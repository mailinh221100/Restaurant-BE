const express = require('express');
const router = express.Router();
const {
  createCategory,
  getAllCategories,
  deleteCategory
} = require('../controllers/category.controller');
const authMiddleware = require("../middlewares/auth.middleware");

router.post('/', authMiddleware.verifyToken, authMiddleware.isAdmin, createCategory)
  .get('/', authMiddleware.verifyToken, getAllCategories)
  .delete('/:categoryId', authMiddleware.verifyToken, authMiddleware.isAdmin, deleteCategory)
module.exports = router;