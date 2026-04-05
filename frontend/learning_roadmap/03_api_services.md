# Level 3: API Services & Data Fetching

This level explains how the frontend talks to your backend server. We use a **Service Layer** approach to keep your code clean and manageable.

## 📡 The Service Layer (`lib/api/`)
Instead of writing `fetch("url/api/...")` inside every component, we centralize all logic in one folder. This makes fixing errors or updating API URLs instant.

| Service File | Responsibilities | Key Concept |
| :--- | :--- | :--- |
| `lib/api/auth.js` | Login, Signup, OTP Verification. | **Request Body Mapping** |
| `lib/api/pg.js` | Fetching PGs, CRUD operations for listings. | **Filtering & Sorting API** |
| `lib/api/user.js` | Profile updates, dashboard stats. | **Authenticated Requests** |
| `lib/api/booking.js`| Creation and status management of bookings. | **State Transitions** |
| `lib/api/review.js` | Fetching and posting review data. | **Aggregated Ratings** |
| `lib/api/image.js` | Handling Multi-part form data for uploads. | **Blob/File Management** |
| `lib/api/roomType.js`| Managing specific room configuration logic. | **Nested CRUD** |

## 🛡️ Authenticated Requests & JWT
Most files here use a standard pattern:
1. Get the `token` from `localStorage`.
2. Attach it to the `Authorization: Bearer <TOKEN>` header.
3. Send the request.

---

## 💡 Key Concept: Centralized API Clients
By using `pgApi.getById(id)` instead of writing raw fetch logic:
- Your components stay "clean" (UI only).
- Your API logic is "testable" (Logic only).
- **Data Consistency**: If the backend API changes from `/api/v1` to `/api/v2`, you only change it in one folder.

**Next Stop: [Level 4: Custom Hooks](04_custom_hooks.md)**
