"use client";
import { useEffect, useRef, useCallback } from "react";

type EventHandler = (data: unknown) => void;

export function useEventStream(handlers: Record<string, EventHandler>) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  const connect = useCallback(() => {
    if (eventSourceRef.current) return;

    const es = new EventSource("/api/events/stream");
    eventSourceRef.current = es;

    es.onopen = () => console.log("[SSE] Connected");
    es.onerror = () => {
      console.log("[SSE] Error, reconnecting in 5s...");
      es.close();
      eventSourceRef.current = null;
      setTimeout(connect, 5000);
    };

    // Register handlers for each event type
    for (const eventType of Object.keys(handlersRef.current)) {
      es.addEventListener(eventType, (e) => {
        try {
          const data = JSON.parse((e as MessageEvent).data);
          handlersRef.current[eventType]?.(data);
        } catch {
          // ignore parse errors
        }
      });
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
    };
  }, [connect]);
}
