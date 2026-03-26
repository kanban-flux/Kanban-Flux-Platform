"use client";

import { useState, useCallback, useMemo } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { KanbanColumn } from "./column";
import { BoardFilters } from "./board-filters";
import { CardDetailModal } from "@/components/card/card-detail-modal";
import type { BoardWithColumns, CardWithDetails, ColumnWithCards } from "@/types";

interface FilterState {
  label: string | null;
  member: string | null;
}

export function BoardView({
  initialBoard,
}: {
  initialBoard: BoardWithColumns;
}) {
  const [board, setBoard] = useState(initialBoard);
  const [selectedCard, setSelectedCard] = useState<CardWithDetails | null>(null);
  const [filters, setFilters] = useState<FilterState>({ label: null, member: null });
  const [searchQuery, setSearchQuery] = useState("");

  const refreshBoard = useCallback(async () => {
    const res = await fetch(`/api/boards/${board.id}`);
    const data = await res.json();
    setBoard(data);
  }, [board.id]);

  // Extract unique labels and members from board data
  const { uniqueLabels, uniqueMembers } = useMemo(() => {
    const labelMap = new Map<string, { id: string; name: string; color: string }>();
    const memberMap = new Map<string, { userId: string; name: string }>();

    for (const column of board.columns) {
      for (const card of column.cards) {
        for (const cl of card.labels) {
          if (!labelMap.has(cl.label.id)) {
            labelMap.set(cl.label.id, {
              id: cl.label.id,
              name: cl.label.name,
              color: cl.label.color,
            });
          }
        }
        for (const cm of card.members) {
          if (!memberMap.has(cm.user.id)) {
            memberMap.set(cm.user.id, {
              userId: cm.user.id,
              name: cm.user.name,
            });
          }
        }
      }
    }

    return {
      uniqueLabels: Array.from(labelMap.values()),
      uniqueMembers: Array.from(memberMap.values()),
    };
  }, [board]);

  // Filter cards within a column
  function filterCards(cards: CardWithDetails[]): CardWithDetails[] {
    return cards.filter((card) => {
      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const titleMatch = card.title.toLowerCase().includes(q);
        const descMatch = (card.description || "").toLowerCase().includes(q);
        if (!titleMatch && !descMatch) return false;
      }
      // Label filter
      if (filters.label && !card.labels.some((l) => l.label.name === filters.label)) {
        return false;
      }
      // Member filter
      if (filters.member && !card.members.some((m) => m.user.id === filters.member)) {
        return false;
      }
      return true;
    });
  }

  // Build filtered columns for display
  const filteredColumns: ColumnWithCards[] = useMemo(() => {
    return board.columns.map((col) => ({
      ...col,
      cards: filterCards(col.cards),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board.columns, filters, searchQuery]);

  async function onDragEnd(result: DropResult) {
    const { source, destination } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const newColumns = board.columns.map((col) => ({
      ...col,
      cards: [...col.cards],
    }));
    const sourceCol = newColumns.find((c) => c.id === source.droppableId)!;
    const destCol = newColumns.find((c) => c.id === destination.droppableId)!;

    const [movedCard] = sourceCol.cards.splice(source.index, 1);
    destCol.cards.splice(destination.index, 0, {
      ...movedCard,
      columnId: destCol.id,
    });

    sourceCol.cards.forEach((card, i) => (card.position = i));
    destCol.cards.forEach((card, i) => (card.position = i));

    setBoard({ ...board, columns: newColumns });

    const cardsToUpdate = [
      ...sourceCol.cards,
      ...(source.droppableId !== destination.droppableId ? destCol.cards : []),
    ];

    await fetch("/api/cards/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cards: cardsToUpdate.map((c) => ({
          id: c.id,
          columnId: c.columnId,
          position: c.position,
        })),
      }),
    });
  }

  async function handleAddCard(columnId: string, title: string) {
    await fetch("/api/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, columnId }),
    });
    refreshBoard();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900">
          {board.name}
        </h1>
      </div>

      <BoardFilters
        labels={uniqueLabels}
        members={uniqueMembers}
        onFilterChange={setFilters}
        onSearchChange={setSearchQuery}
      />

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {filteredColumns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              onCardClick={setSelectedCard}
              onAddCard={handleAddCard}
            />
          ))}
        </div>
      </DragDropContext>

      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          open={!!selectedCard}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedCard(null);
              refreshBoard();
            }
          }}
          boardId={board.id}
        />
      )}
    </div>
  );
}
