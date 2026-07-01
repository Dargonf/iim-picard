# Database Schema Migration Guide

## Quick Commands

```bash
# Create a new migration
npx prisma migrate dev --name add_feature_name

# Apply migrations to database
npx prisma migrate deploy

# Reset database (⚠️ loses all data)
npx prisma migrate reset

# View migration history
npx prisma migrate status

# Generate Prisma client
npx prisma generate

# Open Prisma Studio (GUI for database)
npx prisma studio
```

---

## Schema Modification Workflow

### Step 1: Update `prisma/schema.prisma`

#### Add a New Field
```prisma
model Image {
  id        String   @id @default(uuid())
  name      String
  // ADD THIS:
  description String? // Optional string field
  createdAt DateTime @default(now())
}
```

#### Add a New Model
```prisma
model Album {
  id        String   @id @default(uuid())
  name      String
  owner     User     @relation(fields: [ownerId], references: [uuid])
  ownerId   String
  images    Image[]
  createdAt DateTime @default(now())
}
```

#### Add a Relation
```prisma
model Image {
  // ... existing fields
  album     Album?   @relation(fields: [albumId], references: [id])
  albumId   String?
}

model Album {
  // ... existing fields
  images    Image[]
}
```

#### Change Field Type
```prisma
// Before
model Image {
  size Int
}

// After
model Image {
  size Float // Changed from Int
}
```

#### Make Field Optional
```prisma
// Before
model Image {
  description String
}

// After
model Image {
  description String?
}
```

#### Make Field Required
```prisma
// Before
model Image {
  description String?
}

// After (with default)
model Image {
  description String @default("")
}
```

### Step 2: Create Migration

```bash
npx prisma migrate dev --name descriptive_name
```

Examples:
```bash
npx prisma migrate dev --name add_image_description
npx prisma migrate dev --name add_album_model
npx prisma migrate dev --name add_image_to_album_relation
npx prisma migrate dev --name make_image_description_optional
```

This will:
1. Create a migration file in `prisma/migrations/`
2. Ask if you want to create a new migration
3. Apply the migration to your local database
4. Regenerate Prisma client

### Step 3: Update Application Code

#### Update API Endpoints
```typescript
// If adding a field to response
const image = await prisma.image.findUnique({
  where: { id },
  include: {
    description: true, // Include new field
  },
});
```

#### Update Form Components
```tsx
// Add new field to form
<input
  type="text"
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  placeholder="Image description"
/>
```

#### Update Type Definitions
Prisma auto-generates types in `@prisma/client`, so no manual updates needed!

### Step 4: Test Changes
```bash
npm run dev
# Test your changes in the browser
```

### Step 5: Commit to Git
```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "Add image description field"
```

---

## Common Migration Patterns

### Add Optional Field to Existing Model
```bash
# 1. Update schema
model Image {
  // ... existing
  subtitle String? // new optional field
}

# 2. Migrate
npx prisma migrate dev --name add_image_subtitle

# 3. Use in code
const image = await prisma.image.findUnique({
  where: { id },
  select: { subtitle: true },
});
```

### Add Required Field to Existing Model (with data)
```bash
# 1. Add as optional first
model User {
  status String? @default("active")
}

# 2. Migrate
npx prisma migrate dev --name add_user_status

# 3. Update existing records (in migration or manually)
npx prisma db execute

# 4. Make required if desired
model User {
  status String @default("active") // Remove ?
}

# 5. Migrate again
npx prisma migrate dev --name make_user_status_required
```

### Create New Model with Relations
```bash
# 1. Add models
model Category {
  id    String @id @default(uuid())
  name  String @unique
  images Image[]
}

model Image {
  // ... existing
  category      Category? @relation(fields: [categoryId], references: [id])
  categoryId    String?
}

# 2. Migrate
npx prisma migrate dev --name add_category_model

# 3. Update API to include category
const image = await prisma.image.findUnique({
  where: { id },
  include: { category: true },
});
```

### Rename Field
```bash
# 1. Create two migrations
# First, add new field
model Image {
  name String
  title String? // New field
}

npx prisma migrate dev --name add_image_title

# 2. Update data and app code to use title
# 3. Remove old field
model Image {
  title String // name field removed
}

npx prisma migrate dev --name remove_image_name
```

### Delete Field
```bash
# 1. Update schema
model Image {
  // Remove the field
}

# 2. Migrate
npx prisma migrate dev --name remove_deprecated_field
```

### Delete Model
```bash
# 1. Remove model and relations
// Remove: model OldModel { ... }
// Update other models to remove relations to OldModel

# 2. Migrate
npx prisma migrate dev --name remove_old_model
```

---

## Migration Safety Checklist

- [ ] Backup database before major changes
- [ ] Test migration locally first
- [ ] Check migration file for correctness
- [ ] Update API endpoints if needed
- [ ] Update component code if needed
- [ ] Update TypeScript types (auto-generated)
- [ ] Test all affected features
- [ ] Commit schema + migration files together
- [ ] Document breaking changes

---

## Troubleshooting

### Migration Already Applied
```bash
# If you get "Migration already applied" error:
npx prisma migrate resolve --rolled-back migration_name
```

### Database Lock Issues
```bash
# If database is locked:
# Kill the process using the database, then:
npx prisma migrate resolve --rolled-back latest
npx prisma migrate deploy
```

### Prisma Client Out of Sync
```bash
# Regenerate Prisma client
npx prisma generate
```

### Need to Reset Everything
```bash
# ⚠️ WARNING: This deletes all data!
npx prisma migrate reset

# Alternative: Just reset without migrations
rm -rf prisma/migrations
npx prisma migrate dev --name init
```

---

## Current Schema Overview

### Entities
- **User** - Authentication, role, groups, images
- **Image** - Files, metadata, public/private, relations
- **Group** - Collections of images
- **Tag** - Categories for images

### Key Relations
- User (1) → (Many) Image
- User (1) → (Many) Group
- Group (Many) ← → (Many) Image
- Image (Many) ← → (Many) Tag

### Storage
- Database: SQLite at `prisma/dev.db`
- Files: `public/uploads/`

---

## Migration File Structure

Each migration creates a timestamped SQL file:
```
prisma/migrations/
├── 20240101120000_init/
│   └── migration.sql
├── 20240101120001_add_field/
│   └── migration.sql
└── .migrations.lock
```

Each file contains the SQL that was executed. You can review these files to understand what changed:
```sql
-- Prisma migration file example
-- CreateTable "Image"
CREATE TABLE "Image" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "extension" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "ownerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Image_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("uuid") ON DELETE RESTRICT ON UPDATE CASCADE
);
```

---

## Best Practices

### ✅ DO
- Add one logical change per migration
- Use descriptive migration names
- Test migrations locally first
- Commit schema + migration files together
- Keep migrations simple and focused
- Document complex migrations

### ❌ DON'T
- Skip migrations (always run `migrate dev`)
- Edit generated migration files
- Make breaking changes without planning
- Assume migrations are reversible
- Forget to update code after schema changes
- Use raw SQL when Prisma supports it
