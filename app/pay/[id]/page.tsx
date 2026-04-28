"use client";

import { parseUnits } from "viem";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { toast } from "sonner";
import { Loader2, CheckCircle2, ArrowUpRight, Copy, Check } from "lucide-react";
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
  const [copied, setCopied] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

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
        if (data.status === "paid") {
          setStatus("paid");
          if (data.txHash) setTxHash(data.txHash);
        }
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (txHash && status !== "paid") {
      pollingRef.current = setInterval(async () => {
        try {
          const res = await fetch("https://arc-testnet.drpc.org", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0",
              method: "eth_getTransactionReceipt",
              params: [txHash],
              id: 1,
            }),
          });
          const data = await res.json();
          if (data.result?.blockNumber) {
            clearInterval(pollingRef.current!);
            handleSuccess(txHash);
          }
        } catch (error) {
          console.error("Polling error:", error);
        }
      }, 3000);
    }
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [txHash, status]);

  const handleSuccess = async (hash: string) => {
    setStatus("paid");
    toast.success("Payment confirmed!");
    await fetch(`/api/requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "paid", txHash: hash }),
    });
  };

  const copyTxHash = () => {
    if (!txHash) return;
    navigator.clipboard.writeText(txHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openExplorer = () => {
    if (txHash) window.open(`https://testnet.arcscan.app/tx/${txHash}`, '_blank');
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
      const valueInWei = parseUnits(request.amount, 18);
      const valueHex = "0x" + valueInWei.toString(16);
      const tx = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [{ from: address, to: request.recipient, value: valueHex }],
      });
      setTxHash(tx);
      toast.success("Transaction sent, waiting for confirmation...");
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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg, #060d1c 0%, #090f28 40%, #070e1f 100%)' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#a78bfa' }} />
      </div>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #060d1c 0%, #090f28 40%, #070e1f 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Poppins', sans-serif" }}>
      <AnimatePresence mode="wait">
        {status === "paid" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ textAlign: 'center', maxWidth: 480, width: '100%' }}
          >
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <CheckCircle2 style={{ width: 40, height: 40, color: '#4ade80' }} />
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#ffffff', marginBottom: 8 }}>
              Payment Confirmed
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(226,232,240,0.6)', marginBottom: 32 }}>
              {'Your payment of '}
              <span style={{ color: '#a78bfa', fontWeight: 600 }}>{request?.amount} USDC</span>
              {' has been confirmed on Arc Testnet.'}
            </p>

            {txHash && (
              <div style={{ background: 'rgba(10,16,38,0.95)', border: '1px solid rgba(139,92,246,0.35)', borderRadius: 16, padding: 20, marginBottom: 16, textAlign: 'left' }}>
                <div style={{ fontSize: 11, color: 'rgba(196,181,253,0.5)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, fontWeight: 600 }}>
                  Transaction Hash
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(109,40,217,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 10, padding: '10px 12px' }}>
                  <span style={{ fontSize: 11, color: '#e2e8f0', fontFamily: 'monospace', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {txHash}
                  </span>
                  <button onClick={copyTxHash} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', flexShrink: 0 }}>
                    {copied
                      ? <Check style={{ width: 14, height: 14, color: '#4ade80' }} />
                      : <Copy style={{ width: 14, height: 14, color: 'rgba(196,181,253,0.6)' }} />
                    }
                  </button>
                </div>
                <div
                  onClick={openExplorer}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, fontSize: 12, color: '#a78bfa', fontWeight: 600, cursor: 'pointer' }}
                >
                  {'View on Arc Explorer'}
                  <ArrowUpRight style={{ width: 14, height: 14 }} />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1, background: 'rgba(109,40,217,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 12, padding: '12px 16px', textAlign: 'left' }}>
                <div style={{ fontSize: 10, color: 'rgba(196,181,253,0.5)', textTransform: 'uppercase', letterSpacing: 1 }}>Amount</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', marginTop: 2 }}>{request?.amount} USDC</div>
              </div>
              <div style={{ flex: 1, background: 'rgba(109,40,217,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 12, padding: '12px 16px', textAlign: 'left' }}>
                <div style={{ fontSize: 10, color: 'rgba(196,181,253,0.5)', textTransform: 'uppercase', letterSpacing: 1 }}>Network</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', marginTop: 2 }}>Arc Testnet</div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="payment"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ width: '100%', maxWidth: 480 }}
          >
            <div style={{ background: 'rgba(10,16,38,0.95)', border: '1px solid rgba(139,92,246,0.55)', borderRadius: 22, overflow: 'hidden', boxShadow: '0 0 40px rgba(109,40,217,0.2)' }}>
              <div style={{ height: 4, background: 'linear-gradient(90deg, #4c1d95, #7c3aed, #a78bfa)' }} />
              <div style={{ padding: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80' }} />
                  <span style={{ fontSize: 11, color: '#4ade80', fontWeight: 600 }}>Arc Testnet</span>
                  <span style={{ marginLeft: 'auto', background: 'rgba(109,40,217,0.18)', border: '1px solid rgba(139,92,246,0.45)', color: '#c4b5fd', fontSize: 10, padding: '3px 9px', borderRadius: 20, fontWeight: 600 }}>
                    ERC-8004 Verified
                  </span>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 12, color: 'rgba(196,181,253,0.55)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                    Payment Request
                  </div>
                  <div style={{ fontSize: 42, fontWeight: 700, color: '#ffffff', lineHeight: 1.1 }}>
                    {request?.amount}{' '}
                    <span style={{ fontSize: 22, color: '#a78bfa' }}>USDC</span>
                  </div>
                  {request?.description && (
                    <div style={{ fontSize: 13, color: 'rgba(226,232,240,0.6)', marginTop: 6 }}>
                      {request.description}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(109,40,217,0.07)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 10, padding: '10px 14px' }}>
                    <span style={{ fontSize: 11, color: 'rgba(196,181,253,0.5)', textTransform: 'uppercase', letterSpacing: 0.5 }}>To</span>
                    <span style={{ fontSize: 12, color: '#e2e8f0', fontFamily: 'monospace' }}>
                      {request?.recipient ? `${request.recipient.slice(0, 6)}...${request.recipient.slice(-4)}` : ''}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(109,40,217,0.07)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 10, padding: '10px 14px' }}>
                    <span style={{ fontSize: 11, color: 'rgba(196,181,253,0.5)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Network</span>
                    <span style={{ fontSize: 12, color: '#e2e8f0' }}>Arc Testnet</span>
                  </div>
                </div>

                <button
                  onClick={handleMetaMaskPay}
                  disabled={isTransacting || !!txHash}
                  style={{
                    width: '100%',
                    padding: 14,
                    borderRadius: 13,
                    background: isTransacting || txHash ? 'rgba(109,40,217,0.3)' : 'linear-gradient(90deg, #4c1d95, #6d28d9, #7c3aed, #a78bfa)',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: isTransacting || txHash ? 'not-allowed' : 'pointer',
                    fontFamily: "'Poppins', sans-serif",
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: isTransacting || txHash ? 'none' : '0 0 20px rgba(109,40,217,0.45)',
                    transition: 'all 0.2s',
                  }}
                >
                  {(isTransacting || !!txHash) && (
                    <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />
                  )}
                  {txHash ? 'Confirming payment...' : !isConnected ? 'Connect Wallet' : isOnArc ? 'Pay Now' : 'Switch to Arc Testnet'}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
                  {[
                    { color: '#7F77DD', label: 'Built on Arc' },
                    { color: '#93c5fd', label: 'Circle USDC' },
                    { color: '#c4b5fd', label: 'ERC-8004' },
                  ].map((b) => (
                    <span key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'rgba(226,232,240,0.4)' }}>
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: b.color, display: 'inline-block' }} />
                      {b.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}