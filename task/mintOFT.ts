import { ethers } from 'ethers'
import { task } from 'hardhat/config'
import '@nomicfoundation/hardhat-ethers'
import { parseUnits } from '@ethersproject/units'
import {
    createGetHreByEid,
    createProviderFactory,
    getEidForNetworkName
} from '@layerzerolabs/devtools-evm-hardhat'

// ABI for the mint function
const MINT_FUNCTION_ABI = [
    "function mint(address _to, uint256 _amount) public",
    "function decimals() public view returns (uint8)"
];

// Helper to handle error messages
function getErrorMessage(error: unknown): string {
    if (!error) return 'Unknown error';
    
    if (error !== null && typeof error === 'object') {
        if ('message' in error && typeof (error as any).message === 'string') {
            const message = (error as any).message;
            
            // Common error patterns and clearer messages
            if (message.includes('missing revert data')) {
                return 'Contract does not have a mint function. Use MyOFTMock contract.';
            }
            
            if (message.includes('insufficient funds')) {
                return 'Insufficient funds for transaction.';
            }
            
            return message;
        }
    }
    
    return String(error);
}

task('lz:oft:mint', 'Mint OFT tokens on a specified network')
    .addParam('contract', 'OFT contract address')
    .addOptionalParam('recipient', 'Address to receive the minted tokens (defaults to sender)')
    .addParam('amount', 'Amount to mint in token decimals')
    .addParam('privateKey', 'Private key of the contract owner')
    .setAction(async (taskArgs, hre) => {
        try {
            // Network setup
            const targetNetwork = hre.network.name;
            console.log(`Network: ${targetNetwork}`);
            
            // Get EID and contract address
            const eid = getEidForNetworkName(targetNetwork);
            const contractAddress = taskArgs.contract;
            
            // Set up provider and wallet
            const environmentFactory = createGetHreByEid();
            const providerFactory = createProviderFactory(environmentFactory);
            const provider = await providerFactory(eid);
            
            const wallet = new ethers.Wallet(taskArgs.privateKey, provider);
            console.log(`Wallet address: ${wallet.address}`);
            
            // Set recipient
            const recipient = taskArgs.recipient || wallet.address;
            console.log(`Recipient: ${recipient}`);
            
            // Create contract instance
            const oftContract = new ethers.Contract(contractAddress, MINT_FUNCTION_ABI, wallet);
            
            // Get token details
            const decimals = await oftContract.decimals();
            const amount = parseUnits(taskArgs.amount, decimals);
            
            console.log(`Minting ${taskArgs.amount} tokens to ${recipient}`);
            
            // Execute mint transaction
            const tx = await oftContract.mint(recipient, amount, {
                gasPrice: (await provider.getGasPrice()).mul(2),
                gasLimit: 500000
            });
            
            console.log(`Transaction hash: ${tx.hash}`);
            
            // Wait for confirmation
            const receipt = await tx.wait();
            console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
            console.log(`Successfully minted ${taskArgs.amount} tokens to ${recipient}`);
            
            return receipt;
        } catch (error) {
            console.error(`Error: ${getErrorMessage(error)}`);
            
            // Log error data if available
            if (error && typeof error === 'object' && 'data' in error) {
                console.error(`Contract revert data: ${(error as any).data}`);
            }
            
            return null;
        }
    }); 