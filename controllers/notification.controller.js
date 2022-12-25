const Notification = require('../models/notification.model');

async function getAllNotifications(req, res, next) {
    try {
        const {_id: userId} = req.user;
      const notifications = await Notification.find({receiver: userId}).sort('-createdAt');
      return res.status(200).json(notifications);
    } catch (error) {
      next(error);
    }
}

module.exports = {
    getAllNotifications,
}