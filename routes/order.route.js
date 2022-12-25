const express = require('express');
const router = express.Router();

const {
  createOrder,
  createOrderDetail,
  getAllOrders,
  getAllOrderDetails,
  acceptOrder,
  rejectOrder,
  cancelOrder,
  completeOrder,
} = require('../controllers/order.controller')
const authMiddleware = require("../middlewares/auth.middleware");
router.post('/', authMiddleware.verifyToken, createOrder)
  .post("/orderDetail", authMiddleware.verifyToken, createOrderDetail)
  .get("/", authMiddleware.verifyToken, getAllOrders)
  .get("/orderDetail/:orderId", authMiddleware.verifyToken, getAllOrderDetails)
  .patch("/:orderId/accept", authMiddleware.verifyToken, authMiddleware.isAdmin, acceptOrder)
  .patch("/:orderId/complete", authMiddleware.verifyToken, authMiddleware.isAdmin, completeOrder)
  .patch("/:orderId/reject", authMiddleware.verifyToken, authMiddleware.isAdmin, rejectOrder)
  .patch("/:orderId/cancel", authMiddleware.verifyToken, cancelOrder)

module.exports = router;