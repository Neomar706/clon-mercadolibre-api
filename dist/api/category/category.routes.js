"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.categoryRouter = void 0;
var _express = require("express");
var _category = require("./category.controller");
var categoryRouter = (0, _express.Router)();
exports.categoryRouter = categoryRouter;
categoryRouter.route('/category/all').get(_category.getCategories);
categoryRouter.route('/category/one').get(_category.getCategory);
categoryRouter.route('/category/create').post(_category.createCategory);
categoryRouter.route('/category/delete').delete(_category.deleteCategory);
categoryRouter.route('/category/update').patch(_category.updateCategory);