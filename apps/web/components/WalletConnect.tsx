"use client";

import { useConnect, useDisconnect, useAccount } from "@starknet-react/core";
import { useEffect, useState } from "react";

export function WalletConnect() {
  const { connect, connectors, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, status } = useAccount();
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  const argentConnector = connectors.find((c) => c.id === "argentX");

  useEffect(() => {
    if (argentConnector) {
      // Check if extension is installed (not if already authorized)
      const check = () => setIsAvailable(argentConnector.available());
      check();
      // Re-check after short delay since extensions inject asynchronously
      const timer = setTimeout(check, 200);
      return () => clearTimeout(timer);
    }
  }, [argentConnector]);

  if (status === "connected" && address) {
    const shortAddr = `${address.slice(0, 6)}...${address.slice(-4)}`;
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--idenium-surface)] border border-[var(--idenium-border)]">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-sm font-mono">{shortAddr}</span>
        </div>
        <button
          onClick={() => disconnect()}
          className="px-4 py-2 text-sm rounded-xl border border-[var(--idenium-border)] hover:bg-[var(--idenium-surface)] transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--idenium-surface)] border border-[var(--idenium-border)]">
        <div className="w-4 h-4 border-2 border-[var(--idenium-border)] border-t-[var(--idenium-primary)] rounded-full animate-spin" />
        <span className="text-sm">Connecting...</span>
      </div>
    );
  }

  if (isAvailable && argentConnector) {
    return (
      <div className="flex flex-col items-end gap-2">
        <button
          onClick={() => connect({ connector: argentConnector })}
          className="px-6 py-2.5 rounded-xl bg-[var(--idenium-primary)] hover:bg-[var(--idenium-primary-dark)] text-white font-semibold transition-colors"
        >
          Connect ArgentX
        </button>
        {error && (
          <p className="text-sm text-red-400">
            Connection failed. Make sure ArgentX is on Sepolia network.
          </p>
        )}
      </div>
    );
  }

  return (
    <a
      href="https://www.argent.xyz/argent-x/"
      target="_blank"
      rel="noopener noreferrer"
      className="px-6 py-2.5 rounded-xl bg-[var(--idenium-primary)] hover:bg-[var(--idenium-primary-dark)] text-white font-semibold transition-colors inline-block"
    >
      Install ArgentX
    </a>
  );
}
