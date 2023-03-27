"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sessionMiddleware = void 0;
var _expressSession = _interopRequireDefault(require("express-session"));
var _expressMysqlSession = _interopRequireDefault(require("express-mysql-session"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
var sessionMiddleware = function sessionMiddleware() {
  var MySQLStore = (0, _expressMysqlSession.default)(_expressSession.default);
  var options = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    database: process.env.DB_NAME,
    clearExpired: process.env.CLEAR_SESSION_EXPIRE,
    expiration: process.env.EXPIRE_SESSION_TIME
  };
  var sessionStore = new MySQLStore(options);
  return (0, _expressSession.default)({
    secret: process.env.SECRET_SESSION_KEY,
    resave: true,
    saveUninitialized: true,
    store: sessionStore
  });
};
exports.sessionMiddleware = sessionMiddleware;