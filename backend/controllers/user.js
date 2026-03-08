const User = require("../models/user.js");
const bcrypt = require("bcryptjs");

exports.registerUser = async (req, res) => {
  try {
    const { 
      name, 
      mobile, 
      password 
    } = req.body;

    //check for existing user
    const existingUser = await User.findOne({ mobile });

    if (existingUser) {
      return res.status(400).json({
        message: "Mobile already Registred",
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      mobile,
      password: hash,
    });

    res.status(201).json(user);

  } 

  catch(error) {
    res.status(500).json(error);
  }

};

//not needed -> issue of data leak
// exports.getAllUsers = async (req, res) => {
//   try {
//     const users = await User.find();

//     if (!users) {
//       res.status(404).json({
//         message: "User not found",
//       });
//     }
//     res.json(users);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// };

exports.getUser = async (req, res) => {
  try {
    const {name} = req.query;
    let filetr = {};
    if(name){
      filetr.name = {$regex:name, $options:"i"}
    }
    const users = await User.find(filetr).select("-password");

    if (!users.length) {
      res.status(200).json([]);
    }

    res.json(users);
  } 
  catch (err) {
    res.status(500).json(err.message);
  }
};

exports.updateUser = async (req, res) => {
  try {

    const userId = req.params.id;
    const { mobile, password } = req.body;

    // 1️⃣ If mobile is being updated → check duplicate

    if(mobile){
      const existingUser = await User.findOne({ mobile });

      if(existingUser && existingUser._id.toString() != userId){
        return res.status(400).json({
          message:"Mobile number already in use",
        });
      }
    }

    // 2️⃣ If password is being updated → hash it
    if(password){
      req.body.password = await bcrypt.hash(password,10);
    }

    // 3️⃣ Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      req.body, 
    { 
      new: true,
      runValidators:true,
    }
  ).select("-password"); // hide password in response

    if (!updatedUser) {
      res.status(404).json({
        message: "User Not found",
      });
    }

    res.json(updatedUser);

  } 
  catch (error) {
    res.status(400).json(error);
  }
};
