import { Contract, RpcProvider, type AccountInterface } from "starknet";
import {
  REGISTRY_ABI,
  RPC_URLS,
  SEPOLIA_CONTRACTS,
  MAINNET_CONTRACTS,
  type IDeniumConfig,
  type UserVerificationStatus,
  type PassportProof,
} from "@idenium/shared";

/**
 * On-chain verifier that interacts with IDenium smart contracts on Starknet.
 */
export class OnChainVerifier {
  private provider: RpcProvider;
  private registryContract: Contract;
  private config: IDeniumConfig;

  constructor(config: IDeniumConfig) {
    this.config = config;

    const rpcUrl = config.rpcUrl ?? RPC_URLS[config.network];
    this.provider = new RpcProvider({ nodeUrl: rpcUrl });

    const contracts = config.network === "mainnet" ? MAINNET_CONTRACTS : SEPOLIA_CONTRACTS;
    const registryAddr = config.registryAddress || contracts.registry;

    this.registryContract = new Contract(
      REGISTRY_ABI as any,
      registryAddr,
      this.provider,
    );
  }

  /**
   * Check if an address is verified on-chain.
   */
  async isVerified(address: string): Promise<boolean> {
    try {
      const result = await this.registryContract.call("is_verified", [address]);
      return Boolean(result);
    } catch (error) {
      console.error("Error checking verification status:", error);
      return false;
    }
  }

  /**
   * Get full verification status for an address.
   */
  async getVerificationStatus(address: string): Promise<UserVerificationStatus> {
    try {
      const [isVerified, nullifier] = await Promise.all([
        this.registryContract.call("is_verified", [address]),
        this.registryContract.call("get_nullifier", [address]),
      ]);

      return {
        isVerified: Boolean(isVerified),
        nullifier: nullifier ? String(nullifier) : undefined,
      };
    } catch {
      return { isVerified: false };
    }
  }

  /**
   * Register a proof on-chain. Requires a connected account.
   */
  async register(
    account: AccountInterface,
    proof: PassportProof,
    walletAddress: string,
  ): Promise<string> {
    const contract = new Contract(
      REGISTRY_ABI as any,
      this.registryContract.address,
      account,
    );

    const proofFelts = this.encodeProofAsFelts(proof);

    const tx = await contract.invoke("register", [
      proofFelts,
      walletAddress,
    ]);

    await this.provider.waitForTransaction(tx.transaction_hash);

    return tx.transaction_hash;
  }

  /**
   * Get the total number of verified users.
   */
  async getTotalVerified(): Promise<bigint> {
    try {
      const result = await this.registryContract.call("get_total_verified");
      return BigInt(String(result));
    } catch {
      return 0n;
    }
  }

  /**
   * Encode a PassportProof into felt252 array for on-chain submission.
   */
  private encodeProofAsFelts(proof: PassportProof): string[] {
    const felts: string[] = [];

    // Encode proof bytes as felts (31 bytes per felt)
    for (let i = 0; i < proof.proof.length; i += 31) {
      const chunk = proof.proof.slice(i, i + 31);
      let val = 0n;
      for (const byte of chunk) {
        val = (val << 8n) | BigInt(byte);
      }
      felts.push("0x" + val.toString(16));
    }

    // Append public inputs
    felts.push(...proof.publicInputs);

    // Append nullifier
    felts.push(proof.nullifier);

    return felts;
  }
}
