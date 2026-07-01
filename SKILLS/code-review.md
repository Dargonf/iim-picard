# Code Review Checklist & Standards

## React Component Patterns

### ✅ Proper Component Structure
```tsx
"use client";  // If using browser APIs or useState

import { ComponentType } from "react";
import { useRouter } from "next/navigation";

interface Props {
  prop1: string;
  prop2: number;
}

export function ComponentName({ prop1, prop2 }: Props) {
  const router = useRouter();
  const [state, setState] = useState("");

  return <div>{prop1}</div>;
}
```

### ✅ Server vs Client Components
- **Server Components:** Data fetching, auth checks, database queries
- **Client Components:** Event handlers, useState, useEffect, useRouter, useSession
- **Pattern:** Extract client parts into separate files (e.g., `delete-button.tsx`)

### ✅ Event Handler Safety
```tsx
// ❌ WRONG - Event handler in Server Component
async function MyPage() {
  function handleClick() { /* ... */ }
  return <button onClick={handleClick}>Click</button>;
}

// ✅ CORRECT - Extract to Client Component
"use client";
function DeleteButton() {
  function handleClick() { /* ... */ }
  return <button onClick={handleClick}>Delete</button>;
}
```

---

## API Route Patterns

### ✅ Proper Error Handling
```typescript
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();

    // Auth check
    if (!session?.user?.uuid) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ownership check
    const item = await prisma.item.findUnique({ where: { id } });
    if (item.ownerId !== session.user.uuid) {
      return Response.json({ error: "Not authorized" }, { status: 403 });
    }

    // Process request
    const body = await request.json();
    const result = await prisma.item.update({ /* ... */ });

    return Response.json({ message: "Success", data: result }, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error("Error:", error);
    return Response.json({ error: "An error occurred" }, { status: 500 });
  }
}
```

### ✅ Input Validation with Zod
```typescript
const schema = z.object({
  name: z.string().min(1).max(255),
  isPublic: z.boolean().optional(),
});

const { name, isPublic } = schema.parse(body);
```

### ✅ File Operations
```typescript
import { unlink } from "fs/promises";
import { join } from "path";

// Delete file
const filePath = join(process.cwd(), "public", "uploads", filename);
try {
  await unlink(filePath);
} catch (err) {
  console.error("File deletion error:", err);
  // Continue - DB record already deleted
}
```

---

## Form Component Patterns

### ✅ Form State Management
```tsx
export function MyForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ /* ... */ });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch("/api/endpoint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed");
        return;
      }

      setSuccess("Operation completed");
      router.refresh();
    } catch (err) {
      setError("An error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      {/* form fields */}
      <button disabled={loading}>{loading ? "Saving..." : "Save"}</button>
    </form>
  );
}
```

### ✅ Toggle UI Pattern
```tsx
const [isEditing, setIsEditing] = useState(false);

return (
  <div>
    <button onClick={() => setIsEditing(!isEditing)}>
      {isEditing ? "Done" : "Edit"}
    </button>
    {isEditing && <EditInterface />}
    {!isEditing && <ViewInterface />}
  </div>
);
```

---

## Tailwind CSS Patterns

### ✅ Dark Mode Support
```tsx
className="bg-white dark:bg-zinc-950 text-black dark:text-white"
className="border-zinc-300 dark:border-zinc-600"
className="hover:bg-zinc-100 dark:hover:bg-zinc-900"
```

### ✅ Responsive Design
```tsx
className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
className="text-sm md:text-base lg:text-lg"
```

### ✅ Disabled States
```tsx
disabled={loading}
className="disabled:opacity-50"
```

---

## Code Quality Checklist

### Security
- [ ] Auth checks on all protected endpoints
- [ ] Ownership verification before modifying data
- [ ] Input validation with Zod
- [ ] No passwords/secrets in logs or responses
- [ ] SQL injection prevention (use Prisma, not raw queries)
- [ ] XSS prevention (React auto-escapes by default)

### Performance
- [ ] No N+1 queries (use `include` in Prisma)
- [ ] File cleanup on delete operations
- [ ] Proper error handling (don't expose stack traces)
- [ ] Optional chaining for null-safe access (`?.`)

### Code Organization
- [ ] Related files in same directory
- [ ] Consistent naming conventions
- [ ] No duplicate code
- [ ] Clear component/function responsibilities
- [ ] Proper TypeScript types

### User Experience
- [ ] Loading states on async operations
- [ ] Clear error messages
- [ ] Success confirmations
- [ ] Disabled buttons during loading
- [ ] Proper form validation
- [ ] Accessible HTML (labels, aria attributes)

### API Design
- [ ] Consistent response format
- [ ] Proper HTTP status codes
- [ ] Clear error messages in responses
- [ ] Documented request/response formats
- [ ] Consistent endpoint naming

---

## Common Issues to Avoid

### ❌ Event Handler in Server Component
```tsx
// WRONG
async function Page() {
  function handleClick() { }
  return <button onClick={handleClick} />;
}
```

### ❌ Missing Error Handling
```tsx
// WRONG
const response = await fetch("/api/...");
const data = response.json(); // What if it fails?
```

### ❌ Setting Loading State After Return
```tsx
// WRONG
if (!response.ok) {
  return; // Loading state never set to false!
}
setLoading(false);
```

### ❌ Not Cleaning Up Files on Delete
```tsx
// WRONG
await prisma.image.delete({ where: { id } });
// File still in public/uploads/ directory
```

### ❌ Missing Ownership Checks
```tsx
// WRONG
const item = await prisma.item.findUnique({ where: { id } });
// Any logged-in user can delete any item!
```

---

## Review Process

When reviewing code:

1. **Security First**
   - Auth checks present?
   - Ownership verified?
   - Input validated?

2. **Error Handling**
   - Try/catch blocks?
   - Proper error responses?
   - Loading states handled?

3. **Type Safety**
   - Proper TypeScript types?
   - No `any` types?

4. **Component Structure**
   - Server vs Client components correct?
   - Responsibilities clear?
   - Reusable components extracted?

5. **Performance**
   - Unnecessary renders?
   - N+1 queries?
   - File cleanup?

6. **UX**
   - Loading indicators?
   - Error messages clear?
   - Success feedback?
