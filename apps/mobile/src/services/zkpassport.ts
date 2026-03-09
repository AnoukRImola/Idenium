import { Linking } from "react-native";
import {
  ZKPASSPORT_DEEP_LINK,
  MOCK_PASSPORTS,
  type PassportProof,
  VerificationLevel,
} from "@idenium/shared";

/**
 * Open the ZKPassport app for passport scanning and proof generation.
 * In production, this opens the ZKPassport app via deep link.
 */
export async function openZKPassport(requestId: string): Promise<boolean> {
  const url = `${ZKPASSPORT_DEEP_LINK}scan?requestId=${requestId}&callback=idenium://proof`;

  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Generate a mock proof for dev mode.
 * Uses one of the 6 available mock passports from ZKPassport.
 */
export function generateMockProof(
  passportType: keyof typeof MOCK_PASSPORTS = "french",
): PassportProof {
  const passport = MOCK_PASSPORTS[passportType];

  return {
    proof: new Uint8Array(256).fill(1), // Mock proof bytes
    publicInputs: [
      "0x1", // passport_valid = true
      "0x1", // is_over_18 = true
      passport.nationality,
    ],
    nullifier: passport.nullifier,
    vkHash: "0x" + "aa".repeat(32),
    verifications: [
      VerificationLevel.PASSPORT_VALID,
      VerificationLevel.AGE_OVER_18,
      VerificationLevel.OFAC_CHECK,
    ],
  };
}

/**
 * Parse a proof callback URL from ZKPassport.
 * Format: idenium://proof?data=<base64_encoded_proof>
 */
export function parseProofCallback(url: string): PassportProof | null {
  try {
    const parsed = new URL(url);
    const data = parsed.searchParams.get("data");
    if (!data) return null;

    const decoded = JSON.parse(atob(data));
    return {
      ...decoded,
      proof: new Uint8Array(decoded.proof),
    };
  } catch {
    return null;
  }
}
