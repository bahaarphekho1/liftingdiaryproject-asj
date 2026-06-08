# Routing

## Rule: All Routes Live Under `/dashboard`

Every page in this app (other than the root `/` landing page) must be nested under `/dashboard`. There are no standalone top-level routes.

```
src/app/
  page.tsx                          # Public landing page only
  dashboard/
    page.tsx                        # /dashboard — main dashboard
    workout/
      [workoutId]/
        page.tsx                    # /dashboard/workout/:workoutId
    ...
```

## Rule: All `/dashboard` Routes Are Protected

Every route under `/dashboard` is a protected route — only authenticated users may access it. Unauthenticated users must be redirected to the sign-in page.

## Rule: Route Protection via Next.js Middleware Only

Route protection **must** be implemented in `src/middleware.ts` using Next.js middleware. Do not guard routes by checking auth state inside individual page components or layouts.

```ts
// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
```

**Never** protect routes by:
- Checking auth state in `page.tsx` or `layout.tsx`
- Wrapping pages in a client-side auth guard component
- Any mechanism other than middleware
