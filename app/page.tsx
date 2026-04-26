import { AgentCard } from "@/components/AgentCard";
import { CreateRequestForm } from "@/components/CreateRequestForm";

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #060d1c 0%, #090f28 40%, #070e1f 100%)', fontFamily: "'Poppins', sans-serif" }}>
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-14 flex flex-col gap-10">

        {/* Header */}
        <div className="flex flex-col gap-3">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(167,139,250,0.5)', color: '#c4b5fd', fontSize: 11, fontWeight: 600, padding: '5px 14px', borderRadius: 20, width: 'fit-content', boxShadow: '0 0 12px rgba(124,58,237,0.25)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#a78bfa', display: 'inline-block' }} />
            Arc Testnet · ERC-8004
          </span>
          <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 900, fontSize: 38, color: '#ffffff', letterSpacing: 2, lineHeight: 1.15 }}>
            LINKPAY ON{' '}
            <span style={{ background: 'linear-gradient(90deg, #818cf8, #a78bfa, #c4b5fd, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              ARC
            </span>
          </h1>
          <p style={{ fontSize: 14, color: '#e2e8f0', lineHeight: 1.75, maxWidth: 380, fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}>
            Generate secure payment requests on Arc Testnet, verified by trustless AI identities on-chain.
          </p>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <AgentCard />
          <CreateRequestForm />
        </div>

        {/* Footer badges */}
        <div className="flex items-center gap-5 flex-wrap">
          {[
            { color: '#7F77DD', label: 'Built on Arc Network' },
            { color: '#93c5fd', label: 'Powered by Circle USDC' },
            { color: '#c4b5fd', label: 'ERC-8004 Identity' },
          ].map((b) => (
            <span key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, color: '#e2e8f0', fontFamily: "'Poppins', sans-serif" }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: b.color, display: 'inline-block' }} />
              {b.label}
            </span>
          ))}
        </div>

        {/* What is section */}
        <div style={{ padding: 28, background: 'rgba(8,14,34,0.8)', borderRadius: 20, border: '1px solid rgba(139,92,246,0.35)', boxShadow: '0 0 24px rgba(109,40,217,0.12)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', marginBottom: 10, fontFamily: "'Poppins', sans-serif" }}>What is LinkPay on Arc?</h2>
          <p style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.8, fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}>
            A platform that lets you request USDC payments simply and securely. Create a link, share it, and whoever receives it can pay directly from their wallet. Every payment is backed by a verified AI agent identity on the blockchain using the ERC-8004 standard.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5">
            {[
              { num: '01', text: 'Create your payment link with the amount and recipient address' },
              { num: '02', text: 'Share it with anyone you want to charge' },
              { num: '03', text: 'Payment executes on Arc Testnet in USDC, verified on-chain' },
            ].map((s) => (
              <div key={s.num} style={{ padding: 16, background: 'rgba(109,40,217,0.08)', borderRadius: 13, border: '1px solid rgba(139,92,246,0.3)', boxShadow: '0 0 12px rgba(109,40,217,0.1)' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#a78bfa', fontFamily: "'Poppins', sans-serif" }}>{s.num}</div>
                <div style={{ fontSize: 12, color: '#e2e8f0', marginTop: 5, lineHeight: 1.6, fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}>{s.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tech section */}
        <div style={{ padding: 28, background: 'rgba(6,11,26,0.9)', borderRadius: 20, border: '1px solid rgba(99,102,241,0.4)', boxShadow: '0 0 28px rgba(79,70,229,0.15)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', marginBottom: 6, fontFamily: "'Poppins', sans-serif" }}>How it works under the hood</h2>
          <p style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.75, fontFamily: "'Poppins', sans-serif", fontWeight: 400, marginBottom: 22 }}>
            LinkPay on Arc combines three independent technologies to make trustless, verifiable payments possible without any central authority.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: '⬡', color: 'rgba(139,92,246,0.2)', borderColor: 'rgba(139,92,246,0.4)', name: 'Arc Network', tag: 'Layer 1 Blockchain', desc: 'The underlying blockchain where all transactions are recorded. Arc provides a fast, low-cost EVM-compatible environment where every payment link and execution lives permanently on-chain.' },
              { icon: '8004', color: 'rgba(79,70,229,0.2)', borderColor: 'rgba(99,102,241,0.4)', name: 'ERC-8004 Standard', tag: 'AI Agent Identity', desc: 'A smart contract standard that gives AI agents a verifiable on-chain identity. The agent behind LinkPay holds a registered identity with a reputation score, making every payment request cryptographically trustworthy.' },
              { icon: 'C', color: 'rgba(59,130,246,0.2)', borderColor: 'rgba(59,130,246,0.4)', name: 'Circle Wallets', tag: 'Wallet Infrastructure', desc: 'Circle provides the wallet infrastructure that allows users to authenticate via email and execute USDC transfers without needing to manage private keys directly.' },
              { icon: '$', color: 'rgba(37,99,235,0.2)', borderColor: 'rgba(37,99,235,0.4)', name: 'USDC on Arc', tag: 'Payment Token', desc: 'USD Coin is the payment currency used on Arc Testnet. USDC is a regulated stablecoin pegged to the US dollar, ensuring payment amounts are predictable and free from price volatility.' },
            ].map((t) => (
              <div key={t.name} style={{ background: 'rgba(79,70,229,0.07)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 14, padding: 18, boxShadow: '0 0 14px rgba(79,70,229,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: t.color, border: `1px solid ${t.borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#c4b5fd', fontFamily: "'Poppins', sans-serif", flexShrink: 0 }}>{t.icon}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', fontFamily: "'Poppins', sans-serif" }}>{t.name}</div>
                    <div style={{ fontSize: 10, color: 'rgba(196,181,253,0.55)', fontFamily: "'Poppins', sans-serif", marginTop: 1 }}>{t.tag}</div>
                  </div>
                </div>
                <p style={{ fontSize: 12, color: '#e2e8f0', lineHeight: 1.6, fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}>{t.desc}</p>
              </div>
            ))}
          </div>

          {/* Flow */}
          <div style={{ marginTop: 16, padding: 16, background: 'rgba(109,40,217,0.05)', borderRadius: 12, border: '1px solid rgba(139,92,246,0.2)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(196,181,253,0.7)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, fontFamily: "'Poppins', sans-serif" }}>Transaction flow</div>
            <div className="flex items-center gap-1 flex-wrap">
              {['User creates request', 'Link stored on-chain', 'Payer connects wallet', 'USDC transfer executes', 'Agent verifies on-chain'].map((step, i, arr) => (
                <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ background: 'rgba(109,40,217,0.15)', border: '1px solid rgba(139,92,246,0.4)', borderRadius: 8, padding: '6px 10px', fontSize: 10, color: '#c4b5fd', fontFamily: "'Poppins', sans-serif", fontWeight: 600, textAlign: 'center' }}>{step}</div>
                  {i < arr.length - 1 && <span style={{ color: 'rgba(139,92,246,0.6)', fontSize: 14 }}>›</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dev banner */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 20px', background: 'rgba(120,80,0,0.12)', border: '1px solid rgba(234,179,8,0.35)', borderRadius: 13, boxShadow: '0 0 14px rgba(234,179,8,0.08)' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#facc15', flexShrink: 0, display: 'inline-block' }} />
          <span style={{ fontSize: 12, color: 'rgba(253,224,71,0.88)', fontFamily: "'Poppins', sans-serif", fontWeight: 400, lineHeight: 1.55 }}>
            This project is currently under active development. Some features may not be fully functional yet. Payment execution via MetaMask is being finalized.
          </span>
        </div>

      </div>
    </main>
  );
}