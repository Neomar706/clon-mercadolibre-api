"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateArticle = exports.togglePauseArticle = exports.searchArticleFilter = exports.getArticlesByUserId = exports.getArticles = exports.deleteArticle = exports.createArticle = exports.articleDetails = void 0;
var _cloudinary = require("cloudinary");
var _client = require("@prisma/client");
var _catchAsyncErrors = require("../../middleware/catchAsyncErrors");
var _errorHandler = require("../../utils/errorHandler");
var _verifyRequiredFields = require("../../utils/verifyRequiredFields");
var _articleFeatures = require("./helpers/articleFeatures");
var _deleteFromDBAndCloudinary = require("./helpers/deleteFromDBAndCloudinary");
var _withoutPicturesOfDatabase = require("./helpers/withoutPicturesOfDatabase");
var _randomCategory = require("./helpers/randomCategory");
var _getPriceBs = require("./helpers/getPriceBs");
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
var prisma = new _client.PrismaClient();
var createArticle = (0, _catchAsyncErrors.catchAsyncErrors)( /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (req, res, next) {
    var requiredFields = ['title', 'brand', 'model', 'isNew', 'stock', 'price', 'shipmentFree', 'daysWarranty', 'description', 'images', 'categories'];
    var [isOk, field] = (0, _verifyRequiredFields.verifyRequiredFields)(req.body, requiredFields);
    if (!isOk) return next(new _errorHandler.ErrorHandler("Por favor ingrese el campo: ".concat(field)));
    var {
      id: userId
    } = req.user;
    var {
      title,
      brand,
      model,
      isNew,
      stock,
      price,
      shipmentFree,
      daysWarranty,
      description
    } = req.body;
    var {
      images,
      categories
    } = req.body;
    var imagesLinks = [];
    for (var i = 0; i < images.length; i++) {
      var result = yield _cloudinary.v2.uploader.upload(images[i], {
        folder: 'articles',
        transformation: [{
          width: 1000
        }]
      });
      imagesLinks.push({
        publicId: result.public_id,
        link: result.secure_url
      });
    }
    yield prisma.article.create({
      data: {
        userId,
        title,
        brand,
        model,
        isNew,
        isPaused: false,
        stock,
        price,
        shipmentFree,
        daysWarranty,
        description,
        pictures: {
          create: imagesLinks
        },
        categories: {
          connect: categories.map(id => ({
            id
          }))
        }
      }
    });
    res.status(200).json({
      success: true,
      message: 'Artículo publicado con éxito'
    });
  });
  return function (_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}());
exports.createArticle = createArticle;
var deleteArticle = (0, _catchAsyncErrors.catchAsyncErrors)( /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator(function* (req, res, next) {
    var articleId = Number(req.query.id);
    var userId = Number(req.user.id);
    if (!articleId) return next(new _errorHandler.ErrorHandler('Por favor ingrese el campo: id', 400));
    var finded = yield prisma.article.count({
      where: {
        id: articleId,
        userId
      }
    });
    if (!finded) return next(new _errorHandler.ErrorHandler('No se encontró ningún artículo', 404));
    var pictures = yield prisma.picture.findMany({
      where: {
        articleId
      },
      select: {
        publicId: true
      }
    });
    try {
      yield prisma.article.delete({
        where: {
          id: articleId
        }
      });
      yield Promise.all(pictures.map(_ref3 => {
        var {
          publicId
        } = _ref3;
        return _cloudinary.v2.uploader.destroy(publicId);
      }));
    } catch (err) {
      next(err);
    }
    res.status(200).json({
      success: true,
      message: 'Artículo se eliminado con éxito'
    });
  });
  return function (_x4, _x5, _x6) {
    return _ref2.apply(this, arguments);
  };
}());
exports.deleteArticle = deleteArticle;
var updateArticle = (0, _catchAsyncErrors.catchAsyncErrors)( /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator(function* (req, res, next) {
    var userId = Number(req.user.id);
    var articleId = Number(req.query.id);
    if (!articleId) return next(new _errorHandler.ErrorHandler('Por favor ingrese el campo: id'));
    var finded = yield prisma.article.count({
      where: {
        id: articleId,
        userId: userId
      }
    });
    if (!finded) return next(new _errorHandler.ErrorHandler('No se encontró ningún artículo', 404));
    var obj = {};
    req.body.title ? obj['title'] = req.body.title : null;
    req.body.brand ? obj['brand'] = req.body.brand : null;
    req.body.model ? obj['model'] = req.body.model : null;
    req.body.is_new ? obj['isNew'] = req.body.is_new : null;
    req.body.is_paused ? obj['isPaused'] = req.body.is_paused : null;
    req.body.stock ? obj['stock'] = req.body.stock : null;
    req.body.price ? obj['price'] = req.body.price : null;
    req.body.shipment_free ? obj['shipmentFree'] = req.body.shipment_free : null;
    req.body.days_warranty ? obj['daysWarranty'] = req.body.days_warranty : null;
    req.body.description ? obj['description'] = req.body.description : null;
    req.body.pictures ? obj['pictures'] = req.body.pictures : null;
    req.body.categories ? obj['categories'] = req.body.categories : null;
    var imagesLinks = [];
    if (obj.pictures) {
      var _pictures = yield prisma.picture.findMany({
        where: {
          articleId
        },
        select: {
          link: true
        }
      });
      var pictures4Delete = _pictures.filter(_ref5 => {
        var {
          link
        } = _ref5;
        return !obj.pictures.includes(link);
      });
      pictures4Delete = pictures4Delete.map(_ref6 => {
        var {
          link
        } = _ref6;
        return link;
      });
      (0, _deleteFromDBAndCloudinary.deleteFromDBAndCloudinary)(prisma.picture, pictures4Delete, next);
      var filteredPictures = (0, _withoutPicturesOfDatabase.withoutPicturesOfDatabase)(obj.pictures);
      for (var i = 0; i < filteredPictures.length; i++) {
        try {
          var result = yield _cloudinary.v2.uploader.upload(filteredPictures[i], {
            folder: 'articles',
            transformation: [{
              width: 1000
            }]
          });
          imagesLinks.push({
            publicId: result.public_id,
            link: result.secure_url
          });
        } catch (err) {
          next(err);
        }
      }
    }
    var pictures = yield prisma.picture.findMany({
      where: {
        articleId
      },
      select: {
        publicId: true
      }
    });
    try {
      var _obj$categories;
      var data = obj;
      if (imagesLinks.length) data.pictures = {
        create: imagesLinks
      };
      if ((_obj$categories = obj.categories) !== null && _obj$categories !== void 0 && _obj$categories.length) {
        var categories = yield prisma.category.findMany({
          where: {
            articles: {
              some: {
                id: articleId
              }
            }
          },
          select: {
            id: true
          }
        });
        data.categories = {
          disconnect: categories,
          connect: obj.categories.map(id => ({
            id
          }))
        };
      }
      yield prisma.article.update({
        where: {
          id: articleId
        },
        data
      });
      yield Promise.all(pictures.map(_ref7 => {
        var {
          publicId
        } = _ref7;
        return _cloudinary.v2.uploader.destroy(publicId);
      }));
    } catch (err) {
      yield Promise.all(imagesLinks.map(_ref8 => {
        var {
          publicId
        } = _ref8;
        return _cloudinary.v2.uploader.destroy(publicId);
      }));
    }
    res.status(200).json({
      success: true,
      message: 'Artículo actualizado con éxito'
    });
  });
  return function (_x7, _x8, _x9) {
    return _ref4.apply(this, arguments);
  };
}());
exports.updateArticle = updateArticle;
var getArticlesRecursive = /*#__PURE__*/function () {
  var _ref9 = _asyncToGenerator(function* (req, res, next) {
    var distinct_of;
    if (!req.query.distinct_of) distinct_of = [''];else distinct_of = JSON.parse(decodeURIComponent(req.query.distinct_of));
    var distinctCategories = (yield prisma.category.findMany({
      where: {
        articles: {
          some: {} // Don't remove
        }
      },

      select: {
        category: true
      }
    })).map(_ref10 => {
      var {
        category
      } = _ref10;
      return category;
    });
    var hasError = distinctCategories.every(elem => distinct_of.includes(elem));
    if (hasError) return () => next(new _errorHandler.ErrorHandler('No se encontró ningún artículo', 404));
    var category = yield (0, _randomCategory.randomCategory)(prisma.category, distinct_of);
    var articles = yield prisma.article.findMany({
      where: {
        categories: {
          some: {
            category
          }
        },
        isPaused: false
      },
      select: {
        id: true,
        title: true,
        price: true,
        shipmentFree: true,
        pictures: {
          select: {
            id: true,
            link: true
          }
        }
      }
    });
    if (!articles.length) return yield getArticlesRecursive(req, res, next);
    if (req.query.userId) {
      var favorites = (yield prisma.favorite.findMany({
        where: {
          userId: Number(req.query.userId)
        },
        select: {
          articleId: true
        }
      })).map(_ref11 => {
        var {
          articleId
        } = _ref11;
        return articleId;
      });
      articles = articles.map(article => _objectSpread(_objectSpread({}, article), {}, {
        isFavorite: favorites.includes(article.id) ? true : false
      }));
    }
    return {
      category,
      articles
    };
  });
  return function getArticlesRecursive(_x10, _x11, _x12) {
    return _ref9.apply(this, arguments);
  };
}();
var getArticles = (0, _catchAsyncErrors.catchAsyncErrors)( /*#__PURE__*/function () {
  var _ref12 = _asyncToGenerator(function* (req, res, next) {
    var result = yield getArticlesRecursive(req, res, next);
    if (typeof result === 'function') return result();
    res.status(200).json({
      success: true,
      result
    });
  });
  return function (_x13, _x14, _x15) {
    return _ref12.apply(this, arguments);
  };
}());
exports.getArticles = getArticles;
var getArticlesByUserId = (0, _catchAsyncErrors.catchAsyncErrors)( /*#__PURE__*/function () {
  var _ref13 = _asyncToGenerator(function* (req, res, next) {
    var userId = Number(req.query.userId);
    var limit = Number(req.query.limit) || 12;
    var distinctId = Number(req.query.distinctId) || 0;
    if (!userId) return next(new _errorHandler.ErrorHandler('Por favor ingrese el campo: userId'));
    var articles = yield prisma.article.findMany({
      where: {
        id: {
          not: {
            equals: distinctId
          }
        },
        userId,
        isPaused: false
      },
      select: {
        id: true,
        title: true,
        price: true,
        shipmentFree: true,
        pictures: {
          select: {
            id: true,
            link: true
          }
        }
      },
      take: limit
    });
    if (!articles.length) return next(new _errorHandler.ErrorHandler('No se encontraron artículos', 404));
    var favorites = (yield prisma.favorite.findMany({
      where: {
        userId
      },
      select: {
        articleId: true
      }
    })).map(_ref14 => {
      var {
        articleId
      } = _ref14;
      return articleId;
    });
    articles = articles.map(article => _objectSpread(_objectSpread({}, article), {}, {
      isFavorite: favorites.includes(article.id) ? true : false
    }));
    res.status(200).json({
      success: true,
      results: articles
    });
  });
  return function (_x16, _x17, _x18) {
    return _ref13.apply(this, arguments);
  };
}());
exports.getArticlesByUserId = getArticlesByUserId;
var togglePauseArticle = (0, _catchAsyncErrors.catchAsyncErrors)( /*#__PURE__*/function () {
  var _ref15 = _asyncToGenerator(function* (req, res, next) {
    var userId = req.user.id;
    var articleId = Number(req.query.article_id);
    if (!articleId) return next(new _errorHandler.ErrorHandler('Por favor ingrese el campo: article_id', 400));
    var article = yield prisma.article.findFirst({
      where: {
        id: articleId,
        userId
      },
      select: {
        _count: true,
        isPaused: true
      }
    });
    if (!article) return next(new _errorHandler.ErrorHandler('No se encontró ningún artículo', 404));
    yield prisma.article.update({
      where: {
        id: articleId
      },
      data: {
        isPaused: !article.isPaused
      }
    });
    res.status(200).json({
      success: true,
      message: !article.isPaused ? 'Artículo pausado con exito' : 'Artículo despausado con exito'
    });
  });
  return function (_x19, _x20, _x21) {
    return _ref15.apply(this, arguments);
  };
}());
exports.togglePauseArticle = togglePauseArticle;
var searchArticleFilter = (0, _catchAsyncErrors.catchAsyncErrors)( /*#__PURE__*/function () {
  var _ref16 = _asyncToGenerator(function* (req, res, next) {
    var {
      keyword,
      state,
      shipmentFree,
      category,
      news,
      price,
      page,
      limit
    } = req.query;
    var queryParams = {};
    keyword ? queryParams['keyword'] = keyword : null;
    state ? queryParams['state'] = state : null;
    news ? queryParams['news'] = news === 'true' ? true : false : null;
    shipmentFree ? queryParams['shipmentFree'] = shipmentFree === 'true' : null;
    price ? queryParams['price'] = price : null;
    category ? queryParams['category'] = category : null;
    page ? queryParams['page'] = Number(page) : null;
    limit ? queryParams['limit'] = Number(limit) : null;
    var query = new _articleFeatures.ArticleFeatures(queryParams).search().filter().paginate();
    res.status(200).json({
      success: true,
      result: {
        articlesQuantity: yield query.getQuantity(prisma.article),
        articles: yield query.run(prisma.article, prisma.favorite, req.query.userId)
      }
    });
  });
  return function (_x22, _x23, _x24) {
    return _ref16.apply(this, arguments);
  };
}());
exports.searchArticleFilter = searchArticleFilter;
var articleDetails = (0, _catchAsyncErrors.catchAsyncErrors)( /*#__PURE__*/function () {
  var _ref17 = _asyncToGenerator(function* (req, res, next) {
    var articleId = Number(req.query.id);
    if (!articleId) return next(new _errorHandler.ErrorHandler('Por favor ingrese el campo: id'));
    var article = yield prisma.article.findUnique({
      where: {
        id: articleId
      },
      include: {
        pictures: {
          select: {
            id: true,
            link: true
          }
        },
        user: {
          select: {
            addresses: {
              where: {
                currentAddress: true
              },
              select: {
                id: true,
                state: true,
                city: true,
                parish: true
              }
            }
          }
        },
        questionInfo: {
          select: {
            id: true,
            questions: {
              select: {
                id: true,
                question: true,
                questionDate: true,
                answer: true,
                answerDate: true
              }
            }
          }
        },
        purchases: true
      }
    });
    var salesCount = yield prisma.purchase.count({
      where: {
        userId: article.userId
      }
    });
    article.user.salesAchieved = salesCount;
    article.isFavorite = (yield prisma.favorite.findMany({
      where: {
        userId: Number(req.query.userId) || 0
      },
      select: {
        articleId: true
      }
    })).map(_ref18 => {
      var {
        articleId
      } = _ref18;
      return articleId;
    }).includes(article.id) ? true : false;
    res.status(200).json({
      success: true,
      result: article
    });
  });
  return function (_x25, _x26, _x27) {
    return _ref17.apply(this, arguments);
  };
}());
exports.articleDetails = articleDetails;