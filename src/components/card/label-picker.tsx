"use client";

import { useEffect, useState } from "react";
import { Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface Label {
  id: string;
  name: string;
  color: string;
}

interface LabelPickerProps {
  cardId: string;
  currentLabels: { label: { id: string; name: string; color: string } }[];
  onUpdate: () => void;
}

export function LabelPicker({ cardId, currentLabels, onUpdate }: LabelPickerProps) {
  const [allLabels, setAllLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      fetchLabels();
    }
  }, [open]);

  async function fetchLabels() {
    setLoading(true);
    try {
      const res = await fetch("/api/labels");
      const data = await res.json();
      setAllLabels(data);
    } finally {
      setLoading(false);
    }
  }

  function isAssigned(labelId: string) {
    return currentLabels.some(({ label }) => label.id === labelId);
  }

  async function toggleLabel(labelId: string) {
    if (isAssigned(labelId)) {
      await fetch(`/api/cards/${cardId}/labels?labelId=${labelId}`, {
        method: "DELETE",
      });
    } else {
      await fetch(`/api/cards/${cardId}/labels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ labelId }),
      });
    }
    onUpdate();
  }

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start gap-2 text-secondary"
        onClick={() => setOpen(!open)}
      >
        <Tag className="h-4 w-4" />
        Labels
      </Button>
      {open && (
        <div className="mt-1 rounded-lg border bg-white p-2.5 shadow-sm space-y-2">
          <h4 className="text-xs font-semibold uppercase text-secondary">Labels</h4>
          {loading ? (
            <p className="text-sm text-secondary py-2">Loading...</p>
          ) : (
            <div className="space-y-0.5">
              {allLabels.map((label) => (
                <button
                  key={label.id}
                  type="button"
                  className="flex w-full cursor-pointer items-center gap-2 rounded px-1.5 py-1.5 hover:bg-surface"
                  onClick={() => toggleLabel(label.id)}
                >
                  <Checkbox
                    checked={isAssigned(label.id)}
                    tabIndex={-1}
                  />
                  <span
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: label.color }}
                  />
                  <span className="text-sm text-neutral-900">{label.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
