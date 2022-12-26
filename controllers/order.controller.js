const Order = require('../models/order.model');
const OrderDetail = require('../models/orderDetail.model');
const MenuItem = require('../models/menuItem.model');
const Notification = require('../models/notification.model');
const User = require('../models/user.model');
const createError = require('http-errors');
const {checkAdmin} = require("../utils/auth.util");
const socketUtil = require('../utils/socket.util');

async function createOrder(req, res, next) {
  try {
    const {_id: userId, fullName} = req.user;
    const {phoneNumber, address, note, orderDetails} = req.body;
    // calculate totalAmount
    let totalAmount = 0;
    for (const orderDetail of orderDetails) {
      const menuItem = await MenuItem.findById(orderDetail.item);
      totalAmount += orderDetail.quantity * menuItem.itemPrice;
    }
    // create order
    const order = await Order.create({user: userId, phoneNumber, address, note, totalAmount, status: 'Pending'});
    // create order details
    for (const orderDetail of orderDetails) {
      await OrderDetail.create({
        order: order._id,
        item: orderDetail.item,
        quantity: orderDetail.quantity
      });
    }

    const message = {
      type: 'New order',
      message: `A new order has been created by ${fullName}!`
    };

    socketUtil.get().emit('create', message);

    const admins = await User.find({roles: ['admin']});
    for (const admin of admins) {
      await Notification.create({
        ...message,
        receiver: admin._id,
      });
    }

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
}

async function createOrderDetail(req, res, next) {
  try {
    const {order, item, quantity, amount} = req.body;

    const orderDetail = await OrderDetail.create({
      order, item, quantity, amount
    });
    const added_orderDetails = await OrderDetail.findById(orderDetail._id).populate({
      path: 'order'
    })
      .populate({
        path: 'item',
        select: '_id itemName itemPrice'
      }).exec();
    res.status(201).json({
      _id: added_orderDetails._id,
      order: added_orderDetails.order,
      item: added_orderDetails.item,
      quantity: added_orderDetails.quantity,
      amount: added_orderDetails.amount
    });
  } catch (error) {
    next(error);
  }
}

async function getAllOrders(req, res, next) {
  try {
    const isAdmin = checkAdmin(req.user);
    const condition = isAdmin ? {} : {user: req.user._id};

    if (req?.query?.status) {
      condition.status = req?.query?.status;
    }

    if (req?.query?.startDate && req?.query?.endDate) {
      condition.createdAt = {
        $gte:  req?.query?.startDate,
        $lte:  req?.query?.endDate
      };
    }
    
    const orders = await Order.find(condition)
      .populate({
        path: 'user',
        select: 'fullName email'
      }).exec();
    return res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
}

async function getAllOrderDetails(req, res, next) {
  try {
    const orderId = req.params.orderId;
    const orderDetails = await OrderDetail.find({order: orderId})
      .populate({
        path: 'item',
        select: '_id itemName itemPrice'
      }).exec();
    console.log(orderId);
    return res.status(200).json(orderDetails);

  } catch (error) {
    next(error);
  }
}

async function acceptOrder(req, res, next) {
  try {
    const order = await Order.findById(req.params.orderId)
        .populate({
          path: 'user',
        }).exec();

    if (!order) {
      return next(createError(404));
    }
    if (order.status !== 'Pending') {
      return res.status(400).json({message: 'Can not accept order that is not in pending.'});
    }
    order.status = 'Accepted';
    await order.save();

    const message = {
      type: 'Accepted order',
      message: `A order has been accepted!`,
      receiver: order?.user?._id,
    }
    // send message
    socketUtil.get().emit(`update-${order?.user?._id}`, message);
    // save message
    await Notification.create(message);

    return res.status(200).json({message: 'Order status has been updated.'});
  } catch (error) {
    next(error);
  }
}

async function completeOrder(req, res, next) {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate({
        path: 'user',
      }).exec();

    if (!order) {
      return next(createError(404));
    }
    if (order.status !== 'Accepted') {
      return res.status(400).json({message: 'Can not complete order that is not in accepted.'});
    }
    order.status = 'Completed';
    await order.save();

    const message = {
      type: 'Completed order',
      message: `A order has been completed!`,
      receiver: order?.user?._id,
    }
    // send message
    socketUtil.get().emit(`update-${order?.user?._id}`, message);
    // save message
    await Notification.create(message);

    return res.status(200).json({message: 'Order status has been updated.'});
  } catch (error) {
    next(error);
  }
}

async function rejectOrder(req, res, next) {
  try {
    const order = await Order.findById(req.params.orderId)
        .populate({
          path: 'user',
        }).exec();
    if (!order) {
      return next(createError(404));
    }
    if (!(order.status === 'Pending' || order.status === 'Accepted')) {
      return res.status(400).json({message: 'Can not accept order that is not in pending.'});
    }
    order.status = 'Rejected';
    await order.save();

    const message = {
      type: 'Rejected order',
      message: `A order has been rejected!`,
      receiver: order?.user?._id,
    }
    // send message
    socketUtil.get().emit(`update-${order?.user?._id}`, message);
    // save message
    await Notification.create(message);

    return res.status(200).json({message: 'Order status has been updated.'});
  } catch (error) {
    next(error);
  }
}

async function cancelOrder(req, res, next) {
  try {
    const {fullName} = req.user;
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return next(createError(404));
    }
    if (order.status !== 'Pending') {
      return res.status(400).json({message: 'Can not accept order that is not in pending.'});
    }
    order.status = 'Cancelled';
    await order.save();

    const message = {
      type: 'Canceled order',
      message: `A order has been canceled by ${fullName}!`
    };

    socketUtil.get().emit('cancel', message);

    const admins = await User.find({roles: ['admin']});
    for (const admin of admins) {
      await Notification.create({
        ...message,
        receiver: admin._id,
      });
    }

    return res.status(200).json({message: 'Order status has been updated.'});
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createOrder,
  createOrderDetail,
  getAllOrders,
  getAllOrderDetails,
  acceptOrder,
  rejectOrder,
  cancelOrder,
  completeOrder,
}