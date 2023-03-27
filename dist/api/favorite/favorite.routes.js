"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.favoriteRouter = void 0;
var _express = require("express");
var _favorite = require("./favorite.controller");
var _auth = require("../../middleware/auth");
var favoriteRouter = (0, _express.Router)();
exports.favoriteRouter = favoriteRouter;
favoriteRouter.route('/favorite/toggle').get(_auth.isAuthenticatedUser, _favorite.toggleArticleFavorite);
favoriteRouter.route('/favorites').get(_auth.isAuthenticatedUser, _favorite.getArticlesFromFavorite);