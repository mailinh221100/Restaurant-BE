const express = require('express');
const router = express.Router();

const {
    createDiningTableTrack, 
    getAllTableTracks
} = require('../controllers/diningTableTrack.controller')

router.post('/', createDiningTableTrack)
    .get("/", getAllTableTracks)

module.exports = router;