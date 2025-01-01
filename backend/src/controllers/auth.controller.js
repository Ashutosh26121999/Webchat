import cloudinary from "../lib/cloudinary.js";
import {generateToken} from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  const {fullName, email, password} = req.body;
  try {
    // verify data
    if (!fullName || !email || !password)
      return res.status(400).json({message: "All fields are required"});
    if (password.length < 6)
      return res
        .status(400)
        .json({message: "Password must be at least 6 characters"});
    //  check if user already exists
    const existingUser = await User.findOne({email});
    if (existingUser)
      return res.status(400).json({message: "User already exists"});
    //  hasing password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // create new user
    const newUser = new User({fullName, email, password: hashedPassword});
    if (newUser) {
      //  generate token
      generateToken(newUser._id, res);
      await newUser.save();

      return res.status(201).json({
        message: "User created successfully",
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({message: "Invalid user data"});
    }
  } catch (error) {
    console.log("Error in signup controller->", error.message);
    res.status(500).json({message: "Internal server error"});
  }
};
export const login = async (req, res) => {
  const {email, password} = req.body;
  try {
    // check if user exists
    const user = await User.findOne({email});
    if (!user) {
      return res.status(400).json({message: "User does not exist"});
    }
    // check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({message: "Invalid credentials"});
    }
    // generate token
    generateToken(user._id, res);
    return res.status(200).json({
      message: "Login successful",
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in login controller->", error.message);
    res.status(500).json({message: "Internal server error"});
  }
};
export const logout = (req, res) => {
  try {
    // logout user
    res.cookie("jwt", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      maxAge: 0,
    });
    return res.status(200).json({message: "Logout successful"});
  } catch (error) {
    console.log("Error in logout controller->", error.message);
    res.status(500).json({message: "Internal server error"});
  }
};

export const updateProfile = async (req, res) => {
  try {
    const {profilePic} = req.body;
    const userId = req.user._id;
    if (!profilePic) {
      return res.status(400).json({message: "Profile picture is required"});
    }
    const uploadedProfilePic = await cloudinary.uploader.upload(profilePic);
    const profilePicUrl = uploadedProfilePic.secure_url;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {profilePic: profilePicUrl},
      {new: true},
    );
    if (!updatedUser) {
      console.log("Error in updateProfile controller->", updatedUser);
      return res.status(404).json({message: "User not found"});
    }
    console.log("Final user in updateProfile controller->", updatedUser);
    return res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in updateProfile controller->", error.message);
    res.status(500).json({message: "Internal server error"});
  }
};
export const checkAuth = async (req, res) => {
  try {
    // console.log("res in checkAuth controller->", req.user);
    return res.status(200).json(req?.user);
  } catch (error) {
    console.log("Error in checkAuth controller->", error.message);
    res.status(500).json({message: "Internal server error"});
  }
};
