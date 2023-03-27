"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateAddress = exports.newAddress = exports.getAddresses = exports.deleteAddress = void 0;
var _client = require("@prisma/client");
var _catchAsyncErrors = require("../../middleware/catchAsyncErrors");
var _errorHandler = require("../../utils/errorHandler");
var _verifyRequiredFields = require("../../utils/verifyRequiredFields");
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
var prisma = new _client.PrismaClient();
var newAddress = (0, _catchAsyncErrors.catchAsyncErrors)( /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (req, res, next) {
    var _req$body;
    var userId = req.user.id;
    var requiredFields = ['state', 'city', 'municipality', 'parish', 'street', 'current_address'];
    var [isOk, field] = (0, _verifyRequiredFields.verifyRequiredFields)(req.body, requiredFields);
    if (!isOk) return next(new _errorHandler.ErrorHandler("Por favor ingrese el campo: ".concat(field), 400));
    var {
      state,
      city,
      municipality,
      parish,
      street,
      current_address
    } = req.body;
    var house_number = (_req$body = req.body) === null || _req$body === void 0 ? void 0 : _req$body.house_number;
    if (current_address) yield prisma.address.updateMany({
      where: {
        userId
      },
      data: {
        currentAddress: false
      }
    });
    var addressCreated = yield prisma.address.create({
      data: {
        userId,
        state,
        city,
        municipality,
        parish,
        street,
        currentAddress: current_address,
        houseNumber: house_number !== null && house_number !== void 0 ? house_number : null
      }
    });
    if (!addressCreated) return next(new _errorHandler.ErrorHandler('No se pudo guardar la dirección', 500));
    res.status(200).json({
      success: true,
      message: '¡Listo! guardamos tu derección'
    });
  });
  return function (_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}());
exports.newAddress = newAddress;
var getAddresses = (0, _catchAsyncErrors.catchAsyncErrors)( /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator(function* (req, res, next) {
    var userId = req.user.id;
    var addresses = yield prisma.address.findMany({
      where: {
        userId
      }
    });
    if (!addresses) return next(new _errorHandler.ErrorHandler('Aún no has registrado ningún domicilio', 400));
    var results = addresses.map(address => ({
      id: address.id,
      state: address.state,
      city: address.city,
      municipality: address.municipality,
      parish: address.parish,
      street: address.street,
      house_number: address.houseNumber,
      current_address: address.currentAddress
    }));
    res.status(200).json({
      success: true,
      results
    });
  });
  return function (_x4, _x5, _x6) {
    return _ref2.apply(this, arguments);
  };
}());
exports.getAddresses = getAddresses;
var updateAddress = (0, _catchAsyncErrors.catchAsyncErrors)( /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator(function* (req, res, next) {
    var userId = req.user.id;
    var addressId = Number(req.query.id);
    if (!addressId) return next(new _errorHandler.ErrorHandler('Por favor ingrese el campo: id'));
    var obj = {};
    req.body.state ? obj['state'] = req.body.state : null;
    req.body.city ? obj['city'] = req.body.city : null;
    req.body.municipality ? obj['municipality'] = req.body.municipality : null;
    req.body.parish ? obj['parish'] = req.body.parish : null;
    req.body.street ? obj['street'] = req.body.street : null;
    req.body.house_number ? obj['houseNumber'] = req.body.house_number : null;
    req.body.current_address ? obj['currentAddress'] = req.body.current_address : null;
    var updated = yield prisma.address.updateMany({
      where: {
        AND: [{
          id: addressId
        }, {
          userId
        }]
      },
      data: obj
    });
    if (!updated.count) return next(new _errorHandler.ErrorHandler('No se pudo actualizar el domicilio', 400));
    res.status(200).json({
      success: true,
      message: '¡Listo! actulizamos tu domicilio'
    });
  });
  return function (_x7, _x8, _x9) {
    return _ref3.apply(this, arguments);
  };
}());
exports.updateAddress = updateAddress;
var deleteAddress = (0, _catchAsyncErrors.catchAsyncErrors)( /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator(function* (req, res, next) {
    var userId = req.user.id;
    var addressId = Number(req.query.id);
    var deleted = yield prisma.address.deleteMany({
      where: {
        AND: [{
          id: addressId
        }, {
          userId
        }, {
          currentAddress: false
        }]
      }
    });
    if (!deleted.count) return next(new _errorHandler.ErrorHandler('No se pudo eliminar el domicilio', 400));
    res.status(200).json({
      success: true,
      message: '¡Listo! eliminamos el domicilio'
    });
  });
  return function (_x10, _x11, _x12) {
    return _ref4.apply(this, arguments);
  };
}());
exports.deleteAddress = deleteAddress;