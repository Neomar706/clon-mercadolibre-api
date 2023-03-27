"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toggleArticleFavorite = exports.getArticlesFromFavorite = void 0;
var _client = require("@prisma/client");
var _catchAsyncErrors = require("../../middleware/catchAsyncErrors");
var _errorHandler = require("../../utils/errorHandler");
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
var prisma = new _client.PrismaClient();
var toggleArticleFavorite = (0, _catchAsyncErrors.catchAsyncErrors)( /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (req, res, next) {
    var userId = req.user.id;
    var articleId = Number(req.query.articleId) || 0;
    if (!articleId) return next(new _errorHandler.ErrorHandler('Por favor ingrese el campo: articleId', 400));
    var favorite = yield prisma.favorite.findFirst({
      where: {
        userId,
        articleId
      }
    });
    if (favorite) {
      yield prisma.favorite.delete({
        where: {
          id: favorite.id
        }
      });
    } else {
      var article = yield prisma.article.findFirst({
        where: {
          id: articleId
        },
        select: {
          userId: true
        }
      });
      if (!(article !== null && article !== void 0 && article.userId)) return next(new _errorHandler.ErrorHandler('No se encontró el artículo', 404));
      if (article.userId === userId) return next(new _errorHandler.ErrorHandler('No puedes guardar en favoritos un artículo publicado por tí', 400));
      yield prisma.favorite.create({
        data: {
          link: "/article?id=".concat(articleId),
          userId,
          articleId
        }
      });
    }
    res.status(200).json({
      success: true,
      message: favorite ? '¡LISTO! eliminamos tu favorito' : '¡LISTO! lo añadimos a tus favoritos'
    });
  });
  return function (_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}());
exports.toggleArticleFavorite = toggleArticleFavorite;
var getArticlesFromFavorite = (0, _catchAsyncErrors.catchAsyncErrors)( /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator(function* (req, res, next) {
    var userId = req.user.id;
    var limit = req.query.limit ? Number(req.query.limit) : 10;
    var page = req.query.page ? Number(req.query.page) : 1;
    var offset = (page - 1) * limit;
    var count = yield prisma.favorite.count({
      where: {
        userId
      }
    });
    if (!count) return next(new _errorHandler.ErrorHandler('No se encontró ningún artículo', 404));
    var favorites = yield prisma.favorite.findMany({
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
    var result = {
      count,
      favorites
    };
    res.status(200).json({
      success: true,
      result
    });
  });
  return function (_x4, _x5, _x6) {
    return _ref2.apply(this, arguments);
  };
}());
exports.getArticlesFromFavorite = getArticlesFromFavorite;