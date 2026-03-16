import Navbar from "./components/Navbar";
import { SearchProvider } from "./context/SearchContext";
import { AuthProvider } from "./context/AuthContext";
import "./globals.css";

export const metadata = { title: "PGFinder — Find Your Perfect PG" };

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