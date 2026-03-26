"use client";

import { useState } from "react";
import { Filter, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterState {
  label: string | null;
  member: string | null;
}

interface BoardFiltersProps {
  labels: { id: string; name: string; color: string }[];
  members: { userId: string; name: string }[];
  onFilterChange: (filters: FilterState) => void;
  onSearchChange: (query: string) => void;
}

export function BoardFilters({
  labels,
  members,
  onFilterChange,
  onSearchChange,
}: BoardFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    label: null,
    member: null,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  function updateFilter(key: keyof FilterState, value: string | null) {
    const newFilters = {
      ...filters,
      [key]: value === "all" ? null : value,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  }

  function clearFilters() {
    const cleared: FilterState = { label: null, member: null };
    setFilters(cleared);
    onFilterChange(cleared);
    setSearchQuery("");
    onSearchChange("");
  }

  const hasFilters = filters.label || filters.member || searchQuery;

  return (
    <div className="mb-3">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-3 w-3 mr-1" />
          Filters
          {hasFilters && (
            <Badge className="ml-1 h-4 w-4 p-0 text-[10px] flex items-center justify-center">
              !
            </Badge>
          )}
        </Button>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={clearFilters}
          >
            <X className="h-3 w-3 mr-1" /> Clear
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="flex flex-wrap items-center gap-2 mt-2 p-2 rounded-lg bg-surface border">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-secondary" />
            <Input
              placeholder="Search cards..."
              className="h-7 w-[200px] text-xs pl-7"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                onSearchChange(e.target.value);
              }}
            />
          </div>

          <Select
            value={filters.label || "all"}
            onValueChange={(v) => v && updateFilter("label", v)}
          >
            <SelectTrigger className="h-7 w-[140px] text-xs">
              <SelectValue placeholder="Label" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Labels</SelectItem>
              {labels.map((l) => (
                <SelectItem key={l.id} value={l.name}>
                  {l.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.member || "all"}
            onValueChange={(v) => v && updateFilter("member", v)}
          >
            <SelectTrigger className="h-7 w-[140px] text-xs">
              <SelectValue placeholder="Member" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Members</SelectItem>
              {members.map((m) => (
                <SelectItem key={m.userId} value={m.userId}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
