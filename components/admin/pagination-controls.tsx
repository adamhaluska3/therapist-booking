"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  totalPages: number;
  rangeStart: number;
  rangeEnd: number;
  total: number;
  isPending: boolean;
  onNavigate: (page: number) => void;
  label?: string;
}

export function PaginationControls({
  page,
  totalPages,
  rangeStart,
  rangeEnd,
  total,
  isPending,
  onNavigate,
  label,
}: Props) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-xs text-neutral-400">
        {`Zobrazené ${rangeStart}–${rangeEnd} z ${total} ${label ?? "výsledkov"}`}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onNavigate(page - 1)}
          disabled={page <= 1 || isPending}
          className="rounded-md border border-surface-200 p-1.5 text-neutral-500 transition-colors hover:bg-surface-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={14} />
        </button>
        <button
          onClick={() => onNavigate(page + 1)}
          disabled={page >= totalPages || isPending}
          className="rounded-md border border-surface-200 p-1.5 text-neutral-500 transition-colors hover:bg-surface-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
