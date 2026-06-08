import { db } from "@/db";
import { workouts, workoutExercises, exerciseDefinitions, sets } from "@/db/schema";
import { eq, and, gte, lt } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function createWorkout(startedAt: Date) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const [workout] = await db
    .insert(workouts)
    .values({ userId, startedAt })
    .returning();

  return workout;
}

export async function getWorkoutById(workoutId: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const rows = await db
    .select({
      workoutId: workouts.id,
      startedAt: workouts.startedAt,
      completedAt: workouts.completedAt,
      exerciseId: workoutExercises.id,
      exerciseOrder: workoutExercises.order,
      exerciseName: exerciseDefinitions.name,
      setId: sets.id,
      setNumber: sets.setNumber,
      reps: sets.reps,
      weight: sets.weight,
    })
    .from(workouts)
    .leftJoin(workoutExercises, eq(workoutExercises.workoutId, workouts.id))
    .leftJoin(exerciseDefinitions, eq(exerciseDefinitions.id, workoutExercises.exerciseDefinitionId))
    .leftJoin(sets, eq(sets.workoutExerciseId, workoutExercises.id))
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .orderBy(workoutExercises.order, sets.setNumber);

  if (rows.length === 0) return null;

  type Exercise = {
    id: number;
    order: number;
    name: string;
    sets: { id: number; setNumber: number; reps: number | null; weight: string | null }[];
  };

  const exerciseMap = new Map<number, Exercise>();

  for (const row of rows) {
    if (row.exerciseId == null) continue;
    if (!exerciseMap.has(row.exerciseId)) {
      exerciseMap.set(row.exerciseId, {
        id: row.exerciseId,
        order: row.exerciseOrder!,
        name: row.exerciseName!,
        sets: [],
      });
    }
    if (row.setId != null) {
      exerciseMap.get(row.exerciseId)!.sets.push({
        id: row.setId,
        setNumber: row.setNumber!,
        reps: row.reps,
        weight: row.weight,
      });
    }
  }

  return {
    id: rows[0].workoutId,
    startedAt: rows[0].startedAt,
    completedAt: rows[0].completedAt,
    exercises: Array.from(exerciseMap.values()),
  };
}

export async function updateWorkout(workoutId: number, startedAt: Date) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const [workout] = await db
    .update(workouts)
    .set({ startedAt })
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .returning();

  return workout ?? null;
}

export async function getWorkoutsForDate(date: Date) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const rows = await db
    .select({
      workoutId: workouts.id,
      startedAt: workouts.startedAt,
      completedAt: workouts.completedAt,
      exerciseName: exerciseDefinitions.name,
    })
    .from(workouts)
    .leftJoin(workoutExercises, eq(workoutExercises.workoutId, workouts.id))
    .leftJoin(
      exerciseDefinitions,
      eq(exerciseDefinitions.id, workoutExercises.exerciseDefinitionId)
    )
    .where(
      and(
        eq(workouts.userId, userId),
        gte(workouts.startedAt, start),
        lt(workouts.startedAt, end)
      )
    )
    .orderBy(workouts.startedAt, workoutExercises.order);

  // Group rows by workout
  const map = new Map<
    number,
    { id: number; startedAt: Date; completedAt: Date | null; exercises: string[] }
  >();

  for (const row of rows) {
    if (!map.has(row.workoutId)) {
      map.set(row.workoutId, {
        id: row.workoutId,
        startedAt: row.startedAt,
        completedAt: row.completedAt,
        exercises: [],
      });
    }
    if (row.exerciseName) {
      map.get(row.workoutId)!.exercises.push(row.exerciseName);
    }
  }

  return Array.from(map.values());
}
