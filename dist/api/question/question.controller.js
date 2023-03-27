"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeQuestion = exports.makeAnswer = exports.getUnansweredQuestions = exports.getQuestions = exports.getMyQuestions = void 0;
var _client = require("@prisma/client");
var _catchAsyncErrors = require("../../middleware/catchAsyncErrors");
var _errorHandler = require("../../utils/errorHandler");
var _verifyRequiredFields = require("../../utils/verifyRequiredFields");
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
var prisma = new _client.PrismaClient();
var makeQuestion = (0, _catchAsyncErrors.catchAsyncErrors)( /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (req, res, next) {
    var _currentQuestionInfo$;
    var userId = req.user.id;
    var articleId = req.query.articleId ? Number(req.query.articleId) : undefined;
    var link = req.body.link;
    var question = req.body.question;
    var [isOk, field] = (0, _verifyRequiredFields.verifyRequiredFields)({
      articleId,
      link,
      question
    }, ['articleId', 'link', 'question']);
    if (!isOk) return next(new _errorHandler.ErrorHandler("Por favor ingrese el campo: ".concat(field), 400));
    var article = yield prisma.article.findFirst({
      where: {
        id: articleId
      }
    });
    if (article.userId == userId) return next(new _errorHandler.ErrorHandler('No puedes preguntar en un artículo publicado por tí', 400));
    var currentQuestionInfo = yield prisma.questionsInfo.findFirst({
      where: {
        articleId,
        userId
      },
      select: {
        id: true,
        article: {
          select: {
            userId: true
          }
        }
      }
    });
    yield prisma.question.create({
      data: {
        question,
        questionsInfo: {
          connectOrCreate: {
            where: {
              id: (_currentQuestionInfo$ = currentQuestionInfo === null || currentQuestionInfo === void 0 ? void 0 : currentQuestionInfo.id) !== null && _currentQuestionInfo$ !== void 0 ? _currentQuestionInfo$ : 0
            },
            create: {
              articleId,
              userId,
              link
            }
          }
        }
      }
    });
    res.status(200).json({
      success: true,
      message: '¡LISTO! Enviamos tu pregunta'
    });
  });
  return function (_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}());
exports.makeQuestion = makeQuestion;
var makeAnswer = (0, _catchAsyncErrors.catchAsyncErrors)( /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator(function* (req, res, next) {
    var userId = req.user.id;
    var articleId = req.query.articleId ? Number(req.query.articleId) : undefined;
    var questionId = req.query.questionId ? Number(req.query.questionId) : undefined;
    var answer = req.body.answer;
    var [isOk, field] = (0, _verifyRequiredFields.verifyRequiredFields)({
      articleId,
      questionId,
      answer
    }, ['articleId', 'questionId', 'answer']);
    if (!isOk) return next(new _errorHandler.ErrorHandler("Por favor ingrese el campo: ".concat(field), 400));
    var questionsInfo = yield prisma.questionsInfo.findFirst({
      where: {
        article: {
          userId
        },
        articleId
      },
      select: {
        id: true
      }
    });
    if (!questionsInfo) return next(new _errorHandler.ErrorHandler('No se encontró la pregunta que deseas responder', 404));
    yield prisma.question.update({
      where: {
        id: questionId
      },
      data: {
        answer,
        answerDate: new Date()
      }
    });
    res.status(201).json({
      success: true,
      message: '¡LISTO! Enviamos tu respuesta'
    });
  });
  return function (_x4, _x5, _x6) {
    return _ref2.apply(this, arguments);
  };
}());
exports.makeAnswer = makeAnswer;
var getQuestions = (0, _catchAsyncErrors.catchAsyncErrors)( /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator(function* (req, res, next) {
    var articleId = req.query.articleId ? Number(req.query.articleId) : undefined;
    if (!articleId) return next(new _errorHandler.ErrorHandler('Por favor ingrese el campo: articleId', 400));
    var questions = yield prisma.question.findMany({
      where: {
        questionsInfo: {
          articleId,
          userId: req.query.userId ? {
            not: {
              equals: Number(req.query.userId)
            }
          } : {}
        },
        answer: {
          not: {
            equals: null
          }
        }
      },
      select: {
        id: true,
        question: true,
        questionDate: true,
        answer: true,
        answerDate: true
      }
    });
    res.status(200).json({
      success: true,
      results: questions
    });
  });
  return function (_x7, _x8, _x9) {
    return _ref3.apply(this, arguments);
  };
}());
exports.getQuestions = getQuestions;
var getUnansweredQuestions = (0, _catchAsyncErrors.catchAsyncErrors)( /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator(function* (req, res, next) {
    var questions = yield prisma.question.findMany({
      where: {
        answer: null
      },
      select: {
        id: true,
        question: true,
        questionDate: true,
        answer: true,
        answerDate: true
      }
    });
    if (!questions.length) return next(new _errorHandler.ErrorHandler('No hay preguntas sin responder', 404));
    res.status(200).json({
      success: true,
      results: questions
    });
  });
  return function (_x10, _x11, _x12) {
    return _ref4.apply(this, arguments);
  };
}());
exports.getUnansweredQuestions = getUnansweredQuestions;
var getMyQuestions = (0, _catchAsyncErrors.catchAsyncErrors)( /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator(function* (req, res, next) {
    var userId = req.user.id;
    var articleId = req.query.articleId ? Number(req.query.articleId) : undefined;
    var myQuestions = yield prisma.question.findMany({
      where: {
        questionsInfo: {
          userId,
          articleId
        }
      },
      select: {
        id: true,
        question: true,
        questionDate: true,
        answer: true,
        answerDate: true
      }
    });
    if (!myQuestions.length) return next(new _errorHandler.ErrorHandler('No se encontraron preguntas', 404));
    res.status(200).json({
      success: true,
      results: myQuestions
    });
  });
  return function (_x13, _x14, _x15) {
    return _ref5.apply(this, arguments);
  };
}());
exports.getMyQuestions = getMyQuestions;