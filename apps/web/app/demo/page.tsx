"use client";

import { useState } from "react";
import { useAccount } from "@starknet-react/core";
import Link from "next/link";
import { WalletConnect } from "@/components/WalletConnect";
import { SignWithIDenium } from "@/components/SignWithIDenium";
import { VerificationStatus } from "@/components/VerificationStatus";
import type { VerificationResult } from "@idenium/sdk";

export default function DemoPage() {
  const { status, address } = useAccount();
  const [result, setResult] = useState<VerificationResult | null>(null);

  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-[var(--idenium-border)]">
        <Link href="/" className="flex items-center gap-2">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            className="text-indigo-400"
          >
            <path
              d="M12 2L2 7v10l10 5 10-5V7L12 2z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M12 8v4m0 4h.01"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-xl font-bold">IDenium</span>
        </Link>
        <WalletConnect />
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-4">
          Try Sign with IDenium
        </h1>
        <p className="text-center text-[var(--idenium-text-muted)] mb-12">
          Experience the verification flow in dev mode with mock passport data.
        </p>

        {/* Step 1: Connect Wallet */}
        <div className="space-y-8">
          <div className="p-6 rounded-2xl bg-[var(--idenium-surface)] border border-[var(--idenium-border)]">
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  status === "connected"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-indigo-500/20 text-indigo-400"
                }`}
              >
                {status === "connected" ? "\u2713" : "1"}
              </div>
              <h2 className="text-lg font-bold">Connect Your Wallet</h2>
            </div>

            {status !== "connected" ? (
              <div>
                <p className="text-sm text-[var(--idenium-text-muted)] mb-4">
                  Connect your ArgentX wallet to get started.
                </p>
                <WalletConnect />
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-green-400">
                <span>Wallet connected</span>
                <VerificationStatus />
              </div>
            )}
          </div>

          {/* Step 2: Sign with IDenium */}
          <div className="p-6 rounded-2xl bg-[var(--idenium-surface)] border border-[var(--idenium-border)]">
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  result?.verified
                    ? "bg-green-500/20 text-green-400"
                    : "bg-indigo-500/20 text-indigo-400"
                }`}
              >
                {result?.verified ? "\u2713" : "2"}
              </div>
              <h2 className="text-lg font-bold">Verify Your Identity</h2>
            </div>

            {status !== "connected" ? (
              <p className="text-sm text-[var(--idenium-text-muted)]">
                Connect your wallet first to continue.
              </p>
            ) : result?.verified ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-400 font-semibold">
                  <span className="text-2xl">&#10003;</span>
                  Identity Verified Successfully!
                </div>
                <div className="text-sm text-[var(--idenium-text-muted)] space-y-1">
                  <p>
                    Address: <span className="font-mono">{address}</span>
                  </p>
                  {result.proof && (
                    <p>
                      Nullifier:{" "}
                      <span className="font-mono">
                        {result.proof.nullifier.slice(0, 16)}...
                      </span>
                    </p>
                  )}
                  <p>
                    Timestamp:{" "}
                    {new Date(result.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-[var(--idenium-text-muted)] mb-6">
                  Click the button below to start the verification flow. In dev
                  mode, a mock proof will be generated automatically after ~3
                  seconds.
                </p>
                <SignWithIDenium
                  onSuccess={(res) => setResult(res)}
                  onError={(err) => console.error("Verification error:", err)}
                />
              </div>
            )}
          </div>

          {/* Step 3: Result */}
          {result?.verified && (
            <div className="p-6 rounded-2xl bg-green-500/5 border border-green-500/20">
              <h3 className="font-bold text-green-400 mb-3">
                What just happened?
              </h3>
              <ol className="text-sm text-[var(--idenium-text-muted)] space-y-2 list-decimal list-inside">
                <li>
                  You clicked &quot;Sign with IDenium&quot; and a QR code was
                  generated.
                </li>
                <li>
                  In production, the IDenium mobile app would scan this QR and
                  prompt biometric auth.
                </li>
                <li>
                  A ZK proof from your passport would be sent via WebSocket
                  bridge.
                </li>
                <li>
                  The proof would be verified on-chain on Starknet (via Garaga
                  verifier).
                </li>
                <li>
                  Your wallet address is now linked to a nullifier &mdash; no
                  personal data stored.
                </li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
