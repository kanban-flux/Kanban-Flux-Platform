"use client";

import { Badge } from "@/components/ui/badge";
import type { Label } from "@prisma/client";

export function LabelsSection({
  labels,
}: {
  labels: { label: Label }[];
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {labels.map(({ label }) => (
        <Badge
          key={label.id}
          variant="outline"
          className="text-xs"
          style={{
            backgroundColor: `${label.color}15`,
            color: label.color,
            borderColor: `${label.color}30`,
          }}
        >
          {label.name}
        </Badge>
      ))}
    </div>
  );
}
