# IDenium - Context for Claude

## What is this project?
IDenium is a ZK identity system for Starknet, built for a hackathon. "Sign with IDenium" works like "Sign with Google" but with ZK privacy — users prove passport attributes (age, nationality, sanctions status) without revealing personal data. The proof is verified on-chain on Starknet via Garaga/Noir circuits.

## Current State (as of March 2026)

### What's DONE and WORKING

**Monorepo (pnpm workspaces + Turborepo)**
- `pnpm build` compiles all 4 packages successfully
- `pnpm dev:web` runs the Next.js dev server

**Smart Contracts (Cairo 2.16.0, Scarb 2.16.0)**
- `contracts/src/registry.cairo` — IDeniumRegistry: stores wallet↔nullifier mappings after ZK proof verification
- `contracts/src/verifier.cairo` — IDeniumVerifier: stub verifier (dev mode accepts all proofs, production will use Garaga-generated verifier)
- `contracts/src/interface.cairo` — trait definitions
- 6/6 tests pass with `snforge test` (snforge 0.57.0)
- **DEPLOYED to Starknet Sepolia:**
  - Verifier: `0x0708d9c8fcf58a037ab734997b51636fa173dcbe0f5106337443db6c6a6ee554`
  - Registry: `0x0099c89a2c2a673f4dc95f15b426a5206b932b80867a2943cb8fb5ccd2dd2a27`
- **E2E on-chain test completed:** called `register()` with mock proof, `is_verified()` returns `true`, `get_nullifier()` returns `0xDEADBEEF`, `get_total_verified()` returns `1`
- sncast profile `idenium` configured in `contracts/snfoundry.toml`
- Owner account: `0x01d68ca9ed282ce3bf1b70be3ae5f42a3b3f2c5e3910e3b3cb57afe0c4e4fd5c`

**packages/shared (@idenium/shared)**
- Types: `VerificationLevel`, `PassportProof`, `IDeniumConfig`, `VerificationRequest`, etc.
- Constants: real Sepolia contract addresses, ABI (with proper enum event wrapper for starknet.js), RPC URLs, mock passports
- Builds with tsup (ESM + CJS)

**packages/sdk (@idenium/sdk)**
- `IDenium` class: createVerificationRequest, waitForProof, isVerified, registerOnChain, getTotalVerified
- `OnChainVerifier`: reads/writes to Starknet contracts via starknet.js v6
- `IDeniumBridge`: WebSocket bridge for web↔mobile communication (with devMode mock that auto-completes in 3s)
- `VerificationQueryBuilder`: fluent API for building verification requests
- React exports (`@idenium/sdk/react`): `useIDenium` hook, `SignWithIDenium` component
- Builds with tsup (ESM + CJS + DTS)

**apps/web (@idenium/web) — Next.js 15 + React 19 + Tailwind 4**
- `/` — Landing page with hero, "How It Works", features, SDK code preview
- `/demo` — Full demo flow: connect ArgentX → click "Sign with IDenium" → QR modal → devMode auto-verifies in 3s → shows result
- `/dashboard` — Shows wallet identity card + verification status
- `/api/verify` — POST endpoint for server-side proof verification
- `StarknetProvider` with @starknet-react/core + ArgentX connector on Sepolia
- Components: `SignWithIDenium`, `WalletConnect`, `VerificationStatus`

**apps/mobile (@idenium/mobile) — React Native (source files only)**
- Screens: `Home` (status + actions), `Setup` (wallet → passport → biometrics → done), `Scan` (QR parsing + biometric auth + proof sending), `Auth` (biometric prompt)
- Services: `biometrics.ts` (react-native-biometrics wrapper), `storage.ts` (encrypted storage), `wallet.ts` (starknet.js + WalletConnect), `zkpassport.ts` (deep link + mock proofs), `starknet.ts` (contract interaction)
- Navigation: React Navigation with native stack
- Metro config for monorepo (watchFolders, blockList)
- **NOTE: No native ios/android directories exist — only TypeScript/JS source files. Cannot run on device without `npx react-native init`.**

### What's NOT DONE

1. **Mobile native init** — Need to run `npx @react-native-community/cli init` to generate ios/ and android/ directories, then copy our src/ files in. Without this, the mobile app can't run on a physical device.

2. **Real ZKPassport integration** — The `zkpassport.ts` service is stubbed. It generates mock proofs and attempts deep links to the ZKPassport app. Real integration requires:
   - `@zkpassport/sdk` npm package
   - ZKPassport app installed on device
   - Noir circuit verification keys for Garaga

3. **Garaga verifier** — The current `verifier.cairo` is a dev-mode stub that accepts all proofs. Production requires:
   - Compiling ZKPassport Noir circuits to get VKs
   - Running `garaga gen --system ultra_keccak_zk_honk --vk <vk_path>` to generate the Cairo verifier
   - Replacing `verifier.cairo` with the generated code

4. **Real WebSocket bridge** — `bridge.ts` connects to `wss://bridge.idenium.xyz` which doesn't exist. In devMode it simulates locally. For production, need a relay server (could use a simple WebSocket server or a service like Pusher).

5. **Web demo calling real contract** — The demo page uses devMode mock. Could be enhanced to actually call `register()` on Sepolia after the mock proof is received, showing the real tx hash on Voyager.

6. **WalletConnect for mobile** — `wallet.ts` has a placeholder. Real WalletConnect integration needs `@walletconnect/modal-react-native` and proper session management with ArgentX mobile.

## Technical Gotchas (learned the hard way)

- **starknet.js v6**: `Contract.connect(account)` returns `void` (mutates in place). Use `new Contract(abi, address, account)` instead.
- **ABI events**: starknet.js requires an enum wrapper around struct events. Without it you get "inconsistency in ABI events definition".
- **tsup exports**: In package.json exports, `types` MUST come BEFORE `import`/`require`, otherwise esbuild warns and TypeScript resolution can fail.
- **Enum re-exports**: TypeScript enums must be exported as values (`export { Foo }`), not type-only (`export type { Foo }`). Otherwise they're undefined at runtime.
- **Scarb/snforge version alignment**: snforge 0.57.0 requires snforge_std >= 0.50.0. Always match the git tag in Scarb.toml to the installed snforge version.
- **sncast deploy timing**: After `declare`, wait ~15 seconds before `deploy` — the class hash needs time to propagate on Sepolia.
- **pnpm + React Native**: `.npmrc` must have `node-linker=hoisted` or RN won't resolve dependencies.

## Build Commands

```bash
pnpm build              # Build all 4 packages (turbo)
pnpm dev:web            # Start Next.js dev server
cd contracts && scarb build    # Build Cairo contracts
cd contracts && snforge test   # Run 6 Cairo tests
```

## File Structure Overview

```
idenium/
├── package.json              # Root: turbo scripts
├── pnpm-workspace.yaml       # apps/* + packages/*
├── .npmrc                    # node-linker=hoisted
├── turbo.json                # build/dev/lint/test pipelines
├── tsconfig.base.json        # Shared TS config
├── apps/
│   ├── web/                  # Next.js 15 (WORKING)
│   │   ├── app/page.tsx      # Landing
│   │   ├── app/demo/page.tsx # Demo with SignWithIDenium
│   │   ├── app/dashboard/    # Dashboard
│   │   ├── app/api/verify/   # API route
│   │   ├── components/       # SignWithIDenium, WalletConnect, VerificationStatus
│   │   └── providers/        # StarknetProvider
│   └── mobile/               # React Native (SOURCE ONLY, no native dirs)
│       └── src/
│           ├── screens/      # Home, Setup, Scan, Auth
│           ├── services/     # biometrics, wallet, zkpassport, starknet, storage
│           └── navigation/   # AppNavigator
├── packages/
│   ├── shared/               # @idenium/shared — types + constants + ABI
│   └── sdk/                  # @idenium/sdk — IDenium class, verifier, bridge, React
└── contracts/                # Cairo (Scarb 2.16.0)
    ├── src/                  # registry.cairo, verifier.cairo, interface.cairo
    ├── tests/                # 6 tests (all pass)
    └── scripts/deploy.sh     # Deployment script
```
