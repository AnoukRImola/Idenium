import { VerificationLevel, type VerificationRequestOptions } from "@idenium/shared";

/**
 * Fluent builder for constructing verification requests.
 *
 * @example
 * ```ts
 * const options = new VerificationQueryBuilder("my-dapp.xyz")
 *   .requirePassportValid()
 *   .requireAgeOver18()
 *   .excludeNationalities(["PRK", "IRN"])
 *   .build();
 * ```
 */
export class VerificationQueryBuilder {
  private verifications: VerificationLevel[] = [];
  private minimumAge?: number;
  private allowed?: string[];
  private excluded?: string[];
  private callbackUrl?: string;
  private domain: string;

  constructor(domain: string) {
    this.domain = domain;
  }

  requirePassportValid(): this {
    this.addVerification(VerificationLevel.PASSPORT_VALID);
    return this;
  }

  requireAgeOver18(): this {
    this.addVerification(VerificationLevel.AGE_OVER_18);
    return this;
  }

  requireAgeOver13(): this {
    this.addVerification(VerificationLevel.AGE_OVER_13);
    return this;
  }

  requireMinimumAge(age: number): this {
    this.minimumAge = age;
    return this;
  }

  requireNationality(): this {
    this.addVerification(VerificationLevel.NATIONALITY);
    return this;
  }

  requireOFACCheck(): this {
    this.addVerification(VerificationLevel.OFAC_CHECK);
    return this;
  }

  allowNationalities(codes: string[]): this {
    this.allowed = codes;
    return this;
  }

  excludeNationalities(codes: string[]): this {
    this.excluded = codes;
    return this;
  }

  setCallbackUrl(url: string): this {
    this.callbackUrl = url;
    return this;
  }

  build(): VerificationRequestOptions {
    if (this.verifications.length === 0) {
      this.requirePassportValid();
    }

    return {
      requiredVerifications: [...this.verifications],
      minimumAge: this.minimumAge,
      allowedNationalities: this.allowed,
      excludedNationalities: this.excluded,
      domain: this.domain,
      callbackUrl: this.callbackUrl,
    };
  }

  private addVerification(level: VerificationLevel): void {
    if (!this.verifications.includes(level)) {
      this.verifications.push(level);
    }
  }
}
