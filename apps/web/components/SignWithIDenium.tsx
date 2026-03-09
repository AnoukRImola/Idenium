"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import QRCode from "react-qr-code";
import { IDenium, type VerificationResult, VerificationLevel } from "@idenium/sdk";
import { SEPOLIA_CONTRACTS } from "@idenium/shared";

interface SignWithIDeniumProps {
  onSuccess: (result: VerificationResult) => void;
  onError?: (error: Error) => void;
  domain?: string;
  requiredVerifications?: VerificationLevel[];
  className?: string;
}

export function SignWithIDenium({
  onSuccess,
  onError,
  domain = "idenium.xyz",
  requiredVerifications = [VerificationLevel.PASSPORT_VALID, VerificationLevel.AGE_OVER_18],
  className,
}: SignWithIDeniumProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "waiting" | "verified" | "error">("idle");
  const cleanupRef = useRef<(() => void) | null>(null);

  const sdk = useRef(
    new IDenium({
      network: "sepolia",
      registryAddress: SEPOLIA_CONTRACTS.registry,
      verifierAddress: SEPOLIA_CONTRACTS.verifier,
      devMode: true,
    }),
  );

  useEffect(() => {
    return () => {
      cleanupRef.current?.();
      sdk.current.destroy();
    };
  }, []);

  const handleOpen = useCallback(async () => {
    setIsOpen(true);
    setStatus("waiting");

    try {
      const request = await sdk.current.createVerificationRequest({
        requiredVerifications,
        domain,
      });

      setQrUrl(request.qrUrl);

      const cleanup = await sdk.current.waitForProof(
        request,
        (result) => {
          setStatus("verified");
          setTimeout(() => {
            setIsOpen(false);
            setStatus("idle");
            onSuccess(result);
          }, 2000);
        },
        (error) => {
          setStatus("error");
          onError?.(error);
        },
      );

      cleanupRef.current = cleanup;
    } catch (err) {
      setStatus("error");
      onError?.(err instanceof Error ? err : new Error("Unknown error"));
    }
  }, [requiredVerifications, domain, onSuccess, onError]);

  const handleClose = useCallback(() => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    setIsOpen(false);
    setQrUrl(null);
    setStatus("idle");
  }, []);

  return (
    <>
      <button
        onClick={handleOpen}
        className={
          className ??
          "inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold text-lg rounded-2xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all"
        }
        type="button"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
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
        Sign with IDenium
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={handleClose}
        >
          <div
            className="bg-[var(--idenium-surface)] border border-[var(--idenium-border)] rounded-3xl p-8 w-full max-w-md relative animate-[slideUp_0.3s_ease]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-[var(--idenium-text-muted)] hover:bg-white/10 transition-colors text-xl"
              type="button"
            >
              &times;
            </button>

            <h2 className="text-xl font-bold text-center mb-6">
              Sign with IDenium
            </h2>

            {status === "waiting" && (
              <div className="text-center">
                <p className="text-[var(--idenium-text-muted)] mb-4">
                  Scan this QR code with the IDenium app
                </p>

                {qrUrl && (
                  <div className="bg-white rounded-2xl p-6 inline-block mx-auto mb-4">
                    <QRCode value={qrUrl} size={200} level="M" />
                  </div>
                )}

                <p className="text-sm text-[var(--idenium-text-muted)] mb-2">
                  Waiting for verification...
                </p>

                <div className="w-8 h-8 border-3 border-[var(--idenium-border)] border-t-[var(--idenium-primary)] rounded-full animate-spin mx-auto" />

                <div className="mt-4 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <p className="text-xs text-indigo-300">
                    Dev Mode: Proof will auto-complete in ~3 seconds
                  </p>
                </div>
              </div>
            )}

            {status === "verified" && (
              <div className="text-center py-8">
                <div className="text-5xl text-green-400 mb-4">&#10003;</div>
                <p className="text-xl font-bold text-green-400">
                  Identity Verified!
                </p>
                <p className="text-sm text-[var(--idenium-text-muted)] mt-2">
                  Your ZK proof has been validated
                </p>
              </div>
            )}

            {status === "error" && (
              <div className="text-center py-8">
                <div className="text-5xl text-red-400 mb-4">&#10007;</div>
                <p className="text-xl font-bold text-red-400 mb-4">
                  Verification Failed
                </p>
                <button
                  onClick={handleOpen}
                  className="px-6 py-2 rounded-xl bg-[var(--idenium-primary)] hover:bg-[var(--idenium-primary-dark)] transition-colors text-white font-semibold"
                  type="button"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
