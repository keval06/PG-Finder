# Level 6: Feature Hub — The Home Page (Geospatial Mastery)

This level explains the most complex interaction on your site: browsing, filtering, and the interactive map — including **Browser Geolocation** and **Marker Clustering**.

## 🏠 Home Page Orchestration (`HomeClient.jsx`)

The Home page acts as a "State Controller" that synchronizes the URL, the Filter Panel, and the Map.

### 1. URL State Synchronization (`useSearchParams`)
The true source of truth is the **URL bar**. 
- **Logic**: When a user changes a filter (e.g., price), the `useEffect` trigger a `router.push()` with a new search query.
- **Benefits**: Users can copy the URL and send it to a friend, and the friend will see the exact same filtered results.
- **Debounced Sync**: We use a `setTimeout(..., 400)` before pushing. This prevents the page from reloading if a user typed "Mumb" but isn't finished yet.

### 2. Browser Geolocation ("Near Me")
```javascript
navigator.geolocation.getCurrentPosition(
  (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
  (err) => setLocationError(errorMessages[err.code])
);
```
- **Pattern**: **Native Browser API**. We don't use a third-party library for this. It triggers the browser's permission pop-up automatically. 
- **Radius Search**: Once a location is set, the API call includes a `radius` parameter (default 5km), which triggers the backend's `$geoNear` aggregation.

---

## 🌎 The Map View (`HomeMap.jsx`)

We use **React Leaflet** for mapping. It is a lightweight, open-source alternative to Google Maps.

### 1. Geospatial Concepts (Points & Clusters)
- **$geoNear Data**: We use a `getLatLng` helper to normalize coordinates from GeoJSON Points `{coordinates: [lng, lat]}` to Leaflet's `[lat, lng]`.
- **Marker Clustering**: `MarkerClusterGroup` groups pins that are too close together into a single "bubble" with a count. This prevents the map from looking cluttered in dense cities.

### 2. Custom Map States
- **Fullscreen Mode**: Clicking "Expand" toggles a CSS fixed-position layout.
- **Map Reflow**: Changing from a small to large container requires a `map.invalidateSize()` call. Without this, the map tiles will look gray or "broken" until you manually resize the window.
- **The "User Dot"**: We created a custom CSS dot (`userDotIcon`) to distinguish the user's live position from the PG listing pins.

---

## 🖼️ The Pin Popup (`InfoCard.jsx`)

When you click a map pin, an `InfoCard` appears at the bottom of the map.
- **Interactive Sliding**: It fetches images for that specific PG only when the pin is clicked.
- **Logic**: `useEffect(..., [activePin._id])`. Every click triggers a fresh fetch of gallery images, ensuring the popup is always up-to-date.

---

## 💡 Key Concept: Responsive Layout Logic
The Home Page has two layouts in one file:
- **Desktop**: A `1/2` split with a `sticky` map on the right.
- **Mobile**: A `fixed` map at the top (`35vh`) and a scrollable PG list at the bottom.
- **Why?** This ensures map interaction is always available on small screens without making the list unreadable.

**Next Stop: [Level 7: Feature Hub - Owner Hub](07_owner_hub.md)**
