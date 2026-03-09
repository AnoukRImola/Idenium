/** Verification levels supported by IDenium */
export enum VerificationLevel {
  /** Basic passport validity check */
  PASSPORT_VALID = "passport_valid",
  /** Age verification (over 18) */
  AGE_OVER_18 = "age_over_18",
  /** Age verification (over 13) */
  AGE_OVER_13 = "age_over_13",
  /** Nationality verification */
  NATIONALITY = "nationality",
  /** OFAC sanctions check */
  OFAC_CHECK = "ofac_check",
}

/** ZK proof generated from passport scan */
export interface PassportProof {
  /** The proof bytes */
  proof: Uint8Array;
  /** Public inputs for the circuit */
  publicInputs: string[];
  /** Nullifier derived from passport */
  nullifier: string;
  /** Verification key hash */
  vkHash: string;
  /** Which verifications were proven */
  verifications: VerificationLevel[];
}

/** Configuration for IDenium SDK */
export interface IDeniumConfig {
  /** Starknet network to use */
  network: "mainnet" | "sepolia";
  /** Custom RPC URL (optional) */
  rpcUrl?: string;
  /** IDenium Registry contract address */
  registryAddress: string;
  /** IDenium Verifier contract address */
  verifierAddress: string;
  /** Enable dev mode with mock proofs */
  devMode?: boolean;
}

/** Options for creating a verification request */
export interface VerificationRequestOptions {
  /** Which verifications to request */
  requiredVerifications: VerificationLevel[];
  /** Minimum age if AGE_OVER_18 or AGE_OVER_13 not sufficient */
  minimumAge?: number;
  /** Allowed nationalities (ISO 3166-1 alpha-3) */
  allowedNationalities?: string[];
  /** Excluded nationalities (ISO 3166-1 alpha-3) */
  excludedNationalities?: string[];
  /** Domain identifier for the requesting dApp */
  domain: string;
  /** Callback URL after verification */
  callbackUrl?: string;
}

/** A verification request that generates a QR code */
export interface VerificationRequest {
  /** Unique request ID */
  requestId: string;
  /** URL to encode in QR code */
  qrUrl: string;
  /** Deep link for mobile */
  deepLink: string;
  /** WebSocket topic for receiving proof */
  topic: string;
  /** Request configuration */
  options: VerificationRequestOptions;
  /** Timestamp of creation */
  createdAt: number;
  /** Expiration timestamp */
  expiresAt: number;
}

/** Result of a verification */
export interface VerificationResult {
  /** Whether verification was successful */
  verified: boolean;
  /** The proof that was verified */
  proof?: PassportProof;
  /** On-chain transaction hash (if registered) */
  txHash?: string;
  /** Wallet address of the verified user */
  address?: string;
  /** Error message if verification failed */
  error?: string;
  /** Timestamp */
  timestamp: number;
}

/** Contract details for on-chain interaction */
export interface ContractDetails {
  /** Registry contract address */
  registryAddress: string;
  /** Verifier contract address */
  verifierAddress: string;
  /** Network */
  network: "mainnet" | "sepolia";
  /** Registry class hash */
  registryClassHash: string;
  /** Verifier class hash */
  verifierClassHash: string;
}

/** User verification status from on-chain */
export interface UserVerificationStatus {
  /** Whether the user is verified */
  isVerified: boolean;
  /** The nullifier associated with this address */
  nullifier?: string;
  /** When the verification was registered */
  verifiedAt?: number;
}

/** Events emitted by the registry contract */
export interface UserVerifiedEvent {
  /** The verified user address */
  user: string;
  /** Nullifier hash */
  nullifier: string;
  /** Block timestamp */
  timestamp: number;
}

/** WebSocket bridge message types */
export enum BridgeMessageType {
  VERIFICATION_REQUEST = "verification_request",
  PROOF_RESPONSE = "proof_response",
  ERROR = "error",
  PING = "ping",
  PONG = "pong",
}

/** WebSocket bridge message */
export interface BridgeMessage {
  type: BridgeMessageType;
  requestId: string;
  payload: unknown;
  timestamp: number;
}
