"use client"

import { MousePointerClick, Copy, TrendingUp } from "lucide-react"

const hints = [
  {
    icon: MousePointerClick,
    title: "Drag & Create",
    description:
      "Kliknite a potiahnite myšou po mriežke pre okamžité vytvorenie nového bloku dostupnosti.",
    iconBg: "bg-brand-100",
    iconColor: "text-brand-600",
  },
  {
    icon: Copy,
    title: "Duplikovať týždeň",
    description:
      "Použite funkciu 'Smart Repeat' pre rýchle kopírovanie vášho harmonogramu do budúcich týždňov.",
    iconBg: "bg-surface-200",
    iconColor: "text-gray-600",
  },
  {
    icon: TrendingUp,
    title: "Vyťaženosť",
    description:
      "Tento týždeň máte naplnených 85 % kapacity. Zvážte pridanie večerných slotov.",
    iconBg: "bg-surface-200",
    iconColor: "text-gray-600",
  },
]

export function CalendarHints() {
  return (
    <div className="grid grid-cols-3 gap-4 mt-6">
      {hints.map((hint) => {
        const Icon = hint.icon
        return (
          <div
            key={hint.title}
            className="bg-white rounded-xl p-4 flex items-start gap-3 border border-surface-200"
          >
            <span
              className={`${hint.iconBg} ${hint.iconColor} h-8 w-8 rounded-lg flex items-center justify-center shrink-0`}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div>
              <div className="text-sm font-semibold text-gray-800 mb-0.5">{hint.title}</div>
              <div className="text-xs text-gray-500 leading-relaxed">{hint.description}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
