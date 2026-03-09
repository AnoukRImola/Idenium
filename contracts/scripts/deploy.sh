#!/bin/bash
# IDenium Contract Deployment Script for Starknet Sepolia
#
# Prerequisites:
#   1. sncast installed (snfoundryup)
#   2. Starknet account with Sepolia ETH
#   3. Account configured: sncast account create --name idenium --network sepolia
#
# Usage:
#   cd contracts && bash scripts/deploy.sh

set -e

ACCOUNT_NAME="${ACCOUNT_NAME:-idenium}"
RPC_URL="${RPC_URL:-https://starknet-sepolia.public.blastapi.io/rpc/v0_7}"

echo "=== IDenium Contract Deployment ==="
echo "Network: Sepolia"
echo "Account: $ACCOUNT_NAME"
echo ""

# Step 1: Build contracts
echo "[1/5] Building contracts..."
scarb build
echo ""

# Step 2: Declare Verifier
echo "[2/5] Declaring IDeniumVerifier..."
VERIFIER_DECLARE=$(sncast --account "$ACCOUNT_NAME" --url "$RPC_URL" \
  declare --contract-name IDeniumVerifier 2>&1)
echo "$VERIFIER_DECLARE"
VERIFIER_CLASS_HASH=$(echo "$VERIFIER_DECLARE" | grep "class_hash:" | awk '{print $2}')
echo "Verifier class hash: $VERIFIER_CLASS_HASH"
echo ""

# Step 3: Deploy Verifier (dev_mode = true for hackathon)
echo "[3/5] Deploying IDeniumVerifier..."
# Constructor args: owner (your account address), dev_mode (1 = true)
OWNER_ADDRESS=$(sncast --account "$ACCOUNT_NAME" --url "$RPC_URL" account address 2>&1 | grep "0x")
VERIFIER_DEPLOY=$(sncast --account "$ACCOUNT_NAME" --url "$RPC_URL" \
  deploy --class-hash "$VERIFIER_CLASS_HASH" \
  --constructor-calldata "$OWNER_ADDRESS" 1 2>&1)
echo "$VERIFIER_DEPLOY"
VERIFIER_ADDRESS=$(echo "$VERIFIER_DEPLOY" | grep "contract_address:" | awk '{print $2}')
echo "Verifier address: $VERIFIER_ADDRESS"
echo ""

# Step 4: Declare Registry
echo "[4/5] Declaring IDeniumRegistry..."
REGISTRY_DECLARE=$(sncast --account "$ACCOUNT_NAME" --url "$RPC_URL" \
  declare --contract-name IDeniumRegistry 2>&1)
echo "$REGISTRY_DECLARE"
REGISTRY_CLASS_HASH=$(echo "$REGISTRY_DECLARE" | grep "class_hash:" | awk '{print $2}')
echo "Registry class hash: $REGISTRY_CLASS_HASH"
echo ""

# Step 5: Deploy Registry
echo "[5/5] Deploying IDeniumRegistry..."
REGISTRY_DEPLOY=$(sncast --account "$ACCOUNT_NAME" --url "$RPC_URL" \
  deploy --class-hash "$REGISTRY_CLASS_HASH" \
  --constructor-calldata "$OWNER_ADDRESS" "$VERIFIER_ADDRESS" 2>&1)
echo "$REGISTRY_DEPLOY"
REGISTRY_ADDRESS=$(echo "$REGISTRY_DEPLOY" | grep "contract_address:" | awk '{print $2}')
echo "Registry address: $REGISTRY_ADDRESS"
echo ""

echo "=== Deployment Complete ==="
echo ""
echo "Update packages/shared/src/constants.ts with:"
echo ""
echo "export const SEPOLIA_CONTRACTS = {"
echo "  registry: \"$REGISTRY_ADDRESS\","
echo "  verifier: \"$VERIFIER_ADDRESS\","
echo "} as const;"
echo ""
echo "Class hashes:"
echo "  Registry: $REGISTRY_CLASS_HASH"
echo "  Verifier: $VERIFIER_CLASS_HASH"
