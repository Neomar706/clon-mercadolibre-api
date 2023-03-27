"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.errorMiddleware = void 0;
var _errorHandler = require("../utils/errorHandler");
var errorMiddleware = function errorMiddleware(err, req, res, next) {
  var _err, _err2;
  (_err = err).statusCode || (_err.statusCode = 500);
  (_err2 = err).message || (_err2.message = 'Internal Server Error');
  if (err.name === 'JsonWebTokenError') {
    var message = 'Token de acceso inválido';
    err = new _errorHandler.ErrorHandler(message, 400);
  }
  if (err.name === 'TokenExpiredError') {
    var _message = 'El token de acceso expiró';
    err = new _errorHandler.ErrorHandler(_message, 400);
  }
  if (err.message === 'connect ECONNREFUSED ::1:3306') {
    var _message2 = 'Error al conectar la base de datos';
    err = new _errorHandler.ErrorHandler(_message2, 500);
  }
  res.status(err.statusCode).json({
    success: false,
    message: err.message
  });
};
exports.errorMiddleware = errorMiddleware;