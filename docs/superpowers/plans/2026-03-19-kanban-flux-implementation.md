# Kanban Flux Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack Kanban project management app (Trello-style) called "Kanban Flux" with Next.js 14, PostgreSQL/Prisma, and NextAuth.

**Architecture:** Next.js 14 App Router full-stack — API Route Handlers for backend, React Server Components + Client Components for frontend, Prisma ORM for database, NextAuth for authentication. All in one unified project.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, @hello-pangea/dnd, Prisma, PostgreSQL, NextAuth (Auth.js v5)

**Spec:** `docs/superpowers/specs/2026-03-19-kanban-flux-design.md`

---

## Parallel Execution Streams

Tasks are organized into streams that can run in parallel. Dependencies are noted.

```
Stream 1: Foundation (Task 1)        ──► ALL other streams depend on this
Stream 2: Backend APIs (Tasks 2-5)   ──► depends on Task 1
Stream 3: Layout Components (Task 6) ──► depends on Task 1
Stream 4: Dashboard Page (Task 7)    ──► depends on Tasks 1, 6
Stream 5: Kanban Board (Task 8)      ──► depends on Tasks 1, 6
Stream 6: Card Detail Modal (Task 9) ──► depends on Tasks 1, 6
Stream 7: Team Management (Task 10)  ──► depends on Tasks 1, 6
Stream 8: Integration & Seed (Task 11) ──► depends on ALL previous
```

After Task 1, Streams 2+3 run in parallel. After Task 6, Streams 4-7 run in parallel with Stream 2.

---

### Task 1: Project Foundation & Setup

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.ts`, `postcss.config.js`
- Create: `src/app/layout.tsx`, `src/app/globals.css`
- Create: `prisma/schema.prisma`
- Create: `src/lib/prisma.ts`, `src/lib/utils.ts`, `src/lib/auth.ts`
- Create: `src/types/index.ts`
- Create: `.env.example`, `.gitignore`

- [ ] **Step 1: Initialize Next.js project**

```bash
cd D:/projetos/kanban-flux
npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git
```

- [ ] **Step 2: Install all dependencies**

```bash
npm install prisma @prisma/client next-auth@beta @hello-pangea/dnd lucide-react class-variance-authority clsx tailwind-merge date-fns
npm install -D @types/node prisma
```

- [ ] **Step 3: Initialize shadcn/ui**

```bash
npx shadcn@latest init -d
npx shadcn@latest add button input dialog dropdown-menu avatar badge table tabs card separator tooltip textarea checkbox popover calendar select
```

- [ ] **Step 4: Configure Tailwind with Kanban Flux design tokens**

Update `tailwind.config.ts` — extend theme with design system colors:

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0052CC",
          50: "#eef0ff",
          100: "#dae2ff",
          200: "#b2c5ff",
          300: "#89a9ff",
          400: "#5c8cff",
          500: "#3870ea",
          600: "#0c56d0",
          700: "#0052CC",
          800: "#002b73",
          900: "#001848",
        },
        secondary: {
          DEFAULT: "#42526E",
          50: "#ecf0ff",
          100: "#d6e3ff",
          200: "#b7c7e8",
          300: "#9baccc",
          400: "#8191b0",
          500: "#677895",
          600: "#4f5f7b",
          700: "#42526E",
          800: "#20314b",
          900: "#091c35",
        },
        tertiary: {
          DEFAULT: "#00B8D9",
          50: "#d9f5ff",
          100: "#afecff",
          200: "#48d7f9",
          300: "#0fbbdc",
          400: "#009ebb",
          500: "#00829a",
          600: "#00687b",
          700: "#00B8D9",
          800: "#003641",
          900: "#001f27",
        },
        neutral: {
          DEFAULT: "#091E42",
          50: "#edf0ff",
          100: "#d8e2ff",
          200: "#b4c6f3",
          300: "#99abd7",
          400: "#7f90bb",
          500: "#6577a0",
          600: "#4c5e85",
          700: "#35466c",
          800: "#1d3054",
          900: "#091E42",
        },
        surface: "#F4F5F7",
        success: "#36B37E",
        warning: "#FFAB00",
        danger: "#FF5630",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

- [ ] **Step 5: Create global CSS**

Update `src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222 47% 15%;
    --card: 220 14% 96%;
    --card-foreground: 222 47% 15%;
    --popover: 0 0% 100%;
    --popover-foreground: 222 47% 15%;
    --primary: 214 100% 40%;
    --primary-foreground: 0 0% 100%;
    --secondary: 217 26% 34%;
    --secondary-foreground: 0 0% 100%;
    --muted: 220 14% 96%;
    --muted-foreground: 217 26% 34%;
    --accent: 187 100% 43%;
    --accent-foreground: 0 0% 100%;
    --destructive: 14 100% 59%;
    --destructive-foreground: 0 0% 100%;
    --border: 220 14% 90%;
    --input: 220 14% 90%;
    --ring: 214 100% 40%;
    --radius: 0.75rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground font-sans antialiased;
  }
}
```

- [ ] **Step 6: Create Prisma schema**

Create `prisma/schema.prisma` with the full data model from the spec (User, Workspace, WorkspaceMember, Board, Column, Card, Label, CardLabel, CardMember, Checklist, ChecklistItem, Comment — all models, enums, and relations as specified in the design doc).

- [ ] **Step 7: Create Prisma client singleton**

Create `src/lib/prisma.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 8: Create shared TypeScript types**

Create `src/types/index.ts`:

```typescript
import type { Board, Card, Checklist, ChecklistItem, Column, Comment, Label, User, Workspace, WorkspaceMember } from "@prisma/client";

export type BoardWithColumns = Board & {
  columns: ColumnWithCards[];
};

export type ColumnWithCards = Column & {
  cards: CardWithDetails[];
};

export type CardWithDetails = Card & {
  labels: { label: Label }[];
  members: { user: Pick<User, "id" | "name" | "avatar"> }[];
  checklists: ChecklistWithItems[];
  comments: CommentWithUser[];
};

export type ChecklistWithItems = Checklist & {
  items: ChecklistItem[];
};

export type CommentWithUser = Comment & {
  user: Pick<User, "id" | "name" | "avatar">;
};

export type WorkspaceMemberWithUser = WorkspaceMember & {
  user: Pick<User, "id" | "name" | "email" | "avatar">;
};
```

- [ ] **Step 9: Create utility functions**

Create `src/lib/utils.ts`:

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
```

- [ ] **Step 10: Create .env.example**

```
DATABASE_URL="postgresql://user:password@localhost:5432/kanban_flux"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

- [ ] **Step 11: Setup NextAuth configuration**

Create `src/lib/auth.ts`:

```typescript
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });
        if (!user) return null;
        return { id: user.id, name: user.name, email: user.email, image: user.avatar };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token?.sub) session.user.id = token.sub;
      return session;
    },
    async jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
  },
  pages: { signIn: "/login" },
});
```

Create `src/app/api/auth/[...nextauth]/route.ts`:

```typescript
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
```

- [ ] **Step 12: Create root layout**

Update `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kanban Flux",
  description: "Project management with Kanban boards",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

- [ ] **Step 13: Initialize database and generate Prisma client**

```bash
cp .env.example .env  # edit with real DB credentials
npx prisma generate
npx prisma db push
```

- [ ] **Step 14: Verify project builds**

```bash
npm run build
```

- [ ] **Step 15: Commit foundation**

```bash
git add -A
git commit -m "feat: project foundation - Next.js 14, Prisma, NextAuth, Tailwind, shadcn/ui"
```

---

### Task 2: Backend — Board CRUD API

**Depends on:** Task 1
**Files:**
- Create: `src/app/api/boards/route.ts`
- Create: `src/app/api/boards/[id]/route.ts`

- [ ] **Step 1: Create boards list + create endpoint**

Create `src/app/api/boards/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const boards = await prisma.board.findMany({
    include: {
      columns: { include: { cards: { include: { members: { include: { user: true } } } } } },
    },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(boards);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const board = await prisma.board.create({
    data: {
      name: body.name,
      description: body.description,
      coverImage: body.coverImage,
      workspaceId: body.workspaceId,
      columns: {
        create: [
          { title: "To Do", position: 0 },
          { title: "In Progress", position: 1 },
          { title: "Done", position: 2 },
        ],
      },
    },
    include: { columns: true },
  });
  return NextResponse.json(board, { status: 201 });
}
```

- [ ] **Step 2: Create single board get/update/delete endpoint**

Create `src/app/api/boards/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const board = await prisma.board.findUnique({
    where: { id: params.id },
    include: {
      columns: {
        orderBy: { position: "asc" },
        include: {
          cards: {
            orderBy: { position: "asc" },
            include: {
              labels: { include: { label: true } },
              members: { include: { user: { select: { id: true, name: true, avatar: true } } } },
              checklists: { include: { items: true } },
              comments: {
                include: { user: { select: { id: true, name: true, avatar: true } } },
                orderBy: { createdAt: "desc" },
              },
            },
          },
        },
      },
    },
  });
  if (!board) return NextResponse.json({ error: "Board not found" }, { status: 404 });
  return NextResponse.json(board);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const board = await prisma.board.update({
    where: { id: params.id },
    data: body,
  });
  return NextResponse.json(board);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.board.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/boards/
git commit -m "feat(api): board CRUD endpoints"
```

---

### Task 3: Backend — Column & Card APIs with Reorder

**Depends on:** Task 1
**Files:**
- Create: `src/app/api/columns/route.ts`
- Create: `src/app/api/columns/[id]/route.ts`
- Create: `src/app/api/columns/reorder/route.ts`
- Create: `src/app/api/cards/route.ts`
- Create: `src/app/api/cards/[id]/route.ts`
- Create: `src/app/api/cards/reorder/route.ts`

- [ ] **Step 1: Create column endpoints**

`src/app/api/columns/route.ts` — POST to create column in a board.
`src/app/api/columns/[id]/route.ts` — PATCH to update title/position, DELETE to remove.

- [ ] **Step 2: Create column reorder endpoint**

`src/app/api/columns/reorder/route.ts` — PATCH accepts `{ columns: [{id, position}] }`, updates all positions in a transaction.

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const { columns } = await req.json();
  await prisma.$transaction(
    columns.map((col: { id: string; position: number }) =>
      prisma.column.update({ where: { id: col.id }, data: { position: col.position } })
    )
  );
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 3: Create card CRUD endpoints**

`src/app/api/cards/route.ts` — POST creates card in a column.
`src/app/api/cards/[id]/route.ts` — GET with full includes, PATCH to update, DELETE to remove.

- [ ] **Step 4: Create card reorder/move endpoint**

`src/app/api/cards/reorder/route.ts` — PATCH accepts `{ cards: [{id, columnId, position}] }` for drag-and-drop. Updates all in transaction.

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const { cards } = await req.json();
  await prisma.$transaction(
    cards.map((card: { id: string; columnId: string; position: number }) =>
      prisma.card.update({
        where: { id: card.id },
        data: { columnId: card.columnId, position: card.position },
      })
    )
  );
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/api/columns/ src/app/api/cards/
git commit -m "feat(api): column and card CRUD with drag-and-drop reorder"
```

---

### Task 4: Backend — Card Sub-resources (Comments, Checklists, Labels, Members)

**Depends on:** Task 1
**Files:**
- Create: `src/app/api/cards/[id]/comments/route.ts`
- Create: `src/app/api/cards/[id]/checklists/route.ts`
- Create: `src/app/api/checklists/[id]/items/[itemId]/route.ts`
- Create: `src/app/api/cards/[id]/labels/route.ts`
- Create: `src/app/api/cards/[id]/members/route.ts`

- [ ] **Step 1: Create comments endpoint**

POST to add comment (requires userId and text). GET to list comments for a card.

- [ ] **Step 2: Create checklists endpoint**

POST to add checklist with title. Nested items endpoint to toggle completed.

- [ ] **Step 3: Create labels and members endpoints**

POST/DELETE for assigning/removing labels and members from cards.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/cards/ src/app/api/checklists/
git commit -m "feat(api): card sub-resources - comments, checklists, labels, members"
```

---

### Task 5: Backend — Team Management API

**Depends on:** Task 1
**Files:**
- Create: `src/app/api/team/route.ts`
- Create: `src/app/api/team/invite/route.ts`
- Create: `src/app/api/team/[id]/route.ts`

- [ ] **Step 1: Create team list endpoint**

GET returns all workspace members with user details, filterable by role query param.

- [ ] **Step 2: Create invite endpoint**

POST accepts email and role, creates user if not exists, adds WorkspaceMember.

- [ ] **Step 3: Create member update/remove endpoints**

PATCH to update role, DELETE to remove from workspace.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/team/
git commit -m "feat(api): team management endpoints - list, invite, update role, remove"
```

---

### Task 6: Frontend — Layout Components (Sidebar, Topbar, Footer)

**Depends on:** Task 1
**Files:**
- Create: `src/components/layout/sidebar.tsx`
- Create: `src/components/layout/topbar.tsx`
- Create: `src/components/layout/footer.tsx`
- Create: `src/components/layout/app-layout.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create Sidebar component**

`src/components/layout/sidebar.tsx` — Fixed left panel (240px). Contains:
- Logo "Kanban Flux" with palette icon at top
- Navigation items with icons: Project Space, Workspace, Boards, Calendar, Members, Settings
- Uses `lucide-react` icons (LayoutDashboard, Briefcase, Columns3, Calendar, Users, Settings)
- Active state: primary blue background, white text
- Hover state: surface background
- Colors: bg-white, border-r, text-secondary

- [ ] **Step 2: Create Topbar component**

`src/components/layout/topbar.tsx` — Horizontal bar at top. Contains:
- Logo text "KanbanFlux" (left)
- Navigation tabs: Dashboard, My Tasks, Team, Reports
- Active tab: primary blue underline
- Right side: notification bell icon, settings gear, user avatar
- Colors: bg-white, border-b, text-neutral-900

- [ ] **Step 3: Create Footer component**

`src/components/layout/footer.tsx` — Simple footer with:
- Left: Help Center link with question-mark icon
- Center: "© 2024 Kanban Flux. All rights reserved."
- Right: Privacy Policy | Terms of Service | Status
- Colors: text-secondary, text-sm

- [ ] **Step 4: Create AppLayout wrapper**

`src/components/layout/app-layout.tsx` — Combines sidebar + topbar + footer:

```tsx
"use client";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { Footer } from "./footer";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-surface">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-auto p-6">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verify layout renders**

```bash
npm run dev
# Open http://localhost:3000 — should see sidebar + topbar + empty main area + footer
```

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/
git commit -m "feat(ui): layout components - sidebar, topbar, footer, app layout"
```

---

### Task 7: Frontend — Dashboard Page

**Depends on:** Tasks 1, 6
**Files:**
- Create: `src/components/dashboard/recent-boards.tsx`
- Create: `src/components/dashboard/all-boards-table.tsx`
- Create: `src/components/dashboard/create-board-dialog.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create RecentBoards component**

Grid/horizontal scroll of board cards. Each card shows:
- Cover image (or gradient placeholder)
- Board name overlay
- Member count + avatar stack (bottom)
- Last card is "+ Create Board" blue button card

- [ ] **Step 2: Create AllBoardsTable component**

Table with columns: PROJECT NAME (with colored dot), STATUS (badge), TEAM (avatar group), LAST EDITED (date).
- Status badges: Active (green bg), Paused (yellow bg), Archived (gray bg)
- Rows are clickable (navigate to `/board/[id]`)
- Uses shadcn/ui Table component

- [ ] **Step 3: Create CreateBoardDialog component**

Modal dialog with:
- Input: Board name (required)
- Textarea: Description (optional)
- Submit button: "Create Board"
- Uses shadcn/ui Dialog

- [ ] **Step 4: Compose Dashboard page**

`src/app/page.tsx`:

```tsx
import { AppLayout } from "@/components/layout/app-layout";
import { RecentBoards } from "@/components/dashboard/recent-boards";
import { AllBoardsTable } from "@/components/dashboard/all-boards-table";

export default async function DashboardPage() {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/boards`, { cache: "no-store" });
  const boards = await res.json();

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Workspace Dashboard</h1>
          <p className="text-secondary">Manage your project boards and team velocity.</p>
        </div>
        <RecentBoards boards={boards} />
        <AllBoardsTable boards={boards} />
      </div>
    </AppLayout>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/ src/app/page.tsx
git commit -m "feat(ui): dashboard page - recent boards, all boards table, create dialog"
```

---

### Task 8: Frontend — Kanban Board with Drag-and-Drop

**Depends on:** Tasks 1, 6
**Files:**
- Create: `src/components/board/board-view.tsx`
- Create: `src/components/board/column.tsx`
- Create: `src/components/board/card.tsx`
- Create: `src/app/board/[id]/page.tsx`

- [ ] **Step 1: Create KanbanCard component**

`src/components/board/card.tsx` — Individual card within a column. Shows:
- Card title
- Label badges (colored chips, max 3 visible)
- Member avatar stack (bottom right, max 3)
- Due date with calendar icon (if set)
- Checklist progress bar (if checklists exist): "2/5" with mini progress bar
- Wrapped in `Draggable` from @hello-pangea/dnd
- onClick opens card detail modal
- Styles: bg-white, rounded-lg, shadow-sm, hover:shadow-md, p-3

- [ ] **Step 2: Create KanbanColumn component**

`src/components/board/column.tsx` — A single column. Contains:
- Column header: title + card count badge
- `Droppable` area containing list of KanbanCards
- "+ Add Card" button at bottom (inline input on click)
- Styles: bg-surface, rounded-xl, w-[300px], min-h-[200px], p-3

- [ ] **Step 3: Create BoardView component**

`src/components/board/board-view.tsx` — Main board container:
- Board header with board name + "Create Board" button
- Horizontal scrollable area with columns
- `DragDropContext` wrapping all columns
- `onDragEnd` handler: calls `/api/cards/reorder` with optimistic update

```tsx
"use client";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { KanbanColumn } from "./column";
import type { BoardWithColumns } from "@/types";
import { useState } from "react";

export function BoardView({ initialBoard }: { initialBoard: BoardWithColumns }) {
  const [board, setBoard] = useState(initialBoard);

  async function onDragEnd(result: DropResult) {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Optimistic update logic: move card in state, then call API
    const newColumns = [...board.columns];
    const sourceCol = newColumns.find((c) => c.id === source.droppableId)!;
    const destCol = newColumns.find((c) => c.id === destination.droppableId)!;
    const [movedCard] = sourceCol.cards.splice(source.index, 1);
    destCol.cards.splice(destination.index, 0, { ...movedCard, columnId: destCol.id });

    // Update positions
    sourceCol.cards.forEach((card, i) => (card.position = i));
    destCol.cards.forEach((card, i) => (card.position = i));

    setBoard({ ...board, columns: newColumns });

    // Persist
    const cardsToUpdate = [...sourceCol.cards, ...(source.droppableId !== destination.droppableId ? destCol.cards : [])];
    await fetch("/api/cards/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cards: cardsToUpdate.map((c) => ({ id: c.id, columnId: c.columnId, position: c.position })),
      }),
    });
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900">{board.name}</h1>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {board.columns.map((column) => (
            <KanbanColumn key={column.id} column={column} />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
```

- [ ] **Step 4: Create board page**

`src/app/board/[id]/page.tsx`:

```tsx
import { AppLayout } from "@/components/layout/app-layout";
import { BoardView } from "@/components/board/board-view";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function BoardPage({ params }: { params: { id: string } }) {
  const board = await prisma.board.findUnique({
    where: { id: params.id },
    include: {
      columns: {
        orderBy: { position: "asc" },
        include: {
          cards: {
            orderBy: { position: "asc" },
            include: {
              labels: { include: { label: true } },
              members: { include: { user: { select: { id: true, name: true, avatar: true } } } },
              checklists: { include: { items: true } },
              comments: { include: { user: { select: { id: true, name: true, avatar: true } } }, orderBy: { createdAt: "desc" } },
            },
          },
        },
      },
    },
  });

  if (!board) notFound();

  return (
    <AppLayout>
      <BoardView initialBoard={board} />
    </AppLayout>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/board/ src/app/board/
git commit -m "feat(ui): kanban board with drag-and-drop columns and cards"
```

---

### Task 9: Frontend — Card Detail Modal

**Depends on:** Tasks 1, 6
**Files:**
- Create: `src/components/card/card-detail-modal.tsx`
- Create: `src/components/card/checklist.tsx`
- Create: `src/components/card/labels.tsx`
- Create: `src/components/card/members.tsx`
- Create: `src/components/card/comments.tsx`

- [ ] **Step 1: Create Checklist component**

Shows checklist title, progress bar (completed/total), list of checkbox items.
"+ Add item" button at bottom. Toggle calls API to update item.

- [ ] **Step 2: Create Labels component**

Displays colored label badges. "Add Label" button opens popover with color picker + name input.

- [ ] **Step 3: Create Members component**

Shows avatar stack of assigned members. "Add Member" button opens popover with workspace member list.

- [ ] **Step 4: Create Comments component**

Activity feed: each comment shows user avatar, name, timestamp, text.
Input at bottom: "Write a comment..." textarea + Send button.

- [ ] **Step 5: Create CardDetailModal**

`src/components/card/card-detail-modal.tsx` — Full modal with two-column layout:

Left side (~65%): Editable title, Description textarea, Checklist, Comments/Activity
Right side (~35%): Action buttons — Members, Labels, Checklist (add new), Due Date (date picker), separator, Archive, Delete

Uses shadcn/ui Dialog. Max-width 720px.

- [ ] **Step 6: Integrate modal into board**

Update `src/components/board/card.tsx` to open CardDetailModal on click.
Pass card data + refresh callback.

- [ ] **Step 7: Commit**

```bash
git add src/components/card/ src/components/board/card.tsx
git commit -m "feat(ui): card detail modal with checklist, labels, members, comments"
```

---

### Task 10: Frontend — Team Management Page

**Depends on:** Tasks 1, 6
**Files:**
- Create: `src/components/team/member-card.tsx`
- Create: `src/components/team/member-grid.tsx`
- Create: `src/components/team/invite-modal.tsx`
- Create: `src/app/team/page.tsx`

- [ ] **Step 1: Create MemberCard component**

Card showing: large avatar (80px), name, role badge (colored: Admin=blue, Member=green, Viewer=gray), job title.
Three-dot dropdown menu (edit role, remove). Online/offline status dot on avatar.

- [ ] **Step 2: Create MemberGrid component**

Responsive grid (3 columns on desktop, 2 on tablet, 1 on mobile).
Search bar at top. Tab filters: All Members (count), Admins, Viewers.
Last card: "Add New Member" with dashed border + plus icon.

- [ ] **Step 3: Create InviteModal**

Dialog with: email input, role selector (dropdown: Admin/Member/Viewer), Invite button.

- [ ] **Step 4: Compose Team page**

```tsx
import { AppLayout } from "@/components/layout/app-layout";
import { MemberGrid } from "@/components/team/member-grid";

export default async function TeamPage() {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/team`, { cache: "no-store" });
  const members = await res.json();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Team Management</h1>
            <p className="text-secondary">Manage your organization's workspace access, roles, and collaboration permissions.</p>
          </div>
        </div>
        <MemberGrid members={members} />
      </div>
    </AppLayout>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/team/ src/app/team/
git commit -m "feat(ui): team management page - member grid, cards, invite modal"
```

---

### Task 11: Seed Data & Final Integration

**Depends on:** All previous tasks
**Files:**
- Create: `prisma/seed.ts`
- Modify: `package.json` (add prisma seed script)

- [ ] **Step 1: Create comprehensive seed data**

`prisma/seed.ts` — Creates:
- 1 Workspace ("Kanban Flux Workspace")
- 5 Users (Sarah Chen, Marcus Wright, Elena Rodriguez, David Kim, + demo user)
- 3 Boards (Product Launch Q4, API Infrastructure, Marketing Campaign) with statuses
- Columns per board (To Do, In Progress, Done)
- 10+ Cards with descriptions, due dates
- Labels (Bug=red, Feature=blue, Urgent=orange, Design=purple)
- Checklists with items
- Comments
- WorkspaceMembers with mixed roles

- [ ] **Step 2: Add seed script to package.json**

```json
{
  "prisma": {
    "seed": "npx tsx prisma/seed.ts"
  }
}
```

- [ ] **Step 3: Run seed**

```bash
npx prisma db seed
```

- [ ] **Step 4: Full integration test — run dev and verify all pages**

```bash
npm run dev
# Test: Dashboard shows boards, click board opens Kanban, drag cards, open modal, team page
```

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: seed data and final integration - Kanban Flux complete"
```

---

## Summary

| Task | Stream | Description | Can Parallel With |
|------|--------|-------------|-------------------|
| 1 | Foundation | Project setup, deps, config | — (must be first) |
| 2 | Backend | Board CRUD API | Tasks 3, 4, 5, 6 |
| 3 | Backend | Column & Card APIs | Tasks 2, 4, 5, 6 |
| 4 | Backend | Card sub-resources | Tasks 2, 3, 5, 6 |
| 5 | Backend | Team API | Tasks 2, 3, 4, 6 |
| 6 | Frontend | Layout components | Tasks 2, 3, 4, 5 |
| 7 | Frontend | Dashboard page | Tasks 8, 9, 10 |
| 8 | Frontend | Kanban board + DnD | Tasks 7, 9, 10 |
| 9 | Frontend | Card detail modal | Tasks 7, 8, 10 |
| 10 | Frontend | Team management | Tasks 7, 8, 9 |
| 11 | Integration | Seed data + polish | — (must be last) |
