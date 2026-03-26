export interface AgentConfig {
  role: string;
  name: string;
  provider: string;
  model: string;
  capabilities: string[];
  systemPromptSummary: string;
}

export interface TeamTemplateData {
  name: string;
  description: string;
  category: string;
  agents: AgentConfig[];
}

export const DEFAULT_TEMPLATES: TeamTemplateData[] = [
  {
    name: "Full Stack SaaS Team",
    description:
      "Complete team for building SaaS applications: analysis, architecture, frontend, backend, QA, and DevOps",
    category: "saas",
    agents: [
      {
        role: "analyst",
        name: "Analyst Agent",
        provider: "GEMINI",
        model: "gemini-2.5-flash",
        capabilities: ["market-research", "requirements", "mvp-scoping"],
        systemPromptSummary: "Analyzes requirements and decomposes projects",
      },
      {
        role: "architect",
        name: "Solutions Architect",
        provider: "GEMINI",
        model: "gemini-2.5-flash",
        capabilities: ["system-design", "api-design", "database-modeling"],
        systemPromptSummary: "Designs system architecture and tech stack",
      },
      {
        role: "frontend",
        name: "Frontend Specialist",
        provider: "GEMINI",
        model: "gemini-2.5-flash",
        capabilities: ["react", "nextjs", "tailwind", "ui-ux"],
        systemPromptSummary: "Develops premium UI/UX interfaces",
      },
      {
        role: "backend",
        name: "Backend Engineer",
        provider: "GEMINI",
        model: "gemini-2.5-flash",
        capabilities: ["api", "database", "nodejs", "prisma"],
        systemPromptSummary: "Develops server-side systems and APIs",
      },
      {
        role: "qa",
        name: "QA Engineer",
        provider: "GEMINI",
        model: "gemini-2.5-flash",
        capabilities: ["testing", "accessibility", "performance"],
        systemPromptSummary: "Validates deliveries and ensures quality",
      },
      {
        role: "devops",
        name: "DevOps Engineer",
        provider: "GEMINI",
        model: "gemini-2.5-flash",
        capabilities: ["ci-cd", "docker", "deployment"],
        systemPromptSummary: "Manages CI/CD and infrastructure",
      },
    ],
  },
  {
    name: "Landing Page Team",
    description:
      "Lean team optimized for building landing pages fast: analyst, frontend, and QA",
    category: "landing-page",
    agents: [
      {
        role: "analyst",
        name: "Analyst Agent",
        provider: "GEMINI",
        model: "gemini-2.5-flash",
        capabilities: ["market-research", "copywriting", "seo"],
        systemPromptSummary: "Researches market and writes copy",
      },
      {
        role: "frontend",
        name: "Frontend Specialist",
        provider: "GEMINI",
        model: "gemini-2.5-flash",
        capabilities: ["react", "tailwind", "animations", "responsive"],
        systemPromptSummary: "Builds responsive, animated landing pages",
      },
      {
        role: "qa",
        name: "QA Engineer",
        provider: "GEMINI",
        model: "gemini-2.5-flash",
        capabilities: ["cross-browser", "mobile", "performance", "seo"],
        systemPromptSummary: "Tests across browsers and validates SEO",
      },
    ],
  },
  {
    name: "API & Microservices Team",
    description:
      "Backend-focused team for building APIs and microservices",
    category: "api",
    agents: [
      {
        role: "architect",
        name: "API Architect",
        provider: "GEMINI",
        model: "gemini-2.5-flash",
        capabilities: ["api-design", "microservices", "event-driven"],
        systemPromptSummary: "Designs API architecture and contracts",
      },
      {
        role: "backend",
        name: "Backend Engineer",
        provider: "GEMINI",
        model: "gemini-2.5-flash",
        capabilities: ["nodejs", "python", "database", "caching"],
        systemPromptSummary: "Implements APIs and business logic",
      },
      {
        role: "dba",
        name: "DBA Specialist",
        provider: "GEMINI",
        model: "gemini-2.5-flash",
        capabilities: ["postgresql", "redis", "migrations", "optimization"],
        systemPromptSummary: "Designs and optimizes databases",
      },
      {
        role: "devops",
        name: "DevOps Engineer",
        provider: "GEMINI",
        model: "gemini-2.5-flash",
        capabilities: ["docker", "kubernetes", "ci-cd", "monitoring"],
        systemPromptSummary: "Manages containers and deployment",
      },
      {
        role: "qa",
        name: "QA Engineer",
        provider: "GEMINI",
        model: "gemini-2.5-flash",
        capabilities: ["api-testing", "load-testing", "integration-testing"],
        systemPromptSummary: "Tests APIs and validates integrations",
      },
    ],
  },
  {
    name: "Data & AI Team",
    description:
      "Specialized team for data engineering and AI/ML projects",
    category: "data",
    agents: [
      {
        role: "analyst",
        name: "Data Analyst",
        provider: "GEMINI",
        model: "gemini-2.5-flash",
        capabilities: ["data-analysis", "visualization", "statistics"],
        systemPromptSummary: "Analyzes data and produces insights",
      },
      {
        role: "backend",
        name: "Data Engineer",
        provider: "GEMINI",
        model: "gemini-2.5-flash",
        capabilities: ["python", "etl", "pipelines", "spark"],
        systemPromptSummary: "Builds data pipelines and ETL",
      },
      {
        role: "architect",
        name: "ML Architect",
        provider: "GEMINI",
        model: "gemini-2.5-flash",
        capabilities: ["ml-ops", "model-design", "embeddings", "rag"],
        systemPromptSummary: "Designs ML architecture and model pipelines",
      },
      {
        role: "qa",
        name: "ML QA",
        provider: "GEMINI",
        model: "gemini-2.5-flash",
        capabilities: ["model-validation", "bias-testing", "performance"],
        systemPromptSummary: "Validates ML models and data quality",
      },
    ],
  },
];
