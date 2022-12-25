const express = require('express');
const router = express.Router();

const {getDetailsDashboard}= require('../controllers/dashboard.controller')
const authMiddleware = require("../middlewares/auth.middleware");

router.get('/details', authMiddleware.verifyToken, authMiddleware.isAdmin, getDetailsDashboard)

module.exports = router;