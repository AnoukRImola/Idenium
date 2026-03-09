import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { authenticate } from "../services/biometrics";
import { getStoredProof } from "../services/storage";
import type { PassportProof, BridgeMessage, BridgeMessageType } from "@idenium/shared";

interface ScanProps {
  navigation: any;
}

type ScanStatus = "ready" | "scanned" | "authenticating" | "sending" | "done" | "error";

interface QRData {
  requestId: string;
  domain: string;
  verifications: string[];
  topic: string;
  expiresAt: number;
}

export function ScanScreen({ navigation }: ScanProps) {
  const [status, setStatus] = useState<ScanStatus>("ready");
  const [qrInput, setQrInput] = useState("");
  const [qrData, setQrData] = useState<QRData | null>(null);

  const handleManualQR = () => {
    try {
      // Parse the QR data from the idenium:// deep link
      const urlData = qrInput.includes("data=")
        ? decodeURIComponent(qrInput.split("data=")[1])
        : qrInput;

      const parsed: QRData = JSON.parse(urlData);

      if (!parsed.requestId || !parsed.domain) {
        throw new Error("Invalid QR data");
      }

      setQrData(parsed);
      setStatus("scanned");
    } catch {
      Alert.alert("Invalid QR", "Could not parse the QR code data.");
    }
  };

  const handleApprove = async () => {
    if (!qrData) return;

    setStatus("authenticating");

    // Step 1: Biometric auth
    const authenticated = await authenticate("Verify your identity for " + qrData.domain);

    if (!authenticated) {
      setStatus("error");
      Alert.alert("Auth Failed", "Biometric authentication failed.");
      return;
    }

    // Step 2: Get stored proof
    setStatus("sending");
    const proof = await getStoredProof();

    if (!proof) {
      setStatus("error");
      Alert.alert("No Proof", "No stored proof found. Please complete setup first.");
      return;
    }

    // Step 3: Send proof via WebSocket bridge
    try {
      await sendProofViaBridge(qrData.topic, qrData.requestId, proof);
      setStatus("done");
    } catch (error) {
      setStatus("error");
      Alert.alert("Error", "Failed to send proof. Please try again.");
    }
  };

  const handleReset = () => {
    setStatus("ready");
    setQrData(null);
    setQrInput("");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>{"\u2190"} Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Scan QR Code</Text>

      {status === "ready" && (
        <View style={styles.content}>
          <View style={styles.cameraPlaceholder}>
            <Text style={styles.cameraIcon}>{"\uD83D\uDCF7"}</Text>
            <Text style={styles.cameraText}>
              Camera QR scanning requires native build.
            </Text>
            <Text style={styles.cameraSubtext}>
              Paste QR data manually for dev mode:
            </Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Paste QR data or deep link..."
            placeholderTextColor="#64748b"
            value={qrInput}
            onChangeText={setQrInput}
            multiline
          />

          <TouchableOpacity
            style={[styles.primaryButton, !qrInput && styles.buttonDisabled]}
            onPress={handleManualQR}
            disabled={!qrInput}
          >
            <Text style={styles.primaryButtonText}>Parse QR Data</Text>
          </TouchableOpacity>
        </View>
      )}

      {status === "scanned" && qrData && (
        <View style={styles.content}>
          <View style={styles.requestCard}>
            <Text style={styles.requestTitle}>Verification Request</Text>
            <View style={styles.requestRow}>
              <Text style={styles.requestLabel}>From</Text>
              <Text style={styles.requestValue}>{qrData.domain}</Text>
            </View>
            <View style={styles.requestRow}>
              <Text style={styles.requestLabel}>Verifications</Text>
              <Text style={styles.requestValue}>
                {qrData.verifications?.join(", ") || "passport_valid"}
              </Text>
            </View>
            <View style={styles.requestRow}>
              <Text style={styles.requestLabel}>Expires</Text>
              <Text style={styles.requestValue}>
                {new Date(qrData.expiresAt).toLocaleTimeString()}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleApprove}>
            <Text style={styles.primaryButtonText}>Approve & Authenticate</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleReset}>
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {(status === "authenticating" || status === "sending") && (
        <View style={styles.content}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={styles.loadingText}>
              {status === "authenticating"
                ? "Authenticating..."
                : "Sending proof..."}
            </Text>
          </View>
        </View>
      )}

      {status === "done" && (
        <View style={styles.content}>
          <View style={styles.successCard}>
            <Text style={styles.successIcon}>{"\u2713"}</Text>
            <Text style={styles.successTitle}>Proof Sent!</Text>
            <Text style={styles.successDesc}>
              Your identity proof has been sent to {qrData?.domain}. You can close
              this screen.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.primaryButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      )}

      {status === "error" && (
        <View style={styles.content}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleReset}>
            <Text style={styles.primaryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

/**
 * Send proof to the dApp via WebSocket bridge.
 */
async function sendProofViaBridge(
  topic: string,
  requestId: string,
  proof: PassportProof,
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const ws = new WebSocket(`wss://bridge.idenium.xyz/${topic}`);

      ws.onopen = () => {
        const message = {
          type: "proof_response" as const,
          requestId,
          payload: {
            ...proof,
            proof: Array.from(proof.proof),
          },
          timestamp: Date.now(),
        };
        ws.send(JSON.stringify(message));

        setTimeout(() => {
          ws.close();
          resolve();
        }, 500);
      };

      ws.onerror = () => {
        reject(new Error("WebSocket connection failed"));
      };

      // Timeout after 10s
      setTimeout(() => {
        ws.close();
        reject(new Error("Connection timeout"));
      }, 10000);
    } catch (error) {
      reject(error);
    }
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a1a",
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    marginBottom: 20,
  },
  backText: {
    color: "#818cf8",
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 24,
  },
  content: {
    flex: 1,
    gap: 16,
  },
  cameraPlaceholder: {
    backgroundColor: "#111128",
    borderRadius: 20,
    padding: 40,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1e1e3f",
    borderStyle: "dashed",
  },
  cameraIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  cameraText: {
    color: "#94a3b8",
    fontSize: 14,
    textAlign: "center",
  },
  cameraSubtext: {
    color: "#64748b",
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
  },
  input: {
    backgroundColor: "#111128",
    borderRadius: 16,
    padding: 16,
    color: "#e2e8f0",
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#1e1e3f",
    minHeight: 80,
    textAlignVertical: "top",
  },
  requestCard: {
    backgroundColor: "#111128",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "#1e1e3f",
  },
  requestTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 16,
  },
  requestRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  requestLabel: {
    fontSize: 14,
    color: "#94a3b8",
  },
  requestValue: {
    fontSize: 14,
    color: "#e2e8f0",
    fontWeight: "600",
  },
  loadingCard: {
    backgroundColor: "#111128",
    borderRadius: 20,
    padding: 48,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1e1e3f",
    gap: 16,
  },
  loadingText: {
    color: "#94a3b8",
    fontSize: 16,
  },
  successCard: {
    backgroundColor: "#111128",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1e1e3f",
  },
  successIcon: {
    fontSize: 60,
    color: "#22c55e",
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#22c55e",
    marginBottom: 8,
  },
  successDesc: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 22,
  },
  primaryButton: {
    backgroundColor: "#6366f1",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1e1e3f",
  },
  secondaryButtonText: {
    color: "#94a3b8",
    fontSize: 16,
    fontWeight: "600",
  },
});
