import { useState, useCallback, useEffect, useRef } from "react";
import { IDenium } from "./index";
import type {
  IDeniumConfig,
  VerificationRequestOptions,
  VerificationRequest,
  VerificationResult,
} from "@idenium/shared";

/**
 * React hook for IDenium verification flow.
 */
export function useIDenium(config: IDeniumConfig) {
  const sdkRef = useRef<IDenium | null>(null);

  if (!sdkRef.current) {
    sdkRef.current = new IDenium(config);
  }

  useEffect(() => {
    return () => {
      sdkRef.current?.destroy();
    };
  }, []);

  const isVerified = useCallback(
    async (address: string) => {
      return sdkRef.current!.isVerified(address);
    },
    [],
  );

  const createVerificationRequest = useCallback(
    async (options: VerificationRequestOptions) => {
      return sdkRef.current!.createVerificationRequest(options);
    },
    [],
  );

  const registerOnChain = useCallback(
    async (account: any, proof: any, address: string) => {
      return sdkRef.current!.registerOnChain(account, proof, address);
    },
    [],
  );

  return {
    sdk: sdkRef.current,
    isVerified,
    createVerificationRequest,
    registerOnChain,
  };
}

export type SignWithIDeniumProps = {
  config: IDeniumConfig;
  requestOptions: VerificationRequestOptions;
  onSuccess: (result: VerificationResult) => void;
  onError?: (error: Error) => void;
  className?: string;
  label?: string;
};

/**
 * "Sign with IDenium" button + modal component.
 * Renders a button that opens a modal with a QR code for verification.
 */
export function SignWithIDenium({
  config,
  requestOptions,
  onSuccess,
  onError,
  className,
  label = "Sign with IDenium",
}: SignWithIDeniumProps) {
  const { sdk } = useIDenium(config);
  const [isOpen, setIsOpen] = useState(false);
  const [request, setRequest] = useState<VerificationRequest | null>(null);
  const [status, setStatus] = useState<"idle" | "waiting" | "verified" | "error">("idle");
  const cleanupRef = useRef<(() => void) | null>(null);

  const handleClick = useCallback(async () => {
    if (!sdk) return;

    setIsOpen(true);
    setStatus("waiting");

    try {
      const req = await sdk.createVerificationRequest(requestOptions);
      setRequest(req);

      const cleanup = await sdk.waitForProof(
        req,
        (result) => {
          setStatus("verified");
          setTimeout(() => {
            setIsOpen(false);
            onSuccess(result);
          }, 1500);
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
  }, [sdk, requestOptions, onSuccess, onError]);

  const handleClose = useCallback(() => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    setIsOpen(false);
    setRequest(null);
    setStatus("idle");
  }, []);

  return (
    <>
      <button
        onClick={handleClick}
        className={className ?? "idenium-btn"}
        type="button"
      >
        <IDeniumLogo />
        <span>{label}</span>
      </button>

      {isOpen && (
        <div className="idenium-modal-overlay" onClick={handleClose}>
          <div className="idenium-modal" onClick={(e) => e.stopPropagation()}>
            <button className="idenium-modal-close" onClick={handleClose} type="button">
              &times;
            </button>

            <h2 className="idenium-modal-title">Sign with IDenium</h2>

            {status === "waiting" && request && (
              <div className="idenium-modal-body">
                <p>Scan this QR code with the IDenium app</p>
                <div className="idenium-qr-container">
                  {/* QR code rendered by the consuming app using request.qrUrl */}
                  <div
                    className="idenium-qr-placeholder"
                    data-url={request.qrUrl}
                  >
                    QR
                  </div>
                </div>
                <p className="idenium-modal-hint">
                  Waiting for verification...
                </p>
                <div className="idenium-spinner" />
              </div>
            )}

            {status === "verified" && (
              <div className="idenium-modal-body idenium-success">
                <div className="idenium-checkmark">&#10003;</div>
                <p>Identity Verified!</p>
              </div>
            )}

            {status === "error" && (
              <div className="idenium-modal-body idenium-error">
                <p>Verification failed. Please try again.</p>
                <button onClick={handleClick} type="button">Retry</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function IDeniumLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2L2 7v10l10 5 10-5V7L12 2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
