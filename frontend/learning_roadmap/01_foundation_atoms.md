# Level 1: Foundation & Atoms

This level covers the foundational UI elements, the landing page layout, and the general styling configuration.

## 🧱 The Atomic Design Principle
We use "Atoms" as the smallest building blocks. They are logic-less, highly reusable, and visually consistent.

| File | Concept | WHY it matters |
| :--- | :--- | :--- |
| `app/atoms/Button.jsx` | **Prop Delegation** | One component handles `primary`, `outline`, and `danger` variants. Changes here update every button in the app. |
| `app/atoms/Badge.jsx` | **Visual Tokens** | Standardizes how we show "AC", "WiFi", or "Co-ed" tags. |
| `app/atoms/Skeleton.jsx` | **Content Placeholders** | Prevents layout shift during loading by providing a "pulsing" gray box. |
| `app/atoms/EmptyState.jsx` | **Zero-State UX** | Standardizes the message shown when no results or listings are found. |

---

## 🚀 The Landing Page (`app/components/LandingPage.jsx`)
This is the most visually complex file (500+ lines). It introduces several advanced UI patterns.

### 1. Scroll Animations (Intersection Observer)
We use a custom `useInView` hook to trigger fade-in animations only when an element enters the screen.
- **Benefit**: Improved initial load performance and a "premium" feel.

### 2. Animated Counters
In the "Stats" section, numbers count up from 0 to their final value (e.g., "500+ Happy Clients").
- **Logic**: Uses `setInterval` inside a `useEffect` that triggers once when the section is scrolled into view. **Cleanup**: Always uses `clearInterval` on unmount to prevent memory leaks.

### 3. Progressive Navbar
The navbar is transparent at the top but becomes `bg-white/90 backdrop-blur-xl` after 40px of scrolling.
- **Logic**: `window.addEventListener("scroll", handler, { passive: true })`. The `passive: true` flag is a performance optimization for mobile browsers.

---

## 📐 Global Layout & Configuration

### 1. `app/layout.js` (The Root Shell)
This file defines the HTML wrapper for the entire app. It injects:
- **Google Fonts** (Inter).
- **Global Providers**: `AuthProvider` and `SearchProvider`.
- **Navigation**: The `Navbar` component is fixed at the top of every page.

### 2. `tailwind.config.js`
This is your "Design System" file. It defines the color palette and tells Tailwind which files to scan for utility classes.
- **101% Tip**: If you create a new component folder and don't add it to the `content` array here, your styles won't work in production!

**Next Stop: [Level 2: Global State](02_state_management.md)**
