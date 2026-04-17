import { Web3Provider } from "@/components/Web3Provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Arc Payment Link | Powered by ERC-8004",
  description: "Secure, AI-verified payment requests on Arc Testnet.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-zinc-950 text-zinc-100 antialiased`}>
        <Web3Provider>
          {children}
          <Toaster position="bottom-right" richColors theme="dark" />
        </Web3Provider>
      </body>
    </html>
  );
}
