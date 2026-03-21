const mongoose = require("mongoose");
const RoomType = require("../models/roomType.js");
const PG = require("../models/pg.js");

// create room type
exports.createRoomType = async (req, res) => {
  try {
    // find pg
    const pg = await PG.findById(req.body.pg);
    if (!pg) {
      return res.status(404).json({ message: "PG not found" });
    }
    
    // check if owner
    if (pg.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }
    //

    const existingRoomTypes = await RoomType.find({
      pg: req.body.pg,
      isActive: true,
    });

    const alreadyAllocated = existingRoomTypes.reduce(
      (sum, rt) => sum + rt.availableRooms,
      0,
    );

    // check if room type already exists
    if (alreadyAllocated + req.body.availableRooms > pg.room) {
      return res.status(400).json({
        message: `Only ${
          pg.room - alreadyAllocated
        } rooms remaining to allocate`,
      });
    }

    // create room type
    const roomType = await RoomType.create(req.body);

    await PG.findByIdAndUpdate(req.body.pg, {
      isActive: true,
      ...(roomType.price < pg.price && { price: roomType.price }),
    });

    res.status(201).json(roomType);
  } 
  catch (error) {
    res.status(500).json({ 
      message: error.message 
    });
  }
};

// get room types by pg
exports.getRoomTypesByPg = async (req, res) => {
  try {
    const { pgId } = req.query;

    // check if pgId is provided
    if (!pgId) {
      return res.status(400).json({ message: "pgId is required" });
    }

    // check if pgId is valid
    if (!mongoose.Types.ObjectId.isValid(pgId)) {
      return res.status(400).json({ message: "Invalid pgId" });
    }

    // get room types
    const roomTypes = await RoomType.find({
      pg: new mongoose.Types.ObjectId(pgId),
      isActive: true,
    }).populate("pg", "name city room");

    // calculate total beds and remaining beds
    const response = roomTypes.map((rt) => ({
      ...rt.toObject(),
      totalBeds: rt.availableRooms * rt.sharingCount,
      remainingBeds: rt.availableRooms * rt.sharingCount - rt.occupiedBeds,
    }));

    res.json(response);
  } 
  catch (error) {
    res.status(500).json({ 
      message: error.message 
    });
  }
};

exports.updateRoomType = async (req, res) => {
  try {
    // find room type
    const roomType = await RoomType.findById(req.params.id).populate("pg");

    // check if room type exists
    if (!roomType) {
      return res.status(404).json({ message: "Room type not found" });
    }

    // check if pg exists
    if (!roomType.pg) {
      return res.status(404).json({ message: "Associated PG not found" });
    }

    // check if owner
    if (roomType.pg.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // check if availableRooms is provided
    if (req.body.availableRooms !== undefined) {

      // check if beds are available
      const newTotalBeds = req.body.availableRooms * roomType.sharingCount;
      if (newTotalBeds < roomType.occupiedBeds) {
        return res.status(400).json({
          message: `Cannot reduce. ${roomType.occupiedBeds} beds occupied, new capacity would only allow ${newTotalBeds}.`,
        });
      }

      // check if beds are available
      const existingRoomTypes = await RoomType.find({
        pg: roomType.pg._id,
        isActive: true,
        _id: { $ne: req.params.id }, // exclude current one
      });

      const alreadyAllocated = existingRoomTypes.reduce(
        (sum, rt) => sum + rt.availableRooms,
        0,
      );

      if (alreadyAllocated + req.body.availableRooms > roomType.pg.room) {
        return res.status(400).json({
          message: `Only ${
            roomType.pg.room - alreadyAllocated
          } rooms remaining to allocate`,
        });
      }
    }

    // update room type
    const updated = await RoomType.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // recalculate PG minimum price after update
    const allRoomTypes = await RoomType.find({
      pg: roomType.pg._id,
      isActive: true,
    });

    const minPrice = Math.min(...allRoomTypes.map((r) => r.price));
    await PG.findByIdAndUpdate(roomType.pg._id, { price: minPrice });

    res.json(updated);
  } 
  catch (error) {
    res.status(500).json({ 
      message: error.message 
    });
  }
};

// delete room type
exports.deleteRoomType = async (req, res) => {
  try {
    // find room type
    const roomType = await RoomType.findById(req.params.id).populate("pg");
    if (!roomType) {
      return res.status(404).json({ message: "Room type not found" });
    }

    // check if pg exists
    if (!roomType.pg) {
      return res.status(404).json({ message: "Associated PG not found" });
    }

    // check if owner
    if (roomType.pg.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // after — block if occupied, soft delete otherwise
    if (roomType.occupiedBeds > 0) {
      return res.status(400).json({
        message: `Cannot delete. ${roomType.occupiedBeds} beds currently occupied.`,
      });
    }

    // soft delete
    await RoomType.findByIdAndUpdate(req.params.id, { isActive: false });

    // recalculate PG minimum price after delete
    const allRoomTypes = await RoomType.find({
      pg: roomType.pg._id,
      isActive: true,
    });

    // if room types left, recalculate minimum price
    if (allRoomTypes.length > 0) {
      const minPrice = Math.min(...allRoomTypes.map((r) => r.price));

      await PG.findByIdAndUpdate(roomType.pg._id, { price: minPrice });
    } else {
      await PG.findByIdAndUpdate(roomType.pg._id, { isActive: false });
    }
    // if no room types left, PG.price stays as is — not reset to 0

    res.json({ message: "Room type deleted", roomType });
  } 
  catch (error) {
    res.status(500).json({ 
      message: error.message 
    });
  }
};
