"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.historyRouter = void 0;
var _express = require("express");
var _history = require("./history.controller");
var _auth = require("../../middleware/auth");
var historyRouter = (0, _express.Router)();
exports.historyRouter = historyRouter;
historyRouter.route('/history/add').get(_auth.isAuthenticatedUser, _history.add2History);
historyRouter.route('/history/delete').get(_auth.isAuthenticatedUser, _history.delete2History);
historyRouter.route('/history/toggle').get(_auth.isAuthenticatedUser, _history.toggleArticleHistory);
historyRouter.route('/history/all').get(_auth.isAuthenticatedUser, _history.getArticlesFromHistory);