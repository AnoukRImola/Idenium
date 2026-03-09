import {
  DEEP_LINK_SCHEME,
  VERIFICATION_REQUEST_TTL,
  type IDeniumConfig,
  type VerificationRequest,
  type VerificationRequestOptions,
  type VerificationResult,
  type ContractDetails,
  type PassportProof,
  type UserVerificationStatus,
  SEPOLIA_CONTRACTS,
  MAINNET_CONTRACTS,
} from "@idenium/shared";
import { OnChainVerifier } from "./verifier";
import { IDeniumBridge } from "./bridge";
import type { AccountInterface } from "starknet";

export { VerificationQueryBuilder } from "./query-builder";
export { OnChainVerifier } from "./verifier";
export { IDeniumBridge } from "./bridge";
export type {
  IDeniumConfig,
  VerificationRequest,
  VerificationRequestOptions,
  VerificationResult,
  ContractDetails,
  PassportProof,
  UserVerificationStatus,
  VerificationLevel,
  BridgeMessage,
  BridgeMessageType,
  UserVerifiedEvent,
} from "@idenium/shared";

/**
 * Main IDenium SDK class.
 *
 * @example
 * ```ts
 * const idenium = new IDenium({
 *   network: "sepolia",
 *   registryAddress: "0x...",
 *   verifierAddress: "0x...",
 * });
 *
 * // Check if user is verified
 * const verified = await idenium.isVerified("0x...");
 *
 * // Create verification request (generates QR code URL)
 * const request = await idenium.createVerificationRequest({
 *   requiredVerifications: [VerificationLevel.PASSPORT_VALID],
 *   domain: "my-dapp.xyz",
 * });
 * ```
 */
export class IDenium {
  private config: IDeniumConfig;
  private verifier: OnChainVerifier;
  private bridge: IDeniumBridge;

  constructor(config: IDeniumConfig) {
    this.config = config;
    this.verifier = new OnChainVerifier(config);
    this.bridge = new IDeniumBridge(config.devMode);
  }

  /**
   * Create a verification request that generates a QR code for mobile scanning.
   */
  async createVerificationRequest(
    options: VerificationRequestOptions,
  ): Promise<VerificationRequest> {
    const requestId = this.generateRequestId();
    const topic = `idenium:${requestId}`;
    const now = Date.now();

    const qrPayload = {
      requestId,
      domain: options.domain,
      verifications: options.requiredVerifications,
      topic,
      expiresAt: now + VERIFICATION_REQUEST_TTL,
    };

    const qrUrl = `${DEEP_LINK_SCHEME}verify?data=${encodeURIComponent(JSON.stringify(qrPayload))}`;
    const deepLink = qrUrl;

    return {
      requestId,
      qrUrl,
      deepLink,
      topic,
      options,
      createdAt: now,
      expiresAt: now + VERIFICATION_REQUEST_TTL,
    };
  }

  /**
   * Wait for a proof response from the mobile app via WebSocket bridge.
   */
  async waitForProof(
    request: VerificationRequest,
    onProof: (result: VerificationResult) => void,
    onError: (error: Error) => void,
  ): Promise<() => void> {
    return this.bridge.waitForProof(
      request,
      (proof: PassportProof) => {
        onProof({
          verified: true,
          proof,
          timestamp: Date.now(),
        });
      },
      onError,
    );
  }

  /**
   * Check if an address is verified on-chain.
   */
  async isVerified(address: string): Promise<boolean> {
    return this.verifier.isVerified(address);
  }

  /**
   * Get full verification status for an address.
   */
  async getVerificationStatus(address: string): Promise<UserVerificationStatus> {
    return this.verifier.getVerificationStatus(address);
  }

  /**
   * Register a proof on-chain. Requires a connected Starknet account.
   */
  async registerOnChain(
    account: AccountInterface,
    proof: PassportProof,
    walletAddress: string,
  ): Promise<VerificationResult> {
    try {
      const txHash = await this.verifier.register(account, proof, walletAddress);
      return {
        verified: true,
        proof,
        txHash,
        address: walletAddress,
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        verified: false,
        error: error instanceof Error ? error.message : "Registration failed",
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Get total number of verified users on-chain.
   */
  async getTotalVerified(): Promise<bigint> {
    return this.verifier.getTotalVerified();
  }

  /**
   * Get contract details for the configured network.
   */
  getContractDetails(): ContractDetails {
    const contracts =
      this.config.network === "mainnet" ? MAINNET_CONTRACTS : SEPOLIA_CONTRACTS;

    return {
      registryAddress: this.config.registryAddress || contracts.registry,
      verifierAddress: this.config.verifierAddress || contracts.verifier,
      network: this.config.network,
      registryClassHash: "0x0", // Updated after deployment
      verifierClassHash: "0x0", // Updated after deployment
    };
  }

  /**
   * Disconnect and clean up resources.
   */
  destroy(): void {
    this.bridge.disconnect();
  }

  private generateRequestId(): string {
    const bytes = new Uint8Array(16);
    if (typeof globalThis.crypto !== "undefined") {
      globalThis.crypto.getRandomValues(bytes);
    } else {
      for (let i = 0; i < bytes.length; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
    }
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  }
}
