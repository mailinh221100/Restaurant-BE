const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderDetailSchema = new Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Order',
    },
    item: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'MenuItem',
    },
    quantity: {
        type: Number,
        required: true,
    },
})

module.exports = mongoose.model("OrderDetail", orderDetailSchema);