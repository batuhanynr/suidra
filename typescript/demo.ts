import { suiClient, getKeyPair, getUserAddress } from "./src/suiClient";
import { ENV } from "./src/env";

async function main() {
  try {
    console.log("🚀 SuiDra TypeScript Demo Starting...\n");
    
    // Test environment variables
    console.log("📋 Environment Configuration:");
    console.log("SUI_NETWORK:", ENV.SUI_NETWORK);
    console.log("PACKAGE_ID:", ENV.PACKAGE_ID);
    console.log("FORMS_REGISTRY_ID:", ENV.FORMS_REGISTRY_ID);
    console.log("USER_SECRET_KEY:", ENV.USER_SECRET_KEY ? "✅ Set" : "❌ Not set");
    console.log();
    
    // Test wallet connection
    console.log("👤 Wallet Information:");
    let userAddress: string | null = null;
    try {
      const keyPair = getKeyPair();
      userAddress = getUserAddress();
      console.log("User Address:", userAddress);
    } catch (error) {
      console.log("❌ Secret key format error:", (error as Error).message);
      console.log("Please check your USER_SECRET_KEY format in .env file");
      console.log("It should start with 'suiprivkey1q' and be much longer");
      return; // Exit early if wallet setup fails
    }
    console.log();
    
    // Test Sui client connection
    console.log("🌐 Testing Sui Client Connection:");
    const chainId = await suiClient.getChainIdentifier();
    console.log("Chain ID:", chainId);
    
    // Get user balance
    if (userAddress) {
      const balance = await suiClient.getBalance({
        owner: userAddress,
      });
      console.log("SUI Balance:", balance.totalBalance, "MIST");
    }
    console.log();
    
    // Check if package exists
    console.log("📦 Checking Package:");
    try {
      const packageInfo = await suiClient.getObject({
        id: ENV.PACKAGE_ID,
        options: {
          showContent: true,
        },
      });
      console.log("Package Status:", packageInfo.data ? "✅ Found" : "❌ Not found");
      if (packageInfo.data) {
        console.log("Package Type:", packageInfo.data.type);
      }
    } catch (error) {
      console.log("Package Check Error:", error);
    }
    console.log();
    
    // Check if forms registry exists
    console.log("📝 Checking Forms Registry:");
    try {
      const registryInfo = await suiClient.getObject({
        id: ENV.FORMS_REGISTRY_ID,
        options: {
          showContent: true,
        },
      });
      console.log("Registry Status:", registryInfo.data ? "✅ Found" : "❌ Not found");
      if (registryInfo.data) {
        console.log("Registry Type:", registryInfo.data.type);
      }
    } catch (error) {
      console.log("Registry Check Error:", error);
    }
    
    console.log("\n✅ Demo completed successfully!");
    
  } catch (error) {
    console.error("❌ Demo failed:", error);
    process.exit(1);
  }
}

// Run the demo
main().catch(console.error);