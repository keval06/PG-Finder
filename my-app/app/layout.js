import Navbar from "./components/Navbar";
import { SearchProvider } from "./context/SearchContext";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SearchProvider>
          <Navbar/>
          {children}
        </SearchProvider>
      </body>
    </html>
  );
}
