"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPriceBs = void 0;
var _puppeteer = _interopRequireDefault(require("puppeteer"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
var getPriceBs = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* () {
    var browser = yield _puppeteer.default.launch({
      headless: true
    });
    var page = yield browser.newPage();
    yield page.goto('https://www.bcv.org.ve');
    yield page.waitForSelector('.col-sm-6.col-xs-6.centrado');
    var content = yield page.content();
    console.log(content);
  });
  return function getPriceBs() {
    return _ref.apply(this, arguments);
  };
}();
exports.getPriceBs = getPriceBs;