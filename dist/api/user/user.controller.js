"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateProfile = exports.updatePassword = exports.signup = exports.signout = exports.signin = exports.resetPassword = exports.getUserDetails = exports.forgotPassword = void 0;
var _crypto = _interopRequireDefault(require("crypto"));
var _client = require("@prisma/client");
var _catchAsyncErrors = require("../../middleware/catchAsyncErrors");
var _errorHandler = require("../../utils/errorHandler");
var _verifyRequiredFields = require("../../utils/verifyRequiredFields");
var _encryptPassword = require("./helpers/encryptPassword");
var _matchPassword = require("./helpers/matchPassword");
var _sendToken = require("./helpers/sendToken");
var _getResetPasswordToken = require("./helpers/getResetPasswordToken");
var _sendEmail = require("./helpers/sendEmail");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
var prisma = new _client.PrismaClient();
var signup = (0, _catchAsyncErrors.catchAsyncErrors)( /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (req, res, next) {
    var requiredFields = ['name', 'lastname', 'username', 'dni', 'email', 'password', 'phone'];
    var [isOk, field] = (0, _verifyRequiredFields.verifyRequiredFields)(req.body, requiredFields);
    if (!isOk) return next(new _errorHandler.ErrorHandler("Por favor ingrese el campo: ".concat(field), 400));
    var objCopy = _objectSpread({}, req.body);
    delete objCopy.password;
    objCopy.password = yield (0, _encryptPassword.encryptPassword)(req.body.password);
    var user = yield prisma.user.findFirst({
      where: {
        OR: [{
          username: {
            equals: objCopy.username
          }
        }, {
          email: {
            equals: objCopy.email
          }
        }]
      }
    });
    if (user) return next(new _errorHandler.ErrorHandler('El usuario ya se encuentra registrado', 401));
    yield prisma.user.create({
      data: {
        name: objCopy.name,
        lastname: objCopy.lastname,
        username: objCopy.username,
        dni: objCopy.dni,
        email: objCopy.email,
        password: objCopy.password,
        phone: objCopy.phone
      }
    });
    res.status(200).json({
      success: true,
      message: 'Usuario registrado con exito'
    });
  });
  return function (_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}());
exports.signup = signup;
var signin = (0, _catchAsyncErrors.catchAsyncErrors)( /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator(function* (req, res, next) {
    var {
      username,
      password
    } = req.body;
    var [isOk, field] = (0, _verifyRequiredFields.verifyRequiredFields)(req.body, ['username', 'password']);
    if (!isOk) return next(new _errorHandler.ErrorHandler("Por favor ingrese el campo: ".concat(field), 400));
    var user = yield prisma.user.findFirst({
      where: {
        OR: [{
          username: {
            equals: username
          }
        }, {
          email: {
            equals: username
          }
        }]
      },
      include: {
        addresses: {
          where: {
            currentAddress: true
          },
          select: {
            id: true,
            state: true,
            city: true,
            parish: true,
            street: true
          }
        }
      }
    });
    if (!user) return next(new _errorHandler.ErrorHandler('Usuario o contraseña inválida', 401));
    var isMatch = yield (0, _matchPassword.matchPassword)(password, user.password);
    if (!isMatch) return next(new _errorHandler.ErrorHandler('Usuario o contraseña inválida', 401));
    delete user.password;
    delete user.resetPwdToken;
    delete user.resetPwdExpire;
    (0, _sendToken.sendToken)(user, 200, res);
  });
  return function (_x4, _x5, _x6) {
    return _ref2.apply(this, arguments);
  };
}());
exports.signin = signin;
var signout = (0, _catchAsyncErrors.catchAsyncErrors)( /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator(function* (req, res, next) {
    res.cookie('x-access-token', null, {
      expires: new Date(Date.now()),
      httpOnly: true
    });
    delete req.user;
    res.status(200).json({
      success: true,
      message: 'Sesión finalizada'
    });
  });
  return function (_x7, _x8, _x9) {
    return _ref3.apply(this, arguments);
  };
}());
exports.signout = signout;
var forgotPassword = (0, _catchAsyncErrors.catchAsyncErrors)( /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator(function* (req, res, next) {
    var {
      email
    } = req.body;
    if (!email) return next(new _errorHandler.ErrorHandler('Por favor ingrese el campo: email', 400));
    var user = yield prisma.user.findUnique({
      where: {
        email
      }
    });
    if (!user) return next(new _errorHandler.ErrorHandler('Correo inválido', 400));
    var resetToken = yield (0, _getResetPasswordToken.getResetPasswordToken)(user.id);
    var resetPasswordURL = "".concat(process.env.FRONTEND_HOST, "/password/reset?token=").concat(resetToken);
    var message = "Su enlace de recuperaci\xF3n es: ".concat(resetPasswordURL, "\n\nSi no pidi\xF3 este correo por favor ign\xF3relo.");
    try {
      (0, _sendEmail.sendEmail)({
        email: user.email,
        subject: 'MercadoLibre Clone APP',
        message
      });
      res.status(200).json({
        success: true,
        message: "Se envi\xF3 un enlace de recuperaci\xF3n al correo: ".concat(user.email)
      });
    } catch (err) {
      yield prisma.user.update({
        where: {
          id: user.id
        },
        data: {
          resetPwdToken: null,
          resetPwdExpire: null
        }
      });

      // return next(new ErrorHandler(err.message, 500))
      next(new _errorHandler.ErrorHandler(err.message, 500));
    }
  });
  return function (_x10, _x11, _x12) {
    return _ref4.apply(this, arguments);
  };
}());
exports.forgotPassword = forgotPassword;
var resetPassword = (0, _catchAsyncErrors.catchAsyncErrors)( /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator(function* (req, res, next) {
    var requiredFields = ['password', 'confirm_password', 'token'];
    var [isOk, field] = (0, _verifyRequiredFields.verifyRequiredFields)(req.body, requiredFields);
    if (!isOk) return next(new _errorHandler.ErrorHandler("Por favor ingrese en campo: ".concat(field), 400));
    var {
      password,
      confirm_password,
      token
    } = req.body;
    var resetPasswordToken = _crypto.default.createHash('sha256').update(token).digest('hex');
    var user = yield prisma.user.findFirst({
      where: {
        resetPwdToken: resetPasswordToken,
        resetPwdExpire: {
          gt: new Date()
        }
      }
    });
    if (password !== confirm_password) return next(new _errorHandler.ErrorHandler('Las contraseñas no coinciden', 400));
    var isMatch = yield (0, _matchPassword.matchPassword)(password, user.password);
    if (isMatch) return next(new _errorHandler.ErrorHandler('La nueva contraseña nueva debe ser diferente a la anterior', 400));
    var encryptedPassword = yield (0, _encryptPassword.encryptPassword)(password);
    yield prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        password: encryptedPassword,
        resetPwdToken: null,
        resetPwdExpire: null
      }
    });
    delete user.password;
    delete user.resetPwdToken;
    delete user.resetPwdExpire;
    (0, _sendToken.sendToken)(user, 200, res);
  });
  return function (_x13, _x14, _x15) {
    return _ref5.apply(this, arguments);
  };
}());
exports.resetPassword = resetPassword;
var getUserDetails = (0, _catchAsyncErrors.catchAsyncErrors)( /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator(function* (req, res, next) {
    (0, _sendToken.sendToken)(req.user, 200, res);
  });
  return function (_x16, _x17, _x18) {
    return _ref6.apply(this, arguments);
  };
}());
exports.getUserDetails = getUserDetails;
var updateProfile = (0, _catchAsyncErrors.catchAsyncErrors)( /*#__PURE__*/function () {
  var _ref7 = _asyncToGenerator(function* (req, res, next) {
    var obj = {
      name: req.body.name,
      lastname: req.body.lastname,
      username: req.body.username,
      dni: req.body.dni,
      email: req.body.email,
      phone: req.body.phone
    };
    for (var key in obj) if (obj[key] === undefined || obj[key] === '') delete obj[key];
    yield prisma.user.update({
      where: {
        id: req.user.id
      },
      data: obj
    });
    res.status(200).json({
      success: true,
      message: 'Datos actualizados con exito'
    });
  });
  return function (_x19, _x20, _x21) {
    return _ref7.apply(this, arguments);
  };
}());
exports.updateProfile = updateProfile;
var updatePassword = (0, _catchAsyncErrors.catchAsyncErrors)( /*#__PURE__*/function () {
  var _ref8 = _asyncToGenerator(function* (req, res, next) {
    var requiredFields = ['old_password', 'new_password', 'confirm_password'];
    var [isOk, field] = (0, _verifyRequiredFields.verifyRequiredFields)(req.body, requiredFields);
    if (!isOk) return next(new _errorHandler.ErrorHandler("Por favor ingrese el campo: ".concat(field)));
    var {
      old_password,
      new_password,
      confirm_password
    } = req.body;
    var user = yield prisma.user.findUnique({
      where: {
        id: req.user.id
      },
      select: {
        password: true
      }
    });
    var encryptedPasswordFromDB = user.password;
    var isMatch = yield (0, _matchPassword.matchPassword)(old_password, encryptedPasswordFromDB);
    if (!isMatch) return next(new _errorHandler.ErrorHandler('La contraseña anterior es incorrecta', 400));
    var _isMatch = yield (0, _matchPassword.matchPassword)(new_password, encryptedPasswordFromDB);
    if (_isMatch) return next(new _errorHandler.ErrorHandler('La nueva contraseña nueva debe ser diferente a la anterior', 400));
    if (new_password !== confirm_password) return next(new _errorHandler.ErrorHandler('Las contraseñas no coinciden', 400));
    var encryptedPasswordFromReq = yield (0, _encryptPassword.encryptPassword)(new_password);
    yield prisma.user.update({
      where: {
        id: req.user.id
      },
      data: {
        password: encryptedPasswordFromReq
      }
    });
    res.status(200).json({
      success: true,
      message: 'La contraseña se actualizó exitosamente'
    });
  });
  return function (_x22, _x23, _x24) {
    return _ref8.apply(this, arguments);
  };
}());
exports.updatePassword = updatePassword;