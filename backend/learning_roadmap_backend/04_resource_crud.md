# Level 4: Resource Management (CRUD & Pricing Logic)

This level covers how we manage PGs and their sub-resources, like **Room Types**, which contain the most critical inventory logic.

## 🏗️ The PG Controller (`controllers/pg.js`)

PG management is standard CRUD, but with a **Geospatial Hook**:
- When a PG is registered, we convert the incoming `coordinate` array `[lng, lat]` into a proper **GeoJSON Point** before saving. This is "Server-Side Data Hygiene."

---

## 🏢 The RoomType Controller (`controllers/roomType.js`) — Heavy Logic

This is where the **Inventory Guard** and **Pricing Sync** live.

### 1. Capacity Guard (`createRoomType`)
Before adding a new room type, we sum every existing active room type's `availableRooms`.
```javascript
const alreadyAllocated = existingRoomTypes.reduce((sum, rt) => sum + rt.availableRooms, 0);

if (alreadyAllocated + req.body.availableRooms > pg.room) {
  return res.status(400).json({
    message: `Only ${pg.room - alreadyAllocated} rooms remaining to allocate`
  });
}
```
- **Why?** It's impossible to allocate 12 rooms if the PG only has 10 total. This `reduce()` logic prevents data corruption at the entry point.

### 2. Cascading Price Sync
When a new room type is created, we check if its price is lower than the PG's current base price.
```javascript
await PG.findByIdAndUpdate(req.body.pg, {
  isActive: true, // "Wake up" the PG as soon as a room is added
  ...(roomType.price < pg.price && { price: roomType.price }),
});
```
- **Spread Syntax Hook**: `...(cond && { key: val })` is a clean way to conditionally add properties to an object. If the new room is cheaper, the PG's searchable `price` updates instantly.

### 3. Change Reconciliation (`updateRoomType`)
If an owner wants to **reduce** the number of available rooms, we first check if the new capacity can still fit the currently **occupied beds**.
```javascript
const newTotalBeds = req.body.availableRooms * roomType.sharingCount;
if (newTotalBeds < roomType.occupiedBeds) {
  return res.status(400).json({ message: `Cannot reduce. ${roomType.occupiedBeds} beds occupied...` });
}
```
- **Logic**: You can't delete a room if someone is already sleeping in it!

### 4. Soft Delete (`deleteRoomType`)
We never `RoomType.deleteOne()`. We set `isActive: false`.
- **Reason**: We need to keep the record for historical bookings. If you delete the document, the "Booking History" page for guests will crash because the `roomType` ID will point to nothing.

---

## 📈 Collective Price Recalculation
After any room type is updated or deleted, we re-scan the entire PG's room inventory to find the **new minimum price**.
```javascript
const allRoomTypes = await RoomType.find({ pg: roomType.pg._id, isActive: true });
const minPrice = Math.min(...allRoomTypes.map((r) => r.price));
await PG.findByIdAndUpdate(roomType.pg._id, { price: minPrice });
```
- **Math.min(...spread)**: This is how we efficiently find the lowest number in an array. The PG's `price` field is a "Derived Field" — it depends on its children.

---

## 💡 Key Concept: Derived Fields
Fields like `PG.price` are stored in the database but managed by the application logic, not user input. This makes search queries extremely fast because the database doesn't have to "calculate" anything during a filter — it just reads the stored `price`.

**Next Stop: [Level 5: Query Filtering](05_query_filtering.md)**
