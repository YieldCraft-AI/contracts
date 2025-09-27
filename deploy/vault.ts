import { ethers } from 'hardhat'
import { Vault } from '../contracts/rootstock/Vault.sol'
import { StrategyPassiveManagerSushi } from '../contracts/rootstock/StrategyPassiveManagerSushi.sol'

async function main() {
    console.log('=== DEPLOYING COMPLETE DEFI SYSTEM ===')

    // Get the deployer account
    const [deployer] = await ethers.getSigners()
    console.log('Deploying with account:', deployer.address)
    console.log('Account balance:', ethers.formatEther(await ethers.provider.getBalance(deployer.address)), 'ETH')

    // Step 1: Deploy Vault contract
    console.log('\n--- Step 1: Deploying Vault ---')
    const VaultFactory = await ethers.getContractFactory('Vault')
    const vault: Vault = await VaultFactory.deploy('YC token', 'YC')
    await vault.waitForDeployment()
    const vaultAddress = await vault.getAddress()
    console.log('Vault deployed to:', vaultAddress)

    // Step 2: Prepare common addresses for Strategy
    const commonAddresses = {
        vault: vaultAddress,
        unirouter: '0x1400feFD6F9b897970f00Df6237Ff2B8b27Dc82C',
    }

    // Step 3: Deploy StrategyPassiveManagerSushi contract
    console.log('\n--- Step 2: Deploying StrategyPassiveManagerSushi ---')
    const StrategyFactory = await ethers.getContractFactory('StrategyPassiveManagerSushi')

    const strategyPassiveManagerSushi: StrategyPassiveManagerSushi = await StrategyFactory.deploy(
        '0xC0B92Ac272D427633c36fd03dc104a2042B3a425', // pool address
        '0xe43ca1Dee3F0fc1e2df73A0745674545F11A59F5', // quoter address
        60, // positionWidth
        commonAddresses
    )

    await strategyPassiveManagerSushi.waitForDeployment()
    const strategyAddress = await strategyPassiveManagerSushi.getAddress()
    console.log('StrategyPassiveManagerSushi deployed to:', strategyAddress)

    // Step 4: Connect Vault to Strategy
    console.log('\n--- Step 3: Connecting Vault to Strategy ---')
    const setStrategyTx = await vault.setStrategyAddress(strategyAddress)
    await setStrategyTx.wait()
    console.log('Strategy address set in Vault successfully')

    // Step 5: Verify deployment
    console.log('\n--- Step 4: Verifying Deployment ---')
    const vaultStrategyAddress = await vault.strategy()
    const strategyVaultAddress = await strategyPassiveManagerSushi.vault()
    const strategyPool = await strategyPassiveManagerSushi.pool()
    const vaultName = await vault.name()
    const vaultSymbol = await vault.symbol()

    console.log('=== DEPLOYMENT VERIFICATION ===')
    console.log('Vault Name:', vaultName)
    console.log('Vault Symbol:', vaultSymbol)
    console.log('Vault Strategy Address:', vaultStrategyAddress)
    console.log('Strategy Vault Address:', strategyVaultAddress)
    console.log('Strategy Pool Address:', strategyPool)
    console.log('Strategy Position Width:', await strategyPassiveManagerSushi.positionWidth())

    // Verify connections
    if (vaultStrategyAddress !== strategyAddress) {
        throw new Error('Vault strategy address not set correctly')
    }
    if (strategyVaultAddress !== vaultAddress) {
        throw new Error('Strategy vault address not set correctly')
    }

    console.log('=== DEPLOYMENT SUCCESSFUL ===')
    console.log('Vault deployed to:', vaultAddress)
    console.log('Strategy deployed to:', strategyAddress)
    console.log('Owner:', deployer.address)
    console.log('=== ALL CHECKS PASSED ===')

    return {
        vault: vaultAddress,
        strategy: strategyAddress,
        deployer: deployer.address,
        deploymentTxHashes: {
            vault: vault.deploymentTransaction()?.hash,
            strategy: strategyPassiveManagerSushi.deploymentTransaction()?.hash,
        },
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then((result) => {
        console.log('Complete system deployment completed successfully:')
        console.log(JSON.stringify(result, null, 2))
        process.exit(0)
    })
    .catch((error) => {
        console.error('Deployment failed:', error)
        process.exit(1)
    })
