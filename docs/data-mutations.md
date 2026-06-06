# Data Mutations

## Rule: All Database Mutations Go in `/data`

Every database write (insert, update, delete) must live in a helper function inside the `/data` directory. These functions use Drizzle ORM — **never write raw SQL**.

```
src/
  data/
    workouts.ts      # e.g. createWorkout, updateWorkout, deleteWorkout
    exercises.ts     # e.g. createExercise, deleteExercise
    ...
```

Example helper:

```ts
// src/data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function createWorkout(name: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const [workout] = await db
    .insert(workouts)
    .values({ name, userId })
    .returning();

  return workout;
}

export async function deleteWorkout(workoutId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db
    .delete(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}
```

The same ownership rules from data fetching apply here: every mutation helper must resolve `userId` from the auth session itself — never accept it as a parameter.

## Rule: All Mutations Are Triggered via Server Actions

**CRITICAL**: ALL data mutations must be initiated via Next.js Server Actions. This is a fundamental architectural requirement.

**Never** mutate data via:
- Route handlers (`/app/api/...`)
- Client-side `fetch` calls
- `useEffect`
- Any other mechanism not listed as allowed

## Rule: Server Actions Live in Colocated `actions.ts` Files

Each Server Action must be defined in an `actions.ts` file colocated with the route that uses it — not in a shared/global actions file.

```
src/app/
  dashboard/
    page.tsx
  workouts/
    page.tsx
    actions.ts       # Server Actions for the workouts route
    new/
      page.tsx
      actions.ts     # Server Actions for the new workout route
```

Every `actions.ts` file must begin with the `"use server"` directive.

## Rule: Typed Parameters — No `FormData`

Server Action parameters must be explicitly typed. Using `FormData` as a parameter type is **never** allowed.

```ts
// CORRECT — explicit typed parameters
export async function createWorkoutAction(name: string, date: Date) { ... }

// WRONG — FormData is forbidden
export async function createWorkoutAction(formData: FormData) { ... }
```

## Rule: All Server Actions Must Validate Arguments with Zod

Every Server Action must validate its arguments using a Zod schema before doing anything else. Validation failures must be handled — do not silently ignore them or pass unvalidated data to a `/data` helper.

```ts
// src/app/workouts/new/actions.ts
"use server";

import { z } from "zod";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().min(1).max(100),
  date: z.coerce.date(),
});

export async function createWorkoutAction(name: string, date: Date) {
  const parsed = createWorkoutSchema.safeParse({ name, date });
  if (!parsed.success) throw new Error("Invalid input");

  return createWorkout(parsed.data.name, parsed.data.date);
}
```

## Complete Example

```ts
// src/data/exercises.ts
import { db } from "@/db";
import { exercises } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function createExercise(workoutId: string, name: string, sets: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const [exercise] = await db
    .insert(exercises)
    .values({ workoutId, name, sets, userId })
    .returning();

  return exercise;
}
```

```ts
// src/app/workouts/[id]/actions.ts
"use server";

import { z } from "zod";
import { createExercise } from "@/data/exercises";

const createExerciseSchema = z.object({
  workoutId: z.string().uuid(),
  name: z.string().min(1).max(100),
  sets: z.number().int().min(1).max(100),
});

export async function createExerciseAction(
  workoutId: string,
  name: string,
  sets: number
) {
  const parsed = createExerciseSchema.safeParse({ workoutId, name, sets });
  if (!parsed.success) throw new Error("Invalid input");

  return createExercise(parsed.data.workoutId, parsed.data.name, parsed.data.sets);
}
```

```tsx
// src/app/workouts/[id]/page.tsx  (Client Component calling the action)
"use client";

import { createExerciseAction } from "./actions";

export function AddExerciseForm({ workoutId }: { workoutId: string }) {
  async function handleSubmit(name: string, sets: number) {
    await createExerciseAction(workoutId, name, sets);
  }
  // ...
}
```

## Rule: No `redirect()` Inside Server Actions

**Never call `redirect()` from `next/navigation` inside a Server Action.** Redirects must be handled client-side after the Server Action resolves.

```ts
// WRONG — redirect inside a server action
export async function createWorkoutAction(name: string) {
  const workout = await createWorkout(name);
  redirect(`/dashboard/workout/${workout.id}`); // forbidden
}

// CORRECT — return data the client needs to redirect
export async function createWorkoutAction(name: string) {
  return createWorkout(name);
}
```

```tsx
// CORRECT — redirect on the client after the action resolves
"use client";
import { useRouter } from "next/navigation";

export function MyForm() {
  const router = useRouter();

  async function handleSubmit() {
    const workout = await createWorkoutAction(name);
    router.push(`/dashboard/workout/${workout.id}`);
  }
}
```

## Summary of Rules

| Rule | Requirement |
|------|-------------|
| DB writes | Must go in a `/data` helper using Drizzle ORM |
| Triggering mutations | Must use Server Actions only |
| Action file location | Colocated `actions.ts` next to the route that uses it |
| Parameter types | Explicitly typed — `FormData` is forbidden |
| Input validation | Every action must validate all args with Zod before proceeding |
| Auth / ownership | `/data` helpers resolve `userId` from session — never accept it as a param |
