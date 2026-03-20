"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDate, getInitials } from "@/lib/utils";
import type { BoardSummary } from "@/types";

const statusConfig = {
  ACTIVE: { label: "Active", className: "bg-success/10 text-success border-success/20" },
  PAUSED: { label: "Paused", className: "bg-warning/10 text-warning border-warning/20" },
  ARCHIVED: { label: "Archived", className: "bg-gray-100 text-gray-500 border-gray-200" },
};

export function AllBoardsTable({ boards }: { boards: BoardSummary[] }) {
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
      <h2 className="mb-4 text-lg font-semibold text-neutral-900">All Boards</h2>
      <div className="rounded-xl border border-gray-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-medium uppercase text-secondary">
                Project Name
              </TableHead>
              <TableHead className="text-xs font-medium uppercase text-secondary">
                Status
              </TableHead>
              <TableHead className="text-xs font-medium uppercase text-secondary">
                Team
              </TableHead>
              <TableHead className="text-xs font-medium uppercase text-secondary">
                Last Edited
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {boards.map((board) => {
              const members = getMembers(board);
              const status = statusConfig[board.status];
              return (
                <TableRow key={board.id} className="cursor-pointer hover:bg-surface">
                  <TableCell>
                    <Link
                      href={`/board/${board.id}`}
                      className="flex items-center gap-3"
                    >
                      <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                      <div>
                        <p className="font-medium text-neutral-900">
                          {board.name}
                        </p>
                        {board.description && (
                          <p className="text-xs text-secondary">
                            {board.description}
                          </p>
                        )}
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={status.className}>
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex -space-x-2">
                      {members.slice(0, 4).map((member) => (
                        <Avatar
                          key={member.id}
                          className="h-7 w-7 border-2 border-white"
                        >
                          <AvatarFallback className="bg-primary/10 text-[10px] text-primary">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-secondary">
                    {formatDate(board.updatedAt)}
                  </TableCell>
                </TableRow>
              );
            })}
            {boards.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-secondary">
                  No boards yet. Create your first board to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
