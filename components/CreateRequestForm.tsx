"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Link as LinkIcon, Copy, Check } from "lucide-react";

export function CreateRequestForm() {
  const [loading, setLoading] = useState(false);
  const [createdRequest, setCreatedRequest] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      amount: formData.get("amount"),
      description: formData.get("description"),
      recipient: formData.get("recipient"),
    };
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create request");
      const request = await res.json();
      setCreatedRequest(request);
      toast.success("Payment request created!");
    } catch {
      toast.error("Error creating request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/pay/${createdRequest?.id}` : "";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const cardStyle: React.CSSProperties = {
    background: 'rgba(8,14,34,0.97)',
    borderRadius: 22,
    border: '1px solid rgba(139,92,246,0.5)',
    padding: 24,
    boxShadow: '0 0 28px rgba(109,40,217,0.18)',
    fontFamily: "'Poppins', sans-serif",
    display: 'flex',
    flexDirection: 'column',
    gap: 15,
  };

  const labelStyle: React.CSSProperties = { fontSize: 12, color: '#f1f5f9', display: 'block', marginBottom: 6, fontWeight: 600 };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(241,245,249,0.1)',
    border: '1px solid rgba(226,232,240,0.35)',
    borderRadius: 11,
    padding: '11px 14px',
    fontSize: 13,
    color: '#f8fafc',
    outline: 'none',
    fontFamily: "'Poppins', sans-serif",
  };

  if (createdRequest) {
    return (
      <div style={cardStyle}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#ffffff' }}>Request Created!</div>
          <div style={{ fontSize: 12, color: '#e2e8f0', marginTop: 3, fontWeight: 400 }}>Share this link with the payer.</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'rgba(109,40,217,0.07)', border: '1px solid rgba(139,92,246,0.28)', borderRadius: 11 }}>
          <LinkIcon size={14} color="rgba(196,181,253,0.6)" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{shareUrl}</span>
          <button onClick={copyToClipboard} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}>
            {copied ? <Check size={14} color="#4ade80" /> : <Copy size={14} color="rgba(196,181,253,0.6)" />}
          </button>
        </div>
        <button onClick={() => setCreatedRequest(null)} style={{ width: '100%', padding: 13, borderRadius: 13, background: 'rgba(109,40,217,0.15)', border: '1px solid rgba(139,92,246,0.4)', color: '#c4b5fd', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'Poppins', sans-serif" }}>
          Create Another
        </button>
      </div>
    );
  }

  return (
    <div style={cardStyle}>
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#ffffff' }}>New Payment Request</div>
        <div style={{ fontSize: 12, color: '#e2e8f0', marginTop: 3, fontWeight: 400 }}>Request USDC on Arc Testnet</div>
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={labelStyle}>Amount (USDC)</label>
          <input name="amount" type="number" step="0.000001" placeholder="0.00" required style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Recipient Address</label>
          <input name="recipient" placeholder="0x..." required style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Description (optional)</label>
          <input name="description" placeholder="For the AI service..." style={inputStyle} />
        </div>
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 14, borderRadius: 13, background: 'linear-gradient(90deg, #4c1d95, #6d28d9, #7c3aed, #a78bfa)', border: 'none', color: '#ffffff', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'Poppins', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 0 20px rgba(109,40,217,0.45)', opacity: loading ? 0.7 : 1 }}>
          {loading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
          Generate Payment Link
        </button>
      </form>
    </div>
  );
}