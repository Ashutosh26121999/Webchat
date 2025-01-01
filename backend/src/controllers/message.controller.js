import cloudinary from "../lib/cloudinary.js";
import {getReciverSocketId, io} from "../lib/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loogedInUserId = req.user._id;
    console.log("loogedInUserId", loogedInUserId);
    const users = await User.find({_id: {$ne: loogedInUserId}}).select(
      "-password",
    );
    return res.status(200).json(users);
  } catch (error) {
    console.log("Error in getUsersForSidebar controller->", error.message);
    res.status(500).json({message: "Internal server error"});
  }
};
export const getMessages = async (req, res) => {
  try {
    const {id: userToChatId} = req.params;
    const myId = req.user._id;
    //   to send and recive messages for both sender and reciver
    const messages = await Message.find({
      $or: [
        {senderId: myId, receiverId: userToChatId},
        {receiverId: myId, senderId: userToChatId},
      ],
    });
    return res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller->", error.message);
    res.status(500).json({message: "Internal server error"});
  }
};
export const sendMessages = async (req, res) => {
  try {
    const {text, image} = req.body;
    const {id: receiverId} = req.params;
    const senderId = req.user._id;
    let imageUrl;
    if (image) {
      const uploadedImage = await cloudinary.uploader.upload(image);
      imageUrl = uploadedImage.secure_url;
    }
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });
    const savedMessage = await newMessage.save();
    const reciverSocketId = getReciverSocketId(receiverId);
    if (reciverSocketId) {
      io.to(reciverSocketId).emit("newMessage", newMessage);
    }

    return res.status(201).json(savedMessage);
  } catch (error) {
    console.log("Error in sendMessages controller->", error.message);
    res.status(500).json({message: "Internal server error"});
  }
};
