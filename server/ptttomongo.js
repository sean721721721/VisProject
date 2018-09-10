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
var db = mongoose.connect('mongodb://sean721721721:629629629@localhost:27017/ptt?authSource=admin', options);
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("we're connected!")
    // we're connected!
    
  });

function promiseAllP(items, block) {
    var promises = [];
    items.forEach(function (item, index) {
        promises.push(function (item, i) {
            return new Promise(function (resolve, reject) {
                return block.apply(this, [item, index, resolve, reject]);
            });
        }(item, index))
    });
    return Promise.all(promises);
}

var saveFiles = function saveFiles(dirname, collection, schema) {
    mongoose.model(collection, schema);
    
    function save(files) {
        var pagepost = mongoose.model(collection);
        var post = new pagepost();
        var savepost = Object.assign(post, files);
        // console.log(files.articles[j]);
        return new Promise((resolve, reject) => {
                savepost.save(function (err, post, numAffected) {
                    //console.log(numAffected);
                    /*if (post !== undefined) {
                        console.log(files['article_id']);
                    }*/
                    if (err) {
                        reject(err);
                    }
                    resolve('true');
                })
            })
            .catch((err) => {
                console.log('did not save post: ', files['article_id']);
                console.log(err);
            });
    }
    return new Promise((resolve, reject) => {
        console.log(dirname);
            fs.readdir(dirname, function (err, filenames) {
                console.log(dirname);
                console.log(filenames);
                if (err) return reject(err);
                resolve(split())
                async function split() {
                    await promiseAllP(filenames, (filename, index, resolve, reject) => {
                            console.log(filename)
                            if (err) {
                                reject(err);
                            }
                            let p = new Promise((resolve, reject) => {
                                    fs.readFile(dirname + '/' + filename, 'utf-8', (err, data) => {
                                        if (err) {
                                            reject(err);
                                        }
                                        resolve(sub());
                                        async function sub() {
                                            var files = JSON.parse(data);
                                            var fl = files.articles.length;
                                            console.log(filename, " length = ", fl);
                                            for (var j = 0; j < fl; j++) {
                                                await save(files.articles[j]);
                                                // console.log('done file',j);
                                            }
                                        }
                                    });
                                })
                                .catch((err) => {
                                    console.log(err);
                                });

                            return resolve(p);
                        })
                        .catch(err => {
                            console.log(err);
                        })
                }
            });
        })
        .catch(err => {
            console.log(err);
        });
}

var folders = ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36','37','38','39']; // 'Tech_Job', 'Gossiping', 'Soft_Job'];
//folders.forEach(folder => {
var root = "../pttdata/Gossiping";
readfolder();
async function readfolder() {
    for (let i = 0; i < folders.length; i++) {
        folder = folders[i];
        await saveFiles(root + '/' + folder, 'Gossiping', schema.pttSchema)
            .then(function () {
                
                console.log('saved')
            })
            .catch(error => {
                console.log(error);
            });
        //mongoose.model(folder, schema.postSchema)
        //mongoose.model(folder, schema.pttSchema)
        //var pagepost = mongoose.model(folder);
        //console.log(typeof(root + '/' + folder))
    }
}
/* 2 M.1502704474.A.3CB
// 3  Unexpected end of JSON input
// 4 M.1503736380.A.DDD
// 7 M.1505686462.A.F75
// 12 Unexpected token ] in JSON
// 14 M.1511331265.A.E0F
// 15 M.1511585281.A.1DB
// 19 M.1514572172.A.1CB
// 22 M.1517447643.A.EB2
*/
/*readFiles.readFiles(root + '/' + folder)
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
    });*/
//});

var exports = module.exports = {};
exports.readFiles = readFiles;