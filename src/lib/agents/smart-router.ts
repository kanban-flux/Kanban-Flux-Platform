interface RouteDecision {
  provider: string;
  model: string;
  reason: string;
  estimatedCost: number; // per 1M tokens
}

interface TaskProfile {
  descriptionLength: number;
  hasChecklist: boolean;
  checklistItems: number;
  labelCount: number;
  isCodeRelated: boolean;
  isAnalysis: boolean;
  agentRole: string;
}

// Cost per 1M tokens (input+output average)
const MODEL_COSTS: Record<string, number> = {
  "gemini-2.5-flash": 0.15,
  "gemini-2.5-pro": 1.25,
  "claude-haiku-4-5-20251001": 0.80,
  "claude-sonnet-4-20250514": 3.00,
  "claude-opus-4-20250514": 15.00,
  "gpt-4o-mini": 0.15,
  "gpt-4o": 5.00,
};

interface ChecklistInput {
  items?: { id: string; text: string; completed: boolean }[];
}

function profileTask(context: { description: string | null; checklists: ChecklistInput[]; labels: string[]; agentRole: string }): TaskProfile {
  const desc = context.description || "";
  const codeKeywords = ["implement", "code", "function", "api", "component", "database", "schema", "endpoint", "build", "create"];
  const analysisKeywords = ["analyze", "research", "evaluate", "compare", "strategy", "plan", "review", "audit"];

  return {
    descriptionLength: desc.length,
    hasChecklist: context.checklists.length > 0,
    checklistItems: context.checklists.reduce((sum: number, cl: ChecklistInput) => sum + (cl.items?.length || 0), 0),
    labelCount: context.labels.length,
    isCodeRelated: codeKeywords.some(k => desc.toLowerCase().includes(k)),
    isAnalysis: analysisKeywords.some(k => desc.toLowerCase().includes(k)),
    agentRole: context.agentRole,
  };
}

function calculateComplexity(profile: TaskProfile): "low" | "medium" | "high" {
  let score = 0;

  if (profile.descriptionLength > 500) score += 2;
  else if (profile.descriptionLength > 200) score += 1;

  if (profile.hasChecklist) score += 1;
  if (profile.checklistItems > 5) score += 1;
  if (profile.isCodeRelated) score += 2;
  if (profile.isAnalysis) score += 1;

  // Complex roles
  if (["architect", "master", "analyst"].includes(profile.agentRole)) score += 1;

  if (score >= 5) return "high";
  if (score >= 3) return "medium";
  return "low";
}

export function routeTask(context: {
  description: string | null;
  checklists: ChecklistInput[];
  labels: string[];
  agentRole: string;
  availableProviders: string[]; // ["GEMINI", "CLAUDE", "OPENAI"]
}): RouteDecision {
  const profile = profileTask(context);
  const complexity = calculateComplexity(profile);

  // Routing logic
  switch (complexity) {
    case "low":
      // Simple tasks: cheapest model
      if (context.availableProviders.includes("GEMINI")) {
        return { provider: "GEMINI", model: "gemini-2.5-flash", reason: "Low complexity task - using cost-efficient model", estimatedCost: 0.15 };
      }
      return { provider: "OPENAI", model: "gpt-4o-mini", reason: "Low complexity task", estimatedCost: 0.15 };

    case "medium":
      // Medium tasks: balanced model
      if (context.availableProviders.includes("GEMINI")) {
        return { provider: "GEMINI", model: "gemini-2.5-flash", reason: "Medium complexity - Gemini Flash handles well", estimatedCost: 0.15 };
      }
      if (context.availableProviders.includes("CLAUDE")) {
        return { provider: "CLAUDE", model: "claude-sonnet-4-20250514", reason: "Medium complexity - Claude Sonnet", estimatedCost: 3.00 };
      }
      return { provider: "OPENAI", model: "gpt-4o", reason: "Medium complexity", estimatedCost: 5.00 };

    case "high":
      // Complex tasks: premium model
      if (context.availableProviders.includes("CLAUDE")) {
        return { provider: "CLAUDE", model: "claude-sonnet-4-20250514", reason: "High complexity task - using premium model for quality", estimatedCost: 3.00 };
      }
      if (context.availableProviders.includes("OPENAI")) {
        return { provider: "OPENAI", model: "gpt-4o", reason: "High complexity task", estimatedCost: 5.00 };
      }
      return { provider: "GEMINI", model: "gemini-2.5-pro", reason: "High complexity - Gemini Pro", estimatedCost: 1.25 };
  }
}

export function getProviderFallback(currentProvider: string, availableProviders: string[]): { provider: string; model: string } | null {
  const fallbackOrder: Record<string, { provider: string; model: string }[]> = {
    GEMINI: [
      { provider: "OPENAI", model: "gpt-4o-mini" },
      { provider: "CLAUDE", model: "claude-haiku-4-5-20251001" },
    ],
    CLAUDE: [
      { provider: "GEMINI", model: "gemini-2.5-flash" },
      { provider: "OPENAI", model: "gpt-4o" },
    ],
    OPENAI: [
      { provider: "GEMINI", model: "gemini-2.5-flash" },
      { provider: "CLAUDE", model: "claude-sonnet-4-20250514" },
    ],
  };

  const fallbacks = fallbackOrder[currentProvider] || [];
  for (const fb of fallbacks) {
    if (availableProviders.includes(fb.provider)) return fb;
  }
  return null;
}

export { MODEL_COSTS, calculateComplexity, profileTask };
