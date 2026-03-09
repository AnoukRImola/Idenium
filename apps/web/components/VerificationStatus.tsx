"use client";

import { useAccount } from "@starknet-react/core";
import { useState, useEffect } from "react";
import { IDenium } from "@idenium/sdk";
import { SEPOLIA_CONTRACTS } from "@idenium/shared";

export function VerificationStatus() {
  const { address, status } = useAccount();
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status !== "connected" || !address) {
      setIsVerified(null);
      return;
    }

    const checkStatus = async () => {
      setLoading(true);
      try {
        const sdk = new IDenium({
          network: "sepolia",
          registryAddress: SEPOLIA_CONTRACTS.registry,
          verifierAddress: SEPOLIA_CONTRACTS.verifier,
          devMode: true,
        });
        const verified = await sdk.isVerified(address);
        setIsVerified(verified);
      } catch {
        setIsVerified(false);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [address, status]);

  if (status !== "connected") return null;

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--idenium-surface)] border border-[var(--idenium-border)]">
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="idenium-spinner w-4 h-4" />
          <span className="text-sm text-[var(--idenium-text-muted)]">
            Checking verification...
          </span>
        </div>
      ) : isVerified ? (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-400" />
          <span className="text-sm text-green-400 font-semibold">
            Identity Verified
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <span className="text-sm text-yellow-400">Not Verified</span>
        </div>
      )}
    </div>
  );
}
