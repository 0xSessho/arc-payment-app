"use client";

import { useEffect, useState } from "react";
import { getAgentInfo, AgentInfo } from "@/lib/agent";

export function AgentCard() {
  const [agent, setAgent] = useState<AgentInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAgentInfo().then((info) => {
      setAgent(info);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div style={{ borderRadius: 22, overflow: 'hidden', border: '1px solid rgba(139,92,246,0.35)', background: 'rgba(10,16,38,0.95)', boxShadow: '0 0 28px rgba(109,40,217,0.2)', height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '2px solid rgba(139,92,246,0.5)', borderTopColor: '#a78bfa', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!agent) return null;

  return (
    <div style={{ borderRadius: 22, overflow: 'hidden', border: '1px solid rgba(139,92,246,0.55)', background: 'rgba(10,16,38,0.95)', boxShadow: '0 0 28px rgba(109,40,217,0.2)', fontFamily: "'Poppins', sans-serif" }}>
      
      {/* Banner */}
      <div style={{ height: 108, background: 'linear-gradient(135deg, #1e0a4a 0%, #3b1f82 55%, #0f1f4a 100%)', padding: '14px 16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid rgba(139,92,246,0.3)' }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', overflow: 'hidden', border: '1px solid rgba(167,139,250,0.6)', boxShadow: '0 0 10px rgba(124,58,237,0.4)' }}>
          <img src={agent.image} alt="Arc" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ background: 'rgba(109,40,217,0.3)', border: '1px solid rgba(167,139,250,0.55)', color: '#c4b5fd', fontSize: 10, padding: '4px 11px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#a78bfa', display: 'inline-block' }} />
          ERC-8004 Certified
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '0 18px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ marginTop: -28, width: 56, height: 56, borderRadius: 15, border: '2px solid rgba(109,40,217,0.7)', overflow: 'hidden', boxShadow: '0 0 14px rgba(124,58,237,0.35)' }}>
            <img src={agent.image} alt={agent.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ textAlign: 'right', marginTop: 8 }}>
            <div style={{ fontSize: 9, letterSpacing: '1.5px', color: 'rgba(196,181,253,0.55)', textTransform: 'uppercase' }}>Reputation</div>
            <div style={{ fontSize: 23, fontWeight: 700, color: '#c4b5fd' }}>{agent.reputation}/100</div>
          </div>
        </div>

        <div style={{ fontSize: 15, fontWeight: 700, color: '#ffffff', marginTop: 10 }}>{agent.name}</div>
        <div style={{ fontSize: 12, color: '#e2e8f0', marginTop: 3, fontWeight: 400 }}>Trustless AI Agent powered by ERC-8004</div>

        {/* Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 12 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'pulse-dot 2s infinite' }} className="animate-pulse-dot" />
          <span style={{ fontSize: 11, color: '#4ade80', fontWeight: 600 }}>Active</span>
          <span style={{ marginLeft: 'auto', background: 'rgba(109,40,217,0.18)', border: '1px solid rgba(139,92,246,0.45)', color: '#c4b5fd', fontSize: 10, padding: '3px 9px', borderRadius: 20, fontWeight: 600 }}>Arc Testnet</span>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.4), transparent)', margin: '14px 0' }} />

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[
            { val: agent.id, label: 'Agent ID' },
            { val: '12', label: 'Txns' },
            { val: '3', label: 'Validated' },
          ].map((s) => (
            <div key={s.label} style={{ background: 'rgba(109,40,217,0.1)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 11, padding: '9px 11px' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#ffffff' }}>{s.val}</div>
              <div style={{ fontSize: 9, color: 'rgba(196,181,253,0.55)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Addresses */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 13 }}>
          {[
            { label: 'Owner', val: `${agent.owner.slice(0, 6)}...${agent.owner.slice(-4)}` },
            { label: 'Validator', val: '0x97fa...414e' },
          ].map((a) => (
            <div key={a.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(109,40,217,0.07)', border: '1px solid rgba(139,92,246,0.28)', borderRadius: 9, padding: '8px 12px' }}>
              <span style={{ fontSize: 10, color: 'rgba(196,181,253,0.5)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{a.label}</span>
              <span style={{ fontSize: 11, color: '#e2e8f0', fontWeight: 600 }}>{a.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}