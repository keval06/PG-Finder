# Level 9: UI Resilience (Handling Errors & Load States)

In this level, we make the app feel "Pro" by handling the rough edges: slow internet and server crashes.

## 🚧 Error Boundaries (`error.js`)

Next.js provides a special `error.js` file for every route.
- **Home Error**: If the backend is down, instead of a white screen, the user sees an "Oops!" message with a **Retry** button.
- **My-Listings Error**: If an owner tries to view a listing ID that doesn't exist, we show a clean message and a link back to "All Listings."

### 1. The `reset()` Pattern
The `error` component receives a `reset` function.
- **Logic**: This "Clears the cache" and re-attempts to fetch the data. 

---

## ⏳ Loading States (`loading.js`)

We use **Skeleton Frames** to improve the "Perceived Speed" of the app.
- **Why?** A blank screen feels longer than a screen with pulsing boxes. 
- **Pattern**: `loading.js` renders a grid of `Skeleton` atoms that match the exact shape of your `PGCard`. When the data arrives, the real cards "Snap" into place perfectly.

---

## 🔒 Protected Client Routes

We use a custom `useAuth()` hook for "Logic Resilience."

1.  **Mounting Check**: While the app checks if you're logged in, it shows a global loader.
2.  **Unauth Redirect**: If a user tries to bookmark `/my-listings` but isn't an owner, the `useEffect` redirects them to `/auth/login` before the page even renders.

---

## 💡 Key Concept: Parallel Data Fetching
In the root layout, we wrap all children in multiple Providers.
```javascript
<AuthProvider>
  <SearchProvider>
    {children}
  </SearchProvider>
</AuthProvider>
```
- **Result**: The app can check your identity and set up the search filters **at the same time**. This is "Non-Blocking Initialization."

**Next Stop: [Level 10: Expert Concepts](10_expert_concepts.md)**
