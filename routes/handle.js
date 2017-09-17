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
  //console.log(req.query);
  var hasquery = false;
  //var postid = req.params.postid;
  if (req.query['postid']) {
    req.params.postid = req.query['postid'];
    hasquery = true;
  }
  if (req.query['page1']) {
    req.params.page1 = req.query['page1'];
    hasquery = true;
  }
  if (req.query['page2']) {
    req.params.page2 = req.query['page2'];
    hasquery = true;
  }
  //var time1 = req.params.time1;
  if (req.query['time1']) {
    req.params.time1 = req.query['time1'];
    hasquery = true;
  }
  //var time2 = req.params.time2;
  if (req.query['time2']) {
    req.params.time2 = req.query['time2'];
    hasquery = true;
  }
  //var time3 = req.params.time3;
  if (req.query['time3']) {
    req.params.time3 = req.query['time3'];
    hasquery = true;
  }
  //var time4 = req.params.time4;
  if (req.query['time4']) {
    req.params.time4 = req.query['time4'];
    hasquery = true;
  }
  if (req.query['posttype']) {
    req.params.posttype = req.query['posttype'];
    hasquery = true;
  }
  if (req.query['fromname']) {
    req.params.fromname = req.query['fromname'];
    hasquery = true;
  }
  if (req.query['minshare']) {
    req.params.minshare = req.query['minshare'];
    hasquery = true;
  }
  if (req.query['maxshare']) {
    req.params.maxshare = req.query['maxshare'];
    hasquery = true;
  }
  if (req.query['minlike']) {
    req.params.minlike = req.query['minlike'];
    hasquery = true;
  }
  if (req.query['maxlike']) {
    req.params.maxlike = req.query['maxlike'];
    hasquery = true;
  }
  if (req.query['mincomment']) {
    req.params.mincomment = req.query['mincomment'];
    hasquery = true;
  }
  if (req.query['maxcomment']) {
    req.params.maxcomment = req.query['maxcomment'];
    hasquery = true;
  }
  if (req.query['co']) {
    req.params.co = req.query['co'];
    hasquery = true;
  }
  req.query.hasquery = hasquery;
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
  //console.log(req.params);
  next();
}, queryHandler.callback);

//var testurl ="http://140.119.164.22:3000/query?time1=2010-11-17T04:54:56+0000&time2=2010-11-28T04:54:56+0000"
module.exports = router;