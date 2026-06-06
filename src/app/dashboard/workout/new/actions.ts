"use server";

import { z } from "zod";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  startedAt: z.coerce.date(),
});

export async function createWorkoutAction(startedAt: Date) {
  const parsed = createWorkoutSchema.safeParse({ startedAt });
  if (!parsed.success) throw new Error("Invalid input");

  return createWorkout(parsed.data.startedAt);
}
