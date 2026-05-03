"use client";

import { useState } from "react";
import { toast } from "sonner";
import { saveBookingTypePrices } from "@/server/actions/booking-type-prices";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { BookingType } from "@/db/schema";

type Props = {
  bookingTypes: BookingType[];
};

export function BookingTypePricesForm({ bookingTypes }: Props) {
  const [prices, setPrices] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      bookingTypes.map((bt) => [
        bt.id,
        bt.price !== null && bt.price !== undefined
          ? (bt.price / 100).toFixed(2)
          : "",
      ]),
    ),
  );
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await saveBookingTypePrices(
        bookingTypes.map((bt) => {
          const raw = prices[bt.id]?.trim();
          const euros = raw ? parseFloat(raw) : null;
          const cents =
            euros !== null && !isNaN(euros) ? Math.round(euros * 100) : null;
          return { id: bt.id, price: cents };
        }),
      );
      toast.success("Ceny uložené");
    } catch {
      toast.error("Nepodarilo sa uložiť ceny");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-surface-200 bg-white p-6 flex flex-col gap-5">
      <div>
        <p className="text-sm font-semibold text-neutral-800">
          Ceny za typy sedení
        </p>
        <p className="text-xs text-neutral-500 mt-0.5">
          Cena sa použije pri generovaní QR platby pre klienta.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {bookingTypes.map((bt) => (
          <div key={bt.id} className="flex items-center gap-3">
            <label className="w-36 shrink-0 text-sm text-neutral-700">
              {bt.name}
            </label>
            <div className="relative flex-1">
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={prices[bt.id] ?? ""}
                onChange={(e) =>
                  setPrices((prev) => ({ ...prev, [bt.id]: e.target.value }))
                }
                className="pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400">
                EUR
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-brand-600 hover:bg-brand-700 text-white"
        >
          {saving ? "Ukladám…" : "Uložiť ceny"}
        </Button>
      </div>
    </div>
  );
}
