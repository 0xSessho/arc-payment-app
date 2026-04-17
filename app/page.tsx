import { AgentCard } from "@/components/AgentCard";
import { CreateRequestForm } from "@/components/CreateRequestForm";

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-6 space-y-12">
      {/* Background blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight">
              Arc <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Payment</span> Link
            </h1>
            <p className="text-xl text-zinc-400 max-w-lg leading-relaxed">
              Generate secure payment requests on Arc Testnet, verified by trustless AI identities.
            </p>
          </div>
          <AgentCard />
        </div>

        <div className="w-full">
          <CreateRequestForm />
        </div>
      </div>

      <footer className="relative z-10 text-zinc-600 text-sm font-medium">
        Built on Arc Network &bull; Powered by Circle Wallets &bull; ERC-8004
      </footer>
    </main>
  );
}
