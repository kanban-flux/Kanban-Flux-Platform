const LUMYS_URL = process.env.LUMYS_URL || "http://localhost:4200";

interface LumysAgentConfig {
  name: string;
  role: string;
  systemPrompt: string;
  model: string;
  provider: string;
  capabilities: string[];
}

interface LumysResponse {
  response: string;
  tool_calls?: {
    name: string;
    arguments: Record<string, unknown>;
  }[];
  usage?: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
}

/**
 * Ensure an agent exists in Lumys OS, creating it if needed
 */
async function ensureLumysAgent(config: LumysAgentConfig): Promise<string> {
  try {
    // List agents and find by name
    const res = await fetch(`${LUMYS_URL}/api/agents`);
    if (res.ok) {
      const agents = await res.json();
      const existing = Array.isArray(agents)
        ? agents.find((a: Record<string, unknown>) => a.name === config.name)
        : null;
      if (existing) return existing.id;
    }
  } catch {
    // Lumys OS might not be running yet
  }

  // Create agent
  try {
    const res = await fetch(`${LUMYS_URL}/api/agents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: config.name,
        system_prompt: config.systemPrompt,
        model: config.model,
        provider: config.provider.toLowerCase(),
        capabilities: config.capabilities,
      }),
    });
    if (res.ok) {
      const agent = await res.json();
      return agent.id;
    }
  } catch (err) {
    console.error("[Lumys Bridge] Failed to create agent:", err);
  }

  throw new Error(`Failed to create Lumys OS agent: ${config.name}`);
}

/**
 * Execute a task via Lumys OS
 */
export async function executeViaLumys(
  agentConfig: LumysAgentConfig,
  taskMessage: string,
): Promise<LumysResponse> {
  const agentId = await ensureLumysAgent(agentConfig);

  const res = await fetch(`${LUMYS_URL}/api/agents/${agentId}/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: taskMessage,
      stream: false,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Lumys OS execution failed: ${error}`);
  }

  return res.json();
}

/**
 * Check if Lumys OS is available
 */
export async function isLumysAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${LUMYS_URL}/api/health`, {
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Map Kanban Flux tools to Lumys OS capabilities
 */
export function mapToolsToCapabilities(tools: string[]): string[] {
  const mapping: Record<string, string[]> = {
    comment: ["kanban_comment"],
    move_card: ["kanban_move_card"],
    create_card: ["kanban_create_card"],
    assign_agent: ["kanban_assign_agent"],
    git_commit: ["file_write", "shell_exec"],
    create_pr: ["shell_exec"],
    merge_pr: ["shell_exec"],
    git_branch: ["shell_exec"],
    attach_file: ["file_write"],
    save_memory: ["memory_store"],
    recall_memory: ["memory_recall"],
    review_pr: ["web_fetch"],
    request_help: ["kanban_comment"],
    handoff: ["kanban_comment"],
    escalate: ["kanban_comment"],
    setup_cicd: ["file_write", "shell_exec"],
    update_changelog: ["file_write"],
  };

  const capabilities = new Set<string>();
  for (const tool of tools) {
    const mapped = mapping[tool] || [tool];
    mapped.forEach((c) => capabilities.add(c));
  }
  return Array.from(capabilities);
}

export { LUMYS_URL };
