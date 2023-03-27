"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.verifyRequiredFields = void 0;
var verifyRequiredFields = function verifyRequiredFields(reqBody, requiredFields) {
  var obj = JSON.parse(JSON.stringify(reqBody));
  for (var key in obj) if (obj[key] === undefined) delete obj[key];
  var field = '';
  var isOk = true;
  requiredFields.forEach(elem => {
    if (Object.keys(obj).indexOf(elem) < 0) {
      field = elem;
      isOk = false;
      return;
    }
  });
  return [isOk, field];
};
exports.verifyRequiredFields = verifyRequiredFields;