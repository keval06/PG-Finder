# Level 5: Dynamic Query Filtering (Scaling the Search)

How do we build a search query that handles 10+ different filters at the same time? We use a **Dynamic Filter Object**.

## 🛠️ The Search Builder (`buildPGQuery`) — Expert Logic

This helper function in `controllers/pg.js` translates URL parameters (like `?minprice=5000&gender=male`) into a MongoDB `$match` object.

### 1. Regex Search (`$regex`)
```javascript
if (query.q) {
  const searchRegex = { $regex: query.q, $options: "i" };
  filter.$or = [{ name: searchRegex }, { city: searchRegex }];
}
```
- **Concept**: **Fuzzy Search**. This allows a user to type "Mum" and match "Mumbai" or "The Mumbai PG" without needing a perfect match. The `$options: "i"` flag makes it case-insensitive.

### 2. Parameter Parsing (`parseParam`)
URL parameters can arrive as a string (`"wifi,parking"`) or an array (`["wifi", "parking"]`).
- **Logic**: We use a `parseParam` helper to normalize both into a clean JavaScript array before passing to MongoDB.

### 3. `$in` (Matching Any) vs `$all` (Matching All)
```javascript
// Gender: MUST match one of the selected genders
if (genders.length > 0) filter.gender = { $in: genders };

// Amenities: MUST match every selected amenity
if (amenitiesList.length > 0) filter.amenities = { $all: amenitiesList };
```
- **Why?** If a user filters for "Male" and "Mix", they want PGs that are *either* male or mix. But if they filter for "WiFi" and "AC", they want PGs that have **both** features.

### 4. The Infinity Guard
```javascript
// FIX: ignore maxprice if it's "Infinity" (sent by "Above ₹15,000" filter)
if (query.maxprice && query.maxprice !== "Infinity") {
  filter.price.$lte = Number(query.maxprice);
}
```
- **Logic**: The frontend "Above ₹15,000" filter sends `maxprice=Infinity`. If we pass the string `"Infinity"` to `Number()`, it becomes `NaN`. This guard prevents a corrupt filter from breaking the search.

---

## 📈 Pagination (The 101% Rule)
```javascript
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 10;
const skip = (page - 1) * limit;
```
- **Skip & Limit**: We never return 1,000 PGs at once. This avoids "The White Screen of Death" by only loading a small "slice" of data.

---

## 💡 Key Concept: Server-Side Filtering
Always filter at the **Database level** (using MongoDB queries), never at the **App level** (using JS `.filter()`).
- **Why?** Filtering 1,000,000 PGs in JavaScript would crash your server. Doing it in MongoDB uses Indices, making it take milliseconds.

**Next Stop: [Level 6: Aggregations & Geospatial](06_aggregations_geospatial.md)**
