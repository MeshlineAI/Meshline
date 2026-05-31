import type { AppData, Signal, Severity } from "../../types";

const API_KEY_PATTERNS = [
  /AIza[0-9A-Za-z-_]{35}/g,              // Google API keys
  /sk-[a-zA-Z0-9]{48}/g,                 // OpenAI
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g, // UUID-style keys
  /AKIA[0-9A-Z]{16}/g,                   // AWS access keys
  /-----BEGIN [A-Z]+ PRIVATE KEY-----/g, // PEM keys
];

const PHISHING_PATTERNS = [
  /unisw[a0@]p/i,
  /c0inbase/i,
  /aav[e3]/i,
  /0x.*\.xyz$/i,
  /connect.*wallet.*\.xyz/i,
];

const SECURITY_HEADERS = [
  "content-security-policy",
  "x-frame-options",
  "x-content-type-options",
  "strict-transport-security",
  "permissions-policy",
];

export function tlsCheck(app: AppData): Signal {
  const isHttps = app.finalUrl.startsWith("https://");
  return {
    name: "TLS / HTTPS",
    severity: isHttps ? "none" : "high",
    value: { isHttps, url: app.finalUrl },
    description: isHttps
      ? "App is served over HTTPS."
      : "App is NOT served over HTTPS — wallet connect events can be intercepted.",
  };
}

export function securityHeaders(app: AppData): Signal {
  const missing = SECURITY_HEADERS.filter((h) => !app.headers[h]);
  const severity: Severity =
    missing.length >= 4 ? "high" :
    missing.length >= 2 ? "medium" :
    missing.length >= 1 ? "low" : "none";

  return {
    name: "Security Headers",
    severity,
    value: { missing },
    description:
      missing.length > 0
        ? `Missing ${missing.length} security header(s): ${missing.join(", ")}.`
        : "All key security headers present.",
  };
}

export function apiKeyExposure(app: AppData): Signal {
  const found: string[] = [];
  for (const pattern of API_KEY_PATTERNS) {
    const matches = app.bodyHtml.match(pattern);
    if (matches) found.push(...matches.map((m) => m.slice(0, 8) + "…"));
  }

  const unique = [...new Set(found)];

  return {
    name: "API Key Exposure",
    severity: unique.length > 0 ? "critical" : "none",
    value: { count: unique.length, samples: unique.slice(0, 3) },
    description:
      unique.length > 0
        ? `${unique.length} potential API key(s) detected in page source.`
        : "No exposed API keys detected in page source.",
  };
}

export function phishingPattern(app: AppData): Signal {
  const url = app.finalUrl.toLowerCase();
  const matched = PHISHING_PATTERNS.filter((p) => p.test(url));

  return {
    name: "Phishing Pattern",
    severity: matched.length > 0 ? "critical" : "none",
    value: { url, matched: matched.map((p) => p.toString()) },
    description:
      matched.length > 0
        ? `URL matches ${matched.length} phishing pattern(s). This may be a fake DeFi site.`
        : "URL does not match known phishing patterns.",
  };
}

export function cspPolicy(app: AppData): Signal {
  const csp = app.headers["content-security-policy"];

  if (!csp) {
    return {
      name: "CSP Policy",
      severity: "medium",
      value: null,
      description: "No Content-Security-Policy header. XSS attacks not mitigated.",
    };
  }

  const hasUnsafeInline = csp.includes("'unsafe-inline'");
  const hasUnsafeEval = csp.includes("'unsafe-eval'");
  const hasWildcard = csp.includes("*");

  const issues = [
    hasUnsafeInline && "'unsafe-inline'",
    hasUnsafeEval && "'unsafe-eval'",
    hasWildcard && "wildcard (*) source",
  ].filter(Boolean) as string[];

  return {
    name: "CSP Policy",
    severity: issues.length >= 2 ? "high" : issues.length === 1 ? "medium" : "none",
    value: { issues },
    description:
      issues.length > 0
        ? `CSP has weak directives: ${issues.join(", ")}.`
        : "CSP policy appears reasonably strict.",
  };
}
