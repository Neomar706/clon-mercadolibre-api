"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateCategory = exports.getCategory = exports.getCategories = exports.deleteCategory = exports.createCategory = void 0;
var _client = require("@prisma/client");
var _catchAsyncErrors = require("../../middleware/catchAsyncErrors");
var _errorHandler = require("../../utils/errorHandler");
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
var prisma = new _client.PrismaClient();
var getCategories = (0, _catchAsyncErrors.catchAsyncErrors)( /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (req, res, next) {
    var categories = yield prisma.category.findMany();
    res.status(200).json({
      success: true,
      results: categories
    });
  });
  return function (_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}());
exports.getCategories = getCategories;
var getCategory = (0, _catchAsyncErrors.catchAsyncErrors)( /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator(function* (req, res, next) {
    var id = Number(req.query.id);
    if (!id) return next(new _errorHandler.ErrorHandler('Por favor ingrese el campo: id', 400));
    var category = yield prisma.category.findUnique({
      where: {
        id
      }
    });
    if (!category) return next(new _errorHandler.ErrorHandler('No se encontro ninguna categoría', 404));
    res.status(200).json({
      success: true,
      result: category
    });
  });
  return function (_x4, _x5, _x6) {
    return _ref2.apply(this, arguments);
  };
}());
exports.getCategory = getCategory;
var createCategory = (0, _catchAsyncErrors.catchAsyncErrors)( /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator(function* (req, res, next) {
    var {
      category_name
    } = req.body;
    if (!category_name) return next(new _errorHandler.ErrorHandler('Por favor ingrese el campo: category_name', 400));
    yield prisma.category.create({
      data: {
        category: category_name
      }
    });
    res.status(200).json({
      success: true,
      message: 'Categoría creada con exito'
    });
  });
  return function (_x7, _x8, _x9) {
    return _ref3.apply(this, arguments);
  };
}());
exports.createCategory = createCategory;
var deleteCategory = (0, _catchAsyncErrors.catchAsyncErrors)( /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator(function* (req, res, next) {
    var id = Number(req.query.id);
    if (!id) return next(new _errorHandler.ErrorHandler('Por favor ingrese el campo: id', 400));
    yield prisma.category.delete({
      where: {
        id
      }
    });
    res.status(200).json({
      success: true,
      message: 'Categoría eliminada con exito'
    });
  });
  return function (_x10, _x11, _x12) {
    return _ref4.apply(this, arguments);
  };
}());
exports.deleteCategory = deleteCategory;
var updateCategory = (0, _catchAsyncErrors.catchAsyncErrors)( /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator(function* (req, res, next) {
    var id = Number(req.query.id);
    var {
      category_name
    } = req.body;
    if (!id) return next(new _errorHandler.ErrorHandler('Por favor ingrese el campo: id'));
    if (!category_name) return next(new _errorHandler.ErrorHandler('Por favor ingrese el campo: category_name'));
    yield prisma.category.update({
      where: {
        id
      },
      data: {
        category: category_name
      }
    });
    res.status(200).json({
      success: true,
      message: 'Categoría actualizada con exito'
    });
  });
  return function (_x13, _x14, _x15) {
    return _ref5.apply(this, arguments);
  };
}());
exports.updateCategory = updateCategory;