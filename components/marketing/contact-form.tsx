"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ContactForm() {
  return (
    <form className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Meno/Prezývka
          </Label>
          <Input
            placeholder="Katka"
            className="border-0 bg-surface-100 focus-visible:ring-brand-300"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Email
          </Label>
          <Input
            type="email"
            placeholder="katka@email.com"
            className="border-0 bg-surface-100 focus-visible:ring-brand-300"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Typ služby
        </Label>
        <Select>
          <SelectTrigger className="w-full border-0 bg-surface-100">
            <SelectValue placeholder="Vyberte službu" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="psychotherapy">Psychoterapia</SelectItem>
            <SelectItem value="supervision">Supervízia</SelectItem>
            <SelectItem value="seminars">Semináre</SelectItem>
            <SelectItem value="coaching">Koučing</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Správa
        </Label>
        <Textarea
          placeholder="Ako vám môžem pomôcť?"
          className="min-h-32 resize-none border-0 bg-surface-100 focus-visible:ring-brand-300"
        />
      </div>

      <Button className="w-full rounded-lg bg-brand-700 py-3 text-white hover:bg-brand-800">
        Odoslať správu
      </Button>
    </form>
  );
}
