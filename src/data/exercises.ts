import { db } from "@/db";
import { exerciseDefinitions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function getExerciseDefinitions() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return db
    .select()
    .from(exerciseDefinitions)
    .where(eq(exerciseDefinitions.userId, userId))
    .orderBy(exerciseDefinitions.name);
}
