"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface SaveChangesFabProps {
  onClick: () => void
  hasChanges: boolean
}

export function SaveChangesFab({ onClick, hasChanges }: SaveChangesFabProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed bottom-8 right-8 flex items-center gap-2.5 px-5 py-3 rounded-full shadow-xl transition-all duration-300 z-50 font-medium text-sm",
        hasChanges
          ? "bg-gray-900 text-white hover:bg-gray-800 opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none"
      )}
    >
      <span className="h-5 w-5 rounded-full bg-brand-500 flex items-center justify-center shrink-0">
        <Check className="h-3 w-3 text-white" strokeWidth={3} />
      </span>
      Uložiť zmeny
    </button>
  )
}
