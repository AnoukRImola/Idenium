/// IDenium Registry Contract
///
/// Manages the mapping between Starknet wallet addresses and ZK identity nullifiers.
/// When a user proves their passport identity via ZKPassport, the proof is verified
/// on-chain and the wallet<->nullifier mapping is stored.

#[starknet::contract]
pub mod IDeniumRegistry {
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp};
    use starknet::storage::{
        StoragePointerReadAccess, StoragePointerWriteAccess, Map, StoragePathEntry,
    };
    use super::super::interface::{IIDeniumRegistry, IIDeniumVerifierDispatcher, IIDeniumVerifierDispatcherTrait};

    #[storage]
    struct Storage {
        /// Whether a user address is verified
        verified_users: Map<ContractAddress, bool>,
        /// Nullifier associated with each verified address
        user_nullifiers: Map<ContractAddress, felt252>,
        /// Reverse mapping: nullifier -> address
        nullifier_to_address: Map<felt252, ContractAddress>,
        /// Timestamp of verification for each address
        verification_timestamps: Map<ContractAddress, u64>,
        /// Total number of verified users
        total_verified: u256,
        /// Contract owner
        owner: ContractAddress,
        /// Verifier contract address
        verifier_address: ContractAddress,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        UserVerified: UserVerified,
    }

    #[derive(Drop, starknet::Event)]
    pub struct UserVerified {
        #[key]
        pub user: ContractAddress,
        pub nullifier: felt252,
        pub timestamp: u64,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        owner: ContractAddress,
        verifier_address: ContractAddress,
    ) {
        self.owner.write(owner);
        self.verifier_address.write(verifier_address);
        self.total_verified.write(0);
    }

    #[abi(embed_v0)]
    impl IDeniumRegistryImpl of IIDeniumRegistry<ContractState> {
        /// Register a user by verifying their ZK proof on-chain.
        ///
        /// The proof is forwarded to the verifier contract (Garaga).
        /// If valid, the nullifier<->wallet mapping is stored.
        fn register(
            ref self: ContractState,
            proof_with_hints: Span<felt252>,
            wallet: ContractAddress,
        ) {
            // Only the wallet owner or the contract owner can register
            let caller = get_caller_address();
            assert(caller == wallet || caller == self.owner.read(), 'Unauthorized caller');

            // Ensure wallet is not already verified
            assert(!self.verified_users.entry(wallet).read(), 'Already verified');

            // Verify the proof via the verifier contract
            let verifier = IIDeniumVerifierDispatcher {
                contract_address: self.verifier_address.read(),
            };
            let nullifier = verifier.verify_proof(proof_with_hints);

            // Ensure nullifier hasn't been used (prevents double registration)
            let existing = self.nullifier_to_address.entry(nullifier).read();
            let zero_address: ContractAddress = 0.try_into().unwrap();
            assert(existing == zero_address, 'Nullifier already registered');

            // Store mappings
            let timestamp = get_block_timestamp();
            self.verified_users.entry(wallet).write(true);
            self.user_nullifiers.entry(wallet).write(nullifier);
            self.nullifier_to_address.entry(nullifier).write(wallet);
            self.verification_timestamps.entry(wallet).write(timestamp);
            self.total_verified.write(self.total_verified.read() + 1);

            // Emit event
            self.emit(UserVerified { user: wallet, nullifier, timestamp });
        }

        fn is_verified(self: @ContractState, address: ContractAddress) -> bool {
            self.verified_users.entry(address).read()
        }

        fn get_nullifier(self: @ContractState, address: ContractAddress) -> felt252 {
            self.user_nullifiers.entry(address).read()
        }

        fn get_address_by_nullifier(
            self: @ContractState, nullifier: felt252,
        ) -> ContractAddress {
            self.nullifier_to_address.entry(nullifier).read()
        }

        fn get_verification_timestamp(self: @ContractState, address: ContractAddress) -> u64 {
            self.verification_timestamps.entry(address).read()
        }

        fn get_total_verified(self: @ContractState) -> u256 {
            self.total_verified.read()
        }
    }
}
