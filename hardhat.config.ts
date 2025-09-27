// Get the environment configuration from .env file
//
// To make use of automatic environment setup:
// - Duplicate .env.example file and name it .env
// - Fill in the environment variables
import 'dotenv/config'

import 'hardhat-deploy'
import 'hardhat-contract-sizer'
import '@nomiclabs/hardhat-ethers'
import '@layerzerolabs/toolbox-hardhat'
import '@nomicfoundation/hardhat-verify'
import { HardhatUserConfig, HttpNetworkAccountsUserConfig } from 'hardhat/types'

import { EndpointId } from '@layerzerolabs/lz-definitions'
import './task/index'
import { url } from 'inspector'

// Set your preferred authentication method
//
// If you prefer using a mnemonic, set a MNEMONIC environment variable
// to a valid mnemonic
const MNEMONIC = process.env.MNEMONIC

// If you prefer to be authenticated using a private key, set a PRIVATE_KEY environment variable
const PRIVATE_KEY = process.env.PRIVATE_KEY

const accounts: HttpNetworkAccountsUserConfig | undefined = MNEMONIC
    ? { mnemonic: MNEMONIC }
    : PRIVATE_KEY
      ? [PRIVATE_KEY]
      : undefined

if (accounts == null) {
    console.warn(
        'Could not find MNEMONIC or PRIVATE_KEY environment variables. It will not be possible to execute transactions in your example.'
    )
}

const config: HardhatUserConfig = {
    paths: {
        cache: 'cache/hardhat',
    },
    solidity: {
        compilers: [
            {
                version: '0.8.22',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
        ],
    },
    networks: {
        'sepolia-testnet': {
            eid: EndpointId.SEPOLIA_V2_TESTNET,
            url: process.env.RPC_URL_SEPOLIA || 'https://ethereum-sepolia-rpc.publicnode.com',
            accounts,
        },
        hederaTestnet: {
            url: process.env.TESTNET_RPC_URL || 'https://testnet.hashio.io/api',
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            chainId: parseInt(process.env.TESTNET_CHAIN_ID || '296'),
            gas: 10000000, // 10M gas limit
            gasPrice: 370000000000, // 370 Gwei (mínimo requerido por Hedera)
        },
        // Hedera Mainnet
        hederaMainnet: {
            url: process.env.MAINNET_RPC_URL || 'https://mainnet.hashio.io/api',
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            chainId: parseInt(process.env.MAINNET_CHAIN_ID || '295'),
            gas: 10000000,
            gasPrice: 370000000000, // 370 Gwei (mínimo requerido por Hedera)
        },
        'rootstock-testnet': {
            eid: EndpointId.ROOTSTOCK_V2_TESTNET,
            url: process.env.RPC_URL_ROOTSTOCK_TESTNET || 'https://public-node.testnet.rsk.co',
            accounts,
        },
        hardhat: {
            // Need this for testing because TestHelperOz5.sol is exceeding the compiled contract size limit
            allowUnlimitedContractSize: true,
        },
    },
    namedAccounts: {
        deployer: {
            default: 0, // wallet address of index[0], of the mnemonic in .env
        },
    },
    etherscan: {
        apiKey: {
            sepolia: process.env.ETHERSCAN_API_KEY || '',
            'rootstock-testnet': 'API_KEY',
        },
        customChains: [
            {
                network: 'rootstock-testnet',
                chainId: 31,
                urls: {
                    apiURL: 'https://rootstock-testnet.blockscout.com/api/',
                    browserURL: 'https://rootstock-testnet.blockscout.com/',
                },
            },
        ],
    },
    sourcify: {
        enabled: true,
    },
}

export default config
