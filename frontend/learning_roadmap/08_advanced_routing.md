# Level 8: Advanced Routing (Detail Pages & Interactions)

This level covers the "Next Generation" of routing in your app: dynamic parameters, auth-guarded navigation, and external map integration.

## 🏢 The PG Detail Page (`app/pg/[id]/page.js`)

Detail pages are dynamic. The `[id]` folder pattern tells Next.js to grab the ID from the URL and pass it to your component.

### 1. The Detail Page Orchestrator
- **PGDetailClient**: This component acts as the main container. It fetches the PG data and splits it into the image gallery, room type list, and reviews.

---

## 🌎 Advanced Map Integration (`PGLocationMap.jsx`)

Even though we use Leaflet for the display, we bridge it to Google Maps for the actual navigation.

### 1. The "Directions" Bridge
```javascript
const handleGetDirections = () => {
  navigator.geolocation.getCurrentPosition((p) => {
    window.open(`https://www.google.com/maps/dir/?api=1&origin=${p.coords.latitude},${p.coords.longitude}&destination=${pos[0]},${pos[1]}`);
  });
}
```
- **Logic**: This takes the owner's pinned coordinate from your database and the user's live GPS from the browser. It then "Hands Off" the routing task to Google's specialized map app. This is "Ecosystem Integration."

---

## 🛠️ Specialized UI Components

We've added three new navigation atoms to improve the user experience:

| Component | Logic | Concept |
| :--- | :--- | :--- |
| `BackButton.jsx` | Uses `router.back()` | Navigates the user to their **previous** page, preserving their search filters instead of starting over. |
| `BookNowButton.jsx` | Auth-Guarded Navigation | If `!user`, it redirects to `/auth/login`. If a user exists, it proceeds directly to the `/book` page. |
| `PGLocationMapWrapper.jsx` | Dynamic Client Import | A simple wrapper that forces Leaflet to only load in the browser, preventing server-side errors. |

---

## 💡 Key Concept: Dynamic Steppers (`StepperBar.jsx`)
On the booking page, we use a "Step-by-Step" UI.
- **Why?** It reduces "Cognitive Load." Instead of showing a massive form, we ask for:
    1. Select Room Type.
    2. Review Details.
    3. Final Confirmation.

**Next Stop: [Level 9: UI Resilience](09_resilience_nextjs.md)**
