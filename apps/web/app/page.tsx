import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-[var(--idenium-border)]">
        <div className="flex items-center gap-2">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            className="text-indigo-400"
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
          <span className="text-xl font-bold">IDenium</span>
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="/demo"
            className="text-[var(--idenium-text-muted)] hover:text-white transition-colors"
          >
            Demo
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-xl bg-[var(--idenium-primary)] hover:bg-[var(--idenium-primary-dark)] text-white font-semibold transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-4 pt-32 pb-20">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm mb-8">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          Built on Starknet with ZKPassport
        </div>

        <h1 className="text-5xl md:text-7xl font-bold max-w-4xl leading-tight mb-6">
          Your{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            ZK Identity
          </span>{" "}
          on Starknet
        </h1>

        <p className="text-xl text-[var(--idenium-text-muted)] max-w-2xl mb-12">
          Sign with IDenium &mdash; like &quot;Sign with Google&quot; but with
          ZK privacy and passport verification. Prove who you are without
          revealing your data.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/demo"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold text-lg rounded-2xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all"
          >
            Try the Demo
            <span>&rarr;</span>
          </Link>
          <a
            href="https://github.com/idenium"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 border border-[var(--idenium-border)] rounded-2xl text-[var(--idenium-text)] hover:bg-[var(--idenium-surface)] transition-colors font-semibold"
          >
            View on GitHub
          </a>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-[var(--idenium-surface)] border border-[var(--idenium-border)]">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-3xl mb-6">
              &#128274;
            </div>
            <h3 className="text-lg font-bold mb-3">1. Scan Your Passport</h3>
            <p className="text-[var(--idenium-text-muted)]">
              Use the IDenium app to scan your passport via NFC. ZKPassport
              generates a zero-knowledge proof locally on your device.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-[var(--idenium-surface)] border border-[var(--idenium-border)]">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-3xl mb-6">
              &#128737;
            </div>
            <h3 className="text-lg font-bold mb-3">2. Verify On-Chain</h3>
            <p className="text-[var(--idenium-text-muted)]">
              Your ZK proof is verified on Starknet using Garaga. No personal
              data is stored &mdash; only a cryptographic nullifier.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-[var(--idenium-surface)] border border-[var(--idenium-border)]">
            <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center text-3xl mb-6">
              &#10003;
            </div>
            <h3 className="text-lg font-bold mb-3">3. Sign with IDenium</h3>
            <p className="text-[var(--idenium-text-muted)]">
              Use &quot;Sign with IDenium&quot; on any dApp. Scan the QR code,
              authenticate with biometrics, and you&apos;re verified.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-[var(--idenium-surface)] border border-[var(--idenium-border)]">
            <h3 className="font-bold mb-2">ZK Privacy</h3>
            <p className="text-sm text-[var(--idenium-text-muted)]">
              Prove you&apos;re over 18, a citizen, or not sanctioned &mdash;
              without revealing your name, birthday, or passport number.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-[var(--idenium-surface)] border border-[var(--idenium-border)]">
            <h3 className="font-bold mb-2">On-Chain Verification</h3>
            <p className="text-sm text-[var(--idenium-text-muted)]">
              Proofs are verified directly on Starknet using Garaga. No
              trusted third party needed.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-[var(--idenium-surface)] border border-[var(--idenium-border)]">
            <h3 className="font-bold mb-2">Biometric Security</h3>
            <p className="text-sm text-[var(--idenium-text-muted)]">
              Your identity proof is locked behind fingerprint or FaceID
              on your device. Nobody else can use your verification.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-[var(--idenium-surface)] border border-[var(--idenium-border)]">
            <h3 className="font-bold mb-2">Easy Integration</h3>
            <p className="text-sm text-[var(--idenium-text-muted)]">
              Add &quot;Sign with IDenium&quot; to your dApp with just a few
              lines of code using our SDK.
            </p>
          </div>
        </div>
      </section>

      {/* SDK Preview */}
      <section className="px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">For Developers</h2>
          <p className="text-[var(--idenium-text-muted)] mb-8">
            Integrate identity verification in minutes with the IDenium SDK.
          </p>

          <div className="bg-[#0d1117] rounded-2xl p-6 text-left overflow-x-auto border border-[var(--idenium-border)]">
            <pre className="text-sm">
              <code className="text-green-400">
                {`import { IDenium, VerificationLevel } from "@idenium/sdk";

const idenium = new IDenium({
  network: "sepolia",
  registryAddress: "0x...",
  verifierAddress: "0x...",
});

// Check if user is verified
const verified = await idenium.isVerified(userAddress);

// Create verification request (QR code)
const request = await idenium.createVerificationRequest({
  requiredVerifications: [VerificationLevel.AGE_OVER_18],
  domain: "my-dapp.xyz",
});`}
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--idenium-border)] px-8 py-8 text-center text-sm text-[var(--idenium-text-muted)]">
        <p>IDenium &mdash; Built for Starknet Hackathon 2025</p>
      </footer>
    </main>
  );
}
