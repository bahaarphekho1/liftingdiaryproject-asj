import { Dumbbell } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getWorkoutsForDate } from "@/data/workouts";
import { DatePicker } from "./date-picker";
import { format, parseISO, startOfDay } from "date-fns";

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

function formatDate(date: Date): string {
  return `${ordinal(date.getDate())} ${format(date, "MMM yyyy")}`;
}

function durationMinutes(startedAt: Date, completedAt: Date | null): number | null {
  if (!completedAt) return null;
  return Math.round((completedAt.getTime() - startedAt.getTime()) / 60000);
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: dateParam } = await searchParams;
  const date = dateParam ? startOfDay(parseISO(dateParam)) : startOfDay(new Date());

  const workouts = await getWorkoutsForDate(date);

  return (
    <div className="container mx-auto max-w-2xl py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <DatePicker selected={date} />

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
            <Link
              href={`/dashboard/workout/new?date=${format(date, "yyyy-MM-dd")}`}
              className={buttonVariants()}
            >
              Log New Workout
            </Link>
          </div>
        ) : (
          workouts.map((workout) => {
            const duration = durationMinutes(workout.startedAt, workout.completedAt);
            return (
              <Card key={workout.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {formatDate(workout.startedAt)}
                    </CardTitle>
                    {duration !== null && (
                      <Badge variant="secondary">{duration} min</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {workout.exercises.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {workout.exercises.map((exercise) => (
                        <Badge key={exercise} variant="outline">
                          {exercise}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No exercises logged.</p>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
