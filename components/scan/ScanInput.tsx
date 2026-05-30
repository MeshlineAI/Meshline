"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, AlertTriangle, Wallet, Loader2 } from "lucide-react";
import { initiateScan, MeshApiError, type ScanType } from "@/lib/api";
import { quickType, resolveScanType, type SelectorValue } from "@/lib/detect";
import { recordScan } from "@/lib/history";
import { buildPaymentHeader, formatUsdc, type PaymentRequirements } from "@/lib/x402";
import { useWallet } from "@/components/wallet/WalletProvider";
import { ScanProgress } from "./ScanProgress";
import { cn } from "@/lib/utils";

const SELECTORS: { value: SelectorValue; label: string }[] = [
  { value: "auto", label: "Auto" },
  { value: "contract", label: "Contract" },
  { value: "wallet", label: "Wallet" },
  { value: "app", label: "App" },
];

interface PayState {
  requirements: PaymentRequirements;
  resolved: { type: ScanType; input: string };
}

export function ScanInput({ autoFocus = false }: { autoFocus?: boolean }) {
  const router = useRouter();
  const { address, provider, onBase, openPicker, switchToBase } = useWallet();
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState("");
  const [selected, setSelected] = useState<SelectorValue>("auto");
  const [scanning, setScanning] = useState(false);
  const [paying, setPaying] = useState(false);
  const [scanType, setScanType] = useState<ScanType>("contract");
  const [error, setError] = useState<string | null>(null);
  const [pay, setPay] = useState<PayState | null>(null);

  // Allow other surfaces to prefill the box.
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ value: string }>).detail;
      if (detail?.value) {
        setInput(detail.value);
        setError(null);
        setPay(null);
        inputRef.current?.focus();
      }
    };
    window.addEventListener("meshline:setscan", handler);
    return () => window.removeEventListener("meshline:setscan", handler);
  }, []);

  const detected = selected === "auto" ? quickType(input) : selected;

  /** Run the scan; pass a payment header when retrying a paid scan. */
  const runScan = async (resolved: { type: ScanType; input: string }, paymentHeader?: string) => {
    setScanType(resolved.type);
    setScanning(true);
    try {
      const result = await initiateScan({
        input: resolved.input,
        type: resolved.type,
        paymentHeader,
      });
      if (!result.id) throw new MeshApiError(500, "Scan returned no report id");
      recordScan(result);
      router.push(`/scan/${result.id}`);
      // keep `scanning` true — navigation unmounts this component
    } catch (e) {
      setScanning(false);
      if (e instanceof MeshApiError && e.paymentRequired) {
        if (e.requirements) {
          setPay({ requirements: e.requirements, resolved });
        } else {
          setError(e.detail ?? "Free scan quota reached for this month.");
        }
      } else if (e instanceof MeshApiError) {
        setError(e.detail ? `${e.message} — ${e.detail}` : e.message);
      } else {
        setError("Scan failed. Please try again.");
      }
    }
  };

  const handleScan = async () => {
    if (scanning || paying) return;
    setError(null);
    setPay(null);

    const trimmed = input.trim();
    if (!trimmed) {
      setError("Enter a contract address, wallet address, or app URL.");
      return;
    }
    if (selected === "auto" && quickType(trimmed) === "invalid") {
      setError("That doesn't look like a Base address (0x…) or an app URL.");
      return;
    }

    const resolved = await resolveScanType(trimmed, selected);
    if ("error" in resolved) {
      setError(resolved.error);
      return;
    }
    await runScan(resolved);
  };

  /** Pay the x402 invoice with the connected wallet, then retry the scan. */
  const handlePay = async () => {
    if (!pay || paying) return;
    if (!address || !provider) {
      openPicker();
      return;
    }
    setPaying(true);
    setError(null);
    try {
      if (!onBase) await switchToBase();
      const header = await buildPaymentHeader({
        requirements: pay.requirements,
        provider,
        from: address,
      });
      const resolved = pay.resolved;
      setPay(null);
      await runScan(resolved, header);
    } catch (e) {
      const msg = (e as { message?: string })?.message ?? "";
      setError(
        /reject|denied|4001/i.test(msg)
          ? "Payment cancelled in wallet."
          : "Payment failed. Please try again.",
      );
    } finally {
      setPaying(false);
    }
  };

  if (scanning) {
    return (
      <div className="w-full max-w-2xl">
        <ScanProgress type={scanType} />
      </div>
    );
  }

  const amount = pay ? formatUsdc(pay.requirements.maxAmountRequired) : "";

  return (
    <div className="w-full max-w-2xl">
      {/* type selector */}
      <div className="glass mb-3 inline-flex items-center gap-1 rounded-full p-1">
        {SELECTORS.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => setSelected(s.value)}
            className={cn(
              "rounded-full px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-widest transition-colors",
              selected === s.value ? "bg-white/10 text-white" : "text-muted hover:text-white",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* input + scan */}
      <div className="group relative">
        <div className="absolute -inset-[1.5px] rounded-[20px] bg-gradient-to-r from-accent/50 to-accent-soft/40 opacity-40 blur-[3px] transition-opacity group-focus-within:opacity-90" />
        <div className="glass relative flex items-center gap-2 rounded-2xl p-2 pl-4">
          <span className="font-mono text-accent">&gt;</span>
          <input
            ref={inputRef}
            autoFocus={autoFocus}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleScan()}
            placeholder="0x contract · wallet · app.uniswap.org"
            spellCheck={false}
            autoComplete="off"
            className="mono min-w-0 flex-1 bg-transparent px-1 text-sm text-white placeholder-muted-faint focus:outline-none"
          />
          {input.trim() && detected !== "invalid" && (
            <span className="glass hidden shrink-0 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-muted sm:inline-block">
              {detected}
            </span>
          )}
          <button
            type="button"
            onClick={handleScan}
            disabled={!input.trim()}
            className="btn-primary shrink-0 px-5 py-3 disabled:opacity-40"
          >
            SCAN <ArrowRight size={15} />
          </button>
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-faint">
        3 free scans · No signup · AI report in ~30 seconds
      </p>

      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-tier-c/40 bg-tier-c/10 px-3 py-2.5 text-xs text-tier-c">
          <AlertTriangle size={14} />
          {error}
        </div>
      )}

      {pay && (
        <div className="glass mt-3 rounded-2xl border-accent/30 p-4 text-left">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Wallet size={15} className="text-accent" /> Free scans used — pay to continue
          </div>
          <p className="mt-1 text-xs text-muted">
            Pay{" "}
            <span className="font-semibold text-accent">{amount} USDC</span> on Base via x402 to run
            this {pay.resolved.type} scan. Settled before your report is generated.
          </p>
          <button
            type="button"
            onClick={handlePay}
            disabled={paying}
            className="btn-primary mt-3 px-5 py-2.5 text-xs disabled:opacity-50"
          >
            {paying ? <Loader2 size={14} className="animate-spin" /> : <Wallet size={14} />}
            {paying
              ? "Confirm in wallet…"
              : address
                ? `Pay ${amount} USDC`
                : "Connect wallet to pay"}
          </button>
        </div>
      )}
    </div>
  );
}
