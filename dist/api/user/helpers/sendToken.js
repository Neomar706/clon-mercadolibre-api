"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sendToken = void 0;
var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
var sendToken = function sendToken(user, statusCode, res) {
  var token = _jsonwebtoken.default.sign({
    id: user.id
  }, process.env.JWT_SECRET);
  var options = {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    // 24 * 60 * 60 * 1000 => 24horas
    httpOnly: true
  };
  res.status(statusCode).cookie('x-access-token', token, options).json({
    success: true,
    result: {
      user,
      token
    }
  });
};
exports.sendToken = sendToken;