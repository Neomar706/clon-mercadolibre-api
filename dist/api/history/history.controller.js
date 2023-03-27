"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toggleArticleHistory = exports.getArticlesFromHistory = exports.delete2History = exports.add2History = void 0;
var _client = require("@prisma/client");
var _catchAsyncErrors = require("../../middleware/catchAsyncErrors");
var _errorHandler = require("../../utils/errorHandler");
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
var prisma = new _client.PrismaClient();
var add2History = (0, _catchAsyncErrors.catchAsyncErrors)( /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (req, res, next) {
    var articleId = req.query.articleId ? Number(req.query.articleId) : 0;
    var userId = req.user.id;
    if (!articleId) return next(new _errorHandler.ErrorHandler('Por favor ingrese el campo: articleId'), 400);
    var count = yield prisma.article.count({
      where: {
        id: articleId
      }
    });
    if (!count) return next(new _errorHandler.ErrorHandler('No se encontró el artículo'), 404);
    yield prisma.history.create({
      data: {
        link: "/article?id=".concat(articleId),
        userId,
        articleId
      }
    });
    res.status(201).json({
      success: true,
      message: '¡LISTO! lo añadimos a tu historial'
    });
  });
  return function (_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}());
exports.add2History = add2History;
var delete2History = (0, _catchAsyncErrors.catchAsyncErrors)( /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator(function* (req, res, next) {
    var articleId = req.query.articleId ? Number(req.query.articleId) : 0;
    var userId = req.user.id;
    if (!articleId) return next(new _errorHandler.ErrorHandler('Por favor ingrese el campo: articleId'), 400);
    var history = yield prisma.history.findFirst({
      where: {
        userId,
        articleId
      }
    });
    if (!history) return next(new _errorHandler.ErrorHandler('No se encontró el artículo'), 404);
    yield prisma.history.delete({
      where: {
        id: history.id
      }
    });
    res.status(200).json({
      success: true,
      message: '¡LISTO! lo eliminamos de tu historial'
    });
  });
  return function (_x4, _x5, _x6) {
    return _ref2.apply(this, arguments);
  };
}());
exports.delete2History = delete2History;
var toggleArticleHistory = (0, _catchAsyncErrors.catchAsyncErrors)( /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator(function* (req, res, next) {
    var articleId = req.query.articleId ? Number(req.query.articleId) : 0;
    var userId = req.user.id;
    if (!articleId) return next(new _errorHandler.ErrorHandler('Por favor ingrese el campo: articleId'), 400);
    var history = yield prisma.history.findFirst({
      where: {
        userId,
        articleId
      }
    });
    if (history) {
      yield prisma.history.delete({
        where: {
          id: history.id
        }
      });
    } else {
      var count = yield prisma.article.count({
        where: {
          id: articleId
        }
      });
      if (!count) return next(new _errorHandler.ErrorHandler('No se encontró el artículo'), 404);
      yield prisma.history.create({
        data: {
          link: "/article?id=".concat(articleId),
          userId,
          articleId
        }
      });
    }
    res.status(200).json({
      success: true,
      message: history ? '¡LISTO! lo eliminamos de tu historial' : '¡LISTO! lo añadimos a tu historial'
    });
  });
  return function (_x7, _x8, _x9) {
    return _ref3.apply(this, arguments);
  };
}());
exports.toggleArticleHistory = toggleArticleHistory;
var getArticlesFromHistory = (0, _catchAsyncErrors.catchAsyncErrors)( /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator(function* (req, res, next) {
    var userId = req.user.id;
    var limit = req.query.limit ? Number(req.query.limit) : 10;
    var page = req.query.page ? Number(req.query.page) : 1;
    var offset = (page - 1) * limit;
    var count = yield prisma.history.count({
      where: {
        userId
      }
    });
    if (!count) return next(new _errorHandler.ErrorHandler('No se encontró ningún artículo', 404));
    var histories = yield prisma.history.findMany({
      where: {
        userId
      },
      select: {
        id: true,
        link: true,
        article: {
          select: {
            id: true,
            title: true,
            price: true,
            stock: true,
            shipmentFree: true,
            pictures: {
              select: {
                id: true,
                link: true
              }
            }
          }
        }
      },
      take: limit,
      skip: offset,
      orderBy: {
        date: 'desc'
      }
    });
    var favorites = (yield prisma.favorite.findMany({
      where: {
        userId
      },
      select: {
        articleId: true
      }
    })).map(_ref5 => {
      var {
        articleId
      } = _ref5;
      return articleId;
    });
    histories = histories.map(history => _objectSpread(_objectSpread({}, history), {}, {
      article: _objectSpread(_objectSpread({}, history.article), {}, {
        isFavorite: favorites.includes(history.article.id) ? true : false
      })
    }));
    var result = {
      count,
      histories
    };
    res.status(200).json({
      success: true,
      result
    });
  });
  return function (_x10, _x11, _x12) {
    return _ref4.apply(this, arguments);
  };
}());
exports.getArticlesFromHistory = getArticlesFromHistory;