"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ArticleFeatures = void 0;
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var ArticleFeatures = class {
  constructor(queryParams) {
    this.query = '';
    this.queryParams = queryParams;
  }
  search() {
    this.query = {
      where: {
        isPaused: false
      },
      select: {
        id: true,
        title: true,
        price: true,
        shipmentFree: true,
        isNew: true,
        user: {
          select: {
            addresses: {
              where: {
                currentAddress: true
              },
              select: {
                id: true,
                state: true
              }
            }
          }
        },
        categories: true,
        pictures: {
          select: {
            id: true,
            link: true
          }
        }
      }
    };
    return this;
  }
  filter() {
    var _this$queryParams$pri, _this$queryParams$pri2;
    if (this.queryParams.keyword) {
      var keyword = this.queryParams.keyword;
      this.query.where = _objectSpread(_objectSpread({}, this.query.where), {}, {
        title: {
          contains: keyword
        }
      });
    }
    if (this.queryParams.category) {
      var category = this.queryParams.category;
      this.query.where = _objectSpread(_objectSpread({}, this.query.where), {}, {
        categories: {
          some: {
            category
          }
        }
      });
    }
    if (this.queryParams.state) {
      var state = this.queryParams.state;
      this.query.where = _objectSpread(_objectSpread({}, this.query.where), {}, {
        user: {
          addresses: {
            some: {
              state,
              currentAddress: true
            }
          }
        }
      });
    }
    if (this.queryParams.shipmentFree) {
      var shipmentFree = this.queryParams.shipmentFree;
      this.query.where = _objectSpread(_objectSpread({}, this.query.where), {}, {
        shipmentFree
      });
    }
    if (this.queryParams.news) {
      var isNew = this.queryParams.news;
      this.query.where = _objectSpread(_objectSpread({}, this.query.where), {}, {
        isNew
      });
    }
    if ((_this$queryParams$pri = this.queryParams.price) !== null && _this$queryParams$pri !== void 0 && _this$queryParams$pri.lte) {
      var lte = Number(this.queryParams.price.lte);
      this.query.where = _objectSpread(_objectSpread({}, this.query.where), {}, {
        price: {
          lte
        }
      });
    }
    if ((_this$queryParams$pri2 = this.queryParams.price) !== null && _this$queryParams$pri2 !== void 0 && _this$queryParams$pri2.gte) {
      var gte = Number(this.queryParams.price.gte);
      this.query.where = _objectSpread(_objectSpread({}, this.query.where), {}, {
        price: {
          gte
        }
      });
    }
    return this;
  }
  paginate() {
    var _this$queryParams$lim, _this$queryParams$pag;
    var limit = (_this$queryParams$lim = this.queryParams.limit) !== null && _this$queryParams$lim !== void 0 ? _this$queryParams$lim : 15;
    var page = (_this$queryParams$pag = this.queryParams.page) !== null && _this$queryParams$pag !== void 0 ? _this$queryParams$pag : 1;
    var offset = (page - 1) * limit;
    this.query.take = limit;
    this.query.skip = offset;
    return this;
  }
  getQuantity(articleModel) {
    var _this = this;
    return _asyncToGenerator(function* () {
      var query = JSON.parse(JSON.stringify(_this.query));
      delete query.select;
      delete query.skip;
      delete query.take;
      return yield articleModel.count(query);
    })();
  }
  run(articleModel, favoriteModel, userId) {
    var _this2 = this;
    return _asyncToGenerator(function* () {
      var articles = yield articleModel.findMany(_this2.query);
      if (userId) {
        var favorites = (yield favoriteModel.findMany({
          where: {
            userId: Number(userId)
          },
          select: {
            articleId: true
          }
        })).map(_ref => {
          var {
            articleId
          } = _ref;
          return articleId;
        });
        articles = articles.map(article => _objectSpread(_objectSpread({}, article), {}, {
          isFavorite: favorites.includes(article.id) ? true : false
        }));
      }
      return articles;
    })();
  }
};
exports.ArticleFeatures = ArticleFeatures;