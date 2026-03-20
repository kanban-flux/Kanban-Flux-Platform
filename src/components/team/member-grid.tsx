"use client";

import { useState } from "react";
import { Search, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MemberCard } from "./member-card";
import type { WorkspaceMemberWithUser } from "@/types";

export function MemberGrid({
  members,
  onUpdateRole,
  onRemove,
  onInvite,
}: {
  members: WorkspaceMemberWithUser[];
  onUpdateRole: (id: string, role: string) => void;
  onRemove: (id: string) => void;
  onInvite: () => void;
}) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const filtered = members.filter((m) => {
    const matchesSearch =
      !search ||
      m.user.name.toLowerCase().includes(search.toLowerCase()) ||
      m.user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "ALL" || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const adminCount = members.filter((m) => m.role === "ADMIN").length;
  const viewerCount = members.filter((m) => m.role === "VIEWER").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
          <Input
            placeholder="Search members by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Tabs value={roleFilter} onValueChange={setRoleFilter}>
        <TabsList>
          <TabsTrigger value="ALL">
            All Members ({members.length})
          </TabsTrigger>
          <TabsTrigger value="ADMIN">Admins ({adminCount})</TabsTrigger>
          <TabsTrigger value="VIEWER">Viewers ({viewerCount})</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            onUpdateRole={onUpdateRole}
            onRemove={onRemove}
          />
        ))}
        <button
          onClick={onInvite}
          className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 bg-white p-6 text-center transition-colors hover:border-primary hover:bg-primary/5"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface">
            <UserPlus className="h-6 w-6 text-secondary" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-900">
              Add New Member
            </p>
            <p className="text-xs text-secondary">
              Invite your team and start collaborating instantly.
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
