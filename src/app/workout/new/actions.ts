"use server";

import { db } from "@/db";
import { workouts, workoutExercises, sets } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export type SetInput = {
  reps: number;
  weight: string;
};

export type ExerciseInput = {
  exerciseDefinitionId: number;
  sets: SetInput[];
};

export async function createWorkout(
  startedAt: Date,
  exercises: ExerciseInput[]
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const [workout] = await db
    .insert(workouts)
    .values({ userId, startedAt, completedAt: new Date() })
    .returning({ id: workouts.id });

  for (let i = 0; i < exercises.length; i++) {
    const ex = exercises[i];
    const [we] = await db
      .insert(workoutExercises)
      .values({
        workoutId: workout.id,
        exerciseDefinitionId: ex.exerciseDefinitionId,
        order: i + 1,
      })
      .returning({ id: workoutExercises.id });

    for (let j = 0; j < ex.sets.length; j++) {
      const s = ex.sets[j];
      await db.insert(sets).values({
        workoutExerciseId: we.id,
        setNumber: j + 1,
        reps: s.reps || null,
        weight: s.weight || null,
      });
    }
  }

  redirect("/dashboard");
}
