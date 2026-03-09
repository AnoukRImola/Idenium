import ReactNativeBiometrics, { BiometryTypes } from "react-native-biometrics";

const rnBiometrics = new ReactNativeBiometrics();

export type BiometricType = "FaceID" | "TouchID" | "Biometrics" | "none";

/**
 * Check what biometric sensors are available on the device.
 */
export async function getAvailableBiometrics(): Promise<BiometricType> {
  try {
    const { available, biometryType } = await rnBiometrics.isSensorAvailable();
    if (!available) return "none";

    switch (biometryType) {
      case BiometryTypes.FaceID:
        return "FaceID";
      case BiometryTypes.TouchID:
        return "TouchID";
      case BiometryTypes.Biometrics:
        return "Biometrics";
      default:
        return "none";
    }
  } catch {
    return "none";
  }
}

/**
 * Prompt biometric authentication.
 */
export async function authenticate(
  promptMessage = "Verify your identity",
): Promise<boolean> {
  try {
    const { success } = await rnBiometrics.simplePrompt({
      promptMessage,
      cancelButtonText: "Cancel",
    });
    return success;
  } catch {
    return false;
  }
}

/**
 * Create biometric-protected keys for signing.
 */
export async function createBiometricKeys(): Promise<string | null> {
  try {
    const { publicKey } = await rnBiometrics.createKeys();
    return publicKey;
  } catch {
    return null;
  }
}

/**
 * Sign data with biometric-protected keys.
 */
export async function signWithBiometrics(
  payload: string,
  promptMessage = "Sign with IDenium",
): Promise<string | null> {
  try {
    const { success, signature } = await rnBiometrics.createSignature({
      promptMessage,
      payload,
    });
    return success ? signature : null;
  } catch {
    return null;
  }
}

/**
 * Check if biometric keys already exist.
 */
export async function biometricKeysExist(): Promise<boolean> {
  try {
    const { keysExist } = await rnBiometrics.biometricKeysExist();
    return keysExist;
  } catch {
    return false;
  }
}
