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

exports.getAllPg = async (req, res) => {
  try {
    const filter = {};

    if (req.query.city) {
      filter.city = { $regex: req.query.city, $options: "i" };
    }

    if (req.query.gender) {
      filter.gender = req.query.gender;
    }

    if (req.query.minprice || req.query.maxprice) {
      filter.price = {};

      if (req.query.minprice) {
        filter.price.$gte = Number(req.query.minprice);
      }

      if (req.query.maxprice) {
        filter.price.$lte = Number(req.query.maxprice);
      }
    }
 filter.isActive = { $ne: false }; // exclude inactive PGs
    const pgs = await PG.find(filter);

    res.json(pgs);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

exports.getPg = async (req, res) => {
  try {
    const pg = await PG.findById(req.params.id);
    if (!pg) {
      return res.status(404).json({ message: "PG not found" });
    }

    const roomTypes = await RoomType.find({ pg: req.params.id, isActive: true });

    const allocatedRooms = roomTypes.reduce(
      (sum, rt) => sum + rt.availableRooms, 0
    );

    res.json({
      ...pg.toObject(),
      allocatedRooms,                    // sum of all roomType.availableRooms
      unallocatedRooms: pg.room - allocatedRooms,  // remaining unassigned rooms
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
};

exports.updatePg = async (req, res) => {
  try {
    const pg = await PG.findById(req.params.id);

    if (!pg) {
      return res.status(404).json({
        message: "PG not found",
      });
    }

    if (pg.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not allowed",
      });
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

// / GET /api/pg/owner — owner sees their own PGs (including inactive)
exports.getMyPgs = async (req, res) => {
  try {
    const pgs = await PG.find({ owner: req.user._id });
    res.json(pgs);
  } catch (error) {
    res.status(500).json(error.message);
  }
};