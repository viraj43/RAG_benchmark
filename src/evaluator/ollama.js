import { CONFIG } from "../config/index.js";
import { EVALUATOR_SYSTEM_PROMPT, getEvaluatorUserPrompt } from "../config/prompts.js";

/**
 * Robustly parses JSON from LLM output.
 * Handles markdown fences and trailing text.
 */
function extractJson(text) {
  try {
    let cleanText = text.trim();
    if (cleanText.includes("```json")) {
      cleanText = cleanText.split("```json")[1].split("```")[0].trim();
    } else if (cleanText.includes("```")) {
      cleanText = cleanText.split("```")[1].trim();
    }

    const start = cleanText.indexOf("{");
    const end = cleanText.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      cleanText = cleanText.substring(start, end + 1);
    }
    return JSON.parse(cleanText);
  } catch (err) {
    throw new Error(`Failed to parse Judge JSON. Raw output: ${text.substring(0, 200)}...`);
  }
}

/**
 * Grades the search context using the local Ollama Judge.
 * Returns the exact 3 quality metrics.
 */
export async function evaluateContext(query, searchContext) {
  const startTime = Date.now();

  if (!searchContext || searchContext.trim().length === 0) {
    return {
      relevance: 0, accuracy: 0, completeness: 0, quality_score: 0,
      reasoning: "API returned empty or invalid context.",
      eval_latency_ms: 0
    };
  }

  const prompt = getEvaluatorUserPrompt(query, searchContext);
  const openRouterKey = process.env.OPENROUTER_API_KEY || "sk-or-v1-*******************************************************";

  let lastError = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openRouterKey}`
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: EVALUATOR_SYSTEM_PROMPT },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" },
          temperature: 0.1
        })
      });

      if (!res.ok) {
        throw new Error(`OpenRouter API failed with status ${res.status}`);
      }

      const data = await res.json();
      const content = data.choices[0].message.content;
      const result = extractJson(content);

      const relevance = Math.max(0, Math.min(5, Number(result.relevance) || 0));
      const accuracy = Math.max(0, Math.min(5, Number(result.accuracy) || 0));
      const completeness = Math.max(0, Math.min(5, Number(result.completeness) || 0));
      const quality_score = (relevance + accuracy + completeness) / 3;

      return {
        relevance,
        accuracy,
        completeness,
        quality_score,
        reasoning: result.reasoning || "No reasoning provided.",
        eval_latency_ms: Date.now() - startTime
      };

    } catch (error) {
      lastError = error;
      console.log(`   ⚠️ [Judge] Attempt ${attempt} failed: ${error.message}. Retrying in 3s...`);
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  console.error(`[Judge Error] Failed after 3 attempts: ${lastError.message}`);
  return {
    relevance: 0, accuracy: 0, completeness: 0, quality_score: 0,
    reasoning: `JUDGE FAILED: ${lastError.message}`,
    eval_latency_ms: Date.now() - startTime
  };
}
