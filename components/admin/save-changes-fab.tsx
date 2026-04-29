"use client"

import { Check, Undo2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SaveChangesFabProps {
  onSave: () => void
  onRevert: () => void
  hasChanges: boolean
}

export function SaveChangesFab({ onSave, onRevert, hasChanges }: SaveChangesFabProps) {
  return (
    <div
      className={cn(
        "fixed bottom-8 right-8 flex items-center gap-2 z-50 transition-all duration-300",
        hasChanges ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none",
      )}
    >
      <button
        onClick={onRevert}
        className="flex items-center gap-2 px-4 py-3 rounded-full shadow-xl font-medium text-sm bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        <Undo2 className="h-4 w-4" />
        Zahodiť
      </button>

      <button
        onClick={onSave}
        className="flex items-center gap-2.5 px-5 py-3 rounded-full shadow-xl font-medium text-sm bg-gray-900 text-white hover:bg-gray-800 transition-colors"
      >
        <span className="h-5 w-5 rounded-full bg-brand-500 flex items-center justify-center shrink-0">
          <Check className="h-3 w-3 text-white" strokeWidth={3} />
        </span>
        Uložiť zmeny
      </button>
    </div>
  )
}
