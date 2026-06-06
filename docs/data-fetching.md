# Data Fetching

## Rule: Server Components Only

**CRITICAL**: ALL data fetching in this app MUST be done via Server Components. This is a fundamental architectural requirement.

## Allowed Data Fetching Methods
- **Server Components** - The ONLY approved method for data fetching

**Never** fetch data via:
- Route handlers (`/app/api/...`)
- Client components (`"use client"`)
- `useEffect` + `fetch`
- useEffect, SWR, React Query, or any client-side fetching library
- Any other method not explicitly listed as allowed

If a component needs data, it must be a Server Component (no `"use client"` directive) that calls a helper function from the `/data` directory directly.

## Rule: All Database Queries Go in `/data`

Every database query must live in a helper function inside the `/data` directory. These functions use Drizzle ORM — **never write raw SQL**.

## Drizzle ORM Required
- **MUST** user Drizzle ORM for all database queries
- **NEVER** user raw SQL queries
- Follow Drizzle's type-safe query patterns

```
src/
  data/
    workouts.ts      # e.g. getUserWorkouts, getWorkoutById
    exercises.ts     # e.g. getUserExercises
    ...
```

Example helper:

```ts
// src/data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function getUserWorkouts() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return db.select().from(workouts).where(eq(workouts.userId, userId));
}
```

Example Server Component consuming the helper:

```tsx
// src/app/dashboard/page.tsx
import { getUserWorkouts } from "@/data/workouts";

export default async function DashboardPage() {
  const workouts = await getUserWorkouts();
  return <div>{/* render workouts */}</div>;
}
```

## Rule: Users Can Only Access Their Own Data

Every `/data` helper that queries user-owned records **must**:

1. Call `auth()` from `@clerk/nextjs/server` to get the authenticated `userId`.
2. Throw (or return null/empty) immediately if `userId` is not present.
3. Filter every query with `.where(eq(table.userId, userId))` — never return all rows and filter in JS.

This must be enforced inside the helper itself, not in the calling component. A component should never pass a `userId` parameter into a data helper — the helper always resolves it from the session directly.

```ts
// CORRECT — userId comes from session inside the helper
export async function getWorkoutById(workoutId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const [workout] = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));

  return workout ?? null;
}

// WRONG — never accept userId as a parameter
export async function getWorkoutById(userId: string, workoutId: string) { ... }
```

Passing `userId` as a parameter creates a path for callers to request another user's data — always read it from the auth session inside the helper.

## Why This Approach?

1. **Security**: Server-side data fetching with proper authorization
2. **Performance**: No client-side data fetching waterfalls
3. **SEO**: Fully server-rendered content
4. **Type Safety**: Drizzle ORM provides full TypeScript support
5. **Consistency**: Single pattern for all data access
