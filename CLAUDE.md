# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15.5.6 project for town reviews, using:
- React 19.1.0
- TypeScript (strict mode enabled)
- Tailwind CSS 3.4.17
- Turbopack (Next.js bundler)
- App Router architecture

## Development Commands

```bash
# Start development server with Turbopack
npm run dev

# Build for production with Turbopack
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

Development server runs on http://localhost:3000

## Project Structure

- `/src/app/` - Next.js App Router pages and layouts
  - `layout.tsx` - Root layout with Geist font configuration
  - `page.tsx` - Home page
  - `globals.css` - Global styles with Tailwind directives
- TypeScript path alias: `@/*` maps to `./src/*`

## Configuration Files

- `tsconfig.json` - TypeScript config with strict mode, target ES2017
- `tailwind.config.ts` - Tailwind configured for `/src/**/*.{js,ts,jsx,tsx,mdx}`
  - Custom colors: `background`, `foreground` (CSS variables)
  - Custom fonts: Geist Sans and Geist Mono
- `next.config.ts` - Next.js configuration (currently minimal)
- `eslint.config.mjs` - ESLint with Next.js config
- `postcss.config.mjs` - PostCSS with Tailwind and Autoprefixer

## Supabase Integration

This project uses Supabase MCP server for backend operations:
- Configuration file: `.mcp.json` (contains API tokens - **NEVER commit this file**)
- `.mcp.json` is already in `.gitignore`

## Important Notes

- All builds use Turbopack for faster compilation
- Project uses TypeScript strict mode - all code must be type-safe
- Tailwind classes are scoped to `/src/` directory only

## Next.js App Router Best Practices

### Server Components vs Client Components

**Default: Use Server Components**
- All components in `/src/app/` are Server Components by default
- Server Components can be async and directly fetch data
- Keep components as Server Components unless you need:
  - Browser APIs (useState, useEffect, event handlers)
  - User interactivity
  - Custom hooks that use React hooks

**Client Components**
- Add `'use client'` directive at the top of the file
- Use for interactive UI elements only
- Keep Client Components small and deep in the component tree
- Pass data from Server Components to Client Components via props

```tsx
// Server Component (default) - can fetch data
export default async function Page() {
  const data = await fetch('https://api.example.com/data')
  const posts = await data.json()

  return <ClientButton posts={posts} />
}

// Client Component - receives data as props
'use client'
export default function ClientButton({ posts }) {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{posts.length}</button>
}
```

### Data Fetching Strategies

**1. Server-Side Fetch (Recommended for most cases)**
```tsx
// Static data (cached until manually invalidated)
const data = await fetch('https://...', { cache: 'force-cache' }) // default

// Dynamic data (refetched on every request)
const data = await fetch('https://...', { cache: 'no-store' })

// Revalidated data (ISR - cached with time-based revalidation)
const data = await fetch('https://...', { next: { revalidate: 10 } }) // 10 seconds
```

**2. Database Queries in Server Components**
```tsx
import { db, posts } from '@/lib/db'

export default async function Page() {
  const allPosts = await db.select().from(posts)
  return <ul>{allPosts.map(post => <li key={post.id}>{post.title}</li>)}</ul>
}
```

**3. Client-Side Fetch (use SWR or React Query)**
```tsx
'use client'
import useSWR from 'swr'

export default function Profile() {
  const { data, error, isLoading } = useSWR('/api/user', fetcher)
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error</div>
  return <div>{data.name}</div>
}
```

### Caching and Performance

**Fetch Cache Options:**
- `cache: 'force-cache'` - Cache until manually invalidated (default, like getStaticProps)
- `cache: 'no-store'` - Never cache, always fetch fresh (like getServerSideProps)
- `next: { revalidate: 60 }` - Cache with time-based revalidation (ISR)

**React Cache for Deduplication:**
```tsx
import { cache } from 'react'
import 'server-only'

export const getItem = cache(async (id: string) => {
  const res = await fetch(`https://api.example.com/item/${id}`)
  return res.json()
})
```

### Loading States and Suspense

Use React Suspense for streaming and loading states:

```tsx
import { Suspense } from 'react'

export default async function Page() {
  return (
    <div>
      <h1>My Page</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <SlowComponent />
      </Suspense>
    </div>
  )
}

async function SlowComponent() {
  const data = await fetchSlowData()
  return <div>{data}</div>
}
```

### Environment Variables

**Server-only variables:**
- Can be used directly in Server Components
- Never exposed to the client
- Store API keys, database credentials here

```tsx
// Server Component - ✅ Safe
export async function getData() {
  const res = await fetch('https://api.example.com/data', {
    headers: { authorization: process.env.API_KEY }
  })
  return res.json()
}
```

**Client-side variables:**
- Must be prefixed with `NEXT_PUBLIC_`
- Exposed to the browser
- Never store secrets here

### Sequential vs Parallel Data Fetching

**Sequential (waterfall - avoid if possible):**
```tsx
const artist = await getArtist(id)
const albums = await getAlbums(artist.id) // Waits for artist first
```

**Parallel (better performance):**
```tsx
const [artist, albums] = await Promise.all([
  getArtist(id),
  getAlbums(id)
])
```

**With Suspense (recommended for independent data):**
```tsx
<Suspense fallback={<ArtistSkeleton />}>
  <Artist id={id} />
</Suspense>
<Suspense fallback={<AlbumsSkeleton />}>
  <Albums id={id} />
</Suspense>
```

### Routing and Navigation

**File-based routing:**
- `app/page.tsx` → `/`
- `app/about/page.tsx` → `/about`
- `app/blog/[slug]/page.tsx` → `/blog/:slug`
- `app/shop/[...slug]/page.tsx` → `/shop/*` (catch-all)

**Navigation hooks (Client Components only):**
```tsx
'use client'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

export default function Component() {
  const router = useRouter()           // For programmatic navigation
  const pathname = usePathname()       // Current path
  const searchParams = useSearchParams() // Query parameters
}
```

### Layout and Template Best Practices

**Layouts:**
- Shared UI across multiple pages
- Preserve state across navigation
- Can fetch data like pages
- Nest layouts for section-specific UI

```tsx
// app/layout.tsx - Root layout
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

### Type Safety

**Async params and searchParams:**
```tsx
// Next.js 15+ - params and searchParams are Promises
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ query: string }>
}) {
  const { slug } = await params
  const { query } = await searchParams
  // ...
}
```

### Common Patterns to Avoid

❌ **Don't use async Client Components:**
```tsx
'use client'
export default async function ClientComponent() {} // ERROR
```

✅ **Instead, fetch in parent Server Component or use SWR:**
```tsx
// Server Component
export default async function Page() {
  const data = await fetchData()
  return <ClientComponent data={data} />
}
```

❌ **Don't import Server Components into Client Components:**
```tsx
'use client'
import ServerComponent from './server-component' // ERROR
```

✅ **Pass Server Components as children:**
```tsx
<ClientComponent>
  <ServerComponent />
</ClientComponent>
```
