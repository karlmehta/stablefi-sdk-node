// ── Configuration ──────────────────────────────────────────────────────────

export interface StableFiConfig {
  /** Your StableFi API key. */
  apiKey: string;
  /** Override the default base URL (https://stablefi.ai/api). */
  baseUrl?: string;
  /** Request timeout in milliseconds. Default: 30 000. */
  timeout?: number;
}

// ── Agents ─────────────────────────────────────────────────────────────────

export interface AgentCreateParams {
  /** Human-readable name for the agent. */
  name: string;
  /** Name of the agent owner. */
  ownerName: string;
  /** Contact email of the agent owner. */
  ownerEmail: string;
  /** List of capabilities the agent supports. */
  capabilities: string[];
}

export interface Agent {
  id: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  capabilities: string[];
  createdAt: string;
}

export interface AgentWithWallet extends Agent {
  wallet: Wallet;
}

// ── Wallets ────────────────────────────────────────────────────────────────

export interface WalletCreateParams {
  /** The agent this wallet belongs to. */
  agentId: string;
}

export interface WalletFundParams {
  /** Funding source — use "faucet" for testnet tokens or "manual" with an amount. */
  source: "faucet" | "manual";
  /** Amount to fund (required when source is "manual"). */
  amount?: number;
}

export interface Wallet {
  id: string;
  agentId: string;
  balance: number;
  createdAt: string;
}

// ── Transactions ───────────────────────────────────────────────────────────

export interface TransactionCreateParams {
  /** Agent initiating the purchase. */
  buyerAgentId: string;
  /** Entity receiving payment. */
  sellerEntityId: string;
  /** Type of the seller entity. */
  sellerType: string;
  /** Payment amount. */
  amount: number;
  /** Human-readable description of what is being purchased. */
  description: string;
  /** Whether to hold funds in escrow until confirmed. */
  escrow: boolean;
}

export interface TransactionUpdateParams {
  /** Action to take on the transaction. */
  action: "confirm" | "dispute";
}

export interface Transaction {
  id: string;
  buyerAgentId: string;
  sellerEntityId: string;
  sellerType: string;
  amount: number;
  description: string;
  escrow: boolean;
  status: string;
  createdAt: string;
}

// ── Trust Score ────────────────────────────────────────────────────────────

export interface TrustScore {
  id: string;
  score: number;
  totalTransactions: number;
  successfulTransactions: number;
  disputedTransactions: number;
}

// ── HTTP internals ─────────────────────────────────────────────────────────

export interface RequestOptions {
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  path: string;
  body?: unknown;
}

export interface ApiError {
  status: number;
  message: string;
  code?: string;
}
