const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const fs = require('fs');
const nodemailer = require('nodemailer');
const path = require('path');


require('dotenv').config();


async function registerUser(req, res, next) {
  try {
    const {fullName, email, password} = req.body;
    if (!email) {
      return res.status(400).json({message: 'Email is empty'});
    }

    const userExist = await User.findOne({email: email.toLowerCase()});
    if (userExist) {
      return res.status(400).json({message: 'Email already exists'});
    }

    const hashedPassword = await argon2.hash(password);
    const user = await User.create({
      email: email.toLowerCase(),
      fullName,
      password: hashedPassword
    });
    await user.save();

    const accessToken = jwt.sign({userId: user._id}, process.env.ACCESS_TOKEN, {
      expiresIn: '60m',
    })
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      roles: user.roles,
      token: accessToken,
      refreshToken: jwt.sign({userId: user._id}, process.env.JWT_REFRESH_SECRET, {
        expiresIn: '10d',
      })
    })
  } catch (error) {
    next(error);
  }
}

async function signIn(req, res, next) {
  try {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if (!user) res.status(404).json({message: 'Email or password is invalid.'});

    const passwordValid = await argon2.verify(user.password, password);
    if (!passwordValid) return res.status(404).json({message: "Password is invalid"});

    const accessToken = jwt.sign({userId: user._id}, process.env.ACCESS_TOKEN, {
      expiresIn: '180m',
    });
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      roles: user.roles,
      token: accessToken,
      refreshToken: jwt.sign({userId: user._id}, process.env.JWT_REFRESH_SECRET, {
        expiresIn: '10d',
      })
    })
  } catch (error) {
    next(error);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const {email} = req.body
    const user = await User.findOne({email})
    if (!user) {
      return res.status(404).json({message: 'Email is invalid.'});
    }
    console.log("email is exist");

    const resetPasswordCode = Math.random().toString().substring(2, 8);
    console.log(resetPasswordCode);

    user.resetPasswordCode = resetPasswordCode;
    await user.save();
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MASTER_EMAIL,
        pass: process.env.MASTER_PASSWORD
      }
    });

    var mailOptions = {
      from: process.env.MASTER_EMAIL,
      to: user.email,
      subject: 'Password Reset Confirm',
      html: fs.readFileSync(path.join(__dirname, '../views/reset_password_code.html'), 'utf-8')
        .replace('{user.fullName}', user.fullName)
        .replace('{user.resetPasswordCode}', user.resetPasswordCode)

    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({
      message: "Please check your email to receive password reset code."
    });
  } catch (error) {
    next(error);
  }
}

async function verifyResetPasswordCode(req, res, next) {
  try {
    const {email, resetPasswordCode} = req.body
    const user = await User.findOne({email, resetPasswordCode})
    if (!user) {
      return res.status(404).json({message: 'Code is invalid.'});
    }

    user.resetPasswordCode = '';
    await user.save();
    const resetPasswordToken = jwt.sign({userID: user._id}, process.env.ACCESS_TOKEN)
    return res.status(200).json({
      message: "Verifing reset password code is successful.",
      token: resetPasswordToken
    });
  } catch (error) {
    next(error);
  }
}

async function resetPassword(req, res, next) {
  try {
    const {email} = req.user;
    const {oldPassword, password} = req.body;
    const user = await User.findOne({email});
    if (!user) {
      return res.status(404).json({message: 'Email is invalid.'});
    }
    if (!await argon2.verify(user.password, oldPassword)) {
      return res.status(400).json({message: 'Old password is invalid.'});
    }
    const hashedPassword = await argon2.hash(password);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      message: "Reseting password is successful."
    });
  } catch (error) {
    next(error);
  }
}

async function getCurrentUser(req, res, next) {
  try {
    const requestUser = req.user;
    return res.status(200).json(requestUser);
  } catch (error) {
    next(error);
  }
}

async function getListUsers(req, res, next) {
  try {
    const condition = {};
    if (req?.query?.email) {
      condition.email = { "$regex": req?.query?.email, "$options": "i" };
    }
    const users = await User.find(condition).select('-password');
    return res.status(200).json(users);
  } catch (error) {
    next(error);
  }
}

async function adminResetPassword(req, res, next) {
  try {
    const {id} = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({message: 'User id is not exist.'});
    }
    // random new password
    const newPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await argon2.hash(newPassword);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      password: newPassword,
    });
  } catch (error) {
    next(error);
  }
}

async function refreshToken(req, res, next) {
  const refreshToken = req.body.refreshToken.replace('Bearer ', '');
  if (!refreshToken) {
    res.status(400).json({message: 'no refresh token'});
  }
  let user;
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({message: 'Not Found User'})
    }
    if (user.refreshToken !== refreshToken) {
      return res.status(400).json({
        message: 'Refresh token is invalid.'
      });
    }
    const newToken = jwt.sign({userId: user._id}, process.env.ACCESS_TOKEN, {
      expiresIn: '60m',
    });
    return res.status(200).json({
      token: newToken,
    });
  } catch (error) {
    console.log(error);
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({
        message: 'Refresh token is expired.'
      });
    }
    return res.status(401).json({message: 'Not Found User'});
  }
}

async function logOut(req, res, next) {
  try {
    const user = req.user;
    console.log(user);
    user.refreshToken = null;
    await user.save();
    return res.status(200).json({message: 'Log out success.'})
  } catch (error) {
    next(error);
  }
}

module.exports = {
  registerUser,
  signIn,
  forgotPassword,
  verifyResetPasswordCode,
  resetPassword,
  logOut,
  refreshToken,
  getCurrentUser,
  getListUsers,
  adminResetPassword,
}