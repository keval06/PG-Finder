# Level 2: Global State & Auth Flow

This level explains how your application handles user security and "remembers" information across every page.

## 🧠 Why Context API?
React normally passes data from parent to child via **Props**. However, some data (like user login status) is "Universal." Instead of passing it manually through every component, we "broadcast" it using a **Context Provider**.

### 1. `app/context/AuthContext.jsx`
The "Security Guard" of your app.
- **Concepts**: `useState`, `createContext`, `useContext`.
- **Logic**: It reads from `localStorage` on page load to see if you are logged in.

### 2. `app/auth/login/page.js` & `app/auth/signup/page.js`
The "Entrance Gates" of your application.
- **Concepts**: Controlled Forms, API Integration.
- **Logic**: These pages manage the user input, talk to `authApi`, and then update the `AuthContext` if successful.
- **Data Consistency**: They bridge the gap from "Guest" to "Logged in User."

### 3. `app/context/SearchContext.jsx`
The "Universal Listener."
- **Concepts**: Shared state for the Search input in the Navbar.
- **Logic**: Any text typed in the `Navbar.jsx` input is saved here, allowing any page to instantly react to your search query.

---

## 💡 Key Concept: Hydration & Persistent State
**Why does the login stay active even if I refresh the page?**
`AuthContext` uses `useEffect` to check `localStorage` every time the app starts. This bridge between "Temporary State" and "Permanent Browser Storage" is essential for professional applications.

**Next Stop: [Level 3: API Services](03_api_services.md)**
