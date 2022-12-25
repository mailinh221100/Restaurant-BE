const express = require('express');
const router = express.Router();

const {
    getAllNotifications,
} = require('../controllers/notification.controller')
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/", authMiddleware.verifyToken, getAllNotifications)

module.exports = router;