const PG = require("../models/pg.js");
const RoomType = require("../models/roomType.js");

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

    const pg = await PG.create({
      ...req.body,
      owner: req.user._id,
    });

    res.json(pg);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

//for pagination
const buildPGQuery = (query) => {
  const filter = {};

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
    // FIX: ignore maxprice if it's "Infinity" (sent by "Above ₹15,000" filter)
    if (query.maxprice && query.maxprice !== "Infinity") {
      filter.price.$lte = Number(query.maxprice);
    }
  }

  return filter;
};

exports.getAllPg = async (req, res) => {
  try {
    const filter = buildPGQuery(req.query);
    filter.isActive = { $ne: false };

    const { sortField, sortOrder } = req.query;
    const sortDir = sortOrder === "desc" ? -1 : 1;

    // FIX: always paginate — remove the old unpaginated fallback
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // rating/reviews require an aggregation pipeline (join with reviews collection)
    // price/default use a simple find + sort
    const needsAggregation = sortField === "rating" || sortField === "reviews";

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
        {
          $sort:
            sortField === "rating"
              ? { avgRating: sortDir, _id: -1 }
              : { reviewCount: sortDir, _id: -1 },
        },
        {
          // run totalCount and paginated slice in a single DB round-trip
          $facet: {
            metadata: [{ $count: "totalCount" }],
            data: [{ $skip: skip }, { $limit: limit }],
          },
        },
      ];

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

    // ── simple path (price or default sort) ─────────────────────────────
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

exports.getNearbyPGs = async (req, res) => {
  try {
    const {
      lng,
      lat,
      radius = 5,
      sortField,
      sortOrder,
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
    filter.isActive = { $ne: false };

    const sortDir = sortOrder === "desc" ? -1 : 1;
    const skip = (Number(page) - 1) * Number(limit);
    const needsAggregation = sortField === "rating" || sortField === "reviews";

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
        {
          $sort:
            sortField === "rating"
              ? { avgRating: sortDir, _id: -1 }
              : { reviewCount: sortDir, _id: -1 },
        },
        {
          $facet: {
            metadata: [{ $count: "totalCount" }],
            data: [{ $skip: skip }, { $limit: Number(limit) }],
          },
        },
      ];

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

    // ── Simple sort / Distance path ────────────────
    const pipeline = [
      {
        $geoNear: {
          near: { 
            type: "Point", 
            coordinates: [Number(lng), Number(lat)] 
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
    res.status(500).json(error.message);
  }
};

exports.updatePg = async (req, res) => {
  try {
    const pg = await PG.findById(req.params.id);

    if (!pg) {
      return res.status(404).json({ message: "PG not found" });
    }

    if (pg.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const updatedPG = await PG.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json(updatedPG);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

//my listed pG
exports.getMyPgs = async (req, res) => {
  try {
    const pgs = await PG.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json(pgs);
  } catch (error) {
    res.status(500).json(error.message);
  }
};
