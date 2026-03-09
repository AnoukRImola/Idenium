use starknet::ContractAddress;

#[starknet::interface]
pub trait IIDeniumRegistry<TContractState> {
    /// Register a verified user with a ZK proof.
    /// `proof_with_hints` contains the serialized proof and Garaga hints.
    /// `wallet` is the address to register as verified.
    fn register(ref self: TContractState, proof_with_hints: Span<felt252>, wallet: ContractAddress);

    /// Check if an address has been verified.
    fn is_verified(self: @TContractState, address: ContractAddress) -> bool;

    /// Get the nullifier associated with an address.
    fn get_nullifier(self: @TContractState, address: ContractAddress) -> felt252;

    /// Get the address associated with a nullifier (reverse lookup).
    fn get_address_by_nullifier(self: @TContractState, nullifier: felt252) -> ContractAddress;

    /// Get the timestamp when an address was verified.
    fn get_verification_timestamp(self: @TContractState, address: ContractAddress) -> u64;

    /// Get the total number of verified users.
    fn get_total_verified(self: @TContractState) -> u256;
}

#[starknet::interface]
pub trait IIDeniumVerifier<TContractState> {
    /// Verify a ZK proof. Returns the nullifier if valid.
    fn verify_proof(self: @TContractState, proof_with_hints: Span<felt252>) -> felt252;
}
