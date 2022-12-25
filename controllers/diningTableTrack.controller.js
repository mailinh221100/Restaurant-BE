const {DiningTableTrack} = require('../models/reservation.model');
const createError = require('http-errors');

async function createDiningTableTrack(req,res,next){
    try{
        const {diningTable, order} = req.body;
        const diningTableTrack  = await DiningTableTrack.create({
            diningTable, order
        });
        const added_diningTableTrack= await DiningTableTrack.findById(diningTableTrack._id).populate({
            path: 'order'
        })
        .populate({
            path: 'diningTable'
        }).exec();
        res.status(201).json({
            _id: added_diningTableTrack._id,
            diningTable: added_diningTableTrack.diningTable,
            order: added_diningTableTrack.order,
        })
    }
    catch(error){
        next(error);
    }
}

async function getAllTableTracks(req,res,next){
    try{
        const tableTracks = await DiningTableTrack.find()
        if(!tableTracks){
            return next(createError(404));
        }
        const count = await tableTracks.length;
        return res.status(200).json(tableTracks);
    }
    catch(error){
        next(error);
    }
}




module.exports = {createDiningTableTrack, getAllTableTracks}