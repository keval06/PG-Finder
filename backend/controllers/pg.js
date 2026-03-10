const PG = require("../models/pg.js");

exports.registerPG = async (req, res) => {
  try {
    const {
      owner,
      name,
      price,
      address,
      coordinate,
      city,
      gender,
      room,
      bathroom,
      toilet,
      food,
      amenities,
    } = req.body;

    const existingPG = await PG.findOne({
      owner,
      name,
    });

    if (existingPG) {
      return res.status(400).json({
        message: "PG already exists",
      });
    }

    const pg = await PG.create({
      ...req.body,
      owner : req.user._id
    });

    res.json(pg);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

exports.getAllPg = async (req, res) => {
  try {
    const {
      name,
      minprice,
      maxprice,
      address,
      city,
      gender,
      room,
      bathroom,
      toilet,
      food,
      amenities,
    } = req.query;

    let filter = {};
    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }

    if (minprice || maxprice) {
      filter.price = {};

      if (minprice) {
        filter.price.$gte = Number(minprice);
      }

      if (maxprice) {
        filter.price.$lte = Number(maxprice);
      }
    }

    if (address) {
      filter.address = { $regex: address, $options: "i" };
    }

    if (gender) {
      filter.gender = gender.toLowerCase();
    }

    if (room) {
      filter.room = Number(room);
    }

    if (bathroom) {
      filter.bathroom = Number(bathroom);
    }

    if (city) {
      filter.city = { $regex: city, $options: "i" }; //case-insensitive value
    }

    if (toilet) {
      filter.toilet = Number(toilet);
    }

    if (food) {
      filter.food = { $regex: food, $options: "i" };
    }

    if (amenities) {
      filter.amenities = { $regex: amenities, $options: "i" };
    }

    const pgs = await PG.find(filter);
    //PG.find() return array object, so better to check its length
    if (!pgs.length) {
      return res.status(200).json([]);
    }

    res.json(pgs);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.getPg = async (req, res) => {
  try {
    const pg = await PG.findById(req.params.id);

    if (!pg) {
      return res.status(404).json({
        message: "PG Not found",
      });
    }
    res.json(pg);
  } catch (error) {
    res.status(400).json(error.message);
  }
};

exports.updatePg = async (req, res) => {
  try {
    const pg = await PG.findById(req.params.id);

    if (!pg) {
      return res.status(404).json({
        message: "PG Not found",
      });
    }

    // authorisation check
    if (pg.owner.toString() !== req.user._id) {
      return res.status(403).json({
        message: "You are not allowed to update this pg",
      });
    }

    const updatedPG = await PG.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json(updatedPG);
  } catch (error) {
    res.status(400).json(error.message);
  }
};
