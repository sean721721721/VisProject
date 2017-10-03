/* eslint-disable */
var express = require("express");
var app = express();
var config = require("./config")[app.settings.env];

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

/* 
* Load all models and controllers
* remove if not needed, and you can also remove fs variable declaration above
*/
require("./models")(app);
require("./controllers")(app);

/* 
* Set Express settings (middleware and etc)
* see settings.js to add remove options
*/
require("./settings")(app, config);

/* 
* Start listening 
*/
app.set("port", process.env.PORT || 3000);
app.listen(app.get("port"), function(){
console.log("Express server listening on port %s", app.get("port"));
});