const Image = require("../models/image.js");

exports.registerImage = async (req, res) => {
  try {
    const { 
      pg, 
      url, 
      category 
    } = req.body;

    //duplicate check
    const existingImage = await Image.findOne({
      pg,
      url,
    });

    if (existingImage) {
      return res.status(400).json({
        message: "Image already exists",
      });
    }

    const image = await Image.create({
      ...req.body,
    uploadedBy: req.user._id
    });

    res.json(image);
  } 
  
  catch (error) {
    res.status(500).json(error.message);
  }
};


exports.getImagesByPg = async (req, res) => {
  try {
    const { pgId, category } = req.query;

    if (!pgId) {
      return res.status(400).json({
        message: "pgId query parameter is required",
      });
    }

    let filter = { pg: pgId };

    // Optional category filter
    if (category) {
      filter.category = category;
    }

    const images = await Image.find(filter)
    .populate({
      path:"pg",
      select:"name city"
    });

    if (!images.length) {
      return res.status(200).json([]);
    }

    res.json(images);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



exports.deleteImage = async (req, res) => {
  try {
    const image = await Image.findByIdAndDelete(req.params.id);

    if (!image) {
     return res.status(404).json({
        message: "Image Not found",
      });
    }

    res.json(image);
  } 

  catch (error) {
    res.status(400).json(error.message);
  }
};