'use client'
import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command, CommandEmpty, CommandGroup,
  CommandInput, CommandItem, CommandList,
} from '@/components/ui/command'
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover'
import { PostCategory } from '@/db/schema'

export type CategoryComboboxProps = {
  category?: PostCategory
  onChange: (category: PostCategory) => void
  categories: PostCategory[]
}

export const CategoryCombobox = ({ category, onChange, categories }: CategoryComboboxProps) => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger render={
          <Button variant="outline" role="combobox" className="font-normal bg-surface-100 p-2 py-4 w-full max-w-100">
            <div className='flex w-full'>
              <p className='flex-1 text-left'>{category?.name ?? 'Vyberte kategóriu'}</p>
              <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
            </div>
          </Button>
        }/>
        <PopoverContent className="p-0">
          <Command>
            <CommandInput
              placeholder="Hľadať kategóriu..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>Žiadna kategória nenájdená.</CommandEmpty>
              <CommandGroup>
                {filtered.map(cat => (
                  <CommandItem
                    key={cat.id}
                    onSelect={() => { onChange(cat); setOpen(false) }}
                  >
                    <Check className={cn('mr-2 h-4 w-4', category?.id === cat.id ? 'opacity-100' : 'opacity-0')} />
                    {cat.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
  )
}