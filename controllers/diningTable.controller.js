const {DiningTable} = require('../models/reservation.model');
const createError = require('http-errors');

async function createDiningTable(req,res,next){
    try{
        const {tableName, chairCount, tableType, zone} = req.body;
        const diningTable  = await DiningTable.create({
            tableName, chairCount, tableType, zone
        });
        return res.status(201).json(diningTable);
    }
    catch(error){
        next(error);
    }
}

async function deleteDiningTable(req,res,next){
    try{
        const {diningTableId} = req.params;
        const diningTable  = await DiningTable.findById(diningTableId).exec();
        if (!diningTable) {
            return next(createError(404));
        }
        await diningTable.remove();
        return res.status(200).json({message: 'Deleted Dining Table'});
    }
    catch(error){
        next(error);
    }
}

module.exports = {
    createDiningTable,
    deleteDiningTable
}