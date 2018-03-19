/* eslint-disable */
var fs = require('fs');
var readFiles = require('./readfile.js');
/*var MongoClient = require('mongodb').MongoClient,*/
var assert = require('assert');
var mongoose = require('mongoose');
var schema = require('../models/pttSchema.js');

// Use native promises
mongoose.Promise = global.Promise;
//assert.equal(query.exec().constructor, global.Promise);
/*
// Connection URL
var url = 'mongodb://localhost:27017/myproject';

// Use connect method to connect to the server
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected successfully to server");

  db.close();
});
*/

var options = {
    useMongoClient: true
}

// Using `mongoose.connect`...
var db = mongoose.connect('mongodb://villager:4given4get@localhost:27017/ptt?authSource=admin', options);
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("we're connected!")
    // we're connected!
});

var folders = ['data']; //, '2011', '2012'];
folders.forEach(folder => {
    var root = "../ptt-web-crawler/";
    mongoose.model(folder, schema.postSchema)
    var pagepost = mongoose.model(folder);
    //console.log(typeof(root + '/' + folder))
    readFiles.readFiles(root + '/' + folder)
        .then(function (files) {
            console.log("loaded ", files.length)
            //save post to db
            for (var i = 0; i < files.length; i++) {
                //console.log(files[i].contents);
                var fl = files[i].contents.articles.length;
                console.log("file length = " + fl);
                for (var j = 0; j < fl; j++) {
                    var post = new pagepost();
                    post = Object.assign(post, files[i].contents.articles[j]);
                    //console.log(post);
                    post.save(function (err, post, numAffected) {
                        //console.log(numAffected);
                        //console.log(post);
                        if (err) console.log(err);
                    })
                }
            }
        })
        .catch(error => {
            console.log(error);
        });
});

var exports = module.exports = {};
exports.readFiles = readFiles;