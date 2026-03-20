"use client";

import { useState } from "react";
import { Droppable } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import { KanbanCard } from "./card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ColumnWithCards, CardWithDetails } from "@/types";

export function KanbanColumn({
  column,
  onCardClick,
  onAddCard,
}: {
  column: ColumnWithCards;
  onCardClick: (card: CardWithDetails) => void;
  onAddCard: (columnId: string, title: string) => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");

  function handleAddCard() {
    if (!newCardTitle.trim()) return;
    onAddCard(column.id, newCardTitle.trim());
    setNewCardTitle("");
    setIsAdding(false);
  }

  return (
    <div className="flex w-[300px] flex-shrink-0 flex-col rounded-xl bg-surface p-3">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-900">
          {column.title}
        </h3>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[10px] font-medium text-secondary">
          {column.cards.length}
        </span>
      </div>

      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex min-h-[100px] flex-1 flex-col gap-2 rounded-lg p-1 transition-colors ${
              snapshot.isDraggingOver ? "bg-primary/5" : ""
            }`}
          >
            {column.cards.map((card, index) => (
              <KanbanCard
                key={card.id}
                card={card}
                index={index}
                onClick={() => onCardClick(card)}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {isAdding ? (
        <div className="mt-2 space-y-2">
          <Input
            autoFocus
            placeholder="Enter card title..."
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddCard();
              if (e.key === "Escape") setIsAdding(false);
            }}
            className="text-sm"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleAddCard}
              className="bg-primary hover:bg-primary-600"
            >
              Add Card
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsAdding(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="mt-2 flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-secondary hover:bg-gray-200 hover:text-neutral-900"
        >
          <Plus className="h-4 w-4" />
          Add Card
        </button>
      )}
    </div>
  );
}
