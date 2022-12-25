const jwt = require('jsonwebtoken');
const constants = require('../utils/constants')
const createError = require('http-errors');
const User = require('../models/user.model');

async function verifyToken(req, res, next) {
    try {
      const token = req.headers.authorization.replace('Bearer ', '');
      if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
      }
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
      req.user = await User.findById(decoded.userId).select('-password');
      next();
    } catch (error) {
      console.error(error);
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          message: 'Token is expired.'
        });
      } else {
        return res.status(401).json({
          message: 'Not authorized, token failed.'
        });
      }
    }
  }
  
  async function ignoreVerifyToken(req, res, next) {
    try {  
      if (!req.headers.authorization) {
       req.user = null;
        return next();
      }
      const token = req.headers.authorization.replace('Bearer ', '');
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
  
  async function isAdmin(req, res, next) {
    if (req.user.roles.includes(constants.ADMIN)) {
      next();
    } else {
      next(createError(403));
    }
  }
  
  
  module.exports = {
    verifyToken,
    isAdmin,
    ignoreVerifyToken
  };
  