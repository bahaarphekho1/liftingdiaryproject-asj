# UI Coding Standards

## Component Library

**All UI must be built exclusively with [shadcn/ui](https://ui.shadcn.com/) components.**

- Do NOT create custom UI components under any circumstances.
- Do NOT use any other component library (MUI, Chakra, Radix directly, etc.).
- If a shadcn/ui component does not exist for a use case, compose from existing shadcn/ui primitives only.
- Install new shadcn/ui components via the CLI: `npx shadcn@latest add <component>`

## Date Formatting

All dates must be formatted using [date-fns](https://date-fns.org/).

### Required format

Dates are displayed as `{ordinal day} {short month} {full year}`:

```
1st Sep 2025
2nd Aug 2025
3rd Jan 2026
4th Jun 2024
```

### Implementation

Use `format` from `date-fns` with a custom ordinal day helper:

```ts
import { format } from "date-fns";

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

function formatDate(date: Date): string {
  return `${ordinal(date.getDate())} ${format(date, "MMM yyyy")}`;
}
```

Never use `toLocaleDateString`, `Intl.DateTimeFormat`, or any other date formatting approach.
