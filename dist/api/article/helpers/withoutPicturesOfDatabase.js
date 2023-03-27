"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.withoutPicturesOfDatabase = void 0;
var withoutPicturesOfDatabase = function withoutPicturesOfDatabase(arrayOfPictures) {
  var arrayRet = arrayOfPictures.filter(pictureLink => !pictureLink.includes('https://res.cloudinary.com'));
  return arrayRet;
};
exports.withoutPicturesOfDatabase = withoutPicturesOfDatabase;