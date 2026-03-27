require('dotenv').config();
const mongoose = require('mongoose');

async function checkBounds() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');
    const db = mongoose.connection.db;
    const pgsColl = db.collection('pgs');
    
    // Find all that have coordinate array
    const pgs = await pgsColl.find({ coordinate: { $exists: true } }).toArray();
    
    let badCount = 0;
    
    for (const pg of pgs) {
      if (!Array.isArray(pg.coordinate) || pg.coordinate.length !== 2) {
         badCount++;
         console.log(`Fixing PG ${pg._id} (${pg.name})... Setting to Delhi coords (Not a size 2 array)`);
         await pgsColl.updateOne({ _id: pg._id }, { $set: { coordinate: [77.209, 28.6139] } });
         continue;
      }
      
      const lng = pg.coordinate[0];
      const lat = pg.coordinate[1];
      
      let isBad = false;
      if (typeof lng !== 'number' || typeof lat !== 'number' || isNaN(lng) || isNaN(lat) || lng === null || lat === null) {
          console.log(`PG ${pg._id} has non-numeric type`); isBad = true;
      } else {
          if (lng < -180 || lng > 180) { 
            console.log(`PG ${pg._id} (${pg.name}) has bad lng: ${lng}`); 
            isBad = true; 
          }
          if (lat < -90 || lat > 90) { 
            console.log(`PG ${pg._id} (${pg.name}) has bad lat: ${lat}`); 
            isBad = true; 
          }
      }
      
      if (isBad) {
         badCount++;
         console.log(`Fixing PG ${pg._id}... Setting to Delhi`);
         await pgsColl.updateOne({ _id: pg._id }, { $set: { coordinate: [77.209, 28.6139] } });
      }
    }
    
    console.log(`Fixed ${badCount} bad PGs! Retrying Index Creation...`);
    
    try {
      await pgsColl.createIndex({ coordinate: "2dsphere" });
      console.log('✅ 2dsphere index created successfully!');
    } 
    catch (indexErr) {
       console.error('Index error message:', indexErr.message);
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Script failed:', err.message);
    process.exit(1);
  }
}

checkBounds();
