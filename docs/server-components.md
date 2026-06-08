# Server Components

## Rule: `params` and `searchParams` Must Be Awaited

In Next.js 15+, `params` and `searchParams` are **Promises**. You must `await` them before accessing any property.

```tsx
// CORRECT
export default async function WorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { workoutId } = await params;
  // ...
}

// WRONG — accessing params synchronously
export default async function WorkoutPage({
  params,
}: {
  params: { workoutId: string };
}) {
  const { workoutId } = params; // broken in Next.js 15
}
```

The same applies to `searchParams`:

```tsx
// CORRECT
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  // ...
}
```

## Rule: Page Components Must Be `async`

All page components that fetch data or access `params`/`searchParams` must be declared `async`. There is no synchronous equivalent.

## Rule: No Data Fetching in Client Components

Server Components are the only place data fetching is allowed. See `/docs/data-fetching.md` for the full rules.

## Rule: Do Not Pass `userId` Down from Pages

Never extract `userId` in a page and pass it as a prop into child components or data helpers. Auth is always resolved inside `/data` helpers directly. See `/docs/data-fetching.md`.
