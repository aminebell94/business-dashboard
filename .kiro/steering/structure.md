# Project Structure

## Directory Organization

```
/app                    # Next.js App Router pages and API routes
  /api                  # API route handlers
    /login              # Authentication endpoints
    /strapi/[...path]   # Strapi CMS proxy (catch-all route)
  /orders               # Order management pages
    /new                # Create new order
    /[id]               # Order detail and edit
  /products             # Product management pages
  /users                # User management pages
  globals.css           # Global styles
  layout.tsx            # Root layout with sidebar
  page.tsx              # Dashboard home page
  providers.tsx         # React Query and theme providers

/components             # React components
  /dashboard            # Dashboard-specific components (KPIs, charts)
  /layout               # Layout components (sidebar, header)
  /orders               # Order-related components (forms, lists)
  /products             # Product-related components
  /providers            # Provider wrappers (React Query)
  /ui                   # shadcn/ui components (51 files)
  /users                # User-related components
  theme-provider.tsx    # Dark mode theme provider

/lib                    # Shared utilities and business logic
  api.ts                # Strapi API client and data fetching functions
  types.ts              # TypeScript types and Zod schemas
  utils.ts              # Utility functions (cn, etc.)

/hooks                  # Custom React hooks
  use-mobile.ts         # Mobile detection hook
  use-toast.ts          # Toast notification hook

/public                 # Static assets (images, logos)
/styles                 # Additional stylesheets
/.kiro                  # Kiro AI assistant configuration
  /steering             # AI steering rules
```

## Architectural Patterns

### Page Structure
- Pages are in `/app` using Next.js App Router
- Client components marked with `"use client"` directive
- Server components used where possible for better performance

### Component Organization
- Feature-based folders (orders, products, users, dashboard)
- Shared UI components in `/components/ui` (shadcn/ui)
- Layout components separated from feature components

### Data Flow
1. Pages fetch data using TanStack Query hooks
2. API calls go through `/lib/api.ts` wrapper functions
3. API routes in `/app/api/strapi` proxy requests to Strapi backend
4. Types defined in `/lib/types.ts` with Zod schemas

### API Layer
- All Strapi interactions centralized in `lib/api.ts`
- Helper functions for unwrapping Strapi response format
- Consistent error handling with `asJson()` utility
- Query string building with `qs()` helper

### Naming Conventions
- Files: kebab-case (e.g., `order-create-form.tsx`)
- Components: PascalCase (e.g., `OrderCreateForm`)
- Functions: camelCase (e.g., `createOrder`)
- Types: PascalCase (e.g., `OrderStatusType`)
- Constants: SCREAMING_SNAKE_CASE or PascalCase objects (e.g., `OrderStatus`)

### Import Aliases
- `@/components` → `/components`
- `@/lib` → `/lib`
- `@/hooks` → `/hooks`
- `@/app` → `/app`

## Key Files

- `lib/api.ts` - All backend API interactions
- `lib/types.ts` - Type definitions and Zod schemas
- `app/layout.tsx` - Root layout with sidebar navigation
- `app/providers.tsx` - React Query and theme provider setup
- `components/ui/*` - Reusable UI components from shadcn/ui
