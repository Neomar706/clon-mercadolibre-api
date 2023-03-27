"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getResetPasswordToken = void 0;
var _client = require("@prisma/client");
var _crypto = _interopRequireDefault(require("crypto"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
var prisma = new _client.PrismaClient();
var getResetPasswordToken = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (userId) {
    var resetToken = _crypto.default.randomBytes(20).toString('hex');
    var resetPasswordToken = _crypto.default.createHash('sha256').update(resetToken).digest('hex');
    var resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000); // new Date(Date.now() + 15min)

    yield prisma.user.update({
      where: {
        id: userId
      },
      data: {
        resetPwdToken: resetPasswordToken,
        resetPwdExpire: resetPasswordExpire
      }
    });
    return resetToken;
  });
  return function getResetPasswordToken(_x) {
    return _ref.apply(this, arguments);
  };
}();
exports.getResetPasswordToken = getResetPasswordToken;