"use client";

import { Search } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

export type SearchTextProp = {
  onChange: (value: string) => void;
  delay?: number;
  oldSearch?: string;
};

export const SearchText = ({
  onChange,
  delay = 400,
  oldSearch,
}: SearchTextProp) => {
  const handleChange = useDebouncedCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
    delay,
  );

  return (
    <div className="relative max-w-lg">
      <Search
        size={14}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
      />
      <input
        type="text"
        className="w-full rounded-full border border-surface-200 bg-white pl-8 pr-4 py-2 text-sm text-neutral-700 placeholder:text-neutral-400 outline-none focus:border-brand-400 transition-colors"
        placeholder="Hľadaný výraz"
        onChange={handleChange}
        defaultValue={oldSearch || ""}
      />
    </div>
  );
};
