import { get_encoding } from "tiktoken";

// We use the standard OpenAI encoding (cl100k_base) to measure token efficiency
// This is an industry standard way to compare context window usage.
let encoder;

export const countTokens = (text) => {
  if (!text) return 0;
  
  if (!encoder) {
    encoder = get_encoding("cl100k_base");
  }

  try {
    const tokens = encoder.encode(text);
    return tokens.length;
  } catch (error) {
    console.warn("Failed to count tokens, falling back to approximation", error.message);
    // Rough approximation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }
};

export const freeTokenizer = () => {
  if (encoder) {
    encoder.free();
    encoder = null;
  }
};
