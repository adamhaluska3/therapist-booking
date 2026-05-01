"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatTime } from "@/lib/date-utils";

type BookingItem = {
  id: string;
  start: string | number | Date;
  end: string | number | Date;
  status?: string;
  clientName?: string | null;
  notes?: string | null;
};

export default function ClientBookings({
  bookings = [],
}: {
  bookings?: BookingItem[];
}) {
  const [filter, setFilter] = React.useState<"upcoming" | "past">("upcoming");

  const now = Date.now();
  const parsed = bookings.map((b) => ({ ...b, start: new Date(b.start) }));

  const upcoming = parsed.filter((b) => (b.start as Date).getTime() >= now);
  const past = parsed.filter((b) => (b.start as Date).getTime() < now);

  const list = filter === "upcoming" ? upcoming : past;

  return (
    <Card>
      <CardHeader>
        <CardTitle>História sedení</CardTitle>
        <CardDescription />
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-2">
          <Button
            variant={filter === "upcoming" ? "default" : "outline"}
            onClick={() => setFilter("upcoming")}
          >
            Nadchádzajúce
          </Button>
          <Button
            variant={filter === "past" ? "default" : "outline"}
            onClick={() => setFilter("past")}
          >
            Minulé
          </Button>
        </div>

        <div className="flex flex-col gap-3">
          {list.length === 0 && (
            <div className="text-muted-foreground">Žiadne záznamy</div>
          )}
          {list.map((b) => (
            <div
              key={b.id}
              className="flex items-center justify-between rounded-lg bg-muted/40 p-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-100 font-medium text-sm">
                  {(b.start as Date).getDate()}
                </div>
                <div>
                  <div className="font-medium">
                    {b.clientName ?? "Individuálna terapia"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatTime(b.start as Date)} —{" "}
                    {formatTime(new Date(b.end))}
                  </div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {b.status === "confirmed" ? "ONLINE" : b.status}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
