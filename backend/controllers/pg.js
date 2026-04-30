const PG = require("../models/pg.js");
const RoomType = require("../models/roomType.js");

// *This is called Server-Side Filtering. Always filter at database level, not in JS.

// helper: builds filter object from URL params
//for pagination
const buildPGQuery = (query) => {
  const filter = {};

  // 🛡️ CENTRALIZED: Ensure we only show active PGs by default
  filter.isActive = { $ne: false };

  if (query.q) {
    const searchRegex = { $regex: query.q, $options: "i" };
    filter.$or = [{ name: searchRegex }, { city: searchRegex }];
  }

  const parseParam = (param) => {
    if (!param) return [];
    if (Array.isArray(param)) return param;
    return typeof param === "string" ? param.split(",") : [];
  };

  if (query.city) {
    filter.city = { $regex: query.city, $options: "i" };
  }

  if (query.gender) {
    const genders = parseParam(query.gender);
    if (genders.length > 0) filter.gender = { $in: genders };
  }

  if (query.food) {
    const foods = parseParam(query.food);
    if (foods.length > 0) filter.food = { $in: foods };
  }

  if (query.amenities) {
    const amenitiesList = parseParam(query.amenities);
    if (amenitiesList.length > 0) filter.amenities = { $all: amenitiesList };
  }

  if (query.minprice || query.maxprice) {
    filter.price = {};
    if (query.minprice) filter.price.$gte = Number(query.minprice);
    if (query.maxprice && query.maxprice !== "Infinity") {
      filter.price.$lte = Number(query.maxprice);
    }
  }

  return filter;
};

exports.registerPG = async (req, res) => {
  try {
    const existingPG = await PG.findOne({
      owner: req.user._id,
      name: req.body.name,
    });

    if (existingPG) {
      return res.status(400).json({
        message: "PG already exists",
      });
    }

    // This is called: Server-side Trust — never trust client-sent identity fields.
    const pgData = {
      // 🛡️ SECURITY: Prevent Mass Assignment
      name: req.body.name,
      price: Number(req.body.price),
      address: req.body.address,
      city: req.body.city,
      gender: req.body.gender,
      room: req.body.room,
      bathroom: req.body.bathroom,
      toilet: req.body.toilet,
      food: req.body.food,
      amenities: req.body.amenities,
      owner: req.user._id,
    };

    // 🌍 Sync with Frontend: Handle both Array [lng, lat] and GeoJSON Object
    if (req.body.coordinate) {
      if (
        Array.isArray(req.body.coordinate) &&
        req.body.coordinate.length === 2
      ) {
        pgData.coordinate = { type: "Point", coordinates: req.body.coordinate };
      } else if (req.body.coordinate.coordinates) {
        pgData.coordinate = req.body.coordinate; // Already Object format
      }
    }

    const pg = await PG.create(pgData);

    res.status(201).json(pg);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ all PGs with filtering + pagination
exports.getAllPg = async (req, res) => {
  try {
    const filter = buildPGQuery(req.query);

    const { sortField, sortOrder, minRating } = req.query;
    const sortDir = sortOrder === "desc" ? -1 : 1;
    const minRatingNum = Number(minRating) || 0;

    // FIX: always paginate — remove the old unpaginated fallback
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // rating/reviews sort OR minRating filter require aggregation (join with reviews)
    const needsAggregation =
      sortField === "rating" || sortField === "reviews" || minRatingNum > 0;

    // ── aggregation path ─────────────────────────────────────────────────
    if (needsAggregation) {
      const pipeline = [
        { $match: filter },
        {
          $lookup: {
            from: "reviews", // must match the actual MongoDB collection name
            localField: "_id",
            foreignField: "pg",
            as: "_reviews",
          },
        },
        {
          $addFields: {
            avgRating: { $ifNull: [{ $avg: "$_reviews.star" }, 0] },
            reviewCount: { $size: "$_reviews" },
          },
        },
      ];

      // Apply minRating filter AFTER computing avgRating
      if (minRatingNum > 0) {
        pipeline.push({ $match: { avgRating: { $gte: minRatingNum } } });
      }

      // Sort
      if (sortField === "rating") {
        pipeline.push({ $sort: { avgRating: sortDir, _id: -1 } });
      } else if (sortField === "reviews") {
        pipeline.push({ $sort: { reviewCount: sortDir, _id: -1 } });
      } else if (sortField === "price") {
        pipeline.push({ $sort: { price: sortDir, _id: -1 } });
      } else {
        pipeline.push({ $sort: { _id: -1 } }); // default: newest first
      }

      pipeline.push({
        // run totalCount and paginated slice in a single DB round-trip
        $facet: {
          metadata: [{ $count: "totalCount" }],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      });

      const [result] = await PG.aggregate(pipeline);
      const totalCount = result.metadata[0]?.totalCount || 0;

      // strip the temporary joined array before sending to client
      const pgs = result.data.map(({ _reviews: _r, ...pg }) => pg);

      return res.json({
        data: pgs,
        totalCount,
        page,
        totalPages: Math.ceil(totalCount / limit),
      });
    }

    // ── simple path (price or default sort, no minRating) ────────────────
    let sort = { _id: -1 }; // default: newest first
    if (sortField === "price") {
      sort = { price: sortDir, _id: -1 };
    }

    const totalCount = await PG.countDocuments(filter);
    const pgs = await PG.find(filter).sort(sort).skip(skip).limit(limit);

    return res.json({
      data: pgs,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  READ PGs within a radius (geospatial)
exports.getNearbyPGs = async (req, res) => {
  try {
    const {
      lng,
      lat,
      radius = 5,
      sortField,
      sortOrder,
      minRating,
      page = 1,
      limit = 10,
    } = req.query;

    if (!lng || !lat) {
      return res.status(400).json({
        message: "Latitude and longitude required",
      });
    }

    const radiusInMeters = Number(radius) * 1000;
    const filter = buildPGQuery(req.query);
    const minRatingNum = Number(minRating) || 0;

    const sortDir = sortOrder === "desc" ? -1 : 1;
    const skip = (Number(page) - 1) * Number(limit);
    const needsAggregation =
      sortField === "rating" || sortField === "reviews" || minRatingNum > 0;

    if (needsAggregation) {
      const pipeline = [
        {
          $geoNear: {
            near: { type: "Point", coordinates: [Number(lng), Number(lat)] },
            distanceField: "distance",
            maxDistance: radiusInMeters,
            query: filter,
          },
        },
        {
          $lookup: {
            from: "reviews",
            localField: "_id",
            foreignField: "pg",
            as: "_reviews",
          },
        },
        {
          $addFields: {
            avgRating: { $ifNull: [{ $avg: "$_reviews.star" }, 0] },
            reviewCount: { $size: "$_reviews" },
          },
        },
      ];

      // Apply minRating filter AFTER computing avgRating
      if (minRatingNum > 0) {
        pipeline.push({ $match: { avgRating: { $gte: minRatingNum } } });
      }

      // Sort
      if (sortField === "rating") {
        pipeline.push({ $sort: { avgRating: sortDir, _id: -1 } });
      } else if (sortField === "reviews") {
        pipeline.push({ $sort: { reviewCount: sortDir, _id: -1 } });
      } else if (sortField === "price") {
        pipeline.push({ $sort: { price: sortDir, _id: -1 } });
      }
      // else: default distance order from $geoNear

      pipeline.push({
        $facet: {
          metadata: [{ $count: "totalCount" }],
          data: [{ $skip: skip }, { $limit: Number(limit) }],
        },
      });

      const [result] = await PG.aggregate(pipeline);
      const totalCount = result.metadata[0]?.totalCount || 0;
      const pgs = result.data.map(({ _reviews: _r, ...pg }) => pg); // strip joined array

      return res.json({
        data: pgs,
        totalCount,
        page: Number(page),
        totalPages: Math.ceil(totalCount / Number(limit)),
      });
    }

    // ── Simple sort / Distance path (no minRating) ────────────────
    const pipeline = [
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [Number(lng), Number(lat)],
          },
          distanceField: "distance",
          maxDistance: radiusInMeters,
          query: filter,
        },
      },
    ];

    if (sortField === "price") {
      pipeline.push({ $sort: { price: sortDir, _id: -1 } });
    }

    // Facet pagination ensures accurate document count specifically for geo queries
    pipeline.push({
      $facet: {
        metadata: [{ $count: "totalCount" }],
        data: [{ $skip: skip }, { $limit: Number(limit) }],
      },
    });

    const [result] = await PG.aggregate(pipeline);
    const totalCount = result.metadata[0]?.totalCount || 0;
    const pgs = result.data;

    res.json({
      data: pgs,
      totalCount,
      page: Number(page),
      totalPages: Math.ceil(totalCount / Number(limit)),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ single PG detail
exports.getPg = async (req, res) => {
  try {
    const pg = await PG.findById(req.params.id);
    if (!pg) {
      return res.status(404).json({
        message: "PG not found",
      });
    }

    const roomTypes = await RoomType.find({
      pg: req.params.id,
      isActive: true,
    });

    const allocatedRooms = roomTypes.reduce(
      (sum, rt) => sum + rt.availableRooms,
      0,
    );

    res.json({
      ...pg.toObject(),
      allocatedRooms,
      unallocatedRooms: pg.room - allocatedRooms,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE a PG
exports.updatePg = async (req, res) => {
  try {
    const pg = await PG.findById(req.params.id);

    if (!pg) {
      return res.status(404).json({ message: "PG not found" });
    }

    if (pg.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // 🛡️ SECURITY: Prevent Mass Assignment (Ignore un-allowed fields)
    const allowedFields = [
      "name",
      "price",
      "address",
      "coordinate",
      "city",
      "gender",
      "room",
      "bathroom",
      "toilet",
      "food",
      "amenities",
      "isActive",
    ];
    const updateData = {};
    Object.keys(req.body).forEach((key) => {
      if (allowedFields.includes(key)) {
        updateData[key] = req.body[key];
      }
    });

    // 🌍 Sync with Frontend: Handle both Array [lng, lat] and GeoJSON Object
    if (req.body.coordinate) {
      if (
        Array.isArray(req.body.coordinate) &&
        req.body.coordinate.length === 2
      ) {
        updateData.coordinate = {
          type: "Point",
          coordinates: req.body.coordinate,
        };
      } else if (req.body.coordinate.coordinates) {
        updateData.coordinate = req.body.coordinate; // Already Object format
      }
    }

    const updatedPG = await PG.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json(updatedPG);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//my listed pG
// READ owner's own listings
exports.getMyPgs = async (req, res) => {
  try {
    const pgs = await PG.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json({
      data: pgs,
      totalCount: pgs.length,
      page: 1,
      totalPages: 1,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
