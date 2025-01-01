import express from "express";
import {protectRoute} from "../middleware/auth.middleware.js";
import {
  getUsersForSidebar,
  getMessages,
  sendMessages,
} from "../controllers/message.controller.js";
const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
// get all messages
router.get("/:id", protectRoute, getMessages);
// send message
router.post("/send/:id", protectRoute, sendMessages);
export default router;
