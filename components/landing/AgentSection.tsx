import { Bot, KeyRound, Zap } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

const ENDPOINTS = [
  { method: "GET", path: "/v1/scan/contract/:address", price: "0.001", use: "Before executing a DeFi interaction" },
  { method: "GET", path: "/v1/scan/wallet/:address", price: "0.001", use: "Before sending to an unknown address" },
  { method: "GET", path: "/v1/scan/app?url=", price: "0.005", use: "Before connecting a wallet to a dApp" },
  { method: "POST", path: "/v1/scan/batch", price: "0.0005", use: "Bulk portfolio risk check (≤50)" },
];

const PERKS = [
  { icon: KeyRound, title: "No API key", body: "No account, no subscription. The wallet pays per request." },
  { icon: Zap, title: "Pay-per-scan", body: "0.001 USDC on Base via x402. Settled before the report returns." },
  { icon: Bot, title: "Discoverable", body: "Listed on Agent.market and the x402 Bazaar — queryable by any Base agent." },
];

export function AgentSection() {
  return (
    <section id="agents" className="relative z-10 border-b border-white/10 py-24">
      <div className="container-mesh">
        <SectionHeading
          index="04"
          eyebrow="x402 + Agent API"
          title={
            <>
              The first onchain risk oracle{" "}
              <span className="text-gradient">for AI agents.</span>
            </>
          }
          description="Every Meshline endpoint is gated with x402 on Base. Any Coinbase Agentic Wallet or AgentKit agent can call it with zero setup — pay 0.001 USDC, get a structured, EAS-attested JSON report."
        />

        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          {/* terminal call */}
          <Reveal>
            <div className="panel h-full overflow-hidden">
              <div className="flex items-center gap-2 border-b border-white/10 bg-ink-900 px-4 py-3">
                <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px] shadow-accent" />
                <span className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-muted-faint">
                  Agent request · x402
                </span>
              </div>
              <pre className="overflow-x-auto p-5 font-mono text-[12.5px] leading-relaxed">
                <code>
                  <span className="text-muted-faint"># Agent checks a contract before it executes</span>
                  {"\n"}
                  <span className="text-acid">GET</span>{" "}
                  <span className="text-white">/v1/scan/contract/</span>
                  <span className="text-cyan-brand">0x833589…2913</span>
                  {"\n\n"}
                  <span className="text-muted-faint"># 402 → pay 0.001 USDC → retry → 200</span>
                  {"\n"}
                  <span className="text-[#b9cbe0]">{"{"}</span>
                  {"\n"}
                  {"  "}<span className="text-cyan-brand">&quot;meshScore&quot;</span>:{" "}
                  <span className="text-acid">924</span>,{"\n"}
                  {"  "}<span className="text-cyan-brand">&quot;tier&quot;</span>:{" "}
                  <span className="text-white">&quot;AAA&quot;</span>,{"\n"}
                  {"  "}<span className="text-cyan-brand">&quot;easUid&quot;</span>:{" "}
                  <span className="text-white">&quot;0xdef4…&quot;</span>,{"\n"}
                  {"  "}<span className="text-cyan-brand">&quot;reportUrl&quot;</span>:{" "}
                  <span className="text-white">&quot;meshline.io/scan/…&quot;</span>
                  {"\n"}
                  <span className="text-[#b9cbe0]">{"}"}</span>
                </code>
              </pre>
            </div>
          </Reveal>

          {/* endpoints table */}
          <Reveal delay={0.1}>
            <div className="panel h-full p-2">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest text-muted-faint">
                    <th className="px-3 py-3 font-medium">Endpoint</th>
                    <th className="px-3 py-3 text-right font-medium">USDC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {ENDPOINTS.map((e) => (
                    <tr key={e.path} className="align-top">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md border border-white/10 px-1.5 py-0.5 font-mono text-[10px] text-acid">
                            {e.method}
                          </span>
                          <span className="mono break-all text-[12.5px] text-white">{e.path}</span>
                        </div>
                        <div className="mt-1 text-xs text-muted">{e.use}</div>
                      </td>
                      <td className="mono whitespace-nowrap px-3 py-3 text-right font-semibold text-cyan-brand">
                        {e.price}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {PERKS.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.06}>
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-brand/30 bg-cyan-brand/5 text-cyan-brand">
                  <p.icon size={16} />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{p.title}</div>
                  <div className="mt-0.5 text-xs leading-relaxed text-muted">{p.body}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
