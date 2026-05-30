"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { useWallet } from "@/components/wallet/WalletProvider";
import { ConnectWallet } from "@/components/wallet/ConnectWallet";

export function StakeCard() {
  const { address } = useWallet();
  const [amount, setAmount] = useState("");
  const value = Number(amount) || 0;
  const weeklyUsdc = (value * 0.0008).toFixed(2); // illustrative rev-share estimate

  return (
    <div className="panel p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">Stake MESH</h2>
        <span className="mono rounded-full border border-acid/30 px-2.5 py-1 text-[10px] uppercase tracking-widest text-acid">
          20% rev share
        </span>
      </div>
      <p className="mt-2 text-xs text-muted">
        Stake MESH to earn 20% of scan revenue (paid weekly in USDC), unlock premium badges, and get
        sub-5-minute alert latency.
      </p>

      <div className="mt-5 rounded-xl border border-white/10 bg-ink p-1.5">
        <div className="flex items-center gap-2 px-2">
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
            inputMode="decimal"
            placeholder="0.0"
            className="mono min-w-0 flex-1 bg-transparent py-3 text-lg text-white placeholder-muted-faint focus:outline-none"
          />
          <span className="mono shrink-0 rounded-full bg-white/5 px-3 py-1.5 text-xs font-semibold text-white">
            MESH
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-muted">Est. weekly rev share</span>
        <span className="mono text-acid">≈ ${weeklyUsdc} USDC</span>
      </div>

      <div className="mt-5">
        {address ? (
          <button
            type="button"
            disabled
            className="flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 py-3 text-sm font-semibold text-muted"
          >
            <Lock size={14} /> Staking opens at token launch
          </button>
        ) : (
          <ConnectWallet className="w-full justify-center !py-3" />
        )}
      </div>
    </div>
  );
}
