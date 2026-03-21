"use client";

import { useState } from "react";
import { CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { formatDate } from "@/lib/utils";

interface DueDatePickerProps {
  cardId: string;
  currentDueDate: string | Date | null;
  onUpdate: () => void;
}

function getDueDateStatus(date: Date): "overdue" | "today" | "future" {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const due = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (due.getTime() < today.getTime()) return "overdue";
  if (due.getTime() === today.getTime()) return "today";
  return "future";
}

function getDueDateColorClass(status: "overdue" | "today" | "future"): string {
  switch (status) {
    case "overdue":
      return "text-danger";
    case "today":
      return "text-warning";
    case "future":
      return "text-secondary";
  }
}

export function DueDatePicker({
  cardId,
  currentDueDate,
  onUpdate,
}: DueDatePickerProps) {
  const [open, setOpen] = useState(false);

  const selectedDate = currentDueDate ? new Date(currentDueDate) : undefined;
  const status = selectedDate ? getDueDateStatus(selectedDate) : null;

  async function handleSelect(date: Date | undefined) {
    if (!date) return;

    await fetch(`/api/cards/${cardId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dueDate: date.toISOString() }),
    });
    setOpen(false);
    onUpdate();
  }

  async function handleRemove() {
    await fetch(`/api/cards/${cardId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dueDate: null }),
    });
    setOpen(false);
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
        <CalendarIcon className="h-4 w-4" />
        <span>Due Date</span>
        {selectedDate && status && (
          <span className={`ml-auto text-xs ${getDueDateColorClass(status)}`}>
            {formatDate(selectedDate)}
          </span>
        )}
      </Button>
      {open && (
        <div className="mt-1 rounded-lg border bg-white p-1 shadow-sm">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => handleSelect(date)}
          />
          {selectedDate && (
            <div className="border-t p-1.5">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-danger"
                onClick={handleRemove}
              >
                <X className="h-3.5 w-3.5" />
                Remove due date
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
