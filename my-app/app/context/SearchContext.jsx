"use client"; // Context requires React memory, so it must be a client component.

import { usePathname } from "next/navigation";
import { createContext, useState, useContext, useEffect, useRef } from "react";
// 1. Create the empty cloud folder

const SearchContext = createContext();
// 2. Create the Provider (The Wrapper)

export function SearchProvider({ children }) {
  // Create the state: 'query' holds the text, 'setQuery' is the remote control to change it
  const [query, setQuery] = useState("");
  const pathname = usePathname();
  const isFirst = useRef(true);

  useEffect(()=>{
     if (isFirst.current) { isFirst.current = false; return; } // skip mount
    setQuery("");                                               // only on actual nav

  },[pathname]);
  
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
