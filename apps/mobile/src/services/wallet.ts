import { RpcProvider, Account, type AccountInterface } from "starknet";
import { RPC_URLS } from "@idenium/shared";
import { storeWalletAddress, getWalletAddress } from "./storage";

let provider: RpcProvider | null = null;
let currentAccount: AccountInterface | null = null;

/**
 * Initialize the Starknet provider.
 */
export function getProvider(): RpcProvider {
  if (!provider) {
    provider = new RpcProvider({ nodeUrl: RPC_URLS.sepolia });
  }
  return provider;
}

/**
 * Connect a wallet. In production this would use WalletConnect + ArgentX mobile.
 * For the hackathon demo, we support direct account connection.
 */
export async function connectWallet(
  address: string,
  privateKey?: string,
): Promise<string> {
  const p = getProvider();

  if (privateKey) {
    currentAccount = new Account(p, address, privateKey);
  }

  await storeWalletAddress(address);
  return address;
}

/**
 * Get the currently connected account.
 */
export function getAccount(): AccountInterface | null {
  return currentAccount;
}

/**
 * Get the stored wallet address (persisted across sessions).
 */
export async function getSavedWallet(): Promise<string | null> {
  return getWalletAddress();
}

/**
 * Disconnect the wallet.
 */
export async function disconnectWallet(): Promise<void> {
  currentAccount = null;
  provider = null;
}
