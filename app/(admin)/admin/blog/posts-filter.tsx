"use client"

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

    const handleSearch = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value) params.set(key, value)
        else params.delete(key)
        router.push(`${pathname}?${params.toString()}`)
    }

    return (
        <div className="flex wrap">
            <div className="flex-1">
                <SearchText onChange={v => handleSearch("query", v)} oldSearch={query}/>
            </div>
            <div>
                <div className="inline-flex items-center gap-1 rounded-full bg-muted p-1">
                    {publicityTabs.map((tab) => (
                        <button
                        key={tab.title}
                        onClick={() => handleSearch("isPublic", tab.val)}
                        className={cn(
                            "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                            (isPublic === tab.val || (tab.val === "" && isPublic !== "true" && isPublic !== "false"))
                            ? "bg-[#2d4a2d] text-white shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                        >
                        {tab.title}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}