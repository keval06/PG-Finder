# Level 1: Models & Schemas (The Database Design)

In this level, we define the "Shape" of our data. Mongoose schemas are the blueprint for your MongoDB collections.

## 🏗️ The PG Model (`models/pg.js`)

This is the most complex model in the system. It handles everything from pricing to geospatial coordinates.

### 1. Key Fields
- **owner**: A Reference to the User model. `required: true`.
- **coordinate**: Uses the **GeoJSON Point** format.
    - `type`: Must be `"Point"`.
    - `coordinates`: An array of `[longitude, latitude]`. 
    - **Crucial**: MongoDB requires `[longitude, latitude]` order, even though most maps use `[lat, lng]`.
- **isActive**: A boolean flag. If `false`, the PG is hidden from search results (used during soft-delete of all room types).

### 2. Enums for Data Integrity
We use `enum` to restrict values for `gender`, `food`, and `amenities`. This prevents typos like "WiFi" vs "wifi" from breaking your search filters.

### 3. Indices (Performance)
```javascript
pgSchema.index({ city: 1, gender: 1, price: 1, isActive: 1 });
pgSchema.index({ coordinate: "2dsphere" });
```
- **Compound Index**: Optimizes the "Home Page" query which filters by multiple fields at once.
- **2dsphere Index**: Enables advanced geospatial queries like `$near` and `$geoNear`.

---

## 🏢 The RoomType Model (`models/roomType.js`)

Room types are sub-resources of a PG. A single PG can have "Classic", "Luxury", and "Executive" rooms.

- **sharingCount**: How many people per room (1, 2, 3...).
- **availableRooms**: How many rooms of this type exist in the PG.
- **occupiedBeds**: Tracks live occupancy. **Business Logic**: This is automatically incremented/decremented during the Booking lifecycle.
- **isActive**: Used for soft-deletion.

---

## 📅 The Booking Model (`models/booking.js`)

Tracks the relationship between a User, a PG, and a RoomType.

- **status**: `pending`, `confirmed`, `cancelled`, or `completed`.
- **amount**: Total price paid for the duration.
- **dates**: `checkInDate` and `checkOutDate`.

---

## 💡 Key Concept: Why GeoJSON?
Using a standard GeoJSON Point allow us to use MongoDB's native spatial operators. This is how "Near Me" and "Search by Radius" work efficiently with millions of documents.

**Next Stop: [Level 2: Middleware & Security](02_middleware_security.md)**
