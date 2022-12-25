const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/'});
const {
    createMenuItem,
    getAllMenuItems,
    getMenuItemsInCategory,
    getMenuItemById,
    updateMenuItem,
    updateMenuItemStatus,
    searchMenuItem,
    deleteMenuItem,
} = require('../controllers/menuItem.controller');
const authMiddleware = require("../middlewares/auth.middleware");

router.post('/', authMiddleware.verifyToken, authMiddleware.isAdmin, upload.single('image'), createMenuItem)
    .get("/", authMiddleware.verifyToken, getAllMenuItems)
    .get('/category/:categoryId', authMiddleware.verifyToken, getMenuItemsInCategory)
    .get('/:menuItemId', authMiddleware.verifyToken, getMenuItemById)
    .put('/:menuItemId', authMiddleware.verifyToken, authMiddleware.isAdmin, upload.single('image'), updateMenuItem)
    .patch('/:menuItemId/status', authMiddleware.verifyToken, authMiddleware.isAdmin, updateMenuItemStatus)
    .get('/search', authMiddleware.verifyToken, searchMenuItem)
    .delete('/:menuItemId', authMiddleware.verifyToken, authMiddleware.isAdmin, deleteMenuItem)

module.exports = router;