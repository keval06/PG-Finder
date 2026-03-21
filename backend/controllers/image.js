const Image = require("../models/image.js");

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

    console.log("FILE:", req.file);
    console.log("BODY:", req.body);
    const image = await Image.create({
      pg,
      url,
      category,
    });
    console.log("SAVED:", image);
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
    const image = await Image.findByIdAndDelete(req.params.id);

    if (!image) {
      return res.status(404).json({
        message: "Image not found",
      });
    }

    res.json(image);
  } catch (error) {
    res.status(500).json(error.message);
  }
};
