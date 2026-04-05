# Level 7: Feature Hub — Owner Hub (Inventory & Mapping)

This level covers the complex logic of creating a listing, managing room allocations, and pinning your building on a map.

## 📝 The Listing Form (`PGForm.jsx`)

The PG listing form is 600+ lines. It handles three distinct logical domains.

### 1. Leaflet Map Integration (New Map)
We use **React Leaflet** inside the form to let owners "Pin" their location.
```javascript
const handleMapClick = (e) => {
  const { lat, lng } = e.latlng;
  set("coordinate", [lng, lat]); // Save immediately to form state
}
```
- **SSR Warning**: Map libraries require the `window` object. If you don't use `dynamic(() => ..., { ssr: false })`, the Next.js server will crash during build. 
- **Reverse Geocoding**: When you click the map, we call the **Nominatim (OpenStreetMap) API** to convert the coordinates into a human-readable address. This saves the owner from typing their full address manually!

### 2. Live Allocation Check
Before you save, the form calculates if your room types "Fit" in the building.
- **Logic**: `allocated = roomTypes.reduce((s, rt) => s + Number(rt.availableRooms), 0)`.
- **Validation**: If `allocated > totalRooms`, the "Save" button is blocked and a red warning appears. This is "Client-Side Data Integrity."

### 3. Dynamic Room Type Management
Owners can add and remove multiple "Room Type" blocks (e.g., Single vs Double sharing).
- **Unique State**: Each block has its own local state. We use an array of objects `[{ name: "Deluxe", price: 8000, ... }]` and map through them to render the forms.
- **Removal Tracking**: If you delete an existing room type, we track its ID in a `removedIds` array so the backend knows which records to de-activate.

---

## 📅 Received Bookings Hub

This page uses the **StatusBadge** component and the **FilterPanel** to manage incoming requests. 
- **Concept**: **Dashboard Partitioning**. The guest and owner share the same "Booking" data models but have completely different UI views.

---

## 💡 Key Concept: Debounced Search Suggestions
The address field in the form has an **Autocomplete** feature.
- **Problem**: Calling an API on every keystroke is slow.
- **Solution**: `setTimeout(..., 400)`. If a user is typing fast, we clear the timer on every keystroke. We only execute the search when they stop for 400ms. This is the "Debounce" pattern.

**Next Stop: [Level 8: Advanced Routing](08_advanced_routing.md)**
