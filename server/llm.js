export async function explainWithLLM({ masked, rules, patterns, lang }) {
  const key = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL;
  if (!key || !model) return null;

  const language = lang === "hi" ? "Hindi (Devanagari script)" : "simple English";
  const prompt = `You explain scam checks to ordinary Indian users.
Message (sensitive data masked): """${masked}"""
Risk level (already decided, do not change): ${rules.level}
Findings from automatic checks:
${rules.findings.map((f) => "- " + f.reason).join("\n") || "- none"}
Similar known scams:
${patterns.map((p) => `- ${p.name}: ${p.redFlags} Action: ${p.action}`).join("\n") || "- none"}

Return ONLY JSON: {"reasons": ["..."], "action": "..."}
Rules: use ONLY the findings and known scams above. Never invent facts. At most 3 reasons, each under 20 words. Write in ${language}.
If risk is Safe, give 1-2 reasons it looks normal and a brief caution.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
        }),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    if (!Array.isArray(parsed.reasons) || typeof parsed.action !== "string") return null;
    return { reasons: parsed.reasons.slice(0, 3), action: parsed.action };
  } catch {
    return null; // any failure -> use the fallback
  }
}

export function fallbackExplanation(rules, patterns, lang) {
  const actions = {
    Dangerous: { en: "Do not click or reply. Report at 1930 or cybercrime.gov.in.", hi: "लिंक पर क्लिक न करें और जवाब न दें। 1930 या cybercrime.gov.in पर रिपोर्ट करें।" },
    Suspicious: { en: "Be careful. Verify through the official app or website before acting.", hi: "सावधान रहें। कुछ करने से पहले आधिकारिक ऐप या वेबसाइट से जाँच करें।" },
    Safe: { en: "No scam signs found, but never share OTPs or PINs.", hi: "कोई धोखाधड़ी के संकेत नहीं मिले, लेकिन OTP या PIN कभी साझा न करें।" },
  };
  const reasons = rules.findings.slice(0, 3).map((f) => f.reason);
  return { reasons: reasons.length ? reasons : ["No suspicious links or requests were found."], action: actions[rules.level][lang === "hi" ? "hi" : "en"] };
}