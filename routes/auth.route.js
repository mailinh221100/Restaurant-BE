const express = require('express');
const router = express.Router();

const {registerUser,signIn,forgotPassword, verifyResetPasswordCode, resetPassword, logOut, getCurrentUser, getListUsers, adminResetPassword} = require('../controllers/auth.controller')
const authMiddleware = require('../middlewares/auth.middleware');

//@route Post register

router.post('/sign_up', registerUser)
    .post('/sign_in', signIn)
    .get('/log_out', authMiddleware.verifyToken, logOut)
    .post('/forgot_password', authMiddleware.verifyToken, forgotPassword)
    .post('/verify_reset_password_code', authMiddleware.verifyToken, verifyResetPasswordCode )
    .patch('/reset_password',authMiddleware.verifyToken, resetPassword)
    .get('/current_user',authMiddleware.verifyToken, getCurrentUser)
    .get('/list-user',authMiddleware.verifyToken, getListUsers)
    .patch('/admin_reset_password/:id',authMiddleware.verifyToken, authMiddleware.isAdmin, adminResetPassword)

router.get('/',(req,res)=>{
    res.send('ok')
});

module.exports = router;