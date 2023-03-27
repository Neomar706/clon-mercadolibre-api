"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pool = void 0;
var _dotenv = _interopRequireDefault(require("dotenv"));
var _path = _interopRequireDefault(require("path"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
var mysql = require('mysql2');
_dotenv.default.config({
  path: _path.default.join(__dirname, '.env')
});
var {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PWD,
  DB_NAME,
  DB_CONNECTION_LIMIT
} = process.env;
var _pool = mysql.createPool({
  connectionLimit: DB_CONNECTION_LIMIT,
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PWD,
  database: DB_NAME
});
var pool = _pool.promise();
exports.pool = pool;