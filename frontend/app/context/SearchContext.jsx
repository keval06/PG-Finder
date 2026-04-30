"use client"; // Context requires React memory, so it must be a client component.

import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { createContext, useState, useContext, useEffect } from "react";

const SearchContext = createContext();
// 2. Create the Provider (The Wrapper)

export function SearchProvider({ children }) {
  // Create the state: 'query' holds the text, 'setQuery' is the remote control to change it
  const [query, setQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filterCount, setFilterCount] = useState(0);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter(); // Added router for URL manipulation

  // Derive a primitive string so the useEffect dependency works reliably
  const qParam = searchParams.get("q") ?? "";

  // 1. Sync URL -> Local State (Handles initial load & Browser Back Button)
  useEffect(() => {
    // Only update if they differ to prevent infinite loops and flickering
    if (qParam !== query) {
      setQuery(qParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qParam]);

  // 2. Sync Local State -> URL (Debounced by 500ms)
  useEffect(() => {
    // Don't push to URL if they are already identical
    if (query === qParam) return;

    // Wait 500ms after the user stops typing before pushing to the URL
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (query) {
        params.set("q", query);
      } else {
        params.delete("q");
      }
      // Use router.replace to avoid clogging up the back-button history with every keystroke
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 500);

    // Cleanup function cancels the timeout if the user types again before 500ms is up
    return () => clearTimeout(timeoutId);
  }, [query, pathname, router, searchParams, qParam]);

  return (
    // We wrap all children inside the Provider.
    // We pass the query and setQuery tools into the folder so anyone wrapped can use them.
    <SearchContext.Provider
      value={{
        query,
        setQuery,
        drawerOpen,
        setDrawerOpen,
        filterCount,
        setFilterCount,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

// 3. Create a Custom Hook (The Shortcut)

// ?custom hook, whoever use useSearch()
// can access the query and setQuery, to access the cloud
export function useSearch() {
  return useContext(SearchContext);
}
