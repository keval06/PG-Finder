require("dotenv").config();
const mongoose = require("mongoose");

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const pgsColl = db.collection("pgs");

  // 1. BACKUP — same database, new collection
  console.log("📦 Backing up...");
  await pgsColl
    .aggregate([
      { $match: {} },
      { $out: { db: db.databaseName, coll: `pgs_backup_${Date.now()}` } },
    ])
    .toArray();
  console.log("✅ Backup done.");

  // 2. MIGRATE — only old flat array docs, convert to GeoJSON
  console.log("🔄 Migrating...");
  const pgs = await pgsColl
    .find({
      "coordinate.type": { $exists: false }, // only un-migrated
    })
    .toArray();

  let count = 0;
  for (const pg of pgs) {
    const [a, b] = pg.coordinate;
    // India: lat ~8–37, lng ~68–97
    const [lat, lng] = a < 60 ? [a, b] : [b, a]; // safe detection
    await pgsColl.updateOne(
      { _id: pg._id },
      { $set: { coordinate: { type: "Point", coordinates: [lng, lat] } } },
    );
    count++;
  }
  console.log(`✅ Migrated ${count} documents.`);

  // 3. INDEX
  await pgsColl.createIndex({ coordinate: "2dsphere" });
  console.log("✅ Index created.");

  process.exit(0);
}

migrate().catch((err) => {
  console.error("❌ Failed:", err);
  process.exit(1);
});
