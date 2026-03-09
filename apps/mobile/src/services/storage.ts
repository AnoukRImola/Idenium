import EncryptedStorage from "react-native-encrypted-storage";
import type { PassportProof } from "@idenium/shared";

const KEYS = {
  PROOF: "idenium_proof",
  WALLET: "idenium_wallet",
  ONBOARDED: "idenium_onboarded",
  PUBLIC_KEY: "idenium_public_key",
} as const;

/**
 * Store a passport proof securely on device.
 */
export async function storeProof(proof: PassportProof): Promise<void> {
  const serialized = JSON.stringify({
    ...proof,
    proof: Array.from(proof.proof), // Uint8Array -> number[]
  });
  await EncryptedStorage.setItem(KEYS.PROOF, serialized);
}

/**
 * Retrieve the stored passport proof.
 */
export async function getStoredProof(): Promise<PassportProof | null> {
  try {
    const data = await EncryptedStorage.getItem(KEYS.PROOF);
    if (!data) return null;

    const parsed = JSON.parse(data);
    return {
      ...parsed,
      proof: new Uint8Array(parsed.proof), // number[] -> Uint8Array
    };
  } catch {
    return null;
  }
}

/**
 * Store the connected wallet address.
 */
export async function storeWalletAddress(address: string): Promise<void> {
  await EncryptedStorage.setItem(KEYS.WALLET, address);
}

/**
 * Get the stored wallet address.
 */
export async function getWalletAddress(): Promise<string | null> {
  try {
    return await EncryptedStorage.getItem(KEYS.WALLET);
  } catch {
    return null;
  }
}

/**
 * Mark onboarding as complete.
 */
export async function setOnboarded(): Promise<void> {
  await EncryptedStorage.setItem(KEYS.ONBOARDED, "true");
}

/**
 * Check if onboarding is complete.
 */
export async function isOnboarded(): Promise<boolean> {
  try {
    const val = await EncryptedStorage.getItem(KEYS.ONBOARDED);
    return val === "true";
  } catch {
    return false;
  }
}

/**
 * Store the biometric public key.
 */
export async function storePublicKey(key: string): Promise<void> {
  await EncryptedStorage.setItem(KEYS.PUBLIC_KEY, key);
}

/**
 * Clear all stored data (for logout).
 */
export async function clearAll(): Promise<void> {
  await EncryptedStorage.clear();
}
