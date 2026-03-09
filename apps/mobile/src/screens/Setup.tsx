import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  authenticate,
  createBiometricKeys,
  getAvailableBiometrics,
} from "../services/biometrics";
import { generateMockProof, openZKPassport } from "../services/zkpassport";
import { storeProof, storePublicKey, setOnboarded } from "../services/storage";
import { connectWallet } from "../services/wallet";

interface SetupProps {
  navigation: any;
}

type SetupStep = "wallet" | "passport" | "biometrics" | "done";

export function SetupScreen({ navigation }: SetupProps) {
  const [step, setStep] = useState<SetupStep>("wallet");
  const [loading, setLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const handleConnectWallet = async () => {
    setLoading(true);
    try {
      // For demo: use a mock address. In production: WalletConnect + ArgentX
      const mockAddress =
        "0x04e3B6BF2C4e5b921E3c8D5f2D4E6b5C8a7F1D2e3B6A5c4D8E9F0a1B2C3D4e";
      await connectWallet(mockAddress);
      setWalletAddress(mockAddress);
      setStep("passport");
    } catch (error) {
      Alert.alert("Error", "Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  };

  const handleScanPassport = async () => {
    setLoading(true);
    try {
      // Try to open ZKPassport app
      const opened = await openZKPassport("setup");

      if (!opened) {
        // ZKPassport not installed, use mock proof
        Alert.alert(
          "Dev Mode",
          "ZKPassport app not found. Using mock passport proof.",
          [
            {
              text: "OK",
              onPress: async () => {
                const mockProof = generateMockProof("french");
                await storeProof(mockProof);
                setStep("biometrics");
              },
            },
          ],
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to scan passport");
    } finally {
      setLoading(false);
    }
  };

  const handleSetupBiometrics = async () => {
    setLoading(true);
    try {
      const biometricType = await getAvailableBiometrics();

      if (biometricType === "none") {
        Alert.alert(
          "No Biometrics",
          "No biometric sensor found. Continuing without biometric auth.",
        );
        await setOnboarded();
        setStep("done");
        return;
      }

      const authenticated = await authenticate("Register your biometric for IDenium");

      if (authenticated) {
        const publicKey = await createBiometricKeys();
        if (publicKey) {
          await storePublicKey(publicKey);
        }
        await setOnboarded();
        setStep("done");
      } else {
        Alert.alert("Failed", "Biometric authentication failed. Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to set up biometrics");
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "Home" }],
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set Up IDenium</Text>
      <Text style={styles.subtitle}>Complete these steps to verify your identity</Text>

      {/* Progress */}
      <View style={styles.progress}>
        {(["wallet", "passport", "biometrics", "done"] as SetupStep[]).map(
          (s, i) => (
            <View key={s} style={styles.progressItem}>
              <View
                style={[
                  styles.progressDot,
                  step === s && styles.progressDotActive,
                  (["wallet", "passport", "biometrics", "done"].indexOf(step) > i) &&
                    styles.progressDotComplete,
                ]}
              >
                <Text style={styles.progressDotText}>
                  {["wallet", "passport", "biometrics", "done"].indexOf(step) > i
                    ? "\u2713"
                    : String(i + 1)}
                </Text>
              </View>
              {i < 3 && <View style={styles.progressLine} />}
            </View>
          ),
        )}
      </View>

      {/* Step Content */}
      <View style={styles.content}>
        {step === "wallet" && (
          <View style={styles.stepCard}>
            <Text style={styles.stepTitle}>Connect Wallet</Text>
            <Text style={styles.stepDesc}>
              Connect your ArgentX wallet to link your Starknet address with your
              IDenium identity.
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleConnectWallet}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Connect ArgentX</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {step === "passport" && (
          <View style={styles.stepCard}>
            <Text style={styles.stepTitle}>Scan Passport</Text>
            <Text style={styles.stepDesc}>
              Open ZKPassport to scan your passport via NFC. A zero-knowledge proof
              will be generated locally on your device.
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleScanPassport}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Open ZKPassport</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {step === "biometrics" && (
          <View style={styles.stepCard}>
            <Text style={styles.stepTitle}>Enable Biometrics</Text>
            <Text style={styles.stepDesc}>
              Protect your identity proof with fingerprint or Face ID. You'll use
              this to authenticate when signing in to dApps.
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleSetupBiometrics}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Enable Biometrics</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {step === "done" && (
          <View style={styles.stepCard}>
            <Text style={styles.checkmark}>{"\u2713"}</Text>
            <Text style={styles.stepTitle}>All Set!</Text>
            <Text style={styles.stepDesc}>
              Your IDenium identity is ready. You can now use "Sign with IDenium"
              on any supported dApp.
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleDone}
            >
              <Text style={styles.primaryButtonText}>Go to Home</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a1a",
    padding: 20,
    paddingTop: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 32,
  },
  progress: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  progressItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1e1e3f",
    alignItems: "center",
    justifyContent: "center",
  },
  progressDotActive: {
    backgroundColor: "#6366f1",
  },
  progressDotComplete: {
    backgroundColor: "#22c55e",
  },
  progressDotText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: "#1e1e3f",
  },
  content: {
    flex: 1,
  },
  stepCard: {
    backgroundColor: "#111128",
    borderRadius: 20,
    padding: 32,
    borderWidth: 1,
    borderColor: "#1e1e3f",
    alignItems: "center",
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 12,
    textAlign: "center",
  },
  stepDesc: {
    fontSize: 15,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },
  checkmark: {
    fontSize: 60,
    color: "#22c55e",
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: "#6366f1",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
    width: "100%",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
