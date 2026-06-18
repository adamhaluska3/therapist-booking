"use client"

import { useTransition } from "react"
import { SearchText } from "@/components/shared/search-text"
import { cn } from "@/lib/utils"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

export type PostsFilterProp = {
    query?: string,
    isPublic?: string,
    category?: string,
}

type PublicityTab = {
    title: string,
    val: string
}
const publicityTabs: PublicityTab[] = [{title: "Všetko", val: ""}, {title: "Publikované", val: "true"}, {title: "Koncepty", val: "false"}]
export const PostsFilter = ({query, isPublic, category}: PostsFilterProp) => {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [, startTransition] = useTransition()

    const navigate = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value) params.set(key, value)
        else params.delete(key)
        startTransition(() => {
            router.replace(`${pathname}?${params.toString()}`)
        })
    }

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SearchText onChange={v => navigate("query", v)} oldSearch={query}/>
            <div className="flex gap-2 flex-wrap">
                {publicityTabs.map((tab) => (
                    <button
                        key={tab.title}
                        onClick={() => navigate("isPublic", tab.val)}
                        className={cn(
                            "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                            (isPublic === tab.val || (tab.val === "" && isPublic !== "true" && isPublic !== "false"))
                            ? "bg-brand-600 text-white"
                            : "bg-white border border-surface-200 text-neutral-600 hover:bg-surface-50"
                        )}
                    >
                        {tab.title}
                    </button>
                ))}
            </div>
        </div>
    )
}