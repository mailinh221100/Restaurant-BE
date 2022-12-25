const express = require('express');
const router = express.Router();

const {
    getAllChats,
    getGroupChats,
    getGroupOfCurrentUser,
    createChat,
} = require('../controllers/chat.controller')
const authMiddleware = require("../middlewares/auth.middleware");

router.post("/", authMiddleware.verifyToken, createChat)
  .get("/group", authMiddleware.verifyToken, authMiddleware.isAdmin, getGroupChats)
  .get("/group-of-current-user", authMiddleware.verifyToken, getGroupOfCurrentUser)
  .get("/:groupId", authMiddleware.verifyToken, getAllChats)

module.exports = router;