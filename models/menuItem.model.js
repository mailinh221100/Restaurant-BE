const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const itemSchema = new Schema({
    itemName:{
        type: String,
        required: true,
    },
    itemDescription:{
        type: String,
        required: true,
    },
    itemPrice:{
        type: Number,
        required: true,
    },
    imageUrl:{
        type: String,
    },
    imageId:{
        type: String,
    },
    unit: {
        type: String,
        enum : ['Unknown', 'Cup', 'Plate'],
        default: 'Unknown'
    },
    category:  {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Category',
    },
    status: {
        type: String,
        enum : ['Active', 'Inactive'],
        default: 'Active'
    }
}, {
    timestamps: true
  });

module.exports = mongoose.model("MenuItem", itemSchema)