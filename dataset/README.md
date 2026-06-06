# Benchmark Dataset

This folder contains the test queries used for the RAG Search API Benchmark.

## Files

- `rag_benchmark_questions.json` - The main dataset containing all test queries

## Dataset Structure

Each query has the following structure:
```json
{
  "id": "q1",
  "vertical": "1. Coding & Developer Docs",
  "query": "Detail the exact sequence of lifecycle events when utilizing the experimental React Compiler (Forget) with useMemo."
}
```

## Verticals Covered

The dataset spans **17 distinct verticals** with exactly **252 queries**:

1. Coding & Developer Docs
2. System / DevOps / OS
3. News & Current Events
4. Research & Deep Knowledge
5. Finance & Data
6. Multi-hop Reasoning
7. Edge / Ambiguous Queries
8. Product / Comparison
9. Travel & Local Info
10. Health / Medical
11. Legal / Policy
12. Educational / Explanatory
13. Beginner vs Expert
14. Regional / Localization
15. Historical + Timeline
16. Factual Precision
17. Real-Time / Breaking News

## Usage

The dataset is automatically loaded by `src/index.js` when running the benchmark.

To add new test queries, simply add entries to `rag_benchmark_questions.json` in the format shown above.