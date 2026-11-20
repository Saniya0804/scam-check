import "dotenv/config";
import express from "express";
import cors from "cors";
import { analyze } from "./analyze.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "20kb" }));

import rateLimit from "express-rate-limit";
app.use("/api/", rateLimit({ windowMs: 60_000, max: 20, message: "Too many requests. Please wait a minute." }));

app.post("/api/analyze", async (req, res) => {
  const { text, lang } = req.body || {};
  if (typeof text !== "string" || !text.trim() || text.length > 2000)
    return res.status(400).json({ error: "Send a message between 1 and 2000 characters." });
  try {
    res.json(await analyze(text, lang === "hi" ? "hi" : "en"));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Something went wrong." });
  }
});

app.listen(process.env.PORT || 5000, () => console.log("API running"));