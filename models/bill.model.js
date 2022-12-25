const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const billSchema = new Schema ({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Order',
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    total: {
        type: Number,
        required: true,
    },
    billDate: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("Bill", billSchema);