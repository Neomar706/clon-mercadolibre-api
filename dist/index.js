"use strict";

var _cloudinary = require("cloudinary");
var _app = require("./app");
// Handling Uncaught Exception
process.on("uncaughtException", err => {
  console.log("Error: ".concat(err.message));
  console.log("Shutting down the server due to Uncaught Exception");
  process.exit(1);
});
_cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: process.env.CLOUDINARY_API_SECURE
});
var server = _app.app.listen(_app.app.get('port'), () => console.log("Server listening on port: ".concat(_app.app.get('port'))));

// Unhandled Promise Rejection
process.on("unhandledRejection", err => {
  console.log("Error: ".concat(err.message));
  console.log("Shutting down the server due to Unhandled Promise Rejection");
  server.close(() => {
    process.exit(1);
  });
});