"use client";

import { createContext, useState, useContext } from "react";

const SearchContext = createContext();

export function SearchProvider({ children }) {
  const [query, setQuery] = useState("");
  return (
    <SearchContext.Provider value={{ query, setQuery }}>
      {children}
    </SearchContext.Provider>
  );
}

// ?custom hook, whoever use useSearch() 
// can access the query and setQuery, to access the cloud
export function useSearch(){
    return useContext(SearchContext);
}
