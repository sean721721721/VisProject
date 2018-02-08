/* eslint-disable */
var express = require("express");
var app = express();
var config = require("./config")[app.settings.env];
const os = require('os');

var options = {
  timeout: 10000000,
  pool: {
    maxSockets: Infinity
  },
  headers: {
    connection: "keep-alive"
  }
};

/*
 * Connect to database
 * remove if not needed
 */
require("./db").connect(config);
//console.log('db');
/* 
 * Load all models and controllers
 * remove if not needed, and you can also remove fs variable declaration above
 */
// controller auto load Account model
/*require("./models")(app);
console.log('model');*/
require("./controllers")(app);
console.log('controlers loaded');
/* 
 * Set Express settings (middleware and etc)
 * see settings.js to add remove options
 */
require("./settings")(app, config);
console.log('settings loaded');
/* 
 * Start listening 
 */
if (os.platform() === "linux") {
  app.set("port", process.env.PORT || 3000);
} else {
  app.set("port", process.env.PORT || 8000);
}

app.listen(app.get("port"), function () {
  console.log("Express server listening on port %s", app.get("port"));
});