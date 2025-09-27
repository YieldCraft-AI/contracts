const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying AutoSwapLimitSafe on Hedera Testnet...");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatUnits(balance, 8), "HBAR");

  // ========================================
  // CONTRACT PARAMETERS
  // ========================================

  const SAUCERSWAP_ROUTER_V1 = "0x0000000000000000000000000000000000004ac0";
  const BACKEND_EXECUTOR = deployer.address;
  const PYTH_CONTRACT = "0xA2aa501b19aff244D90cc15a4Cf739D2725B5729";
  const HBAR_USD_PRICE_ID =
    "0x3728e591097635310e6341af53db8b7ee42da9b3a8d918f9463ce9cca886dfbd";
  const USDT_USD_PRICE_ID =
    "0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b";

  console.log("\n📋 Contract Parameters:");
  console.log("   SaucerSwap Router:", SAUCERSWAP_ROUTER_V1);
  console.log("   Backend Executor:", BACKEND_EXECUTOR);
  console.log("   Pyth Contract:", PYTH_CONTRACT);

  // ========================================
  // DEPLOY SAFE VERSION
  // ========================================

  console.log("\n🔨 Deploying AutoSwapLimitSafe...");

  try {
    const AutoSwapLimitSafe = await ethers.getContractFactory(
      "AutoSwapLimitSafe"
    );

    const autoSwapLimit = await AutoSwapLimitSafe.deploy(
      SAUCERSWAP_ROUTER_V1,
      BACKEND_EXECUTOR,
      PYTH_CONTRACT,
      HBAR_USD_PRICE_ID,
      USDT_USD_PRICE_ID,
      {
        gasLimit: 3000000,
        gasPrice: "450000000000",
      }
    );

    console.log("⏳ Waiting for deployment...");
    await autoSwapLimit.waitForDeployment();

    const contractAddress = await autoSwapLimit.getAddress();
    console.log("✅ Contract deployed to:", contractAddress);

    // ========================================
    // INITIALIZE CONTRACT
    // ========================================

    console.log("\n🔧 Initializing contract...");

    try {
      // Initialize WETH address
      console.log("   Setting WETH address...");
      const initTx = await autoSwapLimit.initializeWETH({
        gasPrice: "450000000000",
      });
      await initTx.wait();
      console.log("   ✅ WETH initialized");
    } catch (error) {
      console.log("   ⚠️ WETH initialization failed:", error.message);
    }

    try {
      // Associate tokens
      console.log("   Associating tokens...");
      const tokens = [
        "0x00000000000000000000000000000000000014F5", // USDC
        "0x0000000000000000000000000000000000120f46", // SAUCE
      ];

      const associateTx = await autoSwapLimit.associateTokensToContract(
        tokens,
        {
          gasPrice: "450000000000",
        }
      );
      await associateTx.wait();
      console.log("   ✅ Tokens associated");
    } catch (error) {
      console.log("   ⚠️ Token association failed:", error.message);
    }

    // ========================================
    // VERIFY DEPLOYMENT
    // ========================================

    console.log("\n🔍 Verifying deployment...");

    try {
      const config = await autoSwapLimit.getContractConfig();
      console.log("   ✅ Contract config accessible");
      console.log(
        "   Execution Fee:",
        ethers.formatUnits(config[0], 8),
        "HBAR"
      );
      console.log("   Next Order ID:", config[3].toString());
      console.log("   WETH Address:", config[5]);

      const supportedTokens = await autoSwapLimit.getSupportedTokens();
      console.log("   Supported Tokens:", supportedTokens.length);
    } catch (error) {
      console.log("   ⚠️ Verification failed:", error.message);
    }

    // ========================================
    // SUCCESS
    // ========================================

    console.log("\n🎉 DEPLOYMENT SUCCESSFUL!");
    console.log("==========================================");
    console.log("Contract Address:", contractAddress);
    console.log("Network: Hedera Testnet");
    console.log("Deployer:", deployer.address);
    console.log("==========================================");

    console.log("\n📝 Next Steps:");
    console.log(
      "1. View on HashScan:",
      `https://hashscan.io/testnet/contract/${contractAddress}`
    );
    console.log("2. Test Pyth price feeds");
    console.log("3. Create test orders");
    console.log("4. Add more executors if needed");

    return {
      contractAddress,
      deployer: deployer.address,
      success: true,
    };
  } catch (error) {
    console.error("\n❌ Deployment failed:");
    console.error("Error:", error.message);

    if (error.receipt && error.receipt.status === 0) {
      console.error("\n🔧 Transaction reverted. Possible causes:");
      console.error("- Constructor parameter validation failed");
      console.error("- Contract size too large");
      console.error("- Out of gas during deployment");
    }

    throw error;
  }
}

main()
  .then((result) => {
    if (result.success) {
      console.log("\n✅ All done!");
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed:", error.message);
    process.exit(1);
  });

module.exports = { main };
