/* eslint-disable */
/*
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/my_database');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var BlogPost = new Schema({
    author    : ObjectId,
    title     : String,
    body      : String,
    date      : Date
});

var Comment = new Schema({
  name: { type: String, default: 'hahaha' },
  age: { type: Number, min: 18, index: true },
  bio: { type: String, match: /[a-z]/ },
  date: { type: Date, default: Date.now },
  buff: Buffer
});

// a setter
Comment.path('name').set(function (v) {
  return capitalize(v);
});

// middleware
Comment.pre('save', function (next) {
  notify(this.get('email'));
  next();
});
*/
var mongo = require('mongodb'),
  mongoose = require('mongoose'),
  Schema = mongoose.Schema;


//  mongoose.connect('mongodb://140.119.164.166/FBDB');


var save = function save(data, callback) {
  mongoose.Promise = global.Promise;
  mongoose.connect('mongodb://140.119.164.166/FBDB');
  var database = mongoose.connection;
  var posts = data.data,
    postid = data.postid;
  var object = mongoose.Schema({
    id: String,
    created_time: String,
    type: String,
    from: {
      name: String,
      id: String
    },
    message: String,
    shares: Number,
    likes: Number,
    reactions: {
      like: Number,
      love: Number,
      haha: Number,
      wow: Number,
      angry: Number,
      sad: Number,
    },
    comments: {
      context: Object,
      summary: Number
    },
    attachments: Object
  }, {
    collection: "fanpage_" + postid
  });

  //console.log(db);
  var fanpage = "fanpage_" + postid;
  var type;
  //console.log(mongoose.models);
  if (mongoose.models[fanpage]) {
    console.log("ooo")
    type = mongoose.model(fanpage);
  } else {
    type = mongoose.model(fanpage, object);
  }

  database.on('error', console.error.bind(console, 'connection error:'));
  var l = posts.length;
  posts.forEach(function (post) {
    //model = data[i];
    //console.log(model);
    type.findOneAndUpdate({
      "id": post.id
    }, post, function (err, docs) {
      //type.findOne({"id":posts[i].id}, function(err , docs){
      //var model = new type(posts[i]);
      if (err) {
        console.log(err);
        return;
      }
      //console.log(post.id);
      if (!docs) {
        var doc = new type(post);
        console.log("not....on");
        //console.log(doc);

        doc.save(function () {
          console.log("success");
          next();
        });
      } else {
        /*docs = post;
        docs.save(function(){
          console.log("success eee");
          next();
        })*/
        console.log(docs.id);
        next();
      }
      //console.log(docs.id);
    });
  })
  var next = function next() {
    l--;
    if (l == 0) {
      database.close(function () {
        console.log("colse");
      });
      callback(null);
    }
  }

}

var exports = module.exports = {};
exports.save = save;