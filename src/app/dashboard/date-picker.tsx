"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

function formatDate(date: Date): string {
  return `${ordinal(date.getDate())} ${format(date, "MMM yyyy")}`;
}

export function DatePicker({ selected }: { selected: Date }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function handleSelect(d: Date | undefined) {
    if (!d) return;
    setOpen(false);
    const iso = format(d, "yyyy-MM-dd");
    router.push(`/dashboard?date=${iso}`);
  }

  return (
    <div className="mb-8">
      <p className="text-sm text-muted-foreground mb-2">Viewing workouts for</p>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-base font-medium shadow-sm hover:bg-accent hover:text-accent-foreground">
          <CalendarIcon className="h-4 w-4" />
          {formatDate(selected)}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={selected} onSelect={handleSelect} />
        </PopoverContent>
      </Popover>
    </div>
  );
}
