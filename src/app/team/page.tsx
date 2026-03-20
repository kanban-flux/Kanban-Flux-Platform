"use client";

import { useEffect, useState, useCallback } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { MemberGrid } from "@/components/team/member-grid";
import { InviteModal } from "@/components/team/invite-modal";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import type { WorkspaceMemberWithUser } from "@/types";

const DEFAULT_WORKSPACE_ID = "default-workspace";

export default function TeamPage() {
  const [members, setMembers] = useState<WorkspaceMemberWithUser[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch("/api/team");
      const data = await res.json();
      setMembers(data);
    } catch {
      setMembers([]);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  async function handleUpdateRole(id: string, role: string) {
    await fetch(`/api/team/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    fetchMembers();
  }

  async function handleRemove(id: string) {
    await fetch(`/api/team/${id}`, { method: "DELETE" });
    fetchMembers();
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">
              Team Management
            </h1>
            <p className="text-secondary">
              Manage your organization&apos;s workspace access, roles, and
              collaboration permissions.
            </p>
          </div>
          <Button
            onClick={() => setShowInviteModal(true)}
            className="bg-primary hover:bg-primary-600"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        </div>

        <MemberGrid
          members={members}
          onUpdateRole={handleUpdateRole}
          onRemove={handleRemove}
          onInvite={() => setShowInviteModal(true)}
        />

        <InviteModal
          open={showInviteModal}
          onOpenChange={setShowInviteModal}
          workspaceId={DEFAULT_WORKSPACE_ID}
          onInvited={fetchMembers}
        />
      </div>
    </AppLayout>
  );
}
