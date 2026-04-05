# Level 6: Aggregations & Geospatial (Expert Pipelines)

This level is the "Supreme Commander" of your database. When a simple `find()` isn't enough, we use **Aggregation Pipelines**.

## 🛠️ The `getAllPg` Controller — Dual Pipeline Paths

Not all sorts are created equal. Sorting by "Price" is fast; sorting by "Rating" is slow because the rating isn't in the PG document — it's in the `reviews` collection.

### Path 1: The Simple Path (Price/Default Sort)
If sorting by `price` or `newest`, we use a standard `PG.find(filter).sort(sort).skip(skip).limit(limit)`. This is highly optimized by MongoDB indexes.

---

### Path 2: The Aggregation Path (Rating/Reviews Sort)
If sorting by `rating` or `reviews`, we must "Join" the Review collection on-the-fly.

```javascript
[
  { $match: filter }, // 1. Filter out unwanted PGs
  { $lookup: { from: "reviews", localField: "_id", foreignField: "pg", as: "_reviews" } }, // 2. "INNER JOIN"
  { $addFields: { 
      avgRating: { $ifNull: [{ $avg: "$_reviews.star" }, 0] }, // 3. Compute stars
      reviewCount: { $size: "$_reviews" } // 4. Count stars
  }},
  { $sort: { avgRating: -1, _id: -1 } }, // 5. Finally, sort by the computed value
]
```

| Stage | Logic | Concept |
|:---|:---|:---|
| **$match** | Standard filter. **Strategy**: Always `$match` first to reduce the amount of data we join. | Filtering |
| **$lookup** | Corresponds to a SQL `JOIN`. It pulls every review associated with this PG. | Joins |
| **$addFields** | Creates new "Virtual Fields" mapping to existing data. This is how we get `avgRating`. | Computed Fields |

---

## 🌎 Geospatial Pipelines (`getNearbyPGs`)

This uses the **2dsphere index** to find PGs within a specific distance (e.g., 5km) of a latitude/longitude point.

### The `$geoNear` Stage (Constraints)
```javascript
{ $geoNear: {
    near: { type: "Point", coordinates: [Number(lng), Number(lat)] },
    distanceField: "distance", // Adds "distance" value (in meters) to result
    maxDistance: radius * 1000, // Search within X meters
    query: filter, // Apply filters (gender, food, etc.) INSIDE the geo search
}}
```
- **Rule**: `$geoNear` **MUST** be the very first stage in an aggregation pipeline. It cannot follow any other stage. 

---

## 📈 The `$facet` Power Stage (Efficiency)

Both pipelines conclude with a `$facet` stage. This is a "Split-Brain" execution.

```javascript
{ $facet: {
    metadata: [{ $count: "totalCount" }], // Task A: Count everything
    data: [{ $skip: skip }, { $limit: limit }] // Task B: Get the current page
}}
```
- **Why?** Ordinarily, you'd need two separate database queries: one to count the total and one to get the results. `$facet` runs them **in parallel** in a single round-trip, significantly boosting performance.

---

## 💡 Key Concept: Data Normalization
After a `$lookup` and `$addFields`, your object is bloated with a `_reviews` array that the frontend doesn't need. 
- **Pattern**: `const pgs = result.data.map(({ _reviews: _r, ...pg }) => pg);` 
- **Logic**: Use "Destructuring" and the "Rest" operator `...` to strip away the bulky `_reviews` data before sending the final response.

**Next Stop: [Level 7: Booking Lifecycle](07_booking_lifecycle.md)**
