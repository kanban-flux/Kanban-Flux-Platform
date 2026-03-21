"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, Columns3, FileText, Users } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn, getInitials, formatDate } from "@/lib/utils";

interface BoardResult {
  id: string;
  name: string;
  description: string | null;
  status: string;
  updatedAt: string;
}

interface CardResult {
  id: string;
  title: string;
  description: string | null;
  column: {
    title: string;
    board: { id: string; name: string };
  };
  labels: { label: { id: string; name: string; color: string } }[];
}

interface MemberResult {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

interface SearchResults {
  boards: BoardResult[];
  cards: CardResult[];
  members: MemberResult[];
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults(null);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
      } catch {
        setResults(null);
      } finally {
        setLoading(false);
      }

      const params = new URLSearchParams();
      params.set("q", query);
      router.replace(`/search?${params.toString()}`, { scroll: false });
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, router]);

  const hasResults =
    results &&
    (results.boards.length > 0 ||
      results.cards.length > 0 ||
      results.members.length > 0);

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-secondary" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search boards, cards, members..."
            className="h-12 rounded-xl pl-12 text-base shadow-sm border-gray-200 bg-white focus-visible:ring-primary"
          />
        </div>

        {/* States */}
        {loading && (
          <p className="text-center text-sm text-secondary">Searching...</p>
        )}

        {!loading && query.length < 2 && (
          <p className="text-center text-sm text-secondary">
            Type at least 2 characters to search...
          </p>
        )}

        {!loading && query.length >= 2 && results && !hasResults && (
          <p className="text-center text-sm text-secondary">
            No results found for &apos;{query}&apos;
          </p>
        )}

        {/* Results */}
        {!loading && hasResults && (
          <div className="space-y-6">
            {/* Boards */}
            {results!.boards.length > 0 && (
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <Columns3 className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold text-neutral-900">
                    Boards
                  </h2>
                  <Badge variant="secondary" className="text-xs">
                    {results!.boards.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {results!.boards.map((board) => (
                    <Link
                      key={board.id}
                      href={`/board/${board.id}`}
                      className="block rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
                    >
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-neutral-900">
                            {board.name}
                          </h3>
                          {board.description && (
                            <p className="mt-1 text-sm text-secondary line-clamp-1">
                              {board.description}
                            </p>
                          )}
                        </div>
                        <div className="ml-3 flex items-center gap-2">
                          <Badge
                            variant={
                              board.status === "ACTIVE"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {board.status}
                          </Badge>
                          <span className="text-xs text-secondary whitespace-nowrap">
                            {formatDate(board.updatedAt)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {results!.boards.length > 0 && results!.cards.length > 0 && (
              <Separator />
            )}

            {/* Cards */}
            {results!.cards.length > 0 && (
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold text-neutral-900">
                    Cards
                  </h2>
                  <Badge variant="secondary" className="text-xs">
                    {results!.cards.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {results!.cards.map((card) => (
                    <Link
                      key={card.id}
                      href={`/board/${card.column.board.id}`}
                      className="block rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
                    >
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-neutral-900">
                            {card.title}
                          </h3>
                          {card.description && (
                            <p className="mt-1 text-sm text-secondary line-clamp-1">
                              {card.description}
                            </p>
                          )}
                          {card.labels.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {card.labels.map(({ label }) => (
                                <span
                                  key={label.id}
                                  className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white"
                                  style={{ backgroundColor: label.color }}
                                >
                                  {label.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="ml-3 flex flex-col items-end gap-1">
                          <Badge variant="outline" className="text-xs">
                            {card.column.board.name}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {card.column.title}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {(results!.boards.length > 0 || results!.cards.length > 0) &&
              results!.members.length > 0 && <Separator />}

            {/* Members */}
            {results!.members.length > 0 && (
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold text-neutral-900">
                    Members
                  </h2>
                  <Badge variant="secondary" className="text-xs">
                    {results!.members.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {results!.members.map((member) => (
                    <Link
                      key={member.id}
                      href="/team"
                      className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
                    >
                      <Avatar className="h-10 w-10">
                        {member.avatar && (
                          <AvatarImage src={member.avatar} alt={member.name} />
                        )}
                        <AvatarFallback className="bg-primary text-white text-sm">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-neutral-900">
                          {member.name}
                        </p>
                        <p className="text-sm text-secondary">{member.email}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
