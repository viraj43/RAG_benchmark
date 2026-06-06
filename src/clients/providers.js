import { BaseClient } from "./base.js";
import { CONFIG } from "../config/index.js";


export class KeiroLabsClient extends BaseClient {
  constructor() {
    super("KeiroLabs", CONFIG.providers.keiro);
  }

  async search(query) {
    return this.execute(query, async (key) => {
      const res = await fetch(this.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${key}`
        },
        body: JSON.stringify({ query, maxResults: 5, mode: "medium", noCache: true })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      
      const urls = (data.results || []).map(r => r.url);
      const content = (data.results || []).map(r => `Title: ${r.title}\n${r.content || r.snippet}`).join("\n\n---\n\n");
      
      return { content, urls };
    });
  }
}

export class TavilyClient extends BaseClient {
  constructor() {
    super("Tavily", CONFIG.providers.tavily);
  }

  async search(query) {
    return this.execute(query, async (key) => {
      const res = await fetch(this.url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
        body: JSON.stringify({ query, search_depth: "advanced", include_raw_content: "markdown", max_results: 5, chunks_per_source: 3 })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      
      const urls = (data.results || []).map(r => r.url);
      const content = (data.results || []).map(r => `Title: ${r.title}\n${r.raw_content || r.content}`).join("\n\n---\n\n");
      
      return { content, urls };
    });
  }
}

export class ExaClient extends BaseClient {
  constructor() {
    super("Exa", CONFIG.providers.exa);
  }

  async search(query) {
    return this.execute(query, async (key) => {
      const res = await fetch(this.url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": key },
        body: JSON.stringify({
          query,
          type: "auto",
          numResults: 5,
          contents: {
            highlights: { numSentences: 5, highlightsPerUrl: 3 },
            livecrawl: "always"
          }
        })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      
      const urls = (data.results || []).map(r => r.url);
      const content = (data.results || []).map(r => {
        let body = "";
        if (r.highlights && r.highlights.length > 0) {
          body += "Key Highlights:\n" + r.highlights.join("\n");
        }
        return `Title: ${r.title}\n${body}`;
      }).join("\n\n---\n\n");
      
      return { content, urls };
    });
  }
}

export class FirecrawlClient extends BaseClient {
  constructor() {
    super("Firecrawl", CONFIG.providers.firecrawl);
  }

  async search(query) {
    return this.execute(query, async (key) => {
      const res = await fetch("https://api.firecrawl.dev/v2/search", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
        body: JSON.stringify({
          query,
          limit: 5,
          scrapeOptions: {
            formats: ["markdown"]
          },
          timeout: 30000
        })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      
      const results = data.data?.web || data.data || [];
      const urls = results.map(r => r.url);
      const content = results.map(r => `Title: ${r.title}\n${r.markdown || r.description || ""}`).join("\n\n---\n\n");
      
      return { content, urls };
    });
  }
}

export class YouClient extends BaseClient {
  constructor() {
    super("You", CONFIG.providers.you);
  }

  async search(query) {
    return this.execute(query, async (key) => {
      const url = `${this.url}?query=${encodeURIComponent(query)}&count=5&livecrawl=web&livecrawl_formats=markdown&crawl_timeout=15`;
      
      const res = await fetch(url, {
        method: "GET",
        headers: { "X-API-Key": key, "Accept": "application/json" }
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      
      const hits = data.hits || (data.results && data.results.web) || data.web?.results || [];
      
      if (hits.length === 0) {
        throw new Error("API returned no results. Raw response: " + JSON.stringify(data).substring(0, 100));
      }

      const urls = hits.map(r => r.url);
      const content = hits.map(r => {
        let text = "";
        if (r.markdown) text = r.markdown;
        else if (Array.isArray(r.snippets)) text = r.snippets.join(" ");
        else if (r.snippet) text = r.snippet;
        else if (r.description) text = r.description;
        return `Title: ${r.title}\n${text}`;
      }).join("\n\n---\n\n");
      
      return { content, urls };
    });
  }
}
