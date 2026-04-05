# Level 4: Custom Hooks & Logic Extraction

This level explains how we take the "Complex Brain" (logic) out of a page and put it in a separate, reusable hook.

## 🪝 What is a Custom Hook?
A hook is just a Javascript function that uses React functions (`useState`, `useMemo`, `useEffect`). By using hooks, we prevent our pages from becoming "Spaghetti Code."

### 1. `app/hooks/usePGFilters.js`
The "Filtration Engine" of your app.
- **Concepts**: `useMemo`, `useCallback`, State derived from props.
- **Logic**: It takes a raw list of PGs and applies multiple filters (City, Gender, Price, Amenities) and sorting (Price High/Low, Rating).
- **Data Consistency**: Because this logic is in one hook, any updates to the filtering algorithm automatically apply to **both** the Home page and the My Listings page!

---

## 💡 Key Concept: Memoization with `useMemo`
**Why is the filtering so fast?**
Inside the hook, we use `useMemo`. This tells React: "Only recalculate the filtered list if the PGs or the filters actually change." This prevents the browser from doing the same work over and over on every minor re-render.

**Next Stop: [Level 5: Reusable UI Logic](05_reusable_ui_logic.md)**
