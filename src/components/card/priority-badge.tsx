import { Badge } from "@/components/ui/badge";

const PRIORITIES = [
  { label: "P0", name: "Critical", color: "bg-red-100 text-red-700 border-red-200" },
  { label: "P1", name: "High", color: "bg-orange-100 text-orange-700 border-orange-200" },
  { label: "P2", name: "Medium", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { label: "P3", name: "Low", color: "bg-gray-100 text-gray-600 border-gray-200" },
];

export function PriorityBadge({ priority }: { priority: number }) {
  const p = PRIORITIES[priority] || PRIORITIES[2];
  return (
    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${p.color}`}>
      {p.label}
    </Badge>
  );
}

export { PRIORITIES };
