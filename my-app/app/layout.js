import Navbar from "./components/Navbar";
import { SearchProvider } from "./context/SearchContext";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SearchProvider>
          <Navbar />
          {children}{" "}
          {/*The {children} prop here represents your 
page.js
 (The Home Page). */}
        </SearchProvider>
      </body>
    </html>
  );
}
