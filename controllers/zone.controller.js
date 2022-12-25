const {Zone, DiningTable, Reservation} = require('../models/reservation.model');
const createError = require('http-errors');

async function createZone(req,res,next){
    try{
        const {zoneName} = req.body;
        const zone  = await Zone.create({
            zoneName
        });
        res.status(201).json(zone)
    }
    catch(error){
        next(error);
    }
}

async function getZone(req,res,next){
    try{
        const {zoneId} = req.params;
        let zone  = await Zone.findById(zoneId);
        if (!zone) {
            return next(createError(404));
        }
        const diningTables = await DiningTable.find({zone: zoneId});
        zone = {
            _id: zone.id,
            zoneName: zone.zoneName,
            diningTables,
        }
        return res.status(200).json(zone);
    }
    catch(error){
        next(error);
    }
}

async function deleteZone(req,res,next){
    try{
        const {zoneId} = req.params;
        const zone  = await Zone.findById(zoneId);
        if (!zone) {
            return next(createError(404));
        }
        zone.status = 'Inactive';
        await zone.save();
        return res.status(200).json({message: 'Deleted Zone'});
    }
    catch(error){
        next(error);
    }
}

async function getAllZones(req, res, next) {
    try {
      const zones = await Zone.find({status: 'Active'});
      const listZones = [];
      for (const zone of zones) {
          const diningTables = await DiningTable.find({zone: zone._id});
          listZones.push({
              _id: zone._id,
              zoneName: zone.zoneName,
              diningTables,
          });
      }
      return res.status(200).json(listZones);
    } catch (error) {
      next(error);
    }
}

async function getListZoneAndAvailableTables(req, res, next) {
    try {
        const startDate = req?.query?.startDate;
        const endDate = req?.query?.startDate;
        // get order table
        const acceptedReservationsInDate = await Reservation.find({
            status: 'Accepted',
            date: {
                $gte: startDate,
                $lte: endDate,
            }
        })
            .populate({
                path: 'diningTables'
            });

        const orderedTableIds = [];
        for (const acceptedReservation of acceptedReservationsInDate) {
            for (const table of acceptedReservation.diningTables) {
                orderedTableIds.push(table._id.valueOf());
            }
        }

        // get zone and available tables
        const zones = await Zone.find({status: 'Active'});
        const listZones = [];
        for (const zone of zones) {
            const diningTables = await DiningTable.find({zone: zone._id});

            const availableDiningTables = [];

            for (const table of diningTables) {
                if (!orderedTableIds.includes(table._id.valueOf())) {
                    availableDiningTables.push(table);
                }
            }

            listZones.push({
                _id: zone._id,
                zoneName: zone.zoneName,
                diningTables: availableDiningTables,
            });
        }
        return res.status(200).json(listZones);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createZone,
    getZone,
    deleteZone,
    getAllZones,
    getListZoneAndAvailableTables,
}