# Personal Website Project Guide

## Overview
This is a Next.js-based personal website with image gallery functionality, user authentication, and group/tag management system.

**Tech Stack:**
- **Framework:** Next.js 16.2.9 with React 19
- **Database:** SQLite with Prisma ORM
- **Auth:** NextAuth.js 5 with credentials + TOTP support
- **Styling:** Tailwind CSS 4
- **Security:** bcryptjs for password hashing

---

## Project Structure

```
personal-website-bis/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   ├── login/              # Login page
│   │   ├── images/             # Image-related routes
│   │   │   ├── page.tsx        # Browse all public images
│   │   │   ├── [id]/           # Image detail page
│   │   │   │   └── edit/       # Image edit page
│   │   │   ├── my-images/      # User's personal images
│   │   │   └── upload/         # Upload page
│   │   ├── groups/             # Group management
│   │   │   ├── page.tsx        # Groups list
│   │   │   └── [id]/           # Group detail/management
│   │   └── api/                # API routes
│   │       ├── auth/           # NextAuth routes
│   │       ├── upload/         # Image upload endpoint
│   │       ├── images/         # Image CRUD endpoints
│   │       └── groups/         # Group management endpoints
│   ├── components/             # Reusable React components
│   │   ├── edit-image-form.tsx
│   │   ├── create-group-form.tsx
│   │   ├── manage-group-images.tsx
│   │   └── delete-button.tsx
│   └── lib/                    # Utility functions
│       ├── auth.ts            # Auth configuration
│       └── prisma.ts          # Prisma client singleton
├── prisma/
│   └── schema.prisma          # Database schema
├── public/
│   └── uploads/               # User-uploaded images
└── .env                       # Environment variables
```

---

## Key Features

### 1. **Authentication System**
- **Location:** `src/app/api/auth/`
- **Features:**
  - Credentials-based login (username/password)
  - TOTP (Two-Factor Authentication) support
  - Session management with NextAuth.js
  - Password hashing with bcryptjs

**Related Files:**
- `src/lib/auth.ts` - Auth configuration and handlers
- `src/app/login/` - Login UI

### 2. **Image Management**
- **Locations:**
  - Upload: `src/app/images/upload/`
  - Browse: `src/app/images/`
  - My Images: `src/app/images/my-images/`
  - Edit: `src/app/images/[id]/edit/`
  - Detail: `src/app/images/[id]/`

**Features:**
- Upload multiple images at once (up to 100MB per file)
- Assign images to multiple groups during upload
- Edit image properties (name, public/private status)
- Delete images (removes from DB and server storage)
- Page auto-refreshes after deletion

**Key Components:**
- `EditImageForm` - Image editing interface with group management
- `DeleteImageButton` - Delete button with page refresh on success

### 3. **Group System**
- **Locations:**
  - Groups list: `src/app/groups/`
  - Group detail: `src/app/groups/[id]/`

**Features:**
- Create and manage image groups
- Add/remove multiple images from a group
- Edit/Done button to toggle editing mode
- View all images in a group
- Display image count per group

**Key Components:**
- `CreateGroupForm` - Create new groups
- `ManageGroupImages` - Add/remove images from groups

### 4. **Tags System**
- Currently read-only (tags can't be managed yet)
- Images can have multiple tags
- Tags are displayed on image detail pages

---

## Database Schema (Prisma)

### User
```prisma
- uuid (primary key)
- username (unique)
- email (unique)
- password (hashed)
- totp (optional, for 2FA)
- role (USER or ADMIN)
- sessionVersion (for invalidating sessions)
- relations: images[], groups[]
```

### Image
```prisma
- id (primary key)
- name
- extension
- isPublic (boolean)
- owner (User relation)
- ownerId (foreign key)
- tags[] (Tag relation)
- groups[] (Group relation)
- createdAt, updatedAt
```

### Group
```prisma
- id (primary key)
- name
- owner (User relation)
- ownerId (foreign key)
- images[] (Image relation)
- createdAt, updatedAt
```

### Tag
```prisma
- id (primary key)
- name (unique)
- images[] (Image relation)
```

---

## API Endpoints

### Authentication
- `POST /api/auth/callback/credentials` - Login
- `GET /api/auth/session` - Get current session
- `GET /api/auth/providers` - Get auth providers
- `GET /api/auth/csrf` - Get CSRF token

### Images
- `POST /api/upload` - Upload image(s)
  - Body: FormData with `file`, `isPublic`, optional `groupIds[]`
  - Max: 100MB per file
  - Returns: Uploaded image details

- `GET /api/images/` - Get all user's images
- `PUT /api/images/[id]` - Update image (name, isPublic, groupIds)
- `DELETE /api/images/[id]` - Delete image

### Groups
- `GET /api/groups` - List user's groups
- `POST /api/groups` - Create new group
  - Body: `{ name: string }`

- `PUT /api/groups/[id]/images` - Update group images
  - Body: `{ imageIds: string[] }`

---

## User Workflows

### Upload Images
1. Go to `/images/upload`
2. Click the upload area to select files (can select multiple)
3. Files appear as thumbnails with remove option
4. Optionally select groups to add images to
5. Optionally make images public
6. Click "Upload X Images" button

### Edit Image Properties
1. Go to `/images/my-images`
2. Click "Edit" on an image
3. Change name and public/private status
4. For groups:
   - Click "Edit" button to show group checkboxes
   - Select/deselect groups
   - Click "Done" to hide the edit interface
5. Click "Save Changes"

### Manage Groups
1. Go to `/groups`
2. Click on a group to view its images
3. Click "Edit Group" to add/remove images
4. Select images with checkboxes
5. Click "Save" to update
6. Click "Done" to hide the edit interface

### Delete Image
1. Go to `/images/my-images`
2. Click "Delete" button on image
3. Confirm deletion
4. Page auto-refreshes to remove image from list

---

## Recent Changes & Features

### Multi-Group Support
- Images can now belong to multiple groups
- Upload page shows group checkboxes
- Edit page has group management with Edit/Done toggle

### File Deletion Fix
- Delete now removes both database entry AND physical file from server

### Page Refresh on Delete
- Delete button now calls `router.refresh()` to update the page

### File Upload Limit
- Increased from 10MB to 100MB per file
- Frontend validation
- Backend configured to accept 100MB requests

### Toggle UI for Editing
- Groups: Edit/Done button hides/shows management interface
- Images: Edit/Done button for group selection

---

## Environment Variables

Create `.env` file with:
```
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

---

## Running the Project

```bash
# Install dependencies
npm install

# Setup database
npx prisma migrate dev
npx prisma db seed (optional)

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

---

## Common Tasks

### Adding a New Image Property
1. Update Prisma schema (`prisma/schema.prisma`)
2. Run migration: `npx prisma migrate dev --name add_property`
3. Update API endpoints to handle new property
4. Update form components

### Creating New Groups
- Use `POST /api/groups` endpoint
- Or use `CreateGroupForm` component on `/groups`

### Understanding Authentication Flow
1. User logs in at `/login`
2. NextAuth creates session
3. Session is available in server components via `auth()`
4. User can be checked in API routes via `auth()`
5. Logout removes session

---

## Notes
- All user data is isolated - users only see their own images/groups
- Images are stored in `public/uploads/` directory
- File names are UUIDs to prevent conflicts
- Deleted images are removed from both DB and filesystem
