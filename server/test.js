/* eslint-disable */
var fs = require('fs');
var readFiles = require('./readfile.js');
/*var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');*/
var mongoose = require('mongoose');

// Use native promises
mongoose.Promise = global.Promise;
/*
var Schema = mongoose.Schema;

var SomeModelSchema = new Schema({
    a_string: String,
    a_date: Date
});
SomeModelSchema.set('toObject', { getters: true });
// Compile model from schema
var SomeModel = mongoose.model('SomeModel', SomeModelSchema);

// Create an instance of model SomeModel
var awesome_instance = new SomeModel({
    name: 'awesome'
});

// Save the new model instance, passing a callback
awesome_instance.save(function (err, doc, numAffected) {
    console.log(doc);
    if (err) return handleError(err);
    // saved!
});
*/
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var BlogPost = new Schema({
    author: ObjectId,
    title: String,
    body: String,
    date: Date
});

// retrieve my model
var BlogPost = mongoose.model('BlogPost', BlogPost);

// create a blog post
var post = new BlogPost();


var options = {
    useMongoClient: true
}
// Using `mongoose.connect`...
var promise = mongoose.connect('mongodb://villager:4given4get@localhost:27017/test?authSource=admin', options);

post.on('data', function (post) { // create a comment
    console.log("on")
    post.comments.push({
        title: 'My comment'
    });

    post.save(function (err) {
        if (!err) console.log('Success!');
    });
})

promise.then(function (db) {
    /* Use `db`, for instance `db.model()`
});
// Or, if you already have a connection
connection.openUri('mongodb://localhost/myapp', { /* options */
});