"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  startedAt: z.coerce.date(),
});

export async function createWorkoutAction(startedAt: Date) {
  const parsed = createWorkoutSchema.safeParse({ startedAt });
  if (!parsed.success) throw new Error("Invalid input");

  const workout = await createWorkout(parsed.data.startedAt);
  redirect(`/dashboard/workout/${workout.id}`);
}
