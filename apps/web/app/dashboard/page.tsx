"use client";

import { useAccount } from "@starknet-react/core";
import Link from "next/link";
import { WalletConnect } from "@/components/WalletConnect";
import { VerificationStatus } from "@/components/VerificationStatus";

export default function DashboardPage() {
  const { status, address } = useAccount();

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

      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        {status !== "connected" ? (
          <div className="text-center py-20">
            <p className="text-[var(--idenium-text-muted)] mb-6">
              Connect your wallet to view your verification status.
            </p>
            <WalletConnect />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Identity Card */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 border border-[var(--idenium-border)]">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold mb-1">IDenium Identity</h2>
                  <p className="text-sm font-mono text-[var(--idenium-text-muted)]">
                    {address}
                  </p>
                </div>
                <VerificationStatus />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-[var(--idenium-surface)]">
                  <p className="text-xs text-[var(--idenium-text-muted)] mb-1">
                    Network
                  </p>
                  <p className="font-bold">Sepolia</p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--idenium-surface)]">
                  <p className="text-xs text-[var(--idenium-text-muted)] mb-1">
                    Passport Valid
                  </p>
                  <p className="font-bold text-yellow-400">Pending</p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--idenium-surface)]">
                  <p className="text-xs text-[var(--idenium-text-muted)] mb-1">
                    Age Verified
                  </p>
                  <p className="font-bold text-yellow-400">Pending</p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--idenium-surface)]">
                  <p className="text-xs text-[var(--idenium-text-muted)] mb-1">
                    OFAC Check
                  </p>
                  <p className="font-bold text-yellow-400">Pending</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link
                href="/demo"
                className="p-6 rounded-2xl bg-[var(--idenium-surface)] border border-[var(--idenium-border)] hover:border-indigo-500/50 transition-colors"
              >
                <h3 className="font-bold mb-2">Verify Identity</h3>
                <p className="text-sm text-[var(--idenium-text-muted)]">
                  Complete the verification flow to prove your identity.
                </p>
              </Link>
              <div className="p-6 rounded-2xl bg-[var(--idenium-surface)] border border-[var(--idenium-border)] opacity-50">
                <h3 className="font-bold mb-2">View Proof</h3>
                <p className="text-sm text-[var(--idenium-text-muted)]">
                  View your on-chain proof details and transaction history.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
