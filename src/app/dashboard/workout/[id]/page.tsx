import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Dumbbell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getWorkoutById } from "@/data/workouts";

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

function formatDate(date: Date): string {
  return `${ordinal(date.getDate())} ${format(date, "MMM yyyy")}`;
}

export default async function WorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workoutId = parseInt(id, 10);
  if (isNaN(workoutId)) notFound();

  const workout = await getWorkoutById(workoutId);
  if (!workout) notFound();

  return (
    <div className="container mx-auto max-w-2xl py-10 px-4">
      <h1 className="text-3xl font-bold mb-1">Workout</h1>
      <p className="text-muted-foreground mb-8">{formatDate(workout.startedAt)}</p>

      {workout.exercises.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
          <Dumbbell className="h-10 w-10 opacity-30" />
          <p>No exercises logged yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {workout.exercises.map((exercise) => (
            <Card key={exercise.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{exercise.name}</CardTitle>
              </CardHeader>
              {exercise.sets.length > 0 && (
                <CardContent>
                  <div className="space-y-1">
                    {exercise.sets.map((set) => (
                      <div key={set.id} className="flex items-center gap-3 text-sm">
                        <Badge variant="outline" className="w-14 justify-center shrink-0">
                          Set {set.setNumber}
                        </Badge>
                        <span>
                          {set.reps != null ? `${set.reps} reps` : "— reps"}
                          {set.weight != null ? ` @ ${set.weight} kg` : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
