import { HttpClient } from "./http";
import type {
  StableFiConfig,
  Agent,
  AgentCreateParams,
  AgentWithWallet,
  Wallet,
  WalletCreateParams,
  WalletFundParams,
  Transaction,
  TransactionCreateParams,
  TransactionUpdateParams,
  TrustScore,
} from "./types";

const DEFAULT_BASE_URL = "https://stablefi.ai/api";

// ── Resource namespaces ────────────────────────────────────────────────────

class AgentsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Register a new agent.
   */
  async create(params: AgentCreateParams): Promise<Agent> {
    return this.http.request<Agent>({
      method: "POST",
      path: "/agents",
      body: params,
    });
  }

  /**
   * Retrieve an agent by ID.
   */
  async retrieve(id: string): Promise<Agent> {
    return this.http.request<Agent>({
      method: "GET",
      path: `/agents/${encodeURIComponent(id)}`,
    });
  }

  /**
   * Convenience: register an agent **and** create its wallet in one call.
   * Returns the agent record with the wallet attached.
   */
  async createWithWallet(params: AgentCreateParams): Promise<AgentWithWallet> {
    const agent = await this.create(params);
    const wallet = await this.http.request<Wallet>({
      method: "POST",
      path: "/wallets",
      body: { agentId: agent.id },
    });
    return { ...agent, wallet };
  }
}

class WalletsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Create a wallet for an agent.
   */
  async create(params: WalletCreateParams): Promise<Wallet> {
    return this.http.request<Wallet>({
      method: "POST",
      path: "/wallets",
      body: params,
    });
  }

  /**
   * Retrieve a wallet (includes current balance).
   */
  async retrieve(id: string): Promise<Wallet> {
    return this.http.request<Wallet>({
      method: "GET",
      path: `/wallets/${encodeURIComponent(id)}`,
    });
  }

  /**
   * Fund a wallet from the faucet or manually.
   */
  async fund(id: string, params: WalletFundParams): Promise<Wallet> {
    return this.http.request<Wallet>({
      method: "POST",
      path: `/wallets/${encodeURIComponent(id)}/fund`,
      body: params,
    });
  }
}

class TransactionsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Create a new transaction (optionally with escrow).
   */
  async create(params: TransactionCreateParams): Promise<Transaction> {
    return this.http.request<Transaction>({
      method: "POST",
      path: "/transactions",
      body: params,
    });
  }

  /**
   * Retrieve a transaction by ID.
   */
  async retrieve(id: string): Promise<Transaction> {
    return this.http.request<Transaction>({
      method: "GET",
      path: `/transactions/${encodeURIComponent(id)}`,
    });
  }

  /**
   * Confirm or dispute a transaction.
   */
  async update(id: string, params: TransactionUpdateParams): Promise<Transaction> {
    return this.http.request<Transaction>({
      method: "PATCH",
      path: `/transactions/${encodeURIComponent(id)}`,
      body: params,
    });
  }

  /** Shorthand: confirm a transaction. */
  async confirm(id: string): Promise<Transaction> {
    return this.update(id, { action: "confirm" });
  }

  /** Shorthand: dispute a transaction. */
  async dispute(id: string): Promise<Transaction> {
    return this.update(id, { action: "dispute" });
  }
}

class TrustScoreResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Retrieve the trust score for an entity.
   */
  async retrieve(id: string): Promise<TrustScore> {
    return this.http.request<TrustScore>({
      method: "GET",
      path: `/trust-score/${encodeURIComponent(id)}`,
    });
  }
}

// ── Main client ────────────────────────────────────────────────────────────

export class StableFi {
  public readonly agents: AgentsResource;
  public readonly wallets: WalletsResource;
  public readonly transactions: TransactionsResource;
  public readonly trustScore: TrustScoreResource;

  private readonly http: HttpClient;

  constructor(config: StableFiConfig) {
    if (!config.apiKey) {
      throw new Error(
        "An API key is required. Pass it as `new StableFi({ apiKey: '...' })`."
      );
    }

    const baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;
    this.http = new HttpClient(baseUrl, config.apiKey, config.timeout);

    this.agents = new AgentsResource(this.http);
    this.wallets = new WalletsResource(this.http);
    this.transactions = new TransactionsResource(this.http);
    this.trustScore = new TrustScoreResource(this.http);
  }
}
