import { Suspense } from "react";
import Navbar from "../components/Navbar";
import { SearchProvider } from "./context/SearchContext";
import { AuthProvider } from "./context/AuthContext";
import "./globals.css";
import MapProvider from "../components/MapProvider";
import Script from "next/script";
// ?Next.js's special file — it's the permanent frame around every page.
// ?This is a React Server Component by default in Next.js.
// ?=Server Component → runs on the SERVER, not the browser
//  ?                  → no useState, no useEffect, no onClick
//  ?              → just renders HTML structure
// ?The layout doesn't know or care which page it is. It just renders it inside the frame.

export const metadata = {
  title: "QuickPG — Find Your Perfect PG",
  description: "Find your perfect PG accommodation",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="beforeInteractive" />
        <MapProvider>
          <AuthProvider>
            <Suspense fallback={null}>
              <SearchProvider >
                <Navbar />
                {children}
              </SearchProvider>
            </Suspense>
          </AuthProvider>
        </MapProvider>
      </body>
    </html>
  );
}
