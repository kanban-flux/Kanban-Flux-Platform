"use client";

import { useEffect, useState, useCallback } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Store,
  Rocket,
  Users,
  CheckCircle2,
  Loader2,
  Bot,
  Columns3,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface AgentConfig {
  role: string;
  name: string;
  provider: string;
  model: string;
  capabilities: string[];
  systemPromptSummary: string;
}

interface TeamTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  agents: AgentConfig[];
  isPublic: boolean;
  usageCount: number;
  createdAt: string;
}

interface DeployResult {
  templateName: string;
  agents: { role: string; status: string; id: string }[];
}

interface BoardTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  columns: string[];
  cardTemplates: { title: string; priority: number; labels: string[] }[] | null;
  isPublic: boolean;
  createdAt: string;
}

interface BoardDeployResult {
  templateName: string;
  boardId: string;
  boardName: string;
  columnsCreated: number;
  cardsCreated: number;
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const CATEGORY_LABELS: Record<string, string> = {
  all: "All",
  saas: "SaaS",
  "landing-page": "Landing Page",
  api: "API",
  data: "Data & AI",
};

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function MarketplacePage() {
  const [templates, setTemplates] = useState<TeamTemplate[]>([]);
  const [boardTemplates, setBoardTemplates] = useState<BoardTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [boardsLoading, setBoardsLoading] = useState(true);
  const [deploying, setDeploying] = useState<string | null>(null);
  const [deployingBoard, setDeployingBoard] = useState<string | null>(null);
  const [deployResult, setDeployResult] = useState<DeployResult | null>(null);
  const [boardDeployResult, setBoardDeployResult] =
    useState<BoardDeployResult | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("teams");

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch("/api/marketplace");
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch (err) {
      console.error("Failed to fetch templates:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBoardTemplates = useCallback(async () => {
    try {
      const res = await fetch("/api/marketplace/boards");
      if (res.ok) {
        const data = await res.json();
        setBoardTemplates(data);
      }
    } catch (err) {
      console.error("Failed to fetch board templates:", err);
    } finally {
      setBoardsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
    fetchBoardTemplates();
  }, [fetchTemplates, fetchBoardTemplates]);

  const handleDeploy = async (templateId: string) => {
    setDeploying(templateId);
    setDeployResult(null);
    try {
      const res = await fetch(`/api/marketplace/${templateId}/deploy`, {
        method: "POST",
      });
      if (res.ok) {
        const result: DeployResult = await res.json();
        setDeployResult(result);
        // Refresh templates to update usage count
        fetchTemplates();
      }
    } catch (err) {
      console.error("Deploy failed:", err);
    } finally {
      setDeploying(null);
    }
  };

  const handleDeployBoard = async (templateId: string) => {
    setDeployingBoard(templateId);
    setBoardDeployResult(null);
    try {
      const res = await fetch(`/api/marketplace/boards/${templateId}/deploy`, {
        method: "POST",
      });
      if (res.ok) {
        const result: BoardDeployResult = await res.json();
        setBoardDeployResult(result);
      }
    } catch (err) {
      console.error("Board deploy failed:", err);
    } finally {
      setDeployingBoard(null);
    }
  };

  const filtered =
    activeCategory === "all"
      ? templates
      : templates.filter((t) => t.category === activeCategory);

  const filteredBoards =
    activeCategory === "all"
      ? boardTemplates
      : boardTemplates.filter((t) => t.category === activeCategory);

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 flex items-center gap-2">
            <Store className="h-6 w-6 text-primary" />
            Agent Marketplace
          </h1>
          <p className="text-secondary mt-1">
            Pre-built AI teams ready to deploy
          </p>
        </div>

        {/* Tab buttons (Teams / Boards) */}
        <div className="flex gap-2">
          <Button
            variant={activeTab === "teams" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("teams")}
          >
            <Users className="h-4 w-4 mr-1.5" />
            Team Templates
          </Button>
          <Button
            variant={activeTab === "boards" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("boards")}
          >
            <Columns3 className="h-4 w-4 mr-1.5" />
            Board Templates
          </Button>
        </div>

        {/* Category filter - simple buttons */}
        <div className="flex gap-2 flex-wrap">
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <Button
              key={key}
              variant={activeCategory === key ? "default" : "outline"}
              size="sm"
              className="text-xs h-7"
              onClick={() => setActiveCategory(key)}
            >
              {label}
            </Button>
          ))}
        </div>

        {/* Deploy success banner (teams) */}
        {deployResult && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
            <div>
              <p className="font-medium text-green-900">
                Team &quot;{deployResult.templateName}&quot; deployed!
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {deployResult.agents.map((a) => (
                  <Badge key={a.role} variant="secondary" className="text-xs">
                    {a.role} ({a.status})
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Deploy success banner (boards) */}
        {boardDeployResult && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
            <div>
              <p className="font-medium text-green-900">
                Board &quot;{boardDeployResult.boardName}&quot; created!
              </p>
              <p className="text-sm text-green-800 mt-0.5">
                {boardDeployResult.columnsCreated} columns and{" "}
                {boardDeployResult.cardsCreated} cards created.
              </p>
            </div>
          </div>
        )}

        {/* Team templates grid */}
        {activeTab === "teams" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {loading ? (
              <div className="col-span-full flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="col-span-full text-center py-20 text-secondary">
                <p>No templates found</p>
              </div>
            ) : (
              filtered.map((template) => (
                <div
                  key={template.id}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-neutral-900">
                      {template.name}
                    </h3>
                    <Badge
                      variant="secondary"
                      className="text-xs shrink-0 ml-2"
                    >
                      {CATEGORY_LABELS[template.category] || template.category}
                    </Badge>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-secondary line-clamp-2 mb-4">
                    {template.description}
                  </p>

                  {/* Agents */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-neutral-500 uppercase mb-1.5">
                      Agents ({template.agents.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {template.agents.map((a) => (
                        <Badge
                          key={a.role}
                          variant="outline"
                          className="text-xs"
                        >
                          <Bot className="h-3 w-3 mr-1" />
                          {a.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
                    <span className="text-xs text-secondary">
                      {template.agents.length} agents &middot;{" "}
                      {template.usageCount} deploys
                    </span>
                    <Button
                      size="sm"
                      onClick={() => handleDeploy(template.id)}
                      disabled={deploying === template.id}
                    >
                      {deploying === template.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Rocket className="h-4 w-4 mr-1" /> Deploy Team
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Board templates grid */}
        {activeTab === "boards" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {boardsLoading ? (
              <div className="col-span-full flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredBoards.length === 0 ? (
              <div className="col-span-full text-center py-20 text-secondary">
                <p>No board templates found</p>
              </div>
            ) : (
              filteredBoards.map((template) => (
                <div
                  key={template.id}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-neutral-900">
                      {template.name}
                    </h3>
                    <Badge
                      variant="secondary"
                      className="text-xs shrink-0 ml-2"
                    >
                      {CATEGORY_LABELS[template.category] || template.category}
                    </Badge>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-secondary line-clamp-2 mb-4">
                    {template.description}
                  </p>

                  {/* Columns */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-neutral-500 uppercase mb-1.5">
                      Columns
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {template.columns.map((col) => (
                        <Badge
                          key={col}
                          variant="outline"
                          className="text-xs"
                        >
                          {col}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
                    <span className="text-xs text-secondary">
                      {template.columns.length} columns &middot;{" "}
                      {template.cardTemplates?.length || 0} cards
                    </span>
                    <Button
                      size="sm"
                      onClick={() => handleDeployBoard(template.id)}
                      disabled={deployingBoard === template.id}
                    >
                      {deployingBoard === template.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Rocket className="h-4 w-4 mr-1" /> Create Board
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
