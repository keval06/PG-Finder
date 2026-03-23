const Image = require("../models/image.js");
const s3 = require("../config/s3.js");

exports.registerImage = async (req, res) => {
  try {
    const { pg, category } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
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
    res.json(image);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

exports.getImagesByPg = async (req, res) => {
  try {
    const { pgId, category } = req.query;

    let filter = { pg: pgId };

    if (category) {
      filter.category = category;
    }

    const images = await Image.find(filter).populate("pg", "name city");

    res.json(images);
  } catch (error) {
    res.status(500).json(error.message);
  }
};


exports.deleteImage = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);

    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    // 1. strip query string (?w=640&q=75 etc) if present
    const cleanUrl = image.url.split("?")[0];

    // 2. extract key — decode %20 back to spaces to match real S3 key
    const key = decodeURIComponent(cleanUrl.split(".amazonaws.com/")[1]);

    console.log("KEY:", key); // should be: images/1774114223162 - amenities.jpg

    await s3.deleteObject({
      Bucket: process.env.S3_BUCKET,
      Key: key,
    }).promise();

    await image.deleteOne();
    res.json(
      { message: "Image deleted", image 

    });
  } 
  catch (error) {
    console.error("DELETE ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};
