export class BaseClient {
  constructor(name, config) {
    this.name = name;
    this.url = config.url;
    this.keys = config.keys || [];
    this.keyIndex = 0;
    this.costPer1k = config.costPer1k || 0;
  }

  /**
   * Retrieves the current API key and rotates to the next one if requested.
   */
  getKey(rotate = false) {
    if (this.keys.length === 0) return null;
    if (rotate) {
      this.keyIndex = (this.keyIndex + 1) % this.keys.length;
      console.log(`[${this.name}] Rotated to API key index ${this.keyIndex}`);
    }
    return this.keys[this.keyIndex];
  }

  /**
   * Wrapper for executing API calls with automatic key rotation on 429/403.
   * Returns standardized result object.
   */
  async execute(query, fetchFn) {
    let attempts = 0;
    let nonKeyErrors = 0;
    const maxAttempts = Math.max(2, this.keys.length * 2); // Ensure we can retry at least once

    while (attempts < maxAttempts) {
      const currentKey = this.getKey();
      try {
        if (!currentKey && this.name !== "keiro") {
           throw new Error("No API key provided.");
        }

        // Measure latency ONLY for the current request
        const startTime = Date.now();
        const rawData = await fetchFn(currentKey);
        const latencyMs = Date.now() - startTime;
        
        return {
          success: true,
          latencyMs,
          ...rawData
        };

      } catch (error) {
        const isKeyError = error.message.includes("429") || error.message.includes("403") || error.message.includes("401");
        
        if (isKeyError) {
          console.warn(`   ⚠️ [${this.name}] Key failed (${error.message}). Rotating...`);
          this.getKey(true); // Rotate
          attempts++;
          await new Promise(res => setTimeout(res, 1000));
        } else {
          // Non-API key failure (e.g. 500, timeout)
          nonKeyErrors++;
          attempts++;
          
          if (nonKeyErrors === 1) {
             console.warn(`   ⚠️ [${this.name}] Server Error: ${error.message}. Giving it one more chance...`);
             await new Promise(res => setTimeout(res, 1500)); // Small wait before retry
          } else {
             console.error(`   ❌ [${this.name}] Failed twice on server error. Giving up.`);
             return {
               success: false,
               latencyMs: 0,
               content: "",
               urls: [],
               error: `Failed after 2 tries: ${error.message}`
             };
          }
        }
      }
    }

    return {
      success: false,
      latencyMs: 0,
      content: "",
      urls: [],
      error: "All attempts exhausted (Keys or Retries failed)."
    };
  }

  // To be implemented by subclasses
  async search(query) {
    throw new Error("Not implemented");
  }
}
