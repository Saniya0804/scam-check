import "dotenv/config";

const res = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models?pageSize=100&key=${process.env.GEMINI_API_KEY}`
);
const data = await res.json();

if (!res.ok) {
  console.log("Error:", res.status, data);
} else {
  for (const m of data.models) {
    if (m.supportedGenerationMethods?.includes("generateContent")) {
      console.log(m.name, "-", m.displayName);
    }
  }
}