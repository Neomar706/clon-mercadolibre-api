"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.catchAsyncErrors = void 0;
var catchAsyncErrors = func => (req, res, next) => {
  Promise.resolve(func(req, res, next)).catch(next);
};
exports.catchAsyncErrors = catchAsyncErrors;