/** Starknet Sepolia chain ID */
export const STARKNET_SEPOLIA_CHAIN_ID = "0x534e5f5345504f4c4941";

/** Starknet Mainnet chain ID */
export const STARKNET_MAINNET_CHAIN_ID = "0x534e5f4d41494e";

/** Default RPC URLs */
export const RPC_URLS = {
  sepolia: "https://starknet-sepolia.public.blastapi.io/rpc/v0_7",
  mainnet: "https://starknet-mainnet.public.blastapi.io/rpc/v0_7",
} as const;

/** Contract addresses on Starknet Sepolia */
export const SEPOLIA_CONTRACTS = {
  registry: "0x0099c89a2c2a673f4dc95f15b426a5206b932b80867a2943cb8fb5ccd2dd2a27",
  verifier: "0x0708d9c8fcf58a037ab734997b51636fa173dcbe0f5106337443db6c6a6ee554",
} as const;

/**
 * Contract addresses on Starknet Mainnet
 */
export const MAINNET_CONTRACTS = {
  registry: "0x0", // TODO: Update after deployment
  verifier: "0x0", // TODO: Update after deployment
} as const;

/** IDenium Registry ABI (simplified for TypeScript interaction) */
export const REGISTRY_ABI = [
  {
    name: "IDeniumRegistryImpl",
    type: "impl",
    interface_name: "idenium::interface::IIDeniumRegistry",
  },
  {
    name: "idenium::interface::IIDeniumRegistry",
    type: "interface",
    items: [
      {
        name: "register",
        type: "function",
        inputs: [
          { name: "proof_with_hints", type: "core::array::Span::<core::felt252>" },
          { name: "wallet", type: "core::starknet::ContractAddress" },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        name: "is_verified",
        type: "function",
        inputs: [
          { name: "address", type: "core::starknet::ContractAddress" },
        ],
        outputs: [{ type: "core::bool" }],
        state_mutability: "view",
      },
      {
        name: "get_nullifier",
        type: "function",
        inputs: [
          { name: "address", type: "core::starknet::ContractAddress" },
        ],
        outputs: [{ type: "core::felt252" }],
        state_mutability: "view",
      },
      {
        name: "get_address_by_nullifier",
        type: "function",
        inputs: [
          { name: "nullifier", type: "core::felt252" },
        ],
        outputs: [{ type: "core::starknet::ContractAddress" }],
        state_mutability: "view",
      },
      {
        name: "get_total_verified",
        type: "function",
        inputs: [],
        outputs: [{ type: "core::integer::u256" }],
        state_mutability: "view",
      },
    ],
  },
  {
    name: "constructor",
    type: "constructor",
    inputs: [
      { name: "owner", type: "core::starknet::ContractAddress" },
      { name: "verifier_address", type: "core::starknet::ContractAddress" },
    ],
  },
  {
    name: "idenium::registry::IDeniumRegistry::Event",
    type: "event",
    kind: "enum",
    variants: [
      {
        name: "UserVerified",
        type: "idenium::registry::IDeniumRegistry::UserVerified",
        kind: "nested",
      },
    ],
  },
  {
    name: "idenium::registry::IDeniumRegistry::UserVerified",
    type: "event",
    kind: "struct",
    members: [
      { name: "user", type: "core::starknet::ContractAddress", kind: "key" },
      { name: "nullifier", type: "core::felt252", kind: "data" },
      { name: "timestamp", type: "core::integer::u64", kind: "data" },
    ],
  },
] as const;

/** Verification request expiry time (5 minutes) */
export const VERIFICATION_REQUEST_TTL = 5 * 60 * 1000;

/** WebSocket bridge URL for IDenium */
export const BRIDGE_URL = "wss://bridge.idenium.xyz";

/** IDenium deep link scheme */
export const DEEP_LINK_SCHEME = "idenium://";

/** ZKPassport app deep link */
export const ZKPASSPORT_DEEP_LINK = "zkpassport://";

/** Mock passport data for devMode */
export const MOCK_PASSPORTS = {
  french: {
    nationality: "FRA",
    dateOfBirth: "1990-01-15",
    expiryDate: "2030-06-20",
    nullifier: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  },
  german: {
    nationality: "DEU",
    dateOfBirth: "1985-07-22",
    expiryDate: "2029-03-10",
    nullifier: "0x2345678901abcdef2345678901abcdef2345678901abcdef2345678901abcdef",
  },
  spanish: {
    nationality: "ESP",
    dateOfBirth: "1995-11-30",
    expiryDate: "2031-09-05",
    nullifier: "0x3456789012abcdef3456789012abcdef3456789012abcdef3456789012abcdef",
  },
  japanese: {
    nationality: "JPN",
    dateOfBirth: "1988-04-12",
    expiryDate: "2028-12-25",
    nullifier: "0x4567890123abcdef4567890123abcdef4567890123abcdef4567890123abcdef",
  },
  american: {
    nationality: "USA",
    dateOfBirth: "1992-08-18",
    expiryDate: "2032-01-15",
    nullifier: "0x5678901234abcdef5678901234abcdef5678901234abcdef5678901234abcdef",
  },
  brazilian: {
    nationality: "BRA",
    dateOfBirth: "2000-03-05",
    expiryDate: "2030-07-30",
    nullifier: "0x6789012345abcdef6789012345abcdef6789012345abcdef6789012345abcdef",
  },
} as const;
