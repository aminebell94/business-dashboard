# Tech Stack

## Framework & Runtime

- Next.js 14.2 (App Router with React Server Components)
- React 18
- TypeScript 5
- Node.js

## Build System & Package Manager

- Next.js build system
- npm/pnpm for package management

## Styling & UI

- Tailwind CSS 4.1
- shadcn/ui components (New York style variant)
- Radix UI primitives
- Lucide React icons
- Geist font family (Sans & Mono)
- next-themes for dark mode support

## State Management & Data Fetching

- TanStack Query (React Query) v5 for server state
- React hooks for local state
- No global state management library

## Form Handling & Validation

- React Hook Form with @hookform/resolvers
- Zod for schema validation

## Backend Integration

- Strapi CMS (headless CMS backend)
- REST API via `/api/strapi/*` proxy routes
- Custom API wrapper in `lib/api.ts`

## Key Libraries

- date-fns for date manipulation
- class-variance-authority (CVA) for component variants
- tailwind-merge for className merging
- sonner for toast notifications
- vaul for drawer components

## Common Commands

```bash
# Development
npm run dev          # Start dev server on localhost:3000

# Build
npm run build        # Production build

# Production
npm start            # Start production server

# Linting
npm run lint         # Run ESLint
```

## Configuration Notes

- TypeScript strict mode enabled
- ESLint and TypeScript errors ignored during builds (see next.config.mjs)
- Path aliases configured: `@/*` maps to project root
- Images are unoptimized (static export compatible)
