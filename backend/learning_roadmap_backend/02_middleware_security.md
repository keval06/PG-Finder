# Level 2: Middleware & Security Infrastructure

This level explains the "Logic Wrappers" that protect your server and handle global tasks like file uploads.

## 🛡️ The Security Layers (`middleware/`)
Middleware functions run "before" your logic to ensure everything is correct and safe.

| File | Responsibility | Key Concept |
| :--- | :--- | :--- |
| `middleware/protect.js` | Verifies JWT tokens from headers. | **Bearer Authentication** |
| `middleware/errorHandler.js`| Catches every crash in your app. | **Global Error Boundary** |
| `middleware/upload.js` | Configures Multer for image handling. | **Multipart Form Data** |
| `middleware/validate.js` | Ensures incoming data is complete. | **Schema-based Validation** |

### 1. `middleware/protect.js`
This is your most important security file. It extracts the token from `req.headers.authorization`, decodes it, and attaches the matching `user` to the `req` object.

### 2. `middleware/errorHandler.js`
Whenever you call `res.status(500)` or a JS error occurs, this file catches it. It ensures your client receives a clean JSON error message instead of a messy HTML console dump.

---

## 💡 Key Concept: The "req.user" Pattern
Notice how `protect.js` sets `req.user = user`. This is a classic Express pattern. Because this middleware runs first, **every** controller function that follows knows exactly who is making the request, without you having to re-fetch the user from the database!

**Next Stop: [Level 3: Auth & Identity](03_auth_user_logic.md)**
