const express = require('express');
const router = express.Router();

const {
    createDiningTable,
    deleteDiningTable
} = require('../controllers/diningTable.controller')
const authMiddleware = require("../middlewares/auth.middleware");

router.post('/', authMiddleware.verifyToken, authMiddleware.isAdmin, createDiningTable)
    .delete("/:diningTableId", authMiddleware.verifyToken, authMiddleware.isAdmin, deleteDiningTable)

module.exports = router;