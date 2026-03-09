import { Contract, type AccountInterface } from "starknet";
import {
  REGISTRY_ABI,
  SEPOLIA_CONTRACTS,
  type PassportProof,
} from "@idenium/shared";
import { getProvider, getAccount } from "./wallet";

/**
 * Get a read-only instance of the Registry contract.
 */
function getRegistryContract(): Contract {
  const provider = getProvider();
  return new Contract(REGISTRY_ABI as any, SEPOLIA_CONTRACTS.registry, provider);
}

/**
 * Check if an address is verified on-chain.
 */
export async function isVerified(address: string): Promise<boolean> {
  try {
    const contract = getRegistryContract();
    const result = await contract.call("is_verified", [address]);
    return Boolean(result);
  } catch {
    return false;
  }
}

/**
 * Register a proof on-chain using the connected account.
 */
export async function registerProof(
  proof: PassportProof,
  walletAddress: string,
): Promise<string | null> {
  const account = getAccount();
  if (!account) {
    throw new Error("No wallet connected");
  }

  try {
    const contract = getRegistryContract();
    const contractWithAccount = contract.connect(account);

    // Encode proof as felts
    const proofFelts = encodeProofAsFelts(proof);

    const tx = await contractWithAccount.invoke("register", [
      proofFelts,
      walletAddress,
    ]);

    const provider = getProvider();
    await provider.waitForTransaction(tx.transaction_hash);

    return tx.transaction_hash;
  } catch (error) {
    console.error("Failed to register proof:", error);
    return null;
  }
}

/**
 * Get total number of verified users.
 */
export async function getTotalVerified(): Promise<number> {
  try {
    const contract = getRegistryContract();
    const result = await contract.call("get_total_verified");
    return Number(result);
  } catch {
    return 0;
  }
}

function encodeProofAsFelts(proof: PassportProof): string[] {
  const felts: string[] = [];

  for (let i = 0; i < proof.proof.length; i += 31) {
    const chunk = proof.proof.slice(i, i + 31);
    let val = 0n;
    for (const byte of chunk) {
      val = (val << 8n) | BigInt(byte);
    }
    felts.push("0x" + val.toString(16));
  }

  felts.push(...proof.publicInputs);
  felts.push(proof.nullifier);

  return felts;
}
