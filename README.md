# Duplicate Scenario Detector

TypeScript CLI for detecting duplicate JS/TS test scenarios and suspicious test patterns.

## Usage

```bash
npm install
npm run build
node dist/cli.js analyze --testlist tests/fixtures/testlist.json --root . --out ./.out --md
```

### AI Similarity Verification (internal API)

```bash
node dist/cli.js analyze \
  --testlist tests/fixtures/testlist.json \
  --root . \
  --out ./.out \
  --ai-verify \
  --ai-endpoint "https://internal-ai.company.local/similarity" \
  --ai-token "$INTERNAL_AI_TOKEN" \
  --ai-model "my-internal-model"
```

- When enabled, pair scores include:
  - `baseFinal`: static similarity score (AST/call-set/sequence)
  - `aiScore`: score parsed from AI response
  - `final`: blended score used for duplicate grouping
- AI endpoint is expected to return a text-like response that contains JSON:
  - `{"score": 0.0-1.0, "reason": "..."}` (can be plain text or fenced JSON)

## Input

- `testlist.json` entries:

```json
[{ "file": "path/to/test.js", "args": ["--mode=seq", "--seed=1"] }]
```

## Output

- `report.json`
- optional `report.md`

## Notes

- Each `(file,args)` pair is analyzed as a separate scenario variant.
- Parser runs in best-effort mode and keeps parse warnings per unit.
