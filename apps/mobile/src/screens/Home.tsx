import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { isOnboarded } from "../services/storage";
import { getSavedWallet } from "../services/wallet";

interface HomeProps {
  navigation: any;
}

export function HomeScreen({ navigation }: HomeProps) {
  const [wallet, setWallet] = useState<string | null>(null);
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    const check = async () => {
      const ob = await isOnboarded();
      setOnboarded(ob);
      const w = await getSavedWallet();
      setWallet(w);
    };
    check();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>IDenium</Text>
        <Text style={styles.subtitle}>Your ZK Identity</Text>
      </View>

      {/* Identity Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Identity Status</Text>
          <View
            style={[
              styles.statusBadge,
              onboarded ? styles.statusVerified : styles.statusPending,
            ]}
          >
            <Text style={styles.statusText}>
              {onboarded ? "Verified" : "Not Verified"}
            </Text>
          </View>
        </View>

        {wallet && (
          <View style={styles.walletRow}>
            <Text style={styles.walletLabel}>Wallet</Text>
            <Text style={styles.walletAddress}>
              {wallet.slice(0, 8)}...{wallet.slice(-6)}
            </Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {!onboarded && (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate("Setup")}
          >
            <Text style={styles.primaryButtonText}>Set Up Identity</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate("Scan")}
        >
          <Text style={styles.secondaryButtonText}>Scan QR Code</Text>
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.infoTitle}>How It Works</Text>
        <View style={styles.step}>
          <Text style={styles.stepNumber}>1</Text>
          <Text style={styles.stepText}>
            Scan your passport via NFC using ZKPassport
          </Text>
        </View>
        <View style={styles.step}>
          <Text style={styles.stepNumber}>2</Text>
          <Text style={styles.stepText}>
            Register biometric auth (fingerprint/FaceID)
          </Text>
        </View>
        <View style={styles.step}>
          <Text style={styles.stepNumber}>3</Text>
          <Text style={styles.stepText}>
            Scan QR codes from dApps to verify your identity
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a1a",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginTop: 60,
    marginBottom: 40,
  },
  logo: {
    fontSize: 36,
    fontWeight: "800",
    color: "#fff",
  },
  subtitle: {
    fontSize: 16,
    color: "#94a3b8",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#111128",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "#1e1e3f",
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusVerified: {
    backgroundColor: "rgba(34,197,94,0.15)",
  },
  statusPending: {
    backgroundColor: "rgba(234,179,8,0.15)",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#22c55e",
  },
  walletRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  walletLabel: {
    fontSize: 14,
    color: "#94a3b8",
  },
  walletAddress: {
    fontSize: 14,
    fontFamily: "monospace",
    color: "#e2e8f0",
  },
  actions: {
    gap: 12,
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: "#6366f1",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1e1e3f",
  },
  secondaryButtonText: {
    color: "#e2e8f0",
    fontSize: 16,
    fontWeight: "600",
  },
  info: {
    backgroundColor: "#111128",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "#1e1e3f",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 16,
  },
  step: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(99,102,241,0.15)",
    color: "#818cf8",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 28,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: "#94a3b8",
  },
});
