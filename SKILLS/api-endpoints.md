# API Endpoints Reference

## Quick Navigation
- [Authentication](#authentication)
- [Images](#images)
- [Groups](#groups)
- [Utilities](#utilities)

---

## Authentication

### POST `/api/auth/callback/credentials`
**Purpose:** Login with username/password
```
Body: {
  username: string,
  password: string
}
Response: Session created, redirect to home
```
**Location:** NextAuth.js built-in endpoint

### GET `/api/auth/session`
**Purpose:** Get current user session
```
Response: {
  user: {
    name: string,
    email: string,
    uuid: string,
    role: "USER" | "ADMIN"
  }
}
```
**Location:** NextAuth.js built-in endpoint

### GET `/api/auth/providers`
**Purpose:** List available auth providers
**Location:** NextAuth.js built-in endpoint

### GET `/api/auth/csrf`
**Purpose:** Get CSRF token for forms
**Location:** NextAuth.js built-in endpoint

---

## Images

### POST `/api/upload`
**Purpose:** Upload one or more images
**File:** `src/app/api/upload/route.ts`
```
Body: FormData {
  file: File,
  isPublic: "true" | "false",
  groupIds: string[] (optional)
}

Response: {
  message: "Image uploaded successfully",
  image: {
    id: string,
    name: string,
    extension: string,
    isPublic: boolean
  }
}

Limits:
- Max 100MB per file
- Only image/* MIME types
```

### GET `/api/images`
**Purpose:** Get all user's images
**File:** `src/app/api/images/route.ts`
```
Response: {
  images: Image[]
}
```
**Auth Required:** Yes

### GET `/api/images/[id]`
**Purpose:** Get single image details
**File:** `src/app/api/images/[id]/route.ts`
```
Response: Image with tags and groups included
```

### PUT `/api/images/[id]`
**Purpose:** Update image properties
**File:** `src/app/api/images/[id]/route.ts`
```
Body: {
  name?: string,
  isPublic?: boolean,
  groupIds?: string[]
}

Response: {
  message: "Image updated successfully",
  image: { id, name, isPublic }
}
```
**Auth Required:** Yes (must own image)

### DELETE `/api/images/[id]`
**Purpose:** Delete image and file
**File:** `src/app/api/images/[id]/route.ts`
```
Response: { message: "Image deleted successfully" }

Side Effects:
- Removes from database
- Deletes file from public/uploads/
```
**Auth Required:** Yes (must own image)

---

## Groups

### GET `/api/groups`
**Purpose:** List user's groups
**File:** `src/app/api/groups/route.ts`
```
Response: {
  groups: [
    {
      id: string,
      name: string,
      imageCount: number
    }
  ]
}
```
**Auth Required:** Yes

### POST `/api/groups`
**Purpose:** Create new group
**File:** `src/app/api/groups/route.ts`
```
Body: { name: string }

Response: {
  message: "Group created successfully",
  group: { id, name }
}

Validation:
- name required, 1-255 chars
- name must be unique per user
```
**Auth Required:** Yes

### GET `/api/groups/[id]`
**Purpose:** Get group details
**File:** `src/app/api/groups/[id]/route.ts`
```
Response: Group with images included
```

### PUT `/api/groups/[id]/images`
**Purpose:** Update images in group
**File:** `src/app/api/groups/[id]/route.ts`
```
Body: { imageIds: string[] }

Response: {
  message: "Group images updated successfully"
}

Note:
- Use "set" operation (replaces all images)
- Pass empty array to clear group
```
**Auth Required:** Yes (must own group)

---

## Utilities

### File Storage
- **Location:** `public/uploads/[imageId].[extension]`
- **Access:** Direct HTTP access via `/uploads/[imageId].[extension]`
- **Cleanup:** Handled by DELETE `/api/images/[id]`

### Authentication Check
- **Server Components:** `const session = await auth()`
- **API Routes:** `const session = await auth()`
- **Client Components:** `const { data: session } = useSession()`

---

## Common Patterns

### Error Responses
```
400: { error: "Invalid input" }
401: { error: "Unauthorized" }
403: { error: "Not authorized" }
404: { error: "Not found" }
500: { error: "An error occurred" }
```

### Success Responses
Always return 200-201 with data:
```
{
  message?: string,
  data?: object
}
```

### File Upload Example
```javascript
const formData = new FormData();
formData.append("file", file);
formData.append("isPublic", "true");
formData.append("groupIds", groupId1);
formData.append("groupIds", groupId2);

await fetch("/api/upload", {
  method: "POST",
  body: formData
});
```

---

## Testing Checklist

- [ ] Auth required endpoints return 401 when not authenticated
- [ ] Ownership checks prevent users accessing others' data
- [ ] File size limits enforced (100MB max)
- [ ] MIME type validation (image/* only)
- [ ] Database transactions for multi-step operations
- [ ] File cleanup on delete
- [ ] Proper error messages returned
