# Duplicate Scenario Detector

TypeScript CLI for detecting duplicate JS/TS test scenarios and suspicious test patterns.

## Usage

```bash
npm install
npm run build
node dist/cli.js analyze --testlist tests/fixtures/testlist.json --root . --out ./.out --md
```

Config 파일 사용:

```bash
node dist/cli.js analyze \
  --testlist tests/fixtures/testlist.json \
  --root . \
  --out ./.out \
  --config ./config.example.json
```

## `config.json` Format

아래 형식으로 작성하면 됩니다.

```json
{
  "duplicateThreshold": 0.82,
  "nearDuplicateThreshold": 0.7,
  "mdReport": true,
  "weights": {
    "set": 0.35,
    "sequence": 0.35,
    "ast": 0.2,
    "variant": 0.1
  },
  "aiVerification": {
    "enabled": true,
    "endpoint": "https://internal-ai.company.local/similarity",
    "token": "YOUR_BEARER_TOKEN",
    "model": "internal-default",
    "timeoutMs": 20000,
    "maxPairs": 30,
    "minCandidateScore": 0.7,
    "blendWeight": 0.35
  },
  "rules": {
    "missingAwait": { "enabled": true, "severity": "warn" },
    "randomWithoutSeed": { "enabled": true, "severity": "warn" },
    "hardcodedSleep": { "enabled": true, "severity": "warn" },
    "unhandledErrors": { "enabled": true, "severity": "warn" },
    "modeMismatch": { "enabled": true, "severity": "error" },
    "unreachableCalls": { "enabled": true, "severity": "info" },
    "unusedArgs": { "enabled": true, "severity": "info" }
  }
}
```

- `aiVerification.enabled: true` 일 때만 AI 재검증을 수행합니다.
- 토큰은 `config.local.json` 또는 환경변수(`INTERNAL_AI_TOKEN`) 사용을 권장합니다.

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
- API URL/Bearer token 등은 `config` 파일(`aiVerification.endpoint`, `aiVerification.token`)에서 설정 가능.
