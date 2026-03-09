use snforge_std::{declare, ContractClassTrait, DeclareResultTrait, start_cheat_caller_address};
use starknet::ContractAddress;
use idenium::interface::{IIDeniumRegistryDispatcher, IIDeniumRegistryDispatcherTrait};

fn OWNER() -> ContractAddress {
    'OWNER'.try_into().unwrap()
}

fn USER() -> ContractAddress {
    'USER'.try_into().unwrap()
}

fn deploy_verifier(owner: ContractAddress) -> ContractAddress {
    let contract = declare("IDeniumVerifier").unwrap().contract_class();
    let mut calldata = array![];
    owner.serialize(ref calldata);
    true.serialize(ref calldata); // dev_mode = true
    let (contract_address, _) = contract.deploy(@calldata).unwrap();
    contract_address
}

fn deploy_registry(owner: ContractAddress, verifier: ContractAddress) -> ContractAddress {
    let contract = declare("IDeniumRegistry").unwrap().contract_class();
    let mut calldata = array![];
    owner.serialize(ref calldata);
    verifier.serialize(ref calldata);
    let (contract_address, _) = contract.deploy(@calldata).unwrap();
    contract_address
}

fn setup() -> (IIDeniumRegistryDispatcher, ContractAddress, ContractAddress) {
    let owner = OWNER();
    let verifier_address = deploy_verifier(owner);
    let registry_address = deploy_registry(owner, verifier_address);
    let registry = IIDeniumRegistryDispatcher { contract_address: registry_address };
    (registry, registry_address, verifier_address)
}

#[test]
fn test_initial_state() {
    let (registry, _, _) = setup();

    assert(registry.get_total_verified() == 0, 'Total should be 0');
    assert(!registry.is_verified(USER()), 'User should not be verified');
}

#[test]
fn test_register_user() {
    let (registry, registry_address, _) = setup();
    let user = USER();
    let nullifier: felt252 = 0x123456789;

    // Mock proof: in dev mode, last element is the nullifier
    let proof = array![0x1, 0x2, 0x3, nullifier];

    // Register as user
    start_cheat_caller_address(registry_address, user);
    registry.register(proof.span(), user);

    assert(registry.is_verified(user), 'User should be verified');
    assert(registry.get_nullifier(user) == nullifier, 'Wrong nullifier');
    assert(registry.get_address_by_nullifier(nullifier) == user, 'Wrong reverse lookup');
    assert(registry.get_total_verified() == 1, 'Total should be 1');
}

#[test]
#[should_panic(expected: 'Already verified')]
fn test_double_registration() {
    let (registry, registry_address, _) = setup();
    let user = USER();
    let nullifier: felt252 = 0x123456789;
    let proof = array![0x1, 0x2, 0x3, nullifier];

    start_cheat_caller_address(registry_address, user);
    registry.register(proof.span(), user);
    // Second registration should fail
    registry.register(proof.span(), user);
}

#[test]
#[should_panic(expected: 'Nullifier already registered')]
fn test_duplicate_nullifier() {
    let (registry, registry_address, _) = setup();
    let user1 = USER();
    let user2: ContractAddress = 'USER2'.try_into().unwrap();
    let nullifier: felt252 = 0x123456789;

    let proof = array![0x1, 0x2, 0x3, nullifier];

    start_cheat_caller_address(registry_address, user1);
    registry.register(proof.span(), user1);

    start_cheat_caller_address(registry_address, user2);
    registry.register(proof.span(), user2);
}

#[test]
#[should_panic(expected: 'Unauthorized caller')]
fn test_unauthorized_registration() {
    let (registry, registry_address, _) = setup();
    let user = USER();
    let attacker: ContractAddress = 'ATTACKER'.try_into().unwrap();
    let proof = array![0x1, 0x2, 0x3, 0x123];

    // Attacker tries to register for user
    start_cheat_caller_address(registry_address, attacker);
    registry.register(proof.span(), user);
}

#[test]
fn test_owner_can_register_for_user() {
    let (registry, registry_address, _) = setup();
    let owner = OWNER();
    let user = USER();
    let nullifier: felt252 = 0xABC;
    let proof = array![0x1, 0x2, nullifier];

    // Owner registers on behalf of user
    start_cheat_caller_address(registry_address, owner);
    registry.register(proof.span(), user);

    assert(registry.is_verified(user), 'User should be verified');
}
