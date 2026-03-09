"use client";

import { useConnect, useDisconnect, useAccount } from "@starknet-react/core";

export function WalletConnect() {
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, status } = useAccount();

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

  return (
    <div className="flex gap-2">
      {connectors.map((connector) => (
        <button
          key={connector.id}
          onClick={() => connect({ connector })}
          className="px-6 py-2.5 rounded-xl bg-[var(--idenium-primary)] hover:bg-[var(--idenium-primary-dark)] text-white font-semibold transition-colors"
        >
          Connect {connector.name}
        </button>
      ))}
    </div>
  );
}
