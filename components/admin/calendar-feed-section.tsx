"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { AdminCard } from "@/components/admin/admin-card"

export function CalendarFeedSection({ feedUrl }: { feedUrl: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(feedUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <AdminCard>
      <h2 className="text-sm font-semibold text-neutral-700 mb-1">Synchronizácia kalendára</h2>
      <p className="text-sm text-neutral-500 mb-4">
        Pridajte tento odkaz do Google Calendar, Apple Calendar alebo Outlooku ako "Subscribe from URL". Kalendár sa bude automaticky aktualizovať.
      </p>
      <div className="flex items-center gap-2">
        <input
          readOnly
          value={feedUrl}
          className="flex-1 rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-xs text-neutral-600 outline-none font-mono truncate"
          onFocus={(e) => e.target.select()}
        />
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-lg border border-surface-200 bg-white px-3 py-2 text-xs font-medium text-neutral-600 hover:bg-surface-50 transition-colors shrink-0"
        >
          {copied ? <Check size={13} className="text-brand-600" /> : <Copy size={13} />}
          {copied ? "Skopírované" : "Kopírovať"}
        </button>
      </div>
    </AdminCard>
  )
}
