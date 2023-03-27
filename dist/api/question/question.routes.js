"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.questionRouter = void 0;
var _express = require("express");
var _question = require("./question.controller");
var _auth = require("../../middleware/auth");
var questionRouter = (0, _express.Router)();
exports.questionRouter = questionRouter;
questionRouter.route('/question/new').post(_auth.isAuthenticatedUser, _question.makeQuestion);
questionRouter.route('/question/answer').patch(_auth.isAuthenticatedUser, _question.makeAnswer);
questionRouter.route('/question/all').get(_question.getQuestions);
questionRouter.route('/question/unanswered').get(_question.getUnansweredQuestions);
questionRouter.route('/question/my-questions').get(_auth.isAuthenticatedUser, _question.getMyQuestions);