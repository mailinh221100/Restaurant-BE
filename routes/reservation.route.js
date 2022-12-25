const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const {
    createReservation,
    getAllReservations,
    getReservationById,
    acceptReservation,
    rejectReservation,
    cancelReservation,
    completeReservation,
} = require('../controllers/reservation.controller')

router.post('/', authMiddleware.verifyToken, createReservation)
    .get("/:reservationId", authMiddleware.verifyToken, getReservationById)
    .patch("/:reservationId/accept", authMiddleware.verifyToken, authMiddleware.isAdmin, acceptReservation)
    .patch("/:reservationId/complete", authMiddleware.verifyToken, authMiddleware.isAdmin, completeReservation)
    .patch("/:reservationId/reject", authMiddleware.verifyToken, authMiddleware.isAdmin, rejectReservation)
    .patch("/:reservationId/cancel", authMiddleware.verifyToken, cancelReservation)
    .get("/",  authMiddleware.verifyToken, getAllReservations)

module.exports = router;