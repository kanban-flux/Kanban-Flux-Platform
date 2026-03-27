"use client";

import { useEffect, useState, useCallback } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { RecentBoards } from "@/components/dashboard/recent-boards";
import { AllBoardsTable } from "@/components/dashboard/all-boards-table";
import { CreateBoardDialog } from "@/components/dashboard/create-board-dialog";
import { AgentActivity } from "@/components/dashboard/agent-activity";
import { ApprovalsPanel } from "@/components/agents/approvals-panel";
import { WelcomeModal } from "@/components/onboarding/welcome-modal";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import type { BoardSummary } from "@/types";

const DEFAULT_WORKSPACE_ID = "default-workspace";

export default function DashboardPage() {
  const [boards, setBoards] = useState<BoardSummary[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const fetchBoards = useCallback(async () => {
    try {
      const res = await fetch("/api/boards");
      const data = await res.json();
      setBoards(data);
    } catch {
      setBoards([]);
    }
  }, []);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  return (
    <AppLayout>
      <WelcomeModal />
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">
            Workspace Dashboard
          </h1>
          <p className="text-secondary">
            Manage your project boards and team velocity.
          </p>
        </div>
        <ApprovalsPanel />
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              const res = await fetch("/api/agents/master-scan", { method: "POST" });
              const result = await res.json();
              alert(`Master Scan: ${result.assigned} assigned, ${result.triggered} triggered`);
            }}
          >
            <Bot className="h-4 w-4 mr-1.5" />
            Run Master Scan
          </Button>
        </div>
        <RecentBoards
          boards={boards}
          onCreateBoard={() => setShowCreateDialog(true)}
        />
        <AllBoardsTable boards={boards} />
        <AgentActivity />
        <CreateBoardDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          workspaceId={DEFAULT_WORKSPACE_ID}
          onBoardCreated={fetchBoards}
        />
      </div>
    </AppLayout>
  );
}
