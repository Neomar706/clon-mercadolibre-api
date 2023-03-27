"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.deleteFromDBAndCloudinary = void 0;
var _cloudinary = require("cloudinary");
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
var deleteFromDBAndCloudinary = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (pictureModel, pictures4Delete, next) {
    try {
      var pictures = yield pictureModel.findMany({
        where: {
          link: {
            in: pictures4Delete
          }
        }
      });
      yield pictureModel.deleteMany({
        where: {
          link: {
            in: pictures4Delete
          }
        }
      });
      yield Promise.all(pictures.map(picture => _cloudinary.v2.uploader.destroy(picture.publicId)));
    } catch (err) {
      next(err);
    }
  });
  return function deleteFromDBAndCloudinary(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();
exports.deleteFromDBAndCloudinary = deleteFromDBAndCloudinary;