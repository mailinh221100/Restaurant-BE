const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    address: {
        type: String,
    },
    note: {
        type: String,
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    status:{
        type: String,
        enum : ['Pending', 'Accepted', 'Completed', 'Rejected', 'Cancelled'],
        default: 'Pending'
    },
}, {
    timestamps: true
})

module.exports = mongoose.model("Order", orderSchema);