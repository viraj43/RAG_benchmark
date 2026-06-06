/**
 * Calculates Redundancy (%)
 * Measures how many of the top 5 links are from the exact same domain.
 * High redundancy = bad (e.g., returning 5 Wikipedia links).
 */
export const calculateRedundancy = (urls) => {
  if (!urls || urls.length === 0) return 0;
  
  const domains = urls.map(u => {
    try {
      return new URL(u).hostname;
    } catch {
      return u;
    }
  });

  const uniqueDomains = new Set(domains).size;
  const duplicateCount = domains.length - uniqueDomains;
  
  // Return as a percentage (0 to 1)
  return duplicateCount / domains.length;
};

/**
 * Calculates Noise Ratio (0 to 1)
 * Crude approximation without full NLP:
 * Detects heavy HTML, JS, or common nav boilerplate terms in the raw text.
 */
export const calculateNoiseRatio = (text) => {
  if (!text || text.length === 0) return 1.0;
  
  const htmlTags = (text.match(/<\/?[a-z][\s\S]*?>/gi) || []).length;
  const boilerplateTerms = (text.match(/(sign in|accept cookies|subscribe|privacy policy|skip to content)/gi) || []).length;
  
  // Heavily penalize raw HTML tags
  const noiseScore = (htmlTags * 5) + (boilerplateTerms * 2);
  
  // Normalize against text length, bound to 1.0 max
  const ratio = noiseScore / (text.length / 100);
  return Math.max(0, Math.min(1, ratio));
};
