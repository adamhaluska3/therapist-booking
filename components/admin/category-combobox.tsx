"use client";
import { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PostCategory } from "@/db/schema";
import { AddCategoryDialog } from "./add-category";

export type CategoryComboboxProps = {
  category: PostCategory | null;
  onChange: (category: PostCategory | null) => void;
  categories: PostCategory[];
};

export const CategoryCombobox = ({
  category,
  onChange,
  categories,
}: CategoryComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = [
    null,
    ...categories.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()),
    ),
  ] as (PostCategory | null)[];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            role="combobox"
            className="font-normal bg-surface-100 p-2 py-4 w-full max-w-100"
          >
            <div className="flex w-full">
              <p className="flex-1 text-left">
                {category?.name ?? "Vyberte kategóriu"}
              </p>
              <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
            </div>
          </Button>
        }
      />
      <PopoverContent className="p-0 w-full">
        <Command>
          <CommandInput
            placeholder="Hľadať kategóriu..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>Žiadna kategória nenájdená.</CommandEmpty>
            <CommandGroup>
              {filtered.map((cat) => (
                <CommandItem
                  key={cat?.id || "-"}
                  onSelect={() => {
                    onChange(cat);
                    setOpen(false);
                  }}
                  className={cn(cat === null && "text-gray-500")}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      category?.id === cat?.id ||
                        (category === null && cat === null)
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  {cat?.name || "Bez kategórie"}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup>
              <CommandItem>
                <AddCategoryDialog
                  onCreate={(cat) => {
                    onChange(cat);
                    setOpen(false);
                  }}
                >
                  <div className="flex">
                    <Plus className="mr-2 h-4 w-4" />
                    <span>Nová kategória</span>
                  </div>
                </AddCategoryDialog>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
