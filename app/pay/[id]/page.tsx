"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AgentCard } from "@/components/AgentCard";
import { CircleWallet } from "@/components/CircleWallet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAccount, useConnect, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { injected } from "wagmi/connectors";
import { parseUnits } from "viem";
import { arcTestnet } from "viem/chains";
import { USDC_ABI } from "@/lib/contracts";
import { toast } from "sonner";
import { Loader2, Wallet, CheckCircle2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PaymentPage() {
  const { id } = useParams();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"pending" | "processing" | "paid">("pending");
  const [txHash, setTxHash] = useState<string | null>(null);

  const { isConnected, address } = useAccount();
  const { connect } = useConnect();
  const { writeContract, data: metamaskHash } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: (txHash || metamaskHash) as `0x${string}`,
  });

  useEffect(() => {
    fetch(`/api/requests/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setRequest(data);
        if (data.status === "paid") setStatus("paid");
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (isConfirmed && status !== "paid") {
      handleSuccess(txHash || metamaskHash!);
    }
  }, [isConfirmed]);

  const handleSuccess = async (hash: string) => {
    setStatus("paid");
    setTxHash(hash);
    toast.success("Payment confirmed on-chain!");
    
    // Update backend
    await fetch(`/api/requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "paid", txHash: hash }),
    });
  };

  const handleMetaMaskPay = () => {
    if (!isConnected) {
      connect({ connector: injected() });
      return;
    }

    writeContract({
      address: "0x3600000000000000000000000000000000000000",
      abi: USDC_ABI,
      functionName: "transfer",
      args: [request.recipient, parseUnits(request.amount, 6)],
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100">
        Request not found.
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 p-6 flex flex-col items-center justify-center space-y-8">
      <AnimatePresence mode="wait">
        {status === "paid" ? (
          <motion.div
            key="success"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center space-y-6"
          >
            <div className="relative">
               <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full" />
               <CheckCircle2 className="w-32 h-32 text-green-500 mx-auto relative z-10" />
            </div>
            <h1 className="text-4xl font-extrabold text-white">Payment Received!</h1>
            <p className="text-zinc-400">Thank you for your payment on Arc Testnet.</p>
            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 text-left max-w-md mx-auto">
               <div className="text-xs text-zinc-500 uppercase font-bold mb-2">Transaction Details</div>
               <div className="flex justify-between text-sm py-1 border-b border-zinc-800/50">
                  <span className="text-zinc-400">Amount</span>
                  <span className="text-white font-medium">{request.amount} USDC</span>
               </div>
               <div className="flex justify-between text-sm py-1">
                  <span className="text-zinc-400">Recipient</span>
                  <span className="text-white font-mono">{request.recipient.slice(0, 6)}...{request.recipient.slice(-4)}</span>
               </div>
            </div>
            <Button variant="outline" className="border-zinc-800 text-zinc-400 hover:text-white" asChild>
               <a href={`https://testnet.arcscan.app/tx/${txHash || metamaskHash}`} target="_blank" rel="noopener noreferrer">
                 View on Explorer <ArrowRight className="w-4 h-4 ml-2" />
               </a>
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="payment"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-start"
          >
            <div className="space-y-6">
              <AgentCard />
              <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-zinc-500 text-xs uppercase tracking-widest">Payment Request</CardTitle>
                  <CardTitle className="text-4xl font-bold">{request.amount} <span className="text-purple-400 text-2xl">USDC</span></CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-400 text-lg">{request.description || "No description provided."}</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-xl shadow-2xl overflow-hidden">
               <div className="h-1.5 w-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500" />
               <CardHeader>
                  <CardTitle>Select Payment Method</CardTitle>
                  <CardDescription>Secure payment on Arc Testnet.</CardDescription>
               </CardHeader>
               <CardContent>
                  <Tabs defaultValue="metamask" className="w-full">
                    <TabsList className="grid grid-cols-2 w-full bg-zinc-950 p-1 border border-zinc-800 h-12">
                      <TabsTrigger value="metamask" className="data-[state=active]:bg-zinc-800">Browser Wallet</TabsTrigger>
                      <TabsTrigger value="circle" className="data-[state=active]:bg-zinc-800">Email Login</TabsTrigger>
                    </TabsList>
                    <TabsContent value="metamask" className="mt-6 space-y-4">
                       <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-950/30">
                          <Wallet className="w-12 h-12 text-zinc-600 mb-4" />
                          <p className="text-zinc-400 text-center text-sm mb-6">Connect your MetaMask or browser wallet to pay instantly.</p>
                          <Button 
                            className="w-full bg-zinc-100 text-zinc-950 hover:bg-white font-bold h-12"
                            onClick={handleMetaMaskPay}
                            disabled={isConfirming}
                          >
                            {isConfirming ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            {isConnected ? "Pay Now with MetaMask" : "Connect Wallet"}
                          </Button>
                       </div>
                    </TabsContent>
                    <TabsContent value="circle" className="mt-6">
                       <CircleWallet 
                         amount={request.amount} 
                         recipient={request.recipient} 
                         onSuccess={(hash) => {
                           setTxHash(hash);
                           if (hash === "pending") {
                             toast.info("Transfer initiated. Waiting for confirmation...");
                           }
                         }} 
                       />
                    </TabsContent>
                  </Tabs>
               </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
