# Level 8: System Maintenance & Data Migrations

How do we fix data that's already in the database? We use **Maintenance Scripts**. 

## 🔄 The `migrateCoords.js` Script

When the system was first built, coordinates were stored as flat arrays `[lng, lat]`. To use `$geoNear`, we had to migrate them to **GeoJSON point** format.

### 1. The Backup Stage
The first rule of maintenance is: **Never migrate without a backup!**
```javascript
await pgsColl.aggregate([{ $match: {} }, { $out: { db: "pgfinder", coll: `pgs_backup_${Date.now()}` } }]).toArray();
```
- **Operator**: `$out` creates a **cloned collection** in one command. It's the most efficient way to backup 10,000+ documents before a risky operation.

### 2. Intelligent Orientation Detection
 India's latitude is between ~8 and ~37. If the number is > 60, it's almost certainly **longitude**.
- **Logic**: `const [lat, lng] = a < 60 ? [a, b] : [b, a]`. This code "heals" the data by automatically detecting if the developer swapped the order during a previous bulk import.

### 3. Schema Transformation
We use `$set` to transform the field into a GeoJSON Object.
```javascript
$set: { coordinate: { type: "Point", coordinates: [lng, lat] } }
```

### 4. Indexing Strategy
A geospatial query will **crash** if you haven't created a `2dsphere` index.
- **Rule**: `await pgsColl.createIndex({ coordinate: "2dsphere" });` is the final step in any coordinate migration.

---

## 🛠️ The `fixJson.js` Script

If your raw JSON data has formatting errors or missing fields (like `isActive`), this script bulk-updates the entire collection to ensure **Schema Compliance**.

- **Pattern**: **Batch Updates**. This script uses `for` loops with `updateOne()` to ensure each document is independently validated against the Mongoose models.

---

## 💡 Key Concept: Schema Evolution
Your database will change over time. Maintenance scripts allow you to upgrade your data structure without needing to delete and start over. 

**Conclusion: You are now 101% Mastered in the Backend Architecture!**
