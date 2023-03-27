"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.articleRouter = void 0;
var _express = require("express");
var _article = require("./article.controller");
var _auth = require("../../middleware/auth");
var articleRouter = (0, _express.Router)();
exports.articleRouter = articleRouter;
articleRouter.route('/article/new').post(_auth.isAuthenticatedUser, _article.createArticle);
articleRouter.route('/article/delete').delete(_auth.isAuthenticatedUser, _article.deleteArticle);
articleRouter.route('/article/update').put(_auth.isAuthenticatedUser, _article.updateArticle);
articleRouter.route('/articles').get(_article.getArticles);
articleRouter.route('/articles/by-user').get(_article.getArticlesByUserId);
articleRouter.route('/article/toggle-pause').patch(_auth.isAuthenticatedUser, _article.togglePauseArticle);
articleRouter.route('/article/search').get(_article.searchArticleFilter);
articleRouter.route('/article/details').get(_article.articleDetails);