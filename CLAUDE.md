# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**まち口コミ帳** - A location-based community review platform for the Minami-Shinshu region (Iida/Shimoina area) in Japan.

### Core Concept
Digitally visualize local word-of-mouth culture by preserving "who told you about it" alongside location reviews on a map.

### Tech Stack
- Next.js 15.5.6
- React 19.1.0
- TypeScript (strict mode enabled)
- Tailwind CSS 3.4.17
- Turbopack (Next.js bundler)
- App Router architecture
- Supabase (PostgreSQL + Storage)
- Google Maps JavaScript API
- OpenAI API (GPT-4o-mini)

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

Development server runs on http://localhost:3000 (or available port if 3000 is in use)

## Project Structure

```
/src
  /app              - Next.js App Router (pages, layouts, API routes)
  /components       - Reusable React components
  /lib              - Utility functions and shared logic
  /types            - TypeScript type definitions
/docs               - Feature tickets and development documentation
  README.md         - Ticket index and priorities
  001-015_*.md      - Individual feature tickets with todos
/supabase
  /migrations       - Database migration files
REQUIREMENTS.md     - Full requirements specification
```

**Key conventions:**
- TypeScript path alias: `@/*` maps to `./src/*`
- All components default to Server Components unless `'use client'` directive
- Database types auto-generated: `src/types/database.types.ts`

## Configuration Files

- `tsconfig.json` - TypeScript strict mode, target ES2017
- `tailwind.config.ts` - Configured for `/src/**/*.{js,ts,jsx,tsx,mdx}`
  - Custom washi theme colors: beige, green, orange variants
  - Custom font: Zen Maru Gothic (via Google Fonts)
  - Custom shadow: `shadow-washi` for soft paper-like effect
- `next.config.ts` - Next.js configuration (minimal, will expand with CSP headers)
- `eslint.config.mjs` - ESLint with Next.js config
- `postcss.config.mjs` - PostCSS with Tailwind and Autoprefixer

### Environment Variables Required
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=      # Client-side (with referer restrictions)
GOOGLE_MAPS_SERVER_API_KEY=            # Server-side (no referer restrictions) - REQUIRED
OPENAI_API_KEY=
ADMIN_PASSWORD=                        # For admin panel authentication
```

**Important**: Two Google Maps API keys are required:
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - For browser usage (Map display)
- `GOOGLE_MAPS_SERVER_API_KEY` - For API routes (Place Details, Find Place APIs)

## Backend Architecture

### Supabase Integration
This project uses Supabase for backend operations:
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Storage**: Image uploads (recommendations-images bucket)
- **Real-time**: Reaction updates via Supabase Realtime
- Configuration: `.mcp.json` (contains API tokens - **NEVER commit this file**)
- `.mcp.json` is already in `.gitignore`

### Database Schema (Key Tables)
- `places` - Location information (Google Place ID, coordinates, category)
- `recommendations` - User reviews with source attribution
- `reactions` - Emoji reactions (ほっこり, 行ってみたい, メモした)
- `monthly_digests` - AI-generated monthly summaries

### API Routes Structure
- `/api/parse-gmaps` - Parse Google Maps links (supports shortened URLs), extract Place ID, fetch place details
  - Supports `maps.app.goo.gl` shortened URLs
  - Falls back to Find Place from Text API if Place ID not found
- `/api/recommendations` - POST: Create new recommendation with validation
- `/api/upload/image` - POST: Upload and convert images to WebP (max 1200px, quality 80%)
- `/api/upload/image/[path]` - DELETE: Remove images from storage
- `/api/reactions` - Manage reactions (planned)
- `/api/ai/*` - AI features: tone conversion, tag generation (Phase 2)

## Project-Specific Conventions

### Design System
- **Theme**: Washi (Japanese paper) aesthetic with craft paper warmth
- **Colors**: Earth tones (Beige × Deep Green × Persimmon Orange)
- **Font**: Zen Maru Gothic (rounded, soft Japanese typeface)
- **Animations**: Soft, gentle movements with stamp-like effects

### Data Flow Patterns
1. **Post Creation**:
   - User inputs Google Maps URL (including shortened URLs)
   - Parse API expands URL and extracts Place ID or uses Find Place API
   - Images uploaded via `/api/upload/image` (compressed + WebP conversion)
   - Data saved to Supabase with cookie for 24h edit window
2. **Map Display**: Supabase → Filter/Cluster → Google Maps markers (color by category)
3. **Reactions**: LocalStorage (user ID) + Supabase Realtime for live updates (planned)
4. **Image Processing**:
   - Client: browser-image-compression (max 1MB, 1920px)
   - Server: sharp (resize to 1200px, convert to WebP at 80% quality)

### Key Features
- **No authentication required** for posting (cookie-based edit window: 24h)
- **Source attribution**: Who told you about this place (家族, 友人, 近所の人, etc.)
- **Category-based pin colors**: 飲食=Orange, 体験=Blue, 自然=Green, 温泉=Brown
- **AI features**: Tone softening, auto-tag generation, monthly digest reports
- **Mobile-first**: Optimized for 60+ age users with accessibility focus

### Security Notes
- IP addresses are SHA-256 hashed, never stored raw
- Image uploads: Max 3 per post, 5MB each, JPEG/PNG only
- Rate limiting on API routes (especially AI endpoints)
- CSP headers prevent XSS attacks
- Admin panel protected by environment variable password

## Important Build Notes

- All builds use Turbopack for faster compilation
- TypeScript strict mode enforced - all code must be type-safe
- Tailwind classes scoped to `/src/` directory only
- No test framework configured yet (add in Phase 2)
- Development server may use different ports (3001, 3002, 3003) if 3000 is occupied
- Environment variable changes require server restart to take effect

## Key Components and Utilities

### Components
- `Map/Map.tsx` - Google Maps with clustering, current location marker, category-colored pins
- `ReviewCard/*` - Card UI with optimized images, tags, reactions, source attribution, infinite scroll
- `PostModal/PostModal.tsx` - 2-step post creation (URL input → form)
- `PostModal/ImageUpload.tsx` - Drag & drop image upload with compression and preview
- `PostModal/SourceSelector.tsx` - Information source selection (6 presets + other)

### Utilities
- `lib/google-maps.ts` - Map initialization, link parsing (supports shortened URLs), default settings
- `lib/formatters.ts` - Time formatting, icons (heard_from, category), tag colors
- `lib/image-compression.ts` - Client-side image validation and compression
- `lib/supabase/client.ts` - Browser-side Supabase client
- `lib/supabase/server.ts` - Server-side Supabase client (with Next.js 15 async cookies)
- `styles/map-styles.ts` - Custom washi-themed Google Maps styles

### Important Patterns
- Main page (`app/page.tsx`) has map/list toggle view (currently with sample data)
- All marker icons use `google.maps.SymbolPath.CIRCLE` with category-specific colors
- Review cards use Next.js Image with blur placeholder and loading animation
- Image upload: Client compression → Server WebP conversion → Supabase Storage
- Cookie-based edit tracking: 24h window stored in `editable_posts` cookie

## Development Workflow

### Feature Tickets and Todo Management
Development is organized into feature tickets in `/docs`:
- View all tickets and priorities in `/docs/README.md`
- Each ticket follows format: `{number}_{feature_name}.md`
- Tickets include: overview, priority, time estimate, phase, specs, tasks, files, completion criteria

### Todo Format
```markdown
- [ ] Incomplete task
- [×] Completed task
```
**Critical**: Always update `- [ ]` to `- [×]` when completing tasks

### Development Process
1. Check `/docs/README.md` for ticket priorities (🔴 Critical, 🟡 High, 🟢 Medium)
2. Open relevant ticket for detailed specs and implementation tasks
3. Implement features following the ticket's task list
4. Mark completed tasks with `- [×]`
5. Verify all completion criteria before marking ticket as done

### Phase Priority
- **Phase 1 (MVP)**: Tickets 001-009 - Core functionality for initial release
- **Phase 2 (Beta)**: Tickets 010-012 - AI features and optimization
- **Continuous**: Tickets 013-015 - Security, accessibility, legal compliance

### Current Implementation Status
**Phase 1 - MVP (Completed: Tickets 001-006)**
- ✅ **Ticket 001**: Project setup with Next.js 15, Supabase, Google Maps
- ✅ **Ticket 002**: Database schema with 4 tables + RLS policies
- ✅ **Ticket 003**: Google Maps display with clustering, current location, category pins
- ✅ **Ticket 004**: Review card UI with washi design, infinite scroll, image optimization
- ✅ **Ticket 005**: Post modal with Google Maps URL parser, source selector, image upload
- ✅ **Ticket 006**: Image optimization with WebP conversion, blur placeholders, deletion API

**Next Steps (Week 3: 仕上げ)**
- 🟡 **Ticket 007**: Reaction feature (ほっこり, 行ってみたい, メモした buttons)
- 🟡 **Ticket 008**: Search & filter (category, area, tags)
- 🟡 **Ticket 009**: Admin panel (post management, statistics)

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
