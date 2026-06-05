// Augments Express.Request with Meshline-specific flags set by middleware.
declare global {
  namespace Express {
    interface Request {
      // Set true by x402Gate after a verified, settled payment. Free-tier
      // scans never set it. Used to decide whether onchain EAS attestation
      // (which costs gas) is allowed for this request.
      scanPaid?: boolean;
    }
  }
}

export {};
