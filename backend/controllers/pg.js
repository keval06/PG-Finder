const PG = require("../models/pg.js");
const RoomType = require("../models/roomType.js");
const Image = require("../models/image.js");

// *This is called Server-Side Filtering. Always filter at database level, not in JS.

// helper: builds filter object from URL params
//for pagination
const buildPGQuery = (query) => {
  const filter = {};

  // CENTRALIZED: Ensure we only show active PGs by default
  // FIX: $ne: false also matched null/undefined — use strict true
  filter.isActive = true;

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

// Helper for pagination, sorting, and rating aggregations
const paginateAndSendPGs = async (filter, req, res) => {
  const { sortField, sortOrder, minRating } = req.query;
  const sortDir = (sortOrder === "desc") ? -1 : 1;
  const minRatingNum = Number(minRating) || 0;

  // FIX: always paginate — remove the old unpaginated fallback
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  const skip = (page - 1) * limit;

  // ALWAYS use aggregation to fetch review stats
  const pipeline = [
    { $match: filter },
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

  if (minRatingNum > 0) {
    pipeline.push({ $match: { avgRating: { $gte: minRatingNum } } });
  }

  if (sortField === "rating") {
    pipeline.push({
      $sort: { avgRating: sortDir, _id: -1 }
    });
  }
  else if (sortField === "reviews") {
    pipeline.push({
      $sort:
        { reviewCount: sortDir, _id: -1 }
    });
  }
  else if (sortField === "price") {
    pipeline.push({
      $sort:
        { price: sortDir, _id: -1 }
    });
  }
  else {
    pipeline.push({
      $sort:
        { _id: -1 }
    });
  }

  pipeline.push({
    $facet: {
      metadata: [{ $count: "totalCount" }],
      data: [{ $skip: skip }, { $limit: limit }],
    },
  });

  const [result] = await PG.aggregate(pipeline);

  const totalCount = result.metadata[0]?.totalCount || 0;

  const pgs = result.data.map(({ _reviews: _r, ...pg }) => pg);

  return res.json({
    data: pgs,
    totalCount,
    page,
    totalPages: Math.ceil(totalCount / limit) || 1,
  });
};

exports.registerPG = async (req, res) => {
  try {
    const existingPG = await PG.findOne({
      owner: req.user._id,
      name: req.body.name,
      city: req.body.city,
    });

    if (existingPG) {
      return res.status(400).json({
        message: "You already have a PG with this name in this city",
      });
    }

    // This is called: Server-side Trust — never trust client-sent identity fields.
    const pgData = {
      // SECURITY: Prevent Mass Assignment
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

    // Sync with Frontend: Handle both Array [lng, lat] and GeoJSON Object
    if (req.body.coordinate) {
      if (
        Array.isArray(req.body.coordinate) &&
        req.body.coordinate.length === 2
      ) {
        pgData.coordinate = { type: "Point", coordinates: req.body.coordinate };
      }
      else if (req.body.coordinate.coordinates) {
        pgData.coordinate = req.body.coordinate; // Already Object format
      }
    }

    const pg = await PG.create(pgData);

    res.status(201).json(pg);
  }
  catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// READ all PGs with filtering + pagination
exports.getAllPg = async (req, res) => {
  try {
    const filter = buildPGQuery(req.query);
    return await paginateAndSendPGs(filter, req, res);
  }
  catch (error) {
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

    if (lng === undefined || lat === undefined) {
      return res.status(400).json({
        message: "Latitude and longitude required",
      });
    }

    const numLng = Number(lng);
    const numLat = Number(lat);

    if (
      isNaN(numLng) ||
      isNaN(numLat) ||
      numLat < -90 ||
      numLat > 90 ||
      numLng < -180 ||
      numLng > 180
    ) {
      return res.status(400).json({
        message: "Invalid latitude or longitude coordinates",
      });
    }

    // Edge Case: (0,0) is Null Island, practically useless and usually indicates missing/default data
    if (numLat === 0 && numLng === 0) {
      return res.status(400).json({
        message:
          "Coordinates (0,0) are not supported (likely missing location data)",
      });
    }

    const radiusInMeters = Number(radius) * 1000;
    const filter = buildPGQuery(req.query);
    const minRatingNum = Number(minRating) || 0;

    const sortDir = (sortOrder === "desc") ? -1 : 1;
    const skip = (Number(page) - 1) * Number(limit);
    // ALWAYS aggregate for geo queries too so UI gets ratings
    const pipeline = [
      {
        $geoNear: {
          near: { type: "Point", coordinates: [numLng, numLat] },
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
      pipeline.push({
        $match: {
          avgRating: {
            $gte: minRatingNum,
          },
        },
      });
    }

    // Sort
    if (sortField === "rating") {
      pipeline.push({
        $sort:
          { avgRating: sortDir, _id: -1 }
      });
    }
    else if (sortField === "reviews") {
      pipeline.push({
        $sort:
          { reviewCount: sortDir, _id: -1 }
      });
    }
    else if (sortField === "price") {
      pipeline.push({
        $sort:
          { price: sortDir, _id: -1 }
      });
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
      totalPages: Math.ceil(totalCount / Number(limit)) || 1,
    });
  }
  catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ single PG detail
exports.getPg = async (req, res) => {
  try {
    // FIX: inactive PG was reachable via direct ID — now blocked
    const pg = await PG.findOne({
      _id: req.params.id,
      isActive: true
    });
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
      (sum, rt) => sum + rt.availableRooms, 0
    );

    res.json({
      ...pg.toObject(),
      allocatedRooms,
      unallocatedRooms: pg.room - allocatedRooms,
    });
  }
  catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// UPDATE a PG
exports.updatePg = async (req, res) => {
  try {
    const pg = await PG.findById(req.params.id);

    if (!pg) {
      return res.status(404).json({
        message: "PG not found"
      });
    }

    if (pg.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not allowed"
      });
    }

    // SECURITY: Prevent Mass Assignment (Ignore un-allowed fields)
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

    // Sync with Frontend: Handle both Array [lng, lat] and GeoJSON Object
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
  }
  catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

//my listed pG
// READ owner's own listings
exports.getMyPgs = async (req, res) => {
  try {
    //1. Read URL filters (price, rating, etc)
    const filter = buildPGQuery(req.query);
    // 2. FORCE the owner ID
    filter.owner = req.user._id; // Force it to only show their PGs
    // run engine
    return await paginateAndSendPGs(filter, req, res);
  }
  catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Lightweight endpoint for map — returns ALL active PGs with minimal fields
exports.getMapPGs = async (req, res) => {
  try {
    const filter = buildPGQuery(req.query); // reuse existing filter builder

    let pgs;
    if (req.query.lat && req.query.lng) {
      // Geo filter
      const numLng = Number(req.query.lng);
      const numLat = Number(req.query.lat);
      const radiusInMeters = (Number(req.query.radius) || 5) * 1000;

      pgs = await PG.find({
        ...filter,
        coordinate: {
          $near: {
            $geometry: { type: "Point", coordinates: [numLng, numLat] },
            $maxDistance: radiusInMeters,
          },
        },
      })
        .select("_id name city price coordinate gender")
        .lean();
    } else {
      pgs = await PG.find(filter)
        .select("_id name city price coordinate gender")
        .lean();
    }

    res.json(pgs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLandingData = async (req, res) => {
  try {
    // Top 5 cities by PG count
    const topCitiesAgg = await PG.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$city", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    const cities = topCitiesAgg.map((c) => c._id);

    // Top 5 PGs (by rating) per city
    const result = await Promise.all(
      cities.map(async (city) => {
        const pgs = await PG.aggregate([
          { $match: { city, isActive: true } },
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
          { $sort: { avgRating: -1, reviewCount: -1 } },
          { $limit: 5 },
          {
            $project: {
              name: 1,
              city: 1,
              price: 1,
              gender: 1,
              avgRating: 1,
              reviewCount: 1,
            },
          },
        ]);

        // Attach one image per PG
        const pgsWithImage = await Promise.all(
          pgs.map(async (pg) => {
            const img = await Image.findOne({ pg: pg._id }).select("url").lean();
            return { ...pg, image: img?.url || null };
          })
        );

        const totalCount = await PG.countDocuments({ city, isActive: true });
        return { city, totalCount, pgs: pgsWithImage };
      })
    );
    const totalPGs = await PG.countDocuments({ isActive: true });
    const totalCities = (await PG.distinct("city", { isActive: true })).length;

    res.json({
      totals: {
        pgs: totalPGs,
        cities: totalCities,
      },
      cities: result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};