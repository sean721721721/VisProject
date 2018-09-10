/* eslint-disable */
var fs = require('fs');
var readFiles = require('./readfile.js');
/*var MongoClient = require('mongodb').MongoClient,*/
var assert = require('assert');
var mongoose = require('mongoose');
var schema = require('../models/postSchema.js');

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
var db = mongoose.connect('mongodb://sean721721721:629629629@140.119.164.233:27017/newpages?authSource=admin', options);
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("we're connected!")
    // we're connected!
});

var folders = ['TaiwanGreenParty', 'CitizenoftheEarth', '綠盟', 'greenpeace']; //, '2011', '2012'];
folders.forEach(folder => {
    var root = "/windows/D/Crawler_data/newpages";
    mongoose.model(folder, schema.postSchema)
    var pagepost = mongoose.model(folder);
    //console.log(typeof(root + '/' + folder))
    readFiles.readFiles(root + '/' + folder)
        .then(function (files) {
            console.log("loaded ", files.length)
            //save post to db
            for (var i = 0; i < files.length; i++) {
                //console.log(files[i].contents);
                var fl = files[i].contents.data.length;
                console.log("file length = " + fl);
                for (var j = 0; j < fl; j++) {
                    var post = new pagepost();
                    post = Object.assign(post, files[i].contents.data[j]);
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