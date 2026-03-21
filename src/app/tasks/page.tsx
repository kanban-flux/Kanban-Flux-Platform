"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarGroup,
} from "@/components/ui/avatar";
import {
  ClipboardList,
  CalendarDays,
  ArrowUpDown,
  Inbox,
} from "lucide-react";
import { cn, formatDate, getInitials } from "@/lib/utils";

interface TaskCard {
  id: string;
  title: string;
  description: string | null;
  position: number;
  dueDate: string | null;
  columnId: string;
  createdAt: string;
  updatedAt: string;
  column: {
    title: string;
    board: { id: string; name: string };
  };
  labels: { cardId: string; labelId: string; label: { id: string; name: string; color: string } }[];
  members: { cardId: string; userId: string; user: { id: string; name: string; avatar: string | null } }[];
  checklists: {
    id: string;
    title: string;
    cardId: string;
    items: { id: string; text: string; completed: boolean; checklistId: string }[];
  }[];
}

type FilterTab = "all" | "todo" | "inprogress" | "done";
type SortOption = "dueDate" | "updatedAt" | "boardName";

function getStatusVariant(columnTitle: string): string {
  const lower = columnTitle.toLowerCase();
  if (lower.includes("done") || lower.includes("complete")) return "success";
  if (lower.includes("progress") || lower.includes("doing") || lower.includes("review")) return "warning";
  return "gray";
}

function getStatusBadgeClasses(variant: string): string {
  switch (variant) {
    case "success":
      return "bg-[#36B37E]/10 text-[#36B37E] border-[#36B37E]/20";
    case "warning":
      return "bg-[#FFAB00]/10 text-[#946200] border-[#FFAB00]/20";
    default:
      return "bg-gray-100 text-gray-600 border-gray-200";
  }
}

function matchesFilter(columnTitle: string, filter: FilterTab): boolean {
  if (filter === "all") return true;
  const lower = columnTitle.toLowerCase();
  if (filter === "done") return lower.includes("done") || lower.includes("complete");
  if (filter === "inprogress") return lower.includes("progress") || lower.includes("doing") || lower.includes("review");
  if (filter === "todo") return !matchesFilter(columnTitle, "done") && !matchesFilter(columnTitle, "inprogress");
  return true;
}

function getChecklistProgress(checklists: TaskCard["checklists"]): { done: number; total: number } {
  let done = 0;
  let total = 0;
  for (const cl of checklists) {
    for (const item of cl.items) {
      total++;
      if (item.completed) done++;
    }
  }
  return { done, total };
}

export default function TasksPage() {
  const [cards, setCards] = useState<TaskCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [sort, setSort] = useState<SortOption>("updatedAt");

  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch("/api/tasks");
        const data = await res.json();
        setCards(data);
      } catch {
        setCards([]);
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, []);

  const filteredAndSorted = useMemo(() => {
    const filtered = cards.filter((card) => matchesFilter(card.column.title, filter));

    return [...filtered].sort((a, b) => {
      switch (sort) {
        case "dueDate": {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        case "boardName":
          return a.column.board.name.localeCompare(b.column.board.name);
        case "updatedAt":
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });
  }, [cards, filter, sort]);

  const counts = useMemo(() => {
    return {
      all: cards.length,
      todo: cards.filter((c) => matchesFilter(c.column.title, "todo")).length,
      inprogress: cards.filter((c) => matchesFilter(c.column.title, "inprogress")).length,
      done: cards.filter((c) => matchesFilter(c.column.title, "done")).length,
    };
  }, [cards]);

  function cycleSortOption() {
    setSort((prev) => {
      if (prev === "updatedAt") return "dueDate";
      if (prev === "dueDate") return "boardName";
      return "updatedAt";
    });
  }

  const sortLabel =
    sort === "dueDate" ? "Due Date" : sort === "boardName" ? "Board Name" : "Recently Updated";

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">My Tasks</h1>
          <p className="text-secondary">
            All your assigned tasks across boards.
          </p>
        </div>

        {/* Filter Tabs + Sort */}
        <div className="flex items-center justify-between">
          <Tabs value={filter} onValueChange={(v: string) => setFilter(v as FilterTab)}>
            <TabsList>
              <TabsTrigger value="all">All Tasks ({counts.all})</TabsTrigger>
              <TabsTrigger value="todo">To Do ({counts.todo})</TabsTrigger>
              <TabsTrigger value="inprogress">In Progress ({counts.inprogress})</TabsTrigger>
              <TabsTrigger value="done">Done ({counts.done})</TabsTrigger>
            </TabsList>
          </Tabs>

          <button
            onClick={cycleSortOption}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-secondary transition-colors hover:bg-surface hover:text-neutral-900"
          >
            <ArrowUpDown className="h-4 w-4" />
            {sortLabel}
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : filteredAndSorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface">
              <Inbox className="h-8 w-8 text-secondary" />
            </div>
            <h3 className="text-lg font-medium text-neutral-900">
              No tasks assigned to you yet.
            </h3>
            <p className="mt-1 text-sm text-secondary">
              When you are assigned to cards on any board, they will appear here.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[35%]">Task</TableHead>
                  <TableHead>Board</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Members</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSorted.map((card) => {
                  const statusVariant = getStatusVariant(card.column.title);
                  const { done, total } = getChecklistProgress(card.checklists);
                  const progressPct = total > 0 ? Math.round((done / total) * 100) : 0;
                  const isOverdue =
                    card.dueDate && new Date(card.dueDate) < new Date() && statusVariant !== "success";

                  return (
                    <TableRow key={card.id} className="cursor-pointer">
                      <TableCell>
                        <Link
                          href={`/board/${card.column.board.id}`}
                          className="block"
                        >
                          <span className="font-medium text-neutral-900 hover:text-primary transition-colors">
                            {card.title}
                          </span>
                          {card.labels.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {card.labels.map((cl) => (
                                <span
                                  key={cl.labelId}
                                  className="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
                                  style={{ backgroundColor: cl.label.color }}
                                >
                                  {cl.label.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs font-medium">
                          {card.column.board.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                            getStatusBadgeClasses(statusVariant)
                          )}
                        >
                          {card.column.title}
                        </span>
                      </TableCell>
                      <TableCell>
                        {card.dueDate ? (
                          <span
                            className={cn(
                              "flex items-center gap-1.5 text-sm",
                              isOverdue ? "text-[#FF5630] font-medium" : "text-secondary"
                            )}
                          >
                            <CalendarDays className="h-3.5 w-3.5" />
                            {formatDate(card.dueDate)}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">--</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {total > 0 ? (
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-200">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all",
                                  progressPct === 100
                                    ? "bg-[#36B37E]"
                                    : progressPct > 0
                                      ? "bg-[#0052CC]"
                                      : "bg-gray-300"
                                )}
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                            <span className="flex items-center gap-1 text-xs text-secondary">
                              <ClipboardList className="h-3 w-3" />
                              {done}/{total}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">--</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {card.members.length > 0 ? (
                          <AvatarGroup>
                            {card.members.slice(0, 3).map((m) => (
                              <Avatar key={m.userId} size="sm">
                                {m.user.avatar ? (
                                  <AvatarImage src={m.user.avatar} />
                                ) : null}
                                <AvatarFallback>
                                  {getInitials(m.user.name)}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                            {card.members.length > 3 && (
                              <Avatar size="sm">
                                <AvatarFallback>
                                  +{card.members.length - 3}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </AvatarGroup>
                        ) : (
                          <span className="text-sm text-gray-400">--</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
