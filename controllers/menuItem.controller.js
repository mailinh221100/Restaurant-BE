const MenuItem = require('../models/menuItem.model');
const {uploadImage} = require('../utils/cloudinary.util');
const createError = require('http-errors');
const {checkAdmin} = require("../utils/auth.util");

async function createMenuItem(req, res, next) {
    try {
        const {itemName, category, itemDescription, itemPrice, unit, status} = JSON.parse(req.body.data);
        const uploadedImage = await uploadImage(req.file.path);
        const {public_id, secure_url} = uploadedImage;
        const menuItem = await MenuItem.create({
            itemName,
            category,
            itemDescription,
            itemPrice,
            unit,
            status,
            imageUrl: secure_url,
            imageId: public_id,
        });
        const addedMenuItem = await MenuItem.findById(menuItem._id).populate({
            path: 'category',
            select: 'categoryName'
        }).exec();
        res.status(201).json(addedMenuItem);
    } catch (error) {
        next(error);
    }
}

async function getAllMenuItems(req, res, next) {
    try {
        const isAdmin = checkAdmin(req.user);
        const condition = isAdmin ? {} : {status: 'Active'};

        if (req?.query?.itemName) {
            condition.itemName = { "$regex": req?.query?.itemName, "$options": "i" };
        }

        const menuItems = await MenuItem.find(condition)
            .populate({
                path: 'category',
                select: 'categoryName'
            }).exec();
        return res.status(200).json(menuItems);
    } catch (error) {
        next(error);
    }
}

async function getMenuItemById(req, res, next) {
    try {
        const menuItemId = req.params.menuItemId;
        const menuItem = await MenuItem.findOne({_id: menuItemId})
            .populate({
                path: 'category',
                select: 'categoryName'
            }).exec();
        if (!menuItem) {
            return next(createError(404));
        }
        return res.status(200).json(menuItem);
    } catch (error) {
        next(error);
    }
}

async function getMenuItemsInCategory(req, res, next) {
    try {
        const categoryId = req.params.categoryId;
        const menuItems = await MenuItem.find({category: categoryId})
            .populate({
                path: 'category',
                select: '_id categoryName'
            }).exec()
        return res.status(200).json(menuItems);
    } catch (error) {
        next(error);
    }
}

async function updateMenuItem(req, res, next) {
    if (typeof req.body == 'undefined' || req.params.menuItemId === null) {
        return res.json({
            status: "Error",
            message: "Something went wrong! check your sent data"
        });
    }
    try {
        const {itemName, category, itemDescription, itemPrice, unit, status} = JSON.parse(req.body.data);
        const menuItemId = req.params.menuItemId;
        const menuItem = await MenuItem.findById(menuItemId)
            .populate({
                path: 'category',
                select: 'categoryName'
            }).exec();
        if (!menuItem) {
            return next(createError(404));
        } else {
            // upload image if has new image
            if (req.file) {
                const uploadedImage = await uploadImage(req.file.path);
                const { public_id, secure_url } = uploadedImage;
                menuItem.imageUrl = secure_url;
                menuItem.imageId = public_id;
            }
            menuItem.itemName = itemName;
            menuItem.category = category;
            menuItem.itemDescription = itemDescription;
            menuItem.itemPrice = itemPrice;
            menuItem.unit = unit;
            menuItem.status = status;
            await menuItem.save();

            const updatedMenuItem = await MenuItem.findById(menuItem._id).populate({
                path: 'category',
                select: 'categoryName'
            }).exec();
            res.status(201).json(updatedMenuItem)
        }
    } catch (error) {
        next(error);
    }
}

async function searchMenuItem(req, res, next) {
    try {
        const {itemId, category} = req.query;
        console.log("hahah" + req.query);
        const findOpiton = {};
        if (itemId) {
            findOpiton._id = itemId;
            console.log(findOpiton);
        }
        if (category) {
            findOpiton.category = {$regex: '.*' + category + '.*'};
        }

        const menuItems = await MenuItem.find(findOpiton);
        return res.status(200).json(menuItems);
    } catch (error) {
        next(error);
    }
}

async function deleteMenuItem(req, res, next) {
    const itemId = req.params.itemId;
    try {
        const item = await MenuItem.findById(itemId)
            .populate({
                path: 'category',
                select: 'categoryName'
            }).exec();
        if (item) {
            await item.remove();
            return res.status(200).json({message: 'Deleted Menu Item'});
        }
        return next(createError(404));
    } catch (error) {
        next(error);
    }
}

async function updateMenuItemStatus(req, res, next) {
    try {
        const menuItem = await MenuItem.findById(req.params.menuItemId);

        if (!menuItem) {
            return next(createError(404));
        }
        menuItem.status = req.body.status;
        await menuItem.save();
        return res.status(200).json({message: 'MenuItem status has been updated.'});
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createMenuItem,
    getAllMenuItems,
    getMenuItemsInCategory,
    getMenuItemById,
    updateMenuItem,
    updateMenuItemStatus,
    searchMenuItem,
    deleteMenuItem,
}