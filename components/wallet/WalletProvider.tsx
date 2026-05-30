"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

export interface Eip1193Provider {
  request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
}

interface Eip6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
}
interface Eip6963ProviderDetail {
  info: Eip6963ProviderInfo;
  provider: Eip1193Provider;
}

declare global {
  interface Window {
    ethereum?: Eip1193Provider & { providers?: Eip1193Provider[] };
  }
  interface WindowEventMap {
    "eip6963:announceProvider": CustomEvent<Eip6963ProviderDetail>;
  }
}

const BASE_CHAIN_ID = "0x2105"; // 8453

// Known wallets we always surface (with install links if not detected).
export interface WalletOption {
  key: string;
  name: string;
  icon: string | null; // data-uri from EIP-6963, else null → lettered tile
  rdns?: string;
  installed: boolean;
  installUrl?: string;
  provider?: Eip1193Provider;
}

const FALLBACKS: Omit<WalletOption, "installed" | "provider">[] = [
  { key: "coinbase", name: "Coinbase Wallet", icon: null, rdns: "com.coinbase.wallet", installUrl: "https://www.coinbase.com/wallet/downloads" },
  { key: "metamask", name: "MetaMask", icon: null, rdns: "io.metamask", installUrl: "https://metamask.io/download/" },
];

interface WalletState {
  address: string | null;
  chainId: string | null;
  connecting: boolean;
  onBase: boolean;
  /** Active EIP-1193 provider for the connected wallet (for signing x402). */
  provider: Eip1193Provider | null;
  options: WalletOption[];
  pickerOpen: boolean;
  openPicker: () => void;
  closePicker: () => void;
  connectWith: (option: WalletOption) => Promise<void>;
  switchToBase: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletState | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [detected, setDetected] = useState<Eip6963ProviderDetail[]>([]);
  const [active, setActive] = useState<Eip1193Provider | null>(null);

  // EIP-6963 multi-wallet discovery.
  useEffect(() => {
    const onAnnounce = (e: CustomEvent<Eip6963ProviderDetail>) => {
      setDetected((prev) =>
        prev.some((p) => p.info.uuid === e.detail.info.uuid) ? prev : [...prev, e.detail],
      );
    };
    window.addEventListener("eip6963:announceProvider", onAnnounce);
    window.dispatchEvent(new Event("eip6963:requestProvider"));
    return () => window.removeEventListener("eip6963:announceProvider", onAnnounce);
  }, []);

  // Restore an already-authorized session silently (no redirect).
  useEffect(() => {
    const eth = window.ethereum;
    if (!eth) return;
    eth
      .request({ method: "eth_accounts" })
      .then((accts) => {
        const list = accts as string[];
        if (list?.length) {
          setAddress(list[0]);
          setActive(eth);
        }
      })
      .catch(() => {});
    eth.request({ method: "eth_chainId" }).then((c) => setChainId(c as string)).catch(() => {});
  }, []);

  // Bind account/chain change listeners to the active provider.
  useEffect(() => {
    const eth = active;
    if (!eth?.on) return;
    const onAccts = (...args: unknown[]) => {
      const list = args[0] as string[];
      setAddress(list?.length ? list[0] : null);
    };
    const onChain = (...args: unknown[]) => setChainId(args[0] as string);
    eth.on("accountsChanged", onAccts);
    eth.on("chainChanged", onChain);
    return () => {
      eth.removeListener?.("accountsChanged", onAccts);
      eth.removeListener?.("chainChanged", onChain);
    };
  }, [active]);

  const options = useMemo<WalletOption[]>(() => {
    const fromDetected: WalletOption[] = detected.map((d) => ({
      key: d.info.rdns || d.info.uuid,
      name: d.info.name,
      icon: d.info.icon,
      rdns: d.info.rdns,
      installed: true,
      provider: d.provider,
    }));
    // add known wallets that weren't detected, as install prompts
    const merged = [...fromDetected];
    for (const fb of FALLBACKS) {
      if (!merged.some((m) => m.rdns === fb.rdns || m.name === fb.name)) {
        merged.push({ ...fb, installed: false });
      }
    }
    return merged;
  }, [detected]);

  const switchToBase = useCallback(async () => {
    const eth = active ?? window.ethereum;
    if (!eth) return;
    try {
      await eth.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: BASE_CHAIN_ID }],
      });
    } catch (err) {
      // 4902 = chain not added → add Base, then it's selected.
      if ((err as { code?: number })?.code === 4902) {
        await eth
          .request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: BASE_CHAIN_ID,
                chainName: "Base",
                nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
                rpcUrls: ["https://mainnet.base.org"],
                blockExplorerUrls: ["https://basescan.org"],
              },
            ],
          })
          .catch(() => {});
      }
    }
  }, [active]);

  const connectWith = useCallback(
    async (option: WalletOption) => {
      if (!option.installed || !option.provider) {
        if (option.installUrl) window.open(option.installUrl, "_blank", "noopener");
        return;
      }
      const eth = option.provider;
      setConnecting(true);
      try {
        const accts = (await eth.request({ method: "eth_requestAccounts" })) as string[];
        if (accts?.length) {
          setActive(eth);
          setAddress(accts[0]);
          const c = (await eth.request({ method: "eth_chainId" })) as string;
          setChainId(c);
          if (c !== BASE_CHAIN_ID) {
            // best-effort: ask to switch, don't block the redirect on it
            eth
              .request({ method: "wallet_switchEthereumChain", params: [{ chainId: BASE_CHAIN_ID }] })
              .then(() => setChainId(BASE_CHAIN_ID))
              .catch(() => {});
          }
          setPickerOpen(false);
          router.push("/dashboard");
        }
      } catch {
        /* user rejected */
      } finally {
        setConnecting(false);
      }
    },
    [router],
  );

  const disconnect = useCallback(() => {
    setAddress(null);
  }, []);

  const value = useMemo<WalletState>(
    () => ({
      address,
      chainId,
      connecting,
      onBase: chainId === BASE_CHAIN_ID,
      provider: active,
      options,
      pickerOpen,
      openPicker: () => setPickerOpen(true),
      closePicker: () => setPickerOpen(false),
      connectWith,
      switchToBase,
      disconnect,
    }),
    [address, chainId, connecting, active, options, pickerOpen, connectWith, switchToBase, disconnect],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletState {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
