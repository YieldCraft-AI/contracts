import { ethers } from 'ethers'
import { task } from 'hardhat/config'
import '@nomiclabs/hardhat-ethers'
import { parseUnits } from '@ethersproject/units'
import { hexZeroPad } from '@ethersproject/bytes'
import {
    createGetHreByEid,
    createProviderFactory,
    getEidForNetworkName
} from '@layerzerolabs/devtools-evm-hardhat'
import { Options } from '@layerzerolabs/lz-v2-utilities'

// ABI for the OFT contract's send function
const OFT_ABI = [
    "function decimals() view returns (uint8)",
    "function quoteSend(tuple(uint32 dstEid, bytes32 to, uint256 amountLD, uint256 minAmountLD, bytes extraOptions, bytes composeMsg, bytes oftCmd), bool payInLzToken) view returns (tuple(uint256 nativeFee, uint256 lzTokenFee))",
    "function send(tuple(uint32 dstEid, bytes32 to, uint256 amountLD, uint256 minAmountLD, bytes extraOptions, bytes composeMsg, bytes oftCmd), tuple(uint256 nativeFee, uint256 lzTokenFee), address refundAddress) payable returns (tuple(bytes32 guid, uint64 nonce, uint256 fee), tuple(uint256 amountSentLD, uint256 amountReceivedLD))"
];

// Helper to handle error messages
function getErrorMessage(error: unknown): string {
    if (!error) return 'Unknown error';
    
    if (typeof error === 'object' && error !== null && !(error instanceof Date) && !(error instanceof RegExp)) {
        if ('message' in error && typeof (error as any).message === 'string') {
            const message = (error as any).message;
            
            // Common error patterns and clearer messages
            if (message.includes('insufficient funds')) {
                return 'Insufficient funds for transaction.';
            }
            
            return message;
        }
    }
    
    return String(error);
}

task('lz:oft:send', 'Send tokens cross-chain using LayerZero technology')
    .addParam('contract', 'Contract address on source network')
    .addParam('recipient', 'Recipient address on destination network')
    .addParam('source', 'Name of the source network')
    .addParam('destination', 'Name of the destination network')
    .addParam('amount', 'Amount to transfer in token decimals')
    .addParam('privatekey', 'Private key of the sender')
    .setAction(async (taskArgs, hre) => {
        try {
            // Get endpoint IDs for source and destination networks
            const eidA = getEidForNetworkName(taskArgs.source);
            const eidB = getEidForNetworkName(taskArgs.destination);
            const contractAddress = taskArgs.contract;
            const recipient = taskArgs.recipient;
            
            console.log(`Source Network: ${taskArgs.source} (EID: ${eidA})`);
            console.log(`Destination Network: ${taskArgs.destination} (EID: ${eidB})`);
            console.log(`Contract: ${contractAddress}`);
            console.log(`Recipient: ${recipient}`);

            // Get provider for source network
            const environmentFactory = createGetHreByEid();
            const providerFactory = createProviderFactory(environmentFactory);
            const provider = await providerFactory(eidA);
            
            // Create wallet from private key
            const wallet = new ethers.Wallet(taskArgs.privatekey, provider);
            console.log(`Sender address: ${wallet.address}`);
            
            // Create contract instance directly without using contract factory
            const oftContract = new ethers.Contract(contractAddress, OFT_ABI, wallet);
            
            // Get token decimals and parse amount
            const decimals = await oftContract.decimals();
            const amount = parseUnits(taskArgs.amount, decimals);
            console.log(`Amount to send: ${taskArgs.amount} tokens`);
            
            // Create options for the transfer
            const options = Options.newOptions().addExecutorLzReceiveOption(200000, 0).toHex().toString();
            
            // Convert recipient address to bytes32
            const recipientAddressBytes32 = hexZeroPad(recipient, 32);
            
            // Parameters for the send function
            const sendParam = [eidB, recipientAddressBytes32, amount, amount.mul(98).div(100), options, '0x', '0x'];
            
            // Quote the fees required for the transfer
            console.log(`Estimating fees...`);
            const [nativeFee] = await oftContract.quoteSend(sendParam, false);
            console.log(`Estimated fee: ${ethers.utils.formatEther(nativeFee)} native tokens`);
            
            // Double the fee to ensure the transaction doesn't fail
            const overkillNativeFee = nativeFee.mul(2);
            console.log(`Using fee with buffer: ${ethers.utils.formatEther(overkillNativeFee)} native tokens`);
            
            // Get current gas price
            const gasPrice = await provider.getGasPrice();
            console.log(`Current gas price: ${ethers.utils.formatUnits(gasPrice, 'gwei')} gwei`);
            
            // Fee parameters
            const feeParam = [overkillNativeFee, 0];
            
            // Send the transaction
            console.log(`\nSending ${taskArgs.amount} token(s) from ${taskArgs.source} to ${taskArgs.destination}...`);
            const tx = await oftContract.send(
                sendParam, 
                feeParam, 
                wallet.address, 
                {
                    value: overkillNativeFee,
                    gasPrice: gasPrice.mul(12).div(10), // 20% higher gas price
                    gasLimit: 6000000, 
                }
            );
            
            console.log(`Transaction hash: ${tx.hash}`);
            console.log(`Waiting for transaction confirmation...`);
            
            // Wait for the transaction to be confirmed
            const receipt = await tx.wait();
            console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
            
            console.log(`\nTokens sent successfully! View on LayerZero Scan: https://layerzeroscan.com/tx/${tx.hash}`);
            
            return receipt;
        } catch (error) {
            console.error(`\nError during token transfer: ${getErrorMessage(error)}`);
            
            // Extract more information if available
            if (error && typeof error === 'object' && 'data' in error) {
                console.error(`Contract revert data: ${(error as any).data}`);
            }
            
            return null;
        }
    });


