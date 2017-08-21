/* eslint-disable */
var express = require('express');
var router = express.Router();
var queryHandler = require('../server/query.js');

router.param('postid', function (req, res, next, postid) {
  req.postid = postid;
  //console.log(postid);
  next();
})

router.get('/', function (req, res, next) {
  console.log(req.query);
  //var postid = req.params.postid;
  if (req.query['postid']) {
    req.params.postid = req.query['postid'];
  }
  //var time1 = req.params.time1;
  if (req.query['time1']) {
    req.params.time1 = req.query['time1'];
  }
  //var time2 = req.params.time2;
  if (req.query['time2']) {
    req.params.time2 = req.query['time2'];
  }
  if (req.query['posttype']) {
    req.params.posttype = req.query['posttype'];
  }
  if (req.query['fromname']) {
    req.params.fromname = req.query['fromname'];
  }
  if (req.query['minshare']) {
    req.params.minshare = req.query['minshare'];
  }
  if (req.query['maxshare']) {
    req.params.maxshare = req.query['maxshare'];
  }
  if (req.query['minlike']) {
    req.params.minlike = req.query['minlike'];
  }
  if (req.query['maxlike']) {
    req.params.maxlike = req.query['maxlike'];
  }if (req.query['mincomment']) {
    req.params.mincomment = req.query['mincomment'];
  }
  if (req.query['maxcomment']) {
    req.params.maxcomment = req.query['maxcomment'];
  }

  /*
  var posttype = req.params.posttype; //'status','video','link','photo'
  var fromname = req.params.fromname;
  var minshare = req.params.minshare;
  var maxshare = req.params.maxshare;
  var minlike = req.params.minlike;
  var maxlike = req.params.maxlike;
  var minreaction = req.params.minreaction;
  var maxreaction = req.params.maxreaction;
  */
  console.log(req.params);
  next();
},queryHandler.callback);

//var testurl ="http://140.119.164.22:3000/query?time1=2010-11-17T04:54:56+0000&time2=2010-11-28T04:54:56+0000"
module.exports = router;