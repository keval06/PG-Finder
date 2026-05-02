const Image = require("../models/image.js");
const s3 = require("../config/s3.js");
const PG = require("../models/pg.js");

exports.registerImage = async (req, res) => {
  try {
    const { pg, category } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    // 1. Find the PG being targeted for this image upload

    const pgDoc = await PG.findById(pg);

    // 2. Make sure the PG actually exists
    if (!pgDoc) {
      return res.status(404).json({ message: "PG not found" });
    }
    // 3. Verify that the authenticated user is the owner of the PG
    if (pgDoc.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You are not authorized to upload images for this PG.",
      });
    }

    const url = req.file.location;

    const existingImage = await Image.findOne({ pg, url });

    if (existingImage) {
      return res.status(400).json({
        message: "Image already exists",
      });
    }

    // console.log("FILE:", req.file);
    // console.log("BODY:", req.body);
    const image = await Image.create({
      pg,
      url,
      category,
    });
    // console.log("SAVED:", image);
    res.status(201).json(image);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getImagesByPg = async (req, res) => {
  try {
    const { pgId, category } = req.query;

    //* Dynamic filter building — starts with base filter, adds category only if provided.
    let filter = { pg: pgId };

    if (category) {
      filter.category = category;
    }

    const images = await Image.find(filter).populate("pg", "name city");

    res.json(images);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteImage = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id).populate("pg");

    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    // BOLA PROTECTION: Verify PG ownership
    if (image.pg.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You don't own this property's photos!" });
    }

    // 1. strip query string (?w=640&q=75 etc) if present
    const cleanUrl = image.url.split("?")[0];

    // 2. extract key — decode %20 back to spaces to match real S3 key
    // "-" -> "%20" => Encoding
    // "%20" -> "-" => Decoding
    const key = decodeURIComponent(cleanUrl.split(".amazonaws.com/")[1]);

    // console.log("KEY:", key); // should be: images/1774114223162 - amenities.jpg
    // *Without .promise():
    //   s3.deleteObject() returns an AWS Request object, not a Promise
    await s3
      .deleteObject({
        Bucket: process.env.S3_BUCKET,
        Key: key,
      })
      .promise();

    await image.deleteOne(); //*instance method,  Deletes the exact document already loaded.
    res.json({
      message: "Image deleted",
      image,
    });
  } catch (error) {
    console.error("DELETE ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};
