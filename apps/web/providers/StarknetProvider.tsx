"use client";

import { sepolia } from "@starknet-react/chains";
import { StarknetConfig, publicProvider, argent } from "@starknet-react/core";
import { type ReactNode } from "react";

const connectors = [argent()];

export function StarknetProvider({ children }: { children: ReactNode }) {
  return (
    <StarknetConfig
      chains={[sepolia]}
      provider={publicProvider()}
      connectors={connectors}
    >
      {children}
    </StarknetConfig>
  );
}
