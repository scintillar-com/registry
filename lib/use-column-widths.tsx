"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_PREFIX = "col-widths:";

/**
 * Hook for resizable table columns with localStorage persistence.
 */
export function useColumnWidths(
  tableId: string,
  defaults: Record<string, number>,
): {
  widths: Record<string, number>;
  onResize: (key: string, width: number) => void;
} {
  const [widths, setWidths] = useState<Record<string, number>>(() => {
    if (typeof window === "undefined") return defaults;
    try {
      const stored = localStorage.getItem(STORAGE_PREFIX + tableId);
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, number>;
        return { ...defaults, ...Object.fromEntries(Object.entries(parsed).filter(([k]) => k in defaults)) };
      }
    } catch { /* ignore */ }
    return defaults;
  });

  const widthsRef = useRef(widths);
  useEffect(() => {
    widthsRef.current = widths;
    try { localStorage.setItem(STORAGE_PREFIX + tableId, JSON.stringify(widths)); } catch { /* ignore */ }
  }, [widths, tableId]);

  const onResize = useCallback((key: string, width: number) => {
    setWidths((prev) => ({ ...prev, [key]: Math.max(40, width) }));
  }, []);

  return { widths, onResize };
}

/**
 * Drag handle for column resizing. Place at the right edge of a <th>.
 * The parent <th> should have className="relative".
 */
export function ResizeHandle({ onResize }: { onResize: (width: number) => void }) {
  const handleRef = useRef<HTMLDivElement>(null);

  function onMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const th = handleRef.current?.closest("th");
    if (!th) return;

    // Sync to actual rendered width immediately to prevent jump
    const actualWidth = th.getBoundingClientRect().width;
    onResize(actualWidth);

    const startX = e.clientX;

    function onMouseMove(ev: MouseEvent) {
      const newWidth = actualWidth + (ev.clientX - startX);
      onResize(Math.max(40, newWidth));
    }

    function onMouseUp() {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }

  return (
    <div
      ref={handleRef}
      onMouseDown={onMouseDown}
      className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-primary/30 transition-colors"
    />
  );
}

// ── Sort ──────────────────────────────────────────────────────────

export type SortDir = "asc" | "desc";

export function useTableSort<K extends string>(defaultKey?: K, defaultDir: SortDir = "asc") {
  const [sortKey, setSortKey] = useState<K | null>(defaultKey ?? null);
  const [sortDir, setSortDir] = useState<SortDir>(defaultDir);

  const toggle = useCallback((key: K) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }, [sortKey]);

  return { sortKey, sortDir, toggle };
}

/** Sort indicator — shows arrow, previews next direction on hover */
export function SortIndicator({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) {
    return (
      <span className="ml-1.5 text-sm cursor-pointer opacity-0 group-hover:opacity-30 transition-opacity duration-150">↓</span>
    );
  }
  const current = dir === "asc" ? "↓" : "↑";
  const next = dir === "asc" ? "↑" : "↓";
  return (
    <span className="ml-1.5 text-sm cursor-pointer">
      <span className="group-hover:hidden">{current}</span>
      <span className="hidden group-hover:inline opacity-40">{next}</span>
    </span>
  );
}

/** Generic sort comparator */
export function sortRows<T>(rows: T[], key: string | null, dir: SortDir, getter: (row: T, key: string) => string | number): T[] {
  if (!key) return rows;
  return [...rows].sort((a, b) => {
    const va = getter(a, key);
    const vb = getter(b, key);
    if (typeof va === "number" && typeof vb === "number") return dir === "asc" ? va - vb : vb - va;
    const sa = String(va).toLowerCase();
    const sb = String(vb).toLowerCase();
    return dir === "asc" ? sa.localeCompare(sb) : sb.localeCompare(sa);
  });
}
