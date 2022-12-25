const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const diningTableSchema = new Schema({
    tableName: {
        type: String,
        require: true
    },
    chairCount: {
        type: String,
        required: true, 
        enum : ['Small', 'Medium', 'Big'],
        default: 'Small'
    },
    tableType: {
        type: String,
        required: true,
        enum : ['Square', 'Round', 'Rectangle'],
        default: 'Square'
    },
    zone: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Zone',
    },
})

const zoneSchema = new Schema({
    zoneName: {
        type: String,
        require: true
    },
    status: {
        type: String,
        enum : ['Active', 'Inactive'],
        default: 'Active'
    }
})

const reservationSchema = new Schema({
    date: {
        type: Date,
        default: Date.now
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    guestCount: {
        type: Number,
        default: 1,
    },
    note: {
        type: String,
    },
    diningTables:[diningTableSchema],
    status: {
        type: String,
        required: true,
        enum : ['Pending', 'Accepted', 'Completed', 'Rejected', 'Cancelled'],
        default: 'Pending'
    },
}, {
    timestamps: true
})

const Reservation = mongoose.model('Reservation', reservationSchema);
const DiningTable = mongoose.model('DiningTable', diningTableSchema);
const Zone = mongoose.model('Zone', zoneSchema);

module.exports = { Reservation, Zone, DiningTable }



