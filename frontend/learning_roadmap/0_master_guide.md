# Level 0: Master Guide — Project Architecture

Welcome to the PG Finder Frontend Learning Roadmap! This master guide provides a "Big Picture" overview of how the application is built using modern Next.js 14+ practices.

## 🏗️ Core Architecture: Next.js App Router

The application uses the **App Router** (`app/` directory), which is the standard for modern Next.js development.

### 1. Key Concepts
- **Server Components (RSC)**: By default, everything in `app/` is a Server Component. They fetch data on the server, reducing the JavaScript sent to the browser.
- **Client Components**: Files starting with `"use client"` (like `HomeClient.jsx`) are Client Components. Use these for interactivity, state (hooks like `useState`, `useEffect`), and browser-only APIs.
- **File-Based Routing**: Folders define routes. `app/my-listings/page.js` becomes your `/my-listings` URL.

### 2. Project Config Files (Every File Counted)
These files define how the entire project runs. They are outside `app/` but control everything inside it.

| File | What it controls | Why it matters |
| :--- | :--- | :--- |
| `next.config.mjs` | Enables React Compiler, configures allowed image domains, and sets a **custom image loader** (`lib/imageLoader.js`). | Without this, `next/image` would reject Cloudinary/Unsplash URLs. |
| `tailwind.config.js` | Tells Tailwind which files to scan for class names (`app/**`, `components/**`). | If a folder is missing here, Tailwind strips its classes in production — a common silent bug. |
| `postcss.config.mjs` | Runs Tailwind and Autoprefixer as PostCSS plugins during the build. | Required for Tailwind CSS to actually process. |
| `jsconfig.json` | Enables path aliases and JSX recognition for VS Code IntelliSense. | Improves Developer Experience (DX). |
| `eslint.config.mjs` | Enforces Next.js best-practice linting rules. | Catches common mistakes like missing `key` props or wrong hook usage. |
| `.env.local` | Stores `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_MAP_ID`. The `NEXT_PUBLIC_` prefix exposes variables to the browser bundle. | Never put secrets in `NEXT_PUBLIC_` variables — they are visible to end users. |

### 3. The Custom Image Loader (`lib/imageLoader.js`)
```javascript
export default function imageLoader({ src, width, quality }) {
  return `${src}?w=${width}&q=${quality || 75}`;
}
```
- **Why?**: Next.js's default image optimizer runs on its own server. Since you use external URLs (Unsplash, Cloudinary), this custom loader simply appends `?w=` and `?q=` query params that those CDNs understand natively.
- **Concept**: Custom Next.js image loader — bypasses built-in optimizer in favor of CDN-level optimization.

### 4. Folder Structure
- `app/`: Contains routes, layouts, and page-specific logic.
- `app/atoms/`: The smallest UI building blocks (Buttons, Badges).
- `app/components/`: Shared components strictly for the main layout.
- `app/context/`: Global state providers (Authentication, Search).
- `components/`: Shareable, complex UI components used across multiple pages (Navbar, Cards, Modals).
- `hooks/`: Reusable business logic (Filtering, Sorting).
- `lib/api/`: The "Service Layer" — centralized data fetching logic.
- `lib/imageLoader.js`: Custom image URL builder for CDN compatibility.

## 🗺️ Data Consistency Flow
1. **User enters Application**: `AuthContext` checks `localStorage` for a JWT.
2. **Global State Hydration**: `AuthContext` provides the `user` object to all pages via `useAuth()`.
3. **Data Request**: A Client Component calls a function from `lib/api/` (Service Layer).
4. **State Update**: The data is saved into local state (`useState`) or global context.
5. **UI Update**: Components re-render to reflect the new data.

---

## 🔗 Learning Path
1. **[Level 1: Foundation & Atoms](01_foundation_atoms.md)** - Start here to learn the UI building blocks.
2. **[Level 2: Global State](02_state_management.md)** - Learn how data reaches the whole app.
3. **[Level 3: API Services](03_api_services.md)** - Learn how the frontend talks to the backend.
4. **[Level 4: Custom Hooks](04_custom_hooks.md)** - Learn the logic extraction pattern.
5. **[Level 5: Reusable UI & Logic](05_reusable_ui_logic.md)** - Cards, Modals, and Status Badges.
6. **[Level 6: Feature Hub - Home](06_home_hub.md)** - Geolocation, Search, and Mapping.
7. **[Level 7: Feature Hub - Owner Hub](07_owner_hub.md)** - Leaflet Map & Reverse Geocoding.
8. **[Level 8: Advanced Routing](08_advanced_routing.md)** - PG Details & Booking Wrappers.
9. **[Level 9: UI Resilience](09_resilience_nextjs.md)** - Errors, Loading, and Skeleton frames.
10. **[Level 10: Expert Concepts](10_expert_concepts.md)** - Parallel routing & search-syncing.
