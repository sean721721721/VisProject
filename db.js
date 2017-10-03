/* eslint-disable */
var mongoose = require("mongoose");

// Use native promises
mongoose.Promise = global.Promise;
var options = {
	useMongoClient: true
};

module.exports = {
	connect: function (config) {
		// Using `mongoose.connect`...
		mongoose.connect("mongodb://" + config.dbUser + ":" + config.dbPwd + "@" + config.db, options);
		mongoose.connection.on("error", function () {
			console.log("There was an error connecting to the database");
		});
		mongoose.connection.once("open", function () {
			console.log("connected to " + config.db + " successfully!");
		});
	}
};