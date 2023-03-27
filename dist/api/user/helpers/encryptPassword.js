"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.encryptPassword = void 0;
var _bcryptjs = _interopRequireDefault(require("bcryptjs"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
var encryptPassword = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (passwd) {
    var SALT_ROUNDS = 10;
    try {
      var salt = yield _bcryptjs.default.genSalt(SALT_ROUNDS);
      var hash = yield _bcryptjs.default.hash(passwd, salt);
      return hash;
    } catch (err) {
      throw err;
    }
  });
  return function encryptPassword(_x) {
    return _ref.apply(this, arguments);
  };
}();
exports.encryptPassword = encryptPassword;