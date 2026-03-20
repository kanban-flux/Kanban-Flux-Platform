"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { BoardView } from "@/components/board/board-view";
import type { BoardWithColumns } from "@/types";

export default function BoardPage() {
  const params = useParams();
  const [board, setBoard] = useState<BoardWithColumns | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBoard() {
      try {
        const res = await fetch(`/api/boards/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setBoard(data);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchBoard();
  }, [params.id]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  if (!board) {
    return (
      <AppLayout>
        <div className="flex h-full flex-col items-center justify-center gap-2">
          <h1 className="text-2xl font-semibold text-neutral-900">
            Board not found
          </h1>
          <p className="text-secondary">
            The board you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <BoardView initialBoard={board} />
    </AppLayout>
  );
}
