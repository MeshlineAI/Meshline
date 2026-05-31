import type { Request, Response, NextFunction } from "express";
import { config } from "../config";

const USDC_DECIMALS = 6;

function toAtomicUnits(amountUsdc: string): string {
  return Math.round(parseFloat(amountUsdc) * 10 ** USDC_DECIMALS).toString();
}

interface PaymentRequirements {
  scheme: "exact";
  network: "base-mainnet";
  maxAmountRequired: string;
  resource: string;
  description: string;
  mimeType: "application/json";
  payTo: string;
  maxTimeoutSeconds: number;
  asset: string;
  extra: { name: string; version: string };
}

interface PaymentPayload {
  x402Version: number;
  scheme: string;
  network: string;
  payload: {
    signature: string;
    authorization: {
      from: string;
      to: string;
      value: string;
      validAfter: string;
      validBefore: string;
      nonce: string;
    };
  };
}

function buildRequirements(
  req: Request,
  amountUsdc: string,
  description: string
): PaymentRequirements {
  return {
    scheme: "exact",
    network: "base-mainnet",
    maxAmountRequired: toAtomicUnits(amountUsdc),
    resource: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
    description,
    mimeType: "application/json",
    payTo: config.payment.treasuryAddress ?? "",
    maxTimeoutSeconds: 300,
    asset: config.payment.usdcAddress,
    extra: { name: "USDC", version: "2" },
  };
}

const X402_VERSION = 1;

/**
 * Validates that the client's signed authorization actually matches what we
 * asked for. Without this, a client could underpay, pay a different address,
 * or pay on the wrong network and still pass.
 */
function validatePaymentMatchesRequirements(
  payment: PaymentPayload,
  requirements: PaymentRequirements
): string | null {
  const auth = payment?.payload?.authorization;
  if (!auth) return "Missing authorization in payment payload";

  if ((payment.network ?? "").toLowerCase() !== requirements.network.toLowerCase()) {
    return `Network mismatch: expected ${requirements.network}, got ${payment.network}`;
  }
  if ((payment.scheme ?? "").toLowerCase() !== requirements.scheme.toLowerCase()) {
    return `Scheme mismatch: expected ${requirements.scheme}, got ${payment.scheme}`;
  }
  if ((auth.to ?? "").toLowerCase() !== requirements.payTo.toLowerCase()) {
    return "Payment recipient does not match treasury address";
  }
  // Client must authorize at least the required amount
  let authorized: bigint;
  let required: bigint;
  try {
    authorized = BigInt(auth.value);
    required = BigInt(requirements.maxAmountRequired);
  } catch {
    return "Invalid payment value";
  }
  if (authorized < required) {
    return `Underpayment: authorized ${authorized}, required ${required}`;
  }
  return null;
}

async function callFacilitator(
  path: "verify" | "settle",
  payment: PaymentPayload,
  requirements: PaymentRequirements
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${config.payment.facilitatorUrl}/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        x402Version: X402_VERSION,
        paymentPayload: payment,
        paymentRequirements: requirements,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    const body: any = await res.json().catch(() => ({}));

    if (!res.ok) {
      return { ok: false, error: body?.error ?? body?.invalidReason ?? body?.errorReason ?? `facilitator ${path} HTTP ${res.status}` };
    }

    // Gate on the JSON success/validity field, NOT on res.ok
    const success = path === "verify" ? (body.isValid ?? body.valid) : body.success;
    if (!success) {
      return { ok: false, error: body?.invalidReason ?? body?.errorReason ?? `facilitator ${path} returned failure` };
    }

    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message ?? `facilitator ${path} unreachable` };
  }
}

async function verifyAndSettle(
  payment: PaymentPayload,
  requirements: PaymentRequirements
): Promise<{ success: boolean; error?: string }> {
  // Verify the signature/authorization is valid before settling on-chain
  const verify = await callFacilitator("verify", payment, requirements);
  if (!verify.ok) return { success: false, error: verify.error };

  const settle = await callFacilitator("settle", payment, requirements);
  if (!settle.ok) return { success: false, error: settle.error };

  return { success: true };
}

export function x402Gate(amountUsdc: string, description: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!config.payment.treasuryAddress) {
      // x402 not configured — allow through in development
      if (config.nodeEnv === "development") {
        next();
        return;
      }
      res.status(500).json({ error: "Payment system not configured" });
      return;
    }

    const paymentHeader = req.headers["x-payment"] as string | undefined;
    const requirements = buildRequirements(req, amountUsdc, description);

    if (!paymentHeader) {
      res
        .status(402)
        .set(
          "X-Payment-Requirements",
          Buffer.from(JSON.stringify(requirements)).toString("base64")
        )
        .json({ error: "Payment required", requirements });
      return;
    }

    let payment: PaymentPayload;
    try {
      payment = JSON.parse(Buffer.from(paymentHeader, "base64").toString("utf-8"));
    } catch {
      res.status(402).json({ error: "Malformed X-Payment header" });
      return;
    }

    // Reject mismatched/underpaid authorizations before touching the facilitator
    const mismatch = validatePaymentMatchesRequirements(payment, requirements);
    if (mismatch) {
      res.status(402).json({ error: "Payment does not match requirements", detail: mismatch });
      return;
    }

    const { success, error } = await verifyAndSettle(payment, requirements);
    if (!success) {
      res.status(402).json({ error: "Payment verification failed", detail: error });
      return;
    }

    next();
  };
}
