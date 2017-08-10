/* eslint-disable */
var fs = require('fs');
var readFiles = require('./readfile.js');
/*var MongoClient = require('mongodb').MongoClient,*/
var assert = require('assert');
var mongoose = require('mongoose');
require('./postSchema.js')();

// Use native promises
mongoose.Promise = global.Promise;

var pagepost = mongoose.model('Page');

var options = {
    useMongoClient: true
}

// Using `mongoose.connect`...
var db = mongoose.connect('mongodb://villager:4given4get@localhost:27017/test?authSource=admin', options);
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("we're connected!")
    // we're connected!
});

