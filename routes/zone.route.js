const express = require('express');
const router = express.Router();

const {
    createZone,
    getZone,
    deleteZone,
    getAllZones,
    getListZoneAndAvailableTables,
} = require('../controllers/zone.controller')
const authMiddleware = require("../middlewares/auth.middleware");

router.post('/', authMiddleware.verifyToken, authMiddleware.isAdmin, createZone)
    .get("/available", authMiddleware.verifyToken, getListZoneAndAvailableTables)
    .get("/:zoneId", authMiddleware.verifyToken, getZone)
    .delete('/:zoneId', authMiddleware.verifyToken, authMiddleware.isAdmin, deleteZone)
    .get("/", authMiddleware.verifyToken, getAllZones)

module.exports = router;