"use client";

import { useDebouncedCallback } from "use-debounce"

export type SearchTextProp = {
    onChange: (value: string) => void
    delay?: number
    oldSearch?: string
}

export const SearchText = ({onChange, delay = 400, oldSearch} : SearchTextProp) => {

    const handleChange = useDebouncedCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
        delay
    )

    return (
        <input type="text" className="bg-surface-100 p-5 w-full max-w-100 rounded-2xl" placeholder="Hľadaný výraz" onChange={handleChange} defaultValue={oldSearch || ""}/>
    )
}