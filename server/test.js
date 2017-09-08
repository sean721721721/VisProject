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
connection.openUri('mongodb://localhost/myapp', { options
});
*/
// Throwing an error will call the catch method most of the time
var id1 = 0;
var count1 = 5;
var id2 = 10;
var count2 = 50;
var id3 = 20;
var count3 = 25;
var p1 = function p1() {
    id1++;
    return new Promise(function (resolve, reject) {
        if (id1 < 5) {
            console.log("id1= "+id1)
            resolve(p1());
        } else {
            resolve([id1, count1]);
        }
    })
}
/*.catch(function (e) {
    console.log(e);
});*/

var p2 = new Promise(function (resolve, reject) {
    resolve([id2, count2]);
})
/*.catch(function (e) {
    console.log(e);
});*/

var p3 = new Promise(function (resolve, reject) {
    resolve([id3, count3]);
})
/*.catch(function (e) {
    console.log(e);
});*/
var retry = 0;

async function a1(retry) {
    try {
        console.log("in a1")
        await Promise.all([p1(), p2])
            .then(function (e) {
                console.log("a1= " + e);
                //a2();
            })
    } catch (e) {
        console.log("a1= " + e);
        if (retry < 5) {
            retry++;
            console.log(retry)
            a1(retry);
        }
    };
}

async function a2() {
    try {
        console.log("in a2")
        await Promise.all([p2, p3])
            .then(function (e) {
                console.log("a2= " + e);
            })
    } catch (e) {
        console.log("a2= " + e);
    };
}

(async function () {
    await a1(retry);
    await a2();
})()