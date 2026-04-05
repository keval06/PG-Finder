# Level 7: Booking Lifecycle & State Machine (ACID Logic)

How do we create a bulletproof booking system? We use **ACID Transactions**. This is the highest level of database integrity.

## 🔐 The Booking Controller (`controllers/booking.js`)

Transactions ensure your data is NEVER corrupted. If the server crashes during a booking, either the booking is created AND the bed count is updated, or NEITHER happens.

### 1. `startTransaction()` Pattern
```javascript
const session = await mongoose.startSession();
session.startTransaction();
try {
  // 1. Create Booking doc
  // 2. Increment RoomType.occupiedBeds
  // ... all use { session }
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction(); // Roll back EVERYTHING if one fails
} finally {
  session.endSession();
}
```

---

### 2. Guard Logic (The 3 Checkpoints)

Before a booking is created, it must pass 3 critical guards:

- **Check-In/Out Date Validation**: `new Date(out) <= new Date(in)` = **Denied**. This prevents time-traveling bookings.
- **Bed Availability**: `remainingBeds = totalBeds - occupiedBeds`. If `< 1`, we abort.
- **Duplicate Prevention**: We use `$nin: ["cancelled", "completed"]` statuses.
    - **Logic**: You can book the same room type twice, but ONLY if your previous booking was cancelled or already finished. This prevents "Ghost Overlaps."

---

### 3. Bed Reconciliation (`updateBooking`)

When a guest **cancels**, we must **decrement** the `occupiedBeds` in the `RoomType`.

```javascript
if (req.body.status === "cancelled" && existing.status !== "cancelled") {
  await RoomType.findByIdAndUpdate(existing.roomType, { $inc: { occupiedBeds: -1 } }, { session });
}
```
- **Checkpoint**: If they Re-Confirm a previously cancelled booking, we **must** re-check if the bed is still available before incrementing again. This is "Race Condition Prevention."

---

## 📅 Received Bookings (The Owner View)

How does an owner see only their own PGs' bookings? We use a **Two-Tier Fetch**.

1.  **Step 1**: Find all PGs where `owner: req.user._id`.
2.  **Step 2**: Map those PGs to their `_ids`.
3.  **Step 3**: `Booking.find({ pg: { $in: pgIds } })`. 

- **Concept**: **Cross-Collection Population**. We use `.populate("user", "name mobile")` to join the guest's contact info into the booking result.

---

## 💡 Key Concept: Why Atomic Increments?
We use `{ $inc: { occupiedBeds: 1 } }` instead of `roomType.occupiedBeds = roomType.occupiedBeds + 1`. 
- **Reason**: Atomic increments are **thread-safe**. If two users book at the same millisecond, MongoDB will queue the increments correctly. If you manually set the value, they might overwrite each other.

**Next Stop: [Level 8: System Maintenance](08_maintenance_migrations.md)**
