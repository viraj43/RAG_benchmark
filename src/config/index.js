import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

/**
 * Helper to parse comma-separated API keys from .env
 * Allows rotating through multiple free-tier keys
 */
const parseKeys = (envString) => {
  if (!envString) return [];
  return envString.split(",").map((k) => k.trim()).filter(Boolean);
};

export const CONFIG = {
  judge: {
    baseUrl: process.env.OLLAMA_URL || "http://localhost:11434",
    model: process.env.OLLAMA_MODEL || "gpt-oss:20b-cloud",
  },
  providers: {
    keiro: {
      url: "https://kierolabs.space/api/v2/search/content",
      keys: parseKeys(process.env.KEIRO_API_KEYS),
      costPer1k: 1.0, // $50/month = 50,000 credits = $1.00 per 1,000 queries (Startup plan: dedicated account manager, 90-day log retention, SSO & SAML, 10% loyalty bonus, priority infrastructure)
    },
    tavily: {
      url: "https://api.tavily.com/search",
      keys: parseKeys(process.env.TAVILY_API_KEYS),
      costPer1k: 5.0, // $5 per 1000 searches
    },
    exa: {
      url: "https://api.exa.ai/search",
      keys: parseKeys(process.env.EXA_API_KEYS),
      costPer1k: 10.0, // $10 per 1000 searches
    },
    firecrawl: {
      url: "https://api.firecrawl.dev/v2/search",
      keys: parseKeys(process.env.FIRECRAWL_API_KEYS),
      costPer1k: 8.0, 
    },
    you: {
      url: "https://ydc-index.io/v1/search",
      keys: parseKeys(process.env.YOU_API_KEYS),
      costPer1k: 15.0,
    }
  },
  benchmark: {
    resultsDir: path.resolve(__dirname, "../../results"),
    maxConcurrency: parseInt(process.env.MAX_CONCURRENCY || "3", 10),
    timeoutMs: parseInt(process.env.TIMEOUT_MS || "30000", 10),
  }
};
