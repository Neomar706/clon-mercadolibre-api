"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.userRouter = void 0;
var _express = require("express");
var _user = require("./user.controller");
var _auth = require("../../middleware/auth");
var userRouter = (0, _express.Router)();
exports.userRouter = userRouter;
userRouter.route('/auth/signup').post(_user.signup);
userRouter.route('/auth/signin').post(_user.signin);
userRouter.route('/auth/signout').get(_user.signout);
userRouter.route('/auth/password/forgot').post(_user.forgotPassword);
userRouter.route('/auth/password/reset').patch(_user.resetPassword);
userRouter.route('/user/me').get(_auth.isAuthenticatedUser, _user.getUserDetails);
userRouter.route('/user/me/update').put(_auth.isAuthenticatedUser, _user.updateProfile);
userRouter.route('/user/password/update').patch(_auth.isAuthenticatedUser, _user.updatePassword);