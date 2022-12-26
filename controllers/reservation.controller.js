const {Reservation, DiningTable} = require('../models/reservation.model');
const Notification = require('../models/notification.model');
const User = require('../models/user.model');
const createError = require('http-errors');
const {checkAdmin} = require('../utils/auth.util');
const socketUtil = require('../utils/socket.util');

async function createReservation(req, res, next) {
    try {
        const {_id: userId, fullName} = req.user;
        const {date, phoneNumber, guestCount, note, diningTables} = req.body;
        const queryDiningTables = await DiningTable.find({ '_id': { $in: diningTables } });
        const reservation = await Reservation.create({
            date, customer: userId, phoneNumber, guestCount, note, diningTables: queryDiningTables, status: 'Pending',
        });
        const addedReservation = await Reservation.findById(reservation._id)
            .populate({
                path: 'customer',
                select: 'email fullName'
            })
            .populate({
                path: 'diningTables'
            })
            .populate({
                path: 'diningTables.zone'
            }).exec();

        const message = {
            type: 'New reservation',
            message: `A new reservation has been created by ${fullName}!`
        };

        socketUtil.get().emit('create', message);

        const admins = await User.find({roles: ['admin']});
        for (const admin of admins) {
            await Notification.create({
                ...message,
                receiver: admin._id,
            });
        }

        return res.status(201).json(addedReservation);
    } catch (error) {
        next(error);
    }
}

async function getAllReservations(req, res, next) {
    try {
        const isAdmin = checkAdmin(req.user);
        const condition = isAdmin ? {} : {customer: req.user._id};

        if (req?.query?.status) {
            condition.status = req?.query?.status;
        }

        if (req?.query?.startDate && req?.query?.endDate) {
            condition.date = {
                    $gte:  req?.query?.startDate,
                    $lte:  req?.query?.endDate
                };
        }

        const reservation = await Reservation.find(condition)
            .populate({
                path: 'customer',
                select: 'email fullName'
            })
            .populate({
                path: 'diningTables'
            })
            .populate({
                path: 'diningTables.zone'
            }).exec();
        if (!reservation) {
            return next(createError(404));
        }
        return res.status(200).json(reservation);
    } catch (error) {
        next(error);
    }
}

async function getReservationById(req, res, next) {
    try {
        const reservationId = req.params.reservationId;
        const reservation = await Reservation.findOne({_id: reservationId})
            .populate({
                path: 'customer',
                select: 'email fullName'
            })
            .populate({
                path: 'diningTables'
            })
            .populate({
                path: 'diningTables.zone'
            }).exec();
        if (!reservation) {
            return next(createError(404));
        }
        return res.status(200).json(reservation);
    } catch (error) {
        next(error);
    }
}

async function acceptReservation(req, res, next) {
    try {
        const reservation = await Reservation.findById(req.params.reservationId)
            .populate({
                path: 'customer',
            }).exec();
        if (!reservation) {
            return next(createError(404));
        }
        if (reservation.status !== 'Pending') {
            return res.status(400).json({message: 'Can not accept reservation that is not in pending.'});
        }
        reservation.status = 'Accepted';
        await reservation.save();

        const message = {
            type: 'Accepted reservation',
            message: `A reservation has been accepted!`,
            receiver: reservation?.customer?._id,
        }
        // send message
        socketUtil.get().emit(`update-${reservation?.customer?._id}`, message);
        // save message
        await Notification.create(message);

        return res.status(200).json({message: 'Reservation status has been updated.'});
    } catch (error) {
        next(error);
    }
}

async function completeReservation(req, res, next) {
    try {
        const reservation = await Reservation.findById(req.params.reservationId)
          .populate({
              path: 'customer',
          }).exec();
        if (!reservation) {
            return next(createError(404));
        }
        if (reservation.status !== 'Accepted') {
            return res.status(400).json({message: 'Can not complete reservation that is not in accepted.'});
        }
        reservation.status = 'Completed';
        await reservation.save();

        const message = {
            type: 'Completed reservation',
            message: `A reservation has been completed!`,
            receiver: reservation?.customer?._id,
        }
        // send message
        socketUtil.get().emit(`update-${reservation?.customer?._id}`, message);
        // save message
        await Notification.create(message);

        return res.status(200).json({message: 'Reservation status has been updated.'});
    } catch (error) {
        next(error);
    }
}

async function rejectReservation(req, res, next) {
    try {
        const reservation = await Reservation.findById(req.params.reservationId)
            .populate({
                path: 'customer',
            }).exec();
        if (!reservation) {
            return next(createError(404));
        }
        if (!(reservation.status === 'Pending' || reservation.status === 'Accepted')) {
            return res.status(400).json({message: 'Can not reject reservation that is not in pending.'});
        }
        reservation.status = 'Rejected';
        await reservation.save();

        const message = {
            type: 'Rejected reservation',
            message: `A reservation has been rejected!`,
            receiver: reservation?.customer?._id,
        }
        // send message
        socketUtil.get().emit(`update-${reservation?.customer?._id}`, message);
        // save message
        await Notification.create(message);

        return res.status(200).json({message: 'Reservation status has been updated.'});
    } catch (error) {
        next(error);
    }
}

async function cancelReservation(req, res, next) {
    try {
        const {fullName} = req.user;
        const reservation = await Reservation.findById(req.params.reservationId);
        if (!reservation) {
            return next(createError(404));
        }
        if (reservation.status !== 'Pending') {
            return res.status(400).json({message: 'Users can not cancel reservation that is not in pending.'});
        }
        reservation.status = 'Cancelled';
        await reservation.save();

        const message = {
            type: 'Canceled reservation',
            message: `A reservation has been canceled by ${fullName}!`
        };

        socketUtil.get().emit('cancel', message);

        const admins = await User.find({roles: ['admin']});
        for (const admin of admins) {
            await Notification.create({
                ...message,
                receiver: admin._id,
            });
        }

        return res.status(200).json({message: 'Reservation status has been updated.'});
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createReservation,
    getAllReservations,
    getReservationById,
    acceptReservation,
    rejectReservation,
    cancelReservation,
    completeReservation,
}