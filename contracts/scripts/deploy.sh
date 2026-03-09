#!/bin/bash
# IDenium Contract Deployment Script for Starknet Sepolia
#
# Prerequisites:
#   1. Fund the account: go to https://starknet-faucet.vercel.app/
#      Address: 0x01d68ca9ed282ce3bf1b70be3ae5f42a3b3f2c5e3910e3b3cb57afe0c4e4fd5c
#      Request STRK tokens (need ~0.01 STRK)
#
#   2. Deploy the account:
#      cd contracts && sncast --profile idenium account deploy --name idenium
#
#   3. Then run this script:
#      bash scripts/deploy.sh
#
set -e
cd "$(dirname "$0")/.."

PROFILE="idenium"

echo "=== IDenium Contract Deployment ==="
echo ""

# Step 1: Build
echo "[1/4] Building contracts..."
scarb build
echo ""

# Step 2: Declare + Deploy Verifier
echo "[2/4] Declaring IDeniumVerifier..."
VERIFIER_RESULT=$(sncast --profile "$PROFILE" declare --contract-name IDeniumVerifier 2>&1)
echo "$VERIFIER_RESULT"
VERIFIER_CLASS_HASH=$(echo "$VERIFIER_RESULT" | grep "class_hash:" | awk '{print $2}')

if [ -z "$VERIFIER_CLASS_HASH" ]; then
  # Already declared — extract from error
  VERIFIER_CLASS_HASH=$(echo "$VERIFIER_RESULT" | grep -oP '0x[0-9a-fA-F]+' | head -1)
fi
echo "  Class hash: $VERIFIER_CLASS_HASH"
echo ""

echo "[3/4] Deploying IDeniumVerifier (dev_mode=true)..."
OWNER=$(sncast --profile "$PROFILE" account address 2>&1 | grep -oP '0x[0-9a-fA-F]+')
echo "  Owner: $OWNER"

VERIFIER_DEPLOY=$(sncast --profile "$PROFILE" deploy \
  --class-hash "$VERIFIER_CLASS_HASH" \
  --constructor-calldata "$OWNER" 0x1 2>&1)
echo "$VERIFIER_DEPLOY"
VERIFIER_ADDRESS=$(echo "$VERIFIER_DEPLOY" | grep "contract_address:" | awk '{print $2}')
echo "  Verifier address: $VERIFIER_ADDRESS"
echo ""

# Step 3: Declare + Deploy Registry
echo "[4/4] Declaring and deploying IDeniumRegistry..."
REGISTRY_RESULT=$(sncast --profile "$PROFILE" declare --contract-name IDeniumRegistry 2>&1)
echo "$REGISTRY_RESULT"
REGISTRY_CLASS_HASH=$(echo "$REGISTRY_RESULT" | grep "class_hash:" | awk '{print $2}')

if [ -z "$REGISTRY_CLASS_HASH" ]; then
  REGISTRY_CLASS_HASH=$(echo "$REGISTRY_RESULT" | grep -oP '0x[0-9a-fA-F]+' | head -1)
fi
echo "  Class hash: $REGISTRY_CLASS_HASH"

REGISTRY_DEPLOY=$(sncast --profile "$PROFILE" deploy \
  --class-hash "$REGISTRY_CLASS_HASH" \
  --constructor-calldata "$OWNER" "$VERIFIER_ADDRESS" 2>&1)
echo "$REGISTRY_DEPLOY"
REGISTRY_ADDRESS=$(echo "$REGISTRY_DEPLOY" | grep "contract_address:" | awk '{print $2}')
echo "  Registry address: $REGISTRY_ADDRESS"
echo ""

echo "=== DONE ==="
echo ""
echo "Update packages/shared/src/constants.ts:"
echo ""
echo "export const SEPOLIA_CONTRACTS = {"
echo "  registry: \"$REGISTRY_ADDRESS\","
echo "  verifier: \"$VERIFIER_ADDRESS\","
echo "} as const;"
