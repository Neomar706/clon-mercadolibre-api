"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addressRouter = void 0;
var _express = require("express");
var _address = require("./address.controller");
var _auth = require("../../middleware/auth");
var addressRouter = (0, _express.Router)();
exports.addressRouter = addressRouter;
addressRouter.route('/address/new').post(_auth.isAuthenticatedUser, _address.newAddress);
addressRouter.route('/addresses').get(_auth.isAuthenticatedUser, _address.getAddresses);
addressRouter.route('/address/update').put(_auth.isAuthenticatedUser, _address.updateAddress);
addressRouter.route('/address/delete').delete(_auth.isAuthenticatedUser, _address.deleteAddress);