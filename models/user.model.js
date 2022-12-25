const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema= new Schema({
    email: {
        type: String,
        required: true

    },
    password:{
        type: String,
        required: true
    },

    fullName:{
        type: String,
        required:true
    },
    createAt: {
        type: Date,
        default: Date.now
    },
    resetPasswordCode:{
        type: String
    },
    roles:{
        type: [String],
        required: true,
        default: ['user']
    },
    refreshToken: {
        type: String,
    },
    resetPasswordCode: {
        type: String
    }
})

module.exports = mongoose.model('User', userSchema);