const Category = require('../models/category.model');
const MenuItem = require('../models/menuItem.model');
const Order = require('../models/order.model');
const {Reservation} = require('../models/reservation.model');

async function getDetailsDashboard(req, res, next){
    try {
        const categoryCount = await Category.collection.countDocuments({});
        const menuItemCount = await MenuItem.collection.countDocuments({});
        const orderCount = await Order.collection.countDocuments({});
        const reservationCount = await Reservation.collection.countDocuments({});

        const orderStatus = await Order.aggregate([
            {
                $group:{
                    _id:{status:"$status"},
                    count:{$sum:1}
                }
            }
        ]);

        const reservationStatus = await Reservation.aggregate([
            {
                $group:{
                    _id:{status:"$status"},
                    count:{$sum:1}
                }
            }
        ]);

        res.status(200).json({
            category: categoryCount,
            menuItem: menuItemCount,
            order: orderCount,
            reservation: reservationCount,
            orderStatus,
            reservationStatus,
        })
    } catch (error) {
        console.log(error);
        next(error);
    }
}

module.exports = {
    getDetailsDashboard
}