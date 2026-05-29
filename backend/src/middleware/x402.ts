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

async function verifyWithFacilitator(
  payment: PaymentPayload,
  requirements: PaymentRequirements
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${config.payment.facilitatorUrl}/settle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payment, requirements }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "unknown error");
      return { success: false, error: text };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message ?? "facilitator unreachable" };
  }
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

    const { success, error } = await verifyWithFacilitator(payment, requirements);
    if (!success) {
      res.status(402).json({ error: "Payment verification failed", detail: error });
      return;
    }

    next();
  };
}
