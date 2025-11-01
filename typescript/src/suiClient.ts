import { SuiClient } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { ENV } from "./env";

export const suiClient = new SuiClient({
  url: ENV.SUI_NETWORK,
});

// Create keypair from secret key
export const getKeyPair = (): Ed25519Keypair => {
  if (!ENV.USER_SECRET_KEY) {
    throw new Error("USER_SECRET_KEY is required in environment variables");
  }
  
  return Ed25519Keypair.fromSecretKey(ENV.USER_SECRET_KEY);
};

// Get user address
export const getUserAddress = (): string => {
  return getKeyPair().getPublicKey().toSuiAddress();
};
