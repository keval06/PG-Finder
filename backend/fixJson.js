const fs = require("fs");

const raw = fs.readFileSync('../data/test.pgs.json', 'utf-8');
const pgs = JSON.parse(raw);

//Migrate to GeoJSON

const fixed = pgs.map((pg) => {
  if (Array.isArray(pg.coordinate)) {
    pg.coordinate = {
      type: "Point",
      coordinates: pg.coordinate,
    };
  }
  return pg;
});

//save fixed data
fs.writeFileSync('../data/test.pgs.json', JSON.stringify(fixed, null, 2));

console.log("✅ test.pgs.json successfully updated to GeoJSON format!");
