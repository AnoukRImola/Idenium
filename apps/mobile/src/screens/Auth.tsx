import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { authenticate, getAvailableBiometrics, type BiometricType } from "../services/biometrics";

interface AuthProps {
  navigation: any;
  route: {
    params?: {
      onAuthenticated?: () => void;
      reason?: string;
    };
  };
}

export function AuthScreen({ navigation, route }: AuthProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "failed">("idle");
  const [biometricType, setBiometricType] = useState<BiometricType | null>(null);
  const reason = route.params?.reason ?? "Access IDenium";

  React.useEffect(() => {
    getAvailableBiometrics().then(setBiometricType);
  }, []);

  const handleAuth = async () => {
    setStatus("loading");

    const success = await authenticate(reason);

    if (success) {
      setStatus("success");
      setTimeout(() => {
        route.params?.onAuthenticated?.();
        navigation.goBack();
      }, 1000);
    } else {
      setStatus("failed");
    }
  };

  const getBiometricIcon = (): string => {
    switch (biometricType) {
      case "FaceID":
        return "\uD83D\uDE42"; // face
      case "TouchID":
      case "Biometrics":
        return "\uD83D\uDD90\uFE0F"; // hand
      default:
        return "\uD83D\uDD12"; // lock
    }
  };

  const getBiometricLabel = (): string => {
    switch (biometricType) {
      case "FaceID":
        return "Face ID";
      case "TouchID":
        return "Touch ID";
      case "Biometrics":
        return "Fingerprint";
      default:
        return "Authenticate";
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>{getBiometricIcon()}</Text>
        <Text style={styles.title}>Authentication Required</Text>
        <Text style={styles.subtitle}>{reason}</Text>

        {status === "idle" && (
          <TouchableOpacity style={styles.primaryButton} onPress={handleAuth}>
            <Text style={styles.primaryButtonText}>
              Use {getBiometricLabel()}
            </Text>
          </TouchableOpacity>
        )}

        {status === "loading" && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={styles.loadingText}>Authenticating...</Text>
          </View>
        )}

        {status === "success" && (
          <View style={styles.resultContainer}>
            <Text style={styles.successIcon}>{"\u2713"}</Text>
            <Text style={styles.successText}>Authenticated!</Text>
          </View>
        )}

        {status === "failed" && (
          <View style={styles.resultContainer}>
            <Text style={styles.failedIcon}>{"\u2717"}</Text>
            <Text style={styles.failedText}>Authentication Failed</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setStatus("idle");
              }}
            >
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a1a",
    padding: 20,
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    gap: 16,
  },
  icon: {
    fontSize: 64,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: "#6366f1",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 48,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  loadingContainer: {
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: "#94a3b8",
    fontSize: 16,
  },
  resultContainer: {
    alignItems: "center",
    gap: 8,
  },
  successIcon: {
    fontSize: 48,
    color: "#22c55e",
  },
  successText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#22c55e",
  },
  failedIcon: {
    fontSize: 48,
    color: "#ef4444",
  },
  failedText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ef4444",
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: "#6366f1",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  retryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  cancelButton: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    padding: 16,
  },
  cancelText: {
    color: "#64748b",
    fontSize: 16,
  },
});
