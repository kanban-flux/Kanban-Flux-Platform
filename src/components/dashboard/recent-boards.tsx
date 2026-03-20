"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import type { BoardSummary } from "@/types";

const boardCovers = [
  "from-primary to-primary-400",
  "from-tertiary to-blue-400",
  "from-purple-500 to-pink-500",
  "from-success to-emerald-400",
  "from-warning to-orange-400",
];

export function RecentBoards({
  boards,
  onCreateBoard,
}: {
  boards: BoardSummary[];
  onCreateBoard: () => void;
}) {
  const recentBoards = boards.slice(0, 4);

  const getMembers = (board: BoardSummary) => {
    const memberMap = new Map<string, { id: string; name: string; avatar: string | null }>();
    board.columns.forEach((col) =>
      col.cards.forEach((card) =>
        card.members.forEach((m) => memberMap.set(m.user.id, m.user))
      )
    );
    return Array.from(memberMap.values());
  };

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">Recent Boards</h2>
        <button className="text-sm text-primary hover:underline">
          View activity
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {recentBoards.map((board, index) => {
          const members = getMembers(board);
          return (
            <Link
              key={board.id}
              href={`/board/${board.id}`}
              className="group relative overflow-hidden rounded-xl shadow-sm transition-shadow hover:shadow-md"
            >
              <div
                className={`h-36 bg-gradient-to-br ${boardCovers[index % boardCovers.length]} p-4`}
              >
                <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative z-10 flex h-full flex-col justify-end">
                  <h3 className="text-lg font-semibold text-white">
                    {board.name}
                  </h3>
                  <div className="mt-2 flex items-center gap-1">
                    <span className="text-xs text-white/80">
                      {members.length} Members
                    </span>
                    <div className="ml-2 flex -space-x-2">
                      {members.slice(0, 3).map((member) => (
                        <Avatar
                          key={member.id}
                          className="h-6 w-6 border-2 border-white"
                        >
                          <AvatarFallback className="bg-white/30 text-[10px] text-white">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {members.length > 3 && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-white/30 text-[10px] text-white">
                          +{members.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
        <button
          onClick={onCreateBoard}
          className="flex h-36 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 text-primary transition-colors hover:border-primary hover:bg-primary/10"
        >
          <Plus className="h-8 w-8" />
          <span className="text-sm font-medium">Create Board</span>
        </button>
      </div>
    </section>
  );
}
