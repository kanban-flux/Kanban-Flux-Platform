"use client";

import { useState, useEffect, useCallback } from "react";
import { Shield, CheckCircle2, XCircle, Bot, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface ApprovalGate {
  id: string;
  actionType: string;
  status: string;
  description: string;
  createdAt: string;
  agent: { user: { name: string } };
  run: { card: { id: string; title: string } };
}

export function ApprovalsPanel() {
  const [approvals, setApprovals] = useState<ApprovalGate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApprovals = useCallback(async () => {
    try {
      const res = await fetch("/api/agents/approvals?status=PENDING");
      const data = await res.json();
      setApprovals(Array.isArray(data) ? data : []);
    } catch {
      setApprovals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApprovals();
    const interval = setInterval(fetchApprovals, 10000);
    return () => clearInterval(interval);
  }, [fetchApprovals]);

  async function handleDecision(id: string, status: "APPROVED" | "REJECTED") {
    await fetch(`/api/agents/approvals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, resolvedBy: "admin" }),
    });
    fetchApprovals();
  }

  if (loading) return null;
  if (approvals.length === 0) return null;

  return (
    <Card className="border-amber-200 bg-amber-50/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4 text-amber-600" />
          <h3 className="text-sm font-semibold text-amber-900">
            Pending Approvals ({approvals.length})
          </h3>
          <Badge variant="outline" className="bg-amber-100 text-amber-700 text-xs">
            HITL
          </Badge>
        </div>
        <div className="space-y-2">
          {approvals.map((gate) => (
            <div
              key={gate.id}
              className="flex items-start gap-3 p-2 rounded-lg bg-white border border-amber-100"
            >
              <Bot className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900">
                  {gate.agent.user.name}
                </p>
                <p className="text-xs text-secondary mt-0.5">
                  {gate.description}
                </p>
                <p className="text-xs text-secondary mt-0.5">
                  Card:{" "}
                  <span className="font-medium">{gate.run.card.title}</span>
                </p>
                <div className="flex items-center gap-1 mt-0.5 text-xs text-secondary">
                  <Clock className="h-3 w-3" />
                  {new Date(gate.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <Button
                  size="sm"
                  className="h-7 px-2 bg-green-600 hover:bg-green-700 text-xs"
                  onClick={() => handleDecision(gate.id, "APPROVED")}
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 text-xs border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => handleDecision(gate.id, "REJECTED")}
                >
                  <XCircle className="h-3 w-3 mr-1" />
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
