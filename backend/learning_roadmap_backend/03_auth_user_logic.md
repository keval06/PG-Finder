# Level 3: Auth & Identity (Identity Hub)

This level explains the "Logical Gates" for your users—how they win access to the site and how they manage their profiles.

## 🛡️ Authentication Flow
We use standard `JWT` flows to ensure that a user only has to log in once.

### Controllers & Routes (Zero Skips)
| File | Logic | Concept |
| :--- | :--- | :--- |
| `controllers/authController.js` | Login, Signup, OTP logic. | **Identity Consolidation** |
| `routes/authRoutes.js` | Public endpoints for `/login`. | **RESTful Routing** |
| `utils/generateToken.js` | Signs the JWT with your secret key. | **Token Signing** |
| `controllers/user.js` | Profile updates and personal settings. | **Self-Management CRUD** |

## 💡 Key Concept: Identity Logic
Inside `authController.js`, we use `bcrypt` to compare passwords. We **never** store "Plain Text" passwords. By saving only the hash, we ensure that even if our database was compromised, your users' actual passwords would remain secret.

---

## 💡 Key Concept: JWT Lifecycle
1. **Frontend**: Sends mobile + password.
2. **Backend**: Validates, hashes, compares.
3. **Backend**: If correct, generates a token using `generateToken.js`.
4. **Frontend**: Saves that token in `localStorage` for all future requests.

**Next Stop: [Level 4: Resource CRUD](04_resource_crud.md)**
