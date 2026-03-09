import {
  BridgeMessage,
  BridgeMessageType,
  type PassportProof,
  type VerificationRequest,
} from "@idenium/shared";

type ProofCallback = (proof: PassportProof) => void;
type ErrorCallback = (error: Error) => void;

/**
 * WebSocket bridge for communication between web dApp and mobile app.
 * In devMode, simulates the bridge locally.
 */
export class IDeniumBridge {
  private ws: WebSocket | null = null;
  private listeners = new Map<string, { onProof: ProofCallback; onError: ErrorCallback }>();
  private devMode: boolean;

  constructor(devMode = false) {
    this.devMode = devMode;
  }

  /**
   * Listen for a proof response for a given verification request.
   */
  async waitForProof(
    request: VerificationRequest,
    onProof: ProofCallback,
    onError: ErrorCallback,
  ): Promise<() => void> {
    this.listeners.set(request.requestId, { onProof, onError });

    if (this.devMode) {
      return this.simulateDevModeProof(request, onProof);
    }

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      await this.connect(request.topic);
    }

    return () => {
      this.listeners.delete(request.requestId);
      this.disconnect();
    };
  }

  private async connect(topic: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(`wss://bridge.idenium.xyz/${topic}`);

        this.ws.onopen = () => resolve();

        this.ws.onmessage = (event) => {
          try {
            const message: BridgeMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch {
            // Ignore malformed messages
          }
        };

        this.ws.onerror = () => {
          reject(new Error("WebSocket connection failed"));
        };

        this.ws.onclose = () => {
          this.ws = null;
        };
      } catch (err) {
        reject(err);
      }
    });
  }

  private handleMessage(message: BridgeMessage): void {
    const listener = this.listeners.get(message.requestId);
    if (!listener) return;

    switch (message.type) {
      case BridgeMessageType.PROOF_RESPONSE:
        listener.onProof(message.payload as PassportProof);
        this.listeners.delete(message.requestId);
        break;
      case BridgeMessageType.ERROR:
        listener.onError(new Error(String(message.payload)));
        this.listeners.delete(message.requestId);
        break;
    }
  }

  private simulateDevModeProof(
    request: VerificationRequest,
    onProof: ProofCallback,
  ): () => void {
    const timer = setTimeout(() => {
      const mockProof: PassportProof = {
        proof: new Uint8Array(256),
        publicInputs: [
          "0x1", // is_valid
          "0x1", // is_over_18
          request.requestId,
        ],
        nullifier: "0x" + "ab".repeat(32),
        vkHash: "0x" + "cd".repeat(32),
        verifications: request.options.requiredVerifications,
      };
      onProof(mockProof);
    }, 3000); // Simulate 3s delay

    return () => {
      clearTimeout(timer);
      this.listeners.delete(request.requestId);
    };
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
