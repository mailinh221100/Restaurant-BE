const Category = require('../models/category.model');
const createError = require('http-errors');

async function createCategory(req, res, next) {
  try {
    const categoryName = req.body.categoryName;

    const category = await Category.create({
      categoryName
    });
    res.status(201).json({
      _id: category._id,
      category: category.categoryName    
    });
  } catch (error) {
    next(error);
  }
}

async function getAllCategories(req, res, next) {
  try {
    const categories = await Category.find().exec();
    if (!categories) {
      return next(createError(404));
    }
    return res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
}

async function deleteCategory(req, res, next){
    const {categoryId} = req.params;
    try {
        const category = await Category.findById(categoryId);
        console.log("jaajjaja");
        if(category){
            await category.remove();
            return res.status(200).json({ message: 'Deleted Category' });
        }
        return next(createError(404));
    } catch (error) {
        next(error);
    }
}

module.exports = {
  createCategory,
  getAllCategories,
  deleteCategory
}
