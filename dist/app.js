"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.app = void 0;
var _dotenv = _interopRequireDefault(require("dotenv"));
var _path = _interopRequireDefault(require("path"));
var _express = _interopRequireDefault(require("express"));
var _bodyParser = _interopRequireDefault(require("body-parser"));
var _cookieParser = _interopRequireDefault(require("cookie-parser"));
var _morgan = _interopRequireDefault(require("morgan"));
var _cors = _interopRequireDefault(require("cors"));
var _error = require("./middleware/error");
var _session = require("./middleware/session");
var _user = require("./api/user/user.routes");
var _category = require("./api/category/category.routes");
var _article = require("./api/article/article.routes");
var _favorite = require("./api/favorite/favorite.routes");
var _address = require("./api/address/address.routes");
var _question = require("./api/question/question.routes");
var _history = require("./api/history/history.routes");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/** Routes imports */

// dotenv.config({ path: path.join(__dirname, 'config', '.env') })
_dotenv.default.config({
  path: _path.default.join(__dirname, '..', '.env')
});
var app = (0, _express.default)();

/** Global variables */
exports.app = app;
app.set('port', process.env.PORT || 5000);

/** Middlewares */
app.use(_bodyParser.default.urlencoded({
  extended: true
}));
app.use(_bodyParser.default.json({
  limit: '60mb'
}));
app.use((0, _cookieParser.default)(process.env.SECRET_SESSION_KEY));
process.env.NODE_ENV === 'development' && app.use((0, _morgan.default)('dev'));
app.use((0, _cors.default)({
  // origin: process.env.FRONTEND_HOST,
  origin: 'http://localhost:8081',
  // origin: 'https://clon-mercadolibre-production.up.railway.app',
  credentials: true
}));
app.use((0, _session.sessionMiddleware)());

/** Middlewares Routes */
app.use('/api/v1', _user.userRouter);
app.use('/api/v1', _category.categoryRouter);
app.use('/api/v1', _article.articleRouter);
app.use('/api/v1', _favorite.favoriteRouter);
app.use('/api/v1', _address.addressRouter);
app.use('/api/v1', _question.questionRouter);
app.use('/api/v1', _history.historyRouter);
app.use(_error.errorMiddleware);