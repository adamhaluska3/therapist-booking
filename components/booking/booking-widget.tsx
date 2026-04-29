"use client";

import { useState, useCallback } from "react";
import { BookingCalendar } from "./booking-calendar";
import { TimeSlotPanel } from "./time-slot-panel";

export function BookingWidget() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const handleSelectDate = useCallback((d: Date) => {
    setSelectedDate(d);
    setSelectedTime(null);
  }, []);

  const handleConfirm = useCallback(() => {
    if (!selectedDate || !selectedTime) return;
    alert(
      `Rezervácia: ${selectedDate.toLocaleDateString("sk-SK")} o ${selectedTime}`,
    );
  }, [selectedDate, selectedTime]);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
      <BookingCalendar
        today={today}
        selected={selectedDate}
        onSelect={handleSelectDate}
      />
      <TimeSlotPanel
        selected={selectedDate}
        selectedTime={selectedTime}
        onSelectTime={setSelectedTime}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
