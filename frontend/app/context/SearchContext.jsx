"use client"; // Context requires React memory, so it must be a client component.

import { usePathname, useSearchParams } from "next/navigation";
import { createContext, useState, useContext, useEffect } from "react";

const SearchContext = createContext();
// 2. Create the Provider (The Wrapper)

export function SearchProvider({ children }) {
  // Create the state: 'query' holds the text, 'setQuery' is the remote control to change it
  const [query, setQuery] = useState("");
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Sync the search bar with the URL's ?q= parameter on every navigation.
  // This makes the search bar reflect the active search term at all times.
  useEffect(() => {
    const urlQuery = searchParams.get("q") ?? "";
    setQuery(urlQuery);
  }, [pathname, searchParams]);

  return (
    // We wrap all children inside the Provider.
    // We pass the query and setQuery tools into the folder so anyone wrapped can use them.
    <SearchContext.Provider value={{ query, setQuery }}>
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
