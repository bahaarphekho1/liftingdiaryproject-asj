# Authentication

## Rule: Clerk Only

**This app uses [Clerk](https://clerk.com/) for all authentication. No other auth library, custom session handling, or JWT management is permitted.**

- Do NOT use NextAuth, Auth.js, Lucia, or any other auth library.
- Do NOT implement custom session logic, cookie management, or token handling.
- Do NOT store passwords or credentials in the database.

---

## Middleware

Protect routes via Clerk's middleware in `src/middleware.ts`. Define which routes are public and which require authentication there — do not implement auth guards inside individual page components.

```ts
// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)", "/(api|trpc)(.*)"],
};
```

---

## Getting the Current User

### In Server Components and data helpers

Always use `auth()` from `@clerk/nextjs/server`. Never pass `userId` as a prop or parameter — resolve it from the session inside the function.

```ts
import { auth } from "@clerk/nextjs/server";

const { userId } = await auth();
if (!userId) throw new Error("Unauthorized");
```

### In Client Components

Use the `useAuth` or `useUser` hooks from `@clerk/nextjs`.

```tsx
"use client";
import { useUser } from "@clerk/nextjs";

export function ProfileBadge() {
  const { user } = useUser();
  return <span>{user?.firstName}</span>;
}
```

---

## Sign-In and Sign-Up UI

Use Clerk's pre-built components. Do NOT build custom auth forms.

```tsx
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return <SignIn />;
}
```

Place sign-in at `src/app/sign-in/[[...sign-in]]/page.tsx` and sign-up at `src/app/sign-up/[[...sign-up]]/page.tsx`.

---

## UserButton

Use Clerk's `<UserButton />` component for the account menu/avatar. Do not build a custom one.

```tsx
import { UserButton } from "@clerk/nextjs";

<UserButton />
```

---

## Rules Summary

| Concern | Required approach |
|---|---|
| Auth provider | Clerk only |
| Route protection | Clerk middleware (`clerkMiddleware`) |
| Server-side user identity | `auth()` from `@clerk/nextjs/server` |
| Client-side user identity | `useAuth` / `useUser` from `@clerk/nextjs` |
| Sign-in / sign-up UI | Clerk's `<SignIn />` / `<SignUp />` components |
| Account menu | Clerk's `<UserButton />` |
| Passing userId as a parameter | Never — always resolve from session |
