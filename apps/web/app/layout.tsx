import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StarknetProvider } from "@/providers/StarknetProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IDenium - ZK Identity for Starknet",
  description:
    "Sign with IDenium: Privacy-preserving identity verification powered by ZK proofs and passport NFC.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StarknetProvider>{children}</StarknetProvider>
      </body>
    </html>
  );
}
