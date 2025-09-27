import { ethers } from "hardhat";
import { StratManager } from "../typechain-types";

async function main() {
  console.log("=== DEPLOYING STRAT MANAGER ===");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  // Constructor parameters
  const commonAddresses = {
    vault: "0xD6D02591700DC355c258e7Ab730efaCCCAaEa905",
    unirouter: "0x1400feFD6F9b897970f00Df6237Ff2B8b27Dc82C"
  };

  // Get the contract factory
  const StratManagerFactory = await ethers.getContractFactory("StratManager");

  // Deploy the contract
  console.log("Deploying StratManager...");
  const stratManager: StratManager = await StratManagerFactory.deploy(commonAddresses);
  
  // Wait for deployment to complete
  await stratManager.waitForDeployment();
  const stratManagerAddress = await stratManager.getAddress();

  console.log("=== DEPLOYMENT SUCCESSFUL ===");
  console.log("StratManager deployed to:", stratManagerAddress);
  console.log("Transaction hash:", stratManager.deploymentTransaction()?.hash);

  // Verify the deployment
  console.log("Verifying deployment...");
  const vaultAddress = await stratManager.vault();
  const unirouterAddress = await stratManager.unirouter();
  const ownerAddress = await stratManager.owner();

  console.log("Vault address:", vaultAddress);
  console.log("Unirouter address:", unirouterAddress);
  console.log("Owner:", ownerAddress);

  // Verify constructor worked correctly
  if (vaultAddress !== commonAddresses.vault) {
    throw new Error("Vault not set correctly");
  }
  if (unirouterAddress !== commonAddresses.unirouter) {
    throw new Error("Unirouter not set correctly");
  }
  if (ownerAddress !== deployer.address) {
    throw new Error("Owner not set correctly");
  }

  console.log("=== ALL CHECKS PASSED ===");

  return {
    stratManager: stratManagerAddress,
    deployer: deployer.address
  };
}


main()
  .then((result) => {
    console.log("Deployment completed successfully:", result);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });