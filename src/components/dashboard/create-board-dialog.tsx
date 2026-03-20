"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function CreateBoardDialog({
  open,
  onOpenChange,
  workspaceId,
  onBoardCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  onBoardCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, workspaceId }),
      });
      setName("");
      setDescription("");
      onOpenChange(false);
      onBoardCreated();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Board</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-900">
              Board Name
            </label>
            <Input
              placeholder="e.g., Product Launch Q4"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-900">
              Description
            </label>
            <Textarea
              placeholder="What is this board about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !name.trim()}
              className="bg-primary hover:bg-primary-600"
            >
              {loading ? "Creating..." : "Create Board"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
