"use client";

import { useEffect, useState, useCallback } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  AlertTriangle,
} from "lucide-react";

interface WorkspaceData {
  id: string;
  name: string;
  createdAt: string;
  _count: {
    boards: number;
    members: number;
  };
}

export default function SettingsPage() {
  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);
  const [workspaceName, setWorkspaceName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile state
  const [displayName, setDisplayName] = useState("Admin User");
  const [email] = useState("admin@kanbanflux.com");

  // Notification state
  const [notifAssignments, setNotifAssignments] = useState(true);
  const [notifComments, setNotifComments] = useState(true);
  const [notifDueDates, setNotifDueDates] = useState(false);
  const [notifPush, setNotifPush] = useState(false);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const fetchWorkspace = useCallback(async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data) {
        setWorkspace(data);
        setWorkspaceName(data.name || "");
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchWorkspace();
  }, [fetchWorkspace]);

  async function handleSaveWorkspace() {
    if (!workspaceName.trim()) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: workspaceName }),
      });
      if (res.ok) {
        setSaveSuccess(true);
        fetchWorkspace();
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Page Header */}
        <div>
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-6 w-6 text-[#0052CC]" />
            <h1 className="text-2xl font-semibold text-neutral-900">
              Settings
            </h1>
          </div>
          <p className="mt-1 text-secondary">
            Manage your workspace and preferences.
          </p>
        </div>

        {/* Workspace Settings */}
        <Card className="border bg-white rounded-xl p-6">
          <CardContent className="space-y-4 px-0">
            <div className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-[#42526E]" />
              <h2 className="text-lg font-semibold text-neutral-900">
                Workspace Settings
              </h2>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-900">
                Workspace Name
              </label>
              <Input
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="My Workspace"
              />
            </div>

            {workspace && (
              <div className="grid grid-cols-3 gap-4 rounded-lg bg-[#F4F5F7] p-4 text-sm">
                <div>
                  <p className="text-[#42526E]">Created</p>
                  <p className="font-medium text-neutral-900">
                    {new Date(workspace.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-[#42526E]">Boards</p>
                  <p className="font-medium text-neutral-900">
                    {workspace._count.boards}
                  </p>
                </div>
                <div>
                  <p className="text-[#42526E]">Members</p>
                  <p className="font-medium text-neutral-900">
                    {workspace._count.members}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Button
                onClick={handleSaveWorkspace}
                disabled={saving || !workspaceName.trim()}
                className="bg-[#0052CC] hover:bg-[#0052CC]/90"
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              {saveSuccess && (
                <span className="text-sm font-medium text-green-600">
                  Changes saved successfully!
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Profile Settings */}
        <Card className="border bg-white rounded-xl p-6">
          <CardContent className="space-y-4 px-0">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-[#42526E]" />
              <h2 className="text-lg font-semibold text-neutral-900">
                Profile Settings
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "flex h-16 w-16 shrink-0 items-center justify-center rounded-full",
                  "bg-[#0052CC] text-white text-xl font-semibold"
                )}
              >
                {getInitials(displayName)}
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-900">
                    Display Name
                  </label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-900">
                    Email
                  </label>
                  <Input
                    value={email}
                    readOnly
                    className="bg-neutral-100 text-neutral-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div>
              <Button className="bg-[#0052CC] hover:bg-[#0052CC]/90">
                Update Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Notifications */}
        <Card className="border bg-white rounded-xl p-6">
          <CardContent className="space-y-4 px-0">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-[#42526E]" />
              <h2 className="text-lg font-semibold text-neutral-900">
                Notifications
              </h2>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={notifAssignments}
                  onCheckedChange={(val) => setNotifAssignments(!!val)}
                />
                <span className="text-sm text-neutral-900">
                  Email notifications for card assignments
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={notifComments}
                  onCheckedChange={(val) => setNotifComments(!!val)}
                />
                <span className="text-sm text-neutral-900">
                  Email notifications for comments
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={notifDueDates}
                  onCheckedChange={(val) => setNotifDueDates(!!val)}
                />
                <span className="text-sm text-neutral-900">
                  Email notifications for due date reminders
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={notifPush}
                  onCheckedChange={(val) => setNotifPush(!!val)}
                />
                <span className="text-sm text-neutral-900">
                  Browser push notifications
                </span>
              </label>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Danger Zone */}
        <Card className="border-2 border-[#FF5630] bg-white rounded-xl p-6">
          <CardContent className="space-y-4 px-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-[#FF5630]" />
              <h2 className="text-lg font-semibold text-[#FF5630]">
                Danger Zone
              </h2>
            </div>

            <p className="text-sm text-[#42526E]">
              This action cannot be undone. All boards, cards, and data will be
              permanently deleted.
            </p>

            <Button
              variant="outline"
              className="border-[#FF5630] text-[#FF5630] hover:bg-[#FF5630]/10"
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete Workspace
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#FF5630]">
              <AlertTriangle className="h-5 w-5" />
              Delete Workspace
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this workspace? This action cannot
              be undone. All boards, cards, and data will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#FF5630] hover:bg-[#FF5630]/90 text-white"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Yes, Delete Workspace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
