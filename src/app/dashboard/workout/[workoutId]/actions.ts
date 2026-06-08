"use server";

import { z } from "zod";
import { updateWorkout } from "@/data/workouts";

const updateWorkoutSchema = z.object({
  workoutId: z.number().int().positive(),
  startedAt: z.coerce.date(),
});

export async function updateWorkoutAction(workoutId: number, startedAt: Date) {
  const parsed = updateWorkoutSchema.safeParse({ workoutId, startedAt });
  if (!parsed.success) throw new Error("Invalid input");

  return updateWorkout(parsed.data.workoutId, parsed.data.startedAt);
}
