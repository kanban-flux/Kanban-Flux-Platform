"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarCard {
  id: string;
  title: string;
  dueDate: string;
  column: {
    title: string;
    board: { id: string; name: string };
  };
  labels: { label: { id: string; name: string; color: string } }[];
  members: {
    user: { id: string; name: string; avatar: string | null };
  }[];
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const BOARD_COLORS = [
  "#0052CC",
  "#00875A",
  "#FF5630",
  "#6554C0",
  "#FF991F",
  "#00B8D9",
  "#36B37E",
  "#E91E63",
];

function getBoardColor(boardId: string): string {
  let hash = 0;
  for (let i = 0; i < boardId.length; i++) {
    hash = boardId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return BOARD_COLORS[Math.abs(hash) % BOARD_COLORS.length];
}

export default function CalendarPage() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [cards, setCards] = useState<CalendarCard[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/calendar?month=${month}&year=${year}`);
      const data = await res.json();
      setCards(data);
    } catch {
      setCards([]);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  function handlePrevMonth() {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function handleNextMonth() {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1);
    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = new Date(year, month, 0).getDate();

    const prevMonthDays = new Date(year, month - 1, 0).getDate();

    const days: { day: number; isCurrentMonth: boolean; date: Date }[] = [];

    // Previous month trailing days
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      days.push({
        day,
        isCurrentMonth: false,
        date: new Date(year, month - 2, day),
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        day: d,
        isCurrentMonth: true,
        date: new Date(year, month - 1, d),
      });
    }

    // Next month leading days to fill grid
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let i = 1; i <= remaining; i++) {
        days.push({
          day: i,
          isCurrentMonth: false,
          date: new Date(year, month, i),
        });
      }
    }

    return days;
  }, [month, year]);

  const cardsByDay = useMemo(() => {
    const map = new Map<string, CalendarCard[]>();
    for (const card of cards) {
      if (!card.dueDate) continue;
      const d = new Date(card.dueDate);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(card);
    }
    return map;
  }, [cards]);

  function isToday(date: Date) {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  function getDayKey(date: Date) {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  }

  const weeks = useMemo(() => {
    const result: typeof calendarDays[] = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      result.push(calendarDays.slice(i, i + 7));
    }
    return result;
  }, [calendarDays]);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">
              Calendar
            </h1>
            <p className="text-secondary">
              View cards with due dates across all your boards.
            </p>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="min-w-[200px] text-center text-lg font-semibold text-neutral-900">
            {MONTH_NAMES[month - 1]} {year}
          </h2>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="overflow-hidden rounded-xl border bg-white">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b bg-neutral-50">
            {DAY_NAMES.map((name) => (
              <div
                key={name}
                className="px-2 py-2 text-center text-sm font-medium text-secondary"
              >
                {name}
              </div>
            ))}
          </div>

          {/* Weeks */}
          {loading ? (
            <div className="flex h-96 items-center justify-center text-secondary">
              Loading...
            </div>
          ) : (
            <div>
              {weeks.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7">
                  {week.map((dayInfo, di) => {
                    const dayCards =
                      cardsByDay.get(getDayKey(dayInfo.date)) || [];
                    const todayHighlight = isToday(dayInfo.date);

                    return (
                      <div
                        key={`${wi}-${di}`}
                        className={`min-h-[100px] border-b border-r p-1.5 ${
                          todayHighlight
                            ? "bg-primary/5 ring-2 ring-inset ring-primary"
                            : ""
                        } ${!dayInfo.isCurrentMonth ? "bg-neutral-50" : ""}`}
                      >
                        <span
                          className={`mb-1 inline-block text-sm font-medium ${
                            !dayInfo.isCurrentMonth
                              ? "text-neutral-300"
                              : todayHighlight
                                ? "text-primary"
                                : "text-neutral-700"
                          }`}
                        >
                          {dayInfo.day}
                        </span>

                        <div className="space-y-0.5">
                          {dayCards.map((card) => (
                            <div
                              key={card.id}
                              className="flex cursor-pointer items-center truncate rounded px-2 py-0.5 text-xs text-neutral-800 hover:bg-neutral-100"
                              style={{
                                borderLeft: `3px solid ${getBoardColor(card.column.board.id)}`,
                              }}
                              title={`${card.title} — ${card.column.board.name} / ${card.column.title}`}
                            >
                              <span className="truncate">{card.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
