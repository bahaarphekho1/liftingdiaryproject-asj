"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Dumbbell } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

function formatDate(date: Date): string {
  return `${ordinal(date.getDate())} ${format(date, "MMM yyyy")}`;
}

// Placeholder workout data — replace with real data fetching later
const MOCK_WORKOUTS = [
  {
    id: 1,
    name: "Upper Body Strength",
    duration: 55,
    exercises: ["Bench Press", "Pull-ups", "Shoulder Press"],
  },
  {
    id: 2,
    name: "Core & Cardio",
    duration: 30,
    exercises: ["Plank", "Crunches", "Jump Rope"],
  },
];

export default function DashboardPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [open, setOpen] = useState(false);

  // Placeholder: in a real implementation, filter workouts by selected date
  const workouts = MOCK_WORKOUTS;

  return (
    <div className="container mx-auto max-w-2xl py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="mb-8">
        <p className="text-sm text-muted-foreground mb-2">Viewing workouts for</p>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-base font-medium shadow-sm hover:bg-accent hover:text-accent-foreground">
            <CalendarIcon className="h-4 w-4" />
            {formatDate(date)}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => {
                if (d) {
                  setDate(d);
                  setOpen(false);
                }
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Workouts{" "}
          <span className="text-muted-foreground font-normal text-base">
            ({workouts.length})
          </span>
        </h2>

        {workouts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
            <Dumbbell className="h-10 w-10 opacity-30" />
            <p>No workouts logged for this date.</p>
          </div>
        ) : (
          workouts.map((workout) => (
            <Card key={workout.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{workout.name}</CardTitle>
                  <Badge variant="secondary">{workout.duration} min</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {workout.exercises.map((exercise) => (
                    <Badge key={exercise} variant="outline">
                      {exercise}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
