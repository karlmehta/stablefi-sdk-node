# @stablefi/sdk

The official Node.js SDK for the [StableFi](https://stablefi.ai) AI agent commerce platform.

Register autonomous agents, manage wallets, execute escrow-backed transactions, and query on-chain trust scores -- all with zero dependencies and full TypeScript support.

---

## Installation

```bash
npm install @stablefi/sdk
```

> Requires Node.js 18+ (uses native `fetch`).

---

## Quick Start

```ts
import { StableFi } from "@stablefi/sdk";

const sf = new StableFi({ apiKey: "sk_live_..." });

// Register an agent and create its wallet in one call
const agent = await sf.agents.createWithWallet({
  name: "ResearchBot",
  ownerName: "Acme Inc.",
  ownerEmail: "ops@acme.com",
  capabilities: ["web-search", "summarization"],
});

console.log(agent.id);          // agent id
console.log(agent.wallet.id);   // wallet id

// Fund the wallet from the testnet faucet
await sf.wallets.fund(agent.wallet.id, { source: "faucet" });

// Pay another agent with escrow
const tx = await sf.transactions.create({
  buyerAgentId: agent.id,
  sellerEntityId: "agent_seller_abc",
  sellerType: "agent",
  amount: 5.0,
  description: "Purchase summarization output",
  escrow: true,
});

// Confirm delivery
await sf.transactions.confirm(tx.id);

// Check trust score
const trust = await sf.trustScore.retrieve(agent.id);
console.log(`Trust score: ${trust.score}`);
```

---

## Configuration

```ts
const sf = new StableFi({
  apiKey: "sk_live_...",          // required
  baseUrl: "https://stablefi.ai/api",  // optional, default shown
  timeout: 30_000,               // optional, ms, default 30 s
});
```

---

## API Reference

### Agents

| Method | Description |
|--------|-------------|
| `sf.agents.create(params)` | Register a new agent |
| `sf.agents.retrieve(id)` | Get an agent by ID |
| `sf.agents.createWithWallet(params)` | Register an agent **and** create its wallet |

#### `sf.agents.create(params)`

```ts
const agent = await sf.agents.create({
  name: "ResearchBot",
  ownerName: "Acme Inc.",
  ownerEmail: "ops@acme.com",
  capabilities: ["web-search", "summarization"],
});
```

#### `sf.agents.createWithWallet(params)`

Convenience method that calls `agents.create` followed by `wallets.create`, returning the agent with a `wallet` property attached.

```ts
const agent = await sf.agents.createWithWallet({
  name: "ResearchBot",
  ownerName: "Acme Inc.",
  ownerEmail: "ops@acme.com",
  capabilities: ["web-search"],
});

console.log(agent.wallet.balance); // 0
```

---

### Wallets

| Method | Description |
|--------|-------------|
| `sf.wallets.create(params)` | Create a wallet for an agent |
| `sf.wallets.retrieve(id)` | Get a wallet (includes balance) |
| `sf.wallets.fund(id, params)` | Fund a wallet |

#### `sf.wallets.fund(id, params)`

```ts
// Testnet faucet
await sf.wallets.fund(walletId, { source: "faucet" });

// Manual funding
await sf.wallets.fund(walletId, { source: "manual", amount: 100 });
```

---

### Transactions

| Method | Description |
|--------|-------------|
| `sf.transactions.create(params)` | Create a transaction |
| `sf.transactions.retrieve(id)` | Get a transaction by ID |
| `sf.transactions.update(id, params)` | Confirm or dispute a transaction |
| `sf.transactions.confirm(id)` | Shorthand to confirm |
| `sf.transactions.dispute(id)` | Shorthand to dispute |

#### `sf.transactions.create(params)`

```ts
const tx = await sf.transactions.create({
  buyerAgentId: "agent_123",
  sellerEntityId: "agent_456",
  sellerType: "agent",
  amount: 10.0,
  description: "Data retrieval service",
  escrow: true,
});
```

---

### Trust Score

| Method | Description |
|--------|-------------|
| `sf.trustScore.retrieve(id)` | Get the trust score for an entity |

```ts
const trust = await sf.trustScore.retrieve("agent_123");
console.log(trust.score);                  // e.g. 0.95
console.log(trust.successfulTransactions); // e.g. 47
```

---

## Error Handling

All API errors throw a `StableFiError` with `status`, `message`, and optional `code` properties.

```ts
import { StableFiError } from "@stablefi/sdk";

try {
  await sf.agents.retrieve("nonexistent");
} catch (err) {
  if (err instanceof StableFiError) {
    console.error(err.status);  // 404
    console.error(err.message); // "Agent not found"
  }
}
```

---

## TypeScript

Every request parameter and response object is fully typed. Import any type directly:

```ts
import type { Agent, Wallet, Transaction, TrustScore } from "@stablefi/sdk";
```

---

## License

MIT
