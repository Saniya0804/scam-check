import { maskSensitive } from "./masking.js";
import { runRules } from "./rules.js";
import { retrievePatterns } from "./retrieval.js";
import { explainWithLLM, fallbackExplanation } from "./llm.js";

export async function analyze(rawText, lang = "en") {
  const masked = maskSensitive(rawText);
  const rules = runRules(masked);
  const patterns = retrievePatterns(masked);

  const llmResult = await explainWithLLM({ masked, rules, patterns, lang });
const explanation = llmResult || fallbackExplanation(rules, patterns, lang);

  return {
    risk: rules.level,
    score: rules.score,
    findings: rules.findings.map((f) => f.id),
    reasons: explanation.reasons,
    action: explanation.action,
    masked,
    source: llmResult ? "llm" : "fallback",
  };
}