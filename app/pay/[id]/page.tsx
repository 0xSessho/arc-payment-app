"use client";

import { parseUnits } from "viem";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ARC_TESTNET_CHAIN_ID = 5042002;

declare global {
  interface Window { ethereum?: any; }
}

export default function PaymentPage() {
  const { id } = useParams();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"pending" | "paid">("pending");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isTransacting, setIsTransacting] = useState(false);
  const [currentChainId, setCurrentChainId] = useState<number | null>(null);

  const { isConnected, address } = useAccount();
  const { connect } = useConnect();

  useEffect(() => {
    const updateChain = () => {
      if (window.ethereum?.networkVersion) {
        setCurrentChainId(parseInt(window.ethereum.networkVersion));
      }
    };
    updateChain();
    window.ethereum?.on("chainChanged", updateChain);
    return () => window.ethereum?.removeListener("chainChanged", updateChain);
  }, []);

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
    if (txHash && status !== "paid") checkTransactionStatus();
  }, [txHash]);

  const checkTransactionStatus = async () => {
    try {
      const receipt = await fetch(`https://rpc.testnet.arc.network`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_getTransactionReceipt",
          params: [txHash],
          id: 1,
        }),
      }).then((res) => res.json());
      if (receipt.result?.blockNumber) handleSuccess(txHash!);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSuccess = async (hash: string) => {
    setStatus("paid");
    toast.success("Payment confirmed!");
    await fetch(`/api/requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "paid", txHash: hash }),
    });
  };

  const handleMetaMaskPay = async () => {
    if (!isConnected) {
      connect({ connector: injected() });
      return;
    }

    if (currentChainId !== ARC_TESTNET_CHAIN_ID) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x4cef52" }],
        });
        toast.success("Switched to Arc Testnet");
        return;
      } catch (error: any) {
        if (error.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [{
                chainId: "0x4cef52",
                chainName: "Arc Network Testnet",
                rpcUrls: ["https://arc-testnet.drpc.org"],
                nativeCurrency: { name: "ARC", symbol: "ARC", decimals: 18 },
                blockExplorerUrls: ["https://archiescan.io"],
              }],
            });
            toast.success("Network added, please click again");
            return;
          } catch {
            toast.error("Failed to add network");
            return;
          }
        }
        toast.error("Failed to switch network");
        return;
      }
    }

    setIsTransacting(true);
    try {
      // En Arc, USDC es el token nativo con 18 decimales
      const valueInWei = parseUnits(request.amount, 18);
      const valueHex = "0x" + valueInWei.toString(16);

      const tx = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [{
          from: address,
          to: request.recipient,
          value: valueHex,
        }],
      });

      setTxHash(tx);
      toast.success("Transaction sent");
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Transaction failed");
    } finally {
      setIsTransacting(false);
    }
  };

  const isOnArc = currentChainId === ARC_TESTNET_CHAIN_ID;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <AnimatePresence>
        {status === "paid" ? (
          <motion.div className="text-center space-y-4">
            <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto" />
            <h1 className="text-2xl text-white">Payment received</h1>
          </motion.div>
        ) : (
          <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle>Pay {request?.amount} USDC</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleMetaMaskPay}
                disabled={isTransacting}
                className="w-full"
              >
                {isTransacting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {!isConnected ? "Connect Wallet" : isOnArc ? "Pay Now" : "Switch Network"}
              </Button>
            </CardContent>
          </Card>
        )}
      </AnimatePresence>
    </main>
  );
}