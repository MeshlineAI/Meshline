import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config";
import type { Signal, ScanType, RiskTier } from "../types";

const genAI = new GoogleGenerativeAI(config.ai.geminiApiKey);

const SYSTEM_PROMPT = `You are a blockchain security auditor specializing in Base L2 smart contracts and DeFi protocols. Write concise, technical security reports. Use markdown. Focus only on actionable findings — omit generic warnings. Do not hedge or pad the report.`;

export async function generateReport(params: {
  target: string;
  scanType: ScanType;
  meshScore: number;
  tier: RiskTier;
  signals: Signal[];
}): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: config.ai.model,
    systemInstruction: SYSTEM_PROMPT,
  });

  const activeSignals = params.signals.filter((s) => s.severity !== "none");

  const prompt = `## Scan Target
- **Address/URL**: \`${params.target}\`
- **Type**: ${params.scanType}
- **MESH Score**: ${params.meshScore}/1000 (${params.tier})

## Signal Results
${params.signals
  .map(
    (s) =>
      `- **${s.name}** [${s.severity.toUpperCase()}]: ${s.description}${
        s.value !== null ? `\n  Value: \`${JSON.stringify(s.value)}\`` : ""
      }`
  )
  .join("\n")}

## Task
Write a security report with these sections:
1. **Executive Summary** — 2–3 sentences, overall verdict
2. **Key Findings** — one subsection per non-"none" signal (skip if all clear)
3. **Recommendations** — concrete steps to reduce risk
4. **Verdict** — one sentence: safe/proceed with caution/avoid

Keep the report under 500 words. Be precise. No boilerplate.`;

  return withRetry(() => generateWithTimeout(model, prompt, 20_000), 2);
}

async function generateWithTimeout(
  model: ReturnType<GoogleGenerativeAI["getGenerativeModel"]>,
  prompt: string,
  timeoutMs: number
): Promise<string> {
  const result = await Promise.race([
    model.generateContent(prompt),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Gemini request timed out")), timeoutMs)
    ),
  ]);
  return (result as Awaited<ReturnType<typeof model.generateContent>>).response.text();
}

async function withRetry<T>(fn: () => Promise<T>, retries: number): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
      }
    }
  }
  throw lastErr;
}
