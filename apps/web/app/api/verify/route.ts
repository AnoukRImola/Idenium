import { NextRequest, NextResponse } from "next/server";
import { IDenium } from "@idenium/sdk";
import { SEPOLIA_CONTRACTS, type PassportProof } from "@idenium/shared";

const sdk = new IDenium({
  network: "sepolia",
  registryAddress: SEPOLIA_CONTRACTS.registry,
  verifierAddress: SEPOLIA_CONTRACTS.verifier,
  devMode: true,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, proof } = body as {
      address: string;
      proof: PassportProof;
    };

    if (!address) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 },
      );
    }

    // Check on-chain verification status
    const isVerified = await sdk.isVerified(address);

    if (isVerified) {
      return NextResponse.json({
        verified: true,
        message: "Address is already verified on-chain",
        address,
      });
    }

    // If proof provided, we would verify it here
    if (proof) {
      // In production, verify the proof server-side
      // For now, accept in devMode
      return NextResponse.json({
        verified: true,
        message: "Proof verified successfully (devMode)",
        address,
        timestamp: Date.now(),
      });
    }

    return NextResponse.json({
      verified: false,
      message: "Address is not verified and no proof provided",
      address,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Verification failed", details: String(error) },
      { status: 500 },
    );
  }
}
