import Navbar from "../components/Navbar";
import { SearchProvider } from "./context/SearchContext";
import { AuthProvider } from "./context/AuthContext";
import "./globals.css";
// ?Next.js's special file — it's the permanent frame around every page.
// ?This is a React Server Component by default in Next.js.
// ?=Server Component → runs on the SERVER, not the browser
//  ?                  → no useState, no useEffect, no onClick
//  ?              → just renders HTML structure
// ?The layout doesn't know or care which page it is. It just renders it inside the frame.


export const metadata = {
  title: "PGFinder — Find Your Perfect PG",
  description: "Find your perfect PG accommodation",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f8fafc]">

        <AuthProvider>
          <SearchProvider>
            <Navbar />
            {children}
          </SearchProvider>
        </AuthProvider>
        
      </body>
    </html>
  );
}
