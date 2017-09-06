/* eslint-disable */
var graph = require('fbgraph'), // npm install fbgraph
  async = require('async'), // npm install async
  fs = require('fs'),
  CronJob = require('cron').CronJob,
  winston = require('winston'),
  serverUtilities = require('./serverUtilities.js');

graph.setVersion("2.9");

var options = {
  timeout: 10000000,
  pool: {
    maxSockets: Infinity
  },
  headers: {
    connection: "keep-alive"
  }
};

var fanpageId = [ //'155846434444584', // 台大新聞E論壇
  //   '248848828633500', // Appendectomy Project 割闌尾計畫
  //   '325874310840688', // [我是學生，我反旺中] 反媒體巨獸青年聯盟
  //   '319460198179142', // Sunflower Movement 太陽花學運,  last post is 2014/10/31
  //   '692664184110781', // 我反服貿、全臺聲援大串聯
  //   '598791450210166', // 遍地開花！反黑箱服貿協議
  //   '756831544335745', // 反服貿學生組織, last post is 2014/10/11
  //   '657676694269933',// 抗爭無罪．停止暴力．反對服貿．台灣加油, closed
  //   '439857302811540', // 海外留學生聲援台灣反服貿運動
  //   '300162586798382', // SAVE TAIWAN！FIGHT FOR DEMOCRACY！在英台灣學生反黑箱服貿總部
  //   '734899333209359', // 反服貿聯盟,  last post is 2014/05/18
  //   '440363506066314', // DStreet 街頭公民審議,  last post is 2014/11/12
  //   '691777560844943', // 不要服貿，不要被國民黨強暴！
  //   '275500169241166', // 台南反服貿／全台反服貿大串聯,  last post is 2014/09/29
  //   '652438848137404', // 連勝文
  //'136845026417486', // 柯文哲
  //   '100006562054294', // 徐世榮
  //   '198554613504293', // 戴立忍
  //   '263964720407395', // 讓愛與和平佔領中環 Occupy Central with Love and Peace
  //   '269056797871', // 香港專上學生聯會(學聯)
  //   '200954406608272', // 香港獨立媒體網
  //   '935262873170231', // 青年居住論壇
  //   '565274156891915', // 台灣居住正義協會
  //   '431824973661134', // 焦點事件
  '148475335184300', //greenpeace
  //   '103640919705348'  //綠盟
  //   '559756970792038', //出境事務所
  //   '1729604514029664' //勞動之王
  //   '100010574583275' // 梁振英personal
  //'46251501064', //蔡英文 Tsai Ing-wen
  //'157215971120682', //Taipei 2017 Universiade - 世大運
];

var sincedate = "2013-01-01",
  finaldate = "2014-01-01",
  range = 1;

untildate = nextdays(sincedate, finaldate, range);
const initsincedate = sincedate,
  inituntildate = untildate;

var step = [];
while (sincedate !== finaldate) {
  for (var i = 0; i < fanpageId.length; i++) {
    step.push([fanpageId[i], sincedate, untildate]);
  }
  sincedate = nextdays(sincedate, finaldate, range);
  untildate = nextdays(untildate, finaldate, range);
};

var logger = new(winston.Logger)({
  transports: [
    new(winston.transports.Console)(),
    new(winston.transports.File)({
      name: 'info-file',
      filename: './logs/crawler-info.log',
      level: 'info'
    }),
    new(winston.transports.File)({
      name: 'error-file',
      filename: './logs/crawler-error.log',
      level: 'error'
    }),
  ],
  exceptionHandlers: [
    new(winston.transports.File)({
      filename: './logs/exceptions.log'
    }),
  ],
  exitOnError: false
});

function nextmonth(date) {
  var dateArray = date.split("-"),
    year = parseInt(dateArray[0]),
    month = parseInt(dateArray[1]),
    day = parseInt(dateArray[2]);
  if (month === 12) {
    year++;
    month = 1;
  } else {
    month++;
  }
  year = year.toString();
  month = month.toString();
  day = day.toString();
  if (month.length === 1) {
    month = "0" + month;
  }
  if (day.length === 1) {
    day = "0" + day;
  }
  date = year + "-" + month + "-" + day;
  // console.log("date:" + date);
  return date;
};

function nextday(date) {
  var dateArray = date.split("-"),
    year = parseInt(dateArray[0]),
    month = parseInt(dateArray[1]),
    day = parseInt(dateArray[2]);
  if (month === 1 || month === 3 || month === 5 || month === 7 || month === 8 || month === 10 || month === 12) {
    if (day === 31) {
      if (month === 12) {
        year++;
        month = 1;
      } else {
        month++;
      }
      day = 1;
    } else {
      day++;
    }
  } else if (month === 2) {
    if (year % 4 != 0) {
      var odd = 28;
    } else if (year % 100 == 0 && year % 400 != 0) {
      var odd = 28;
    } else {
      var odd = 29;
    }
    if (day === odd) {
      month++;
      day = 1;
    } else {
      day++;
    }
  } else {
    if (day === 30) {
      month++;
      day = 1;
    } else {
      day++;
    }
  }
  year = year.toString();
  month = month.toString();
  day = day.toString();
  if (month.length === 1) {
    month = "0" + month;
  }
  if (day.length === 1) {
    day = "0" + day;
  }
  date = year + "-" + month + "-" + day;
  // console.log("date:" + date);
  return date;
};

function nextdays(date, finaldate, range) {
  for (var i = 0; i < range; i++) {
    if (date !== finaldate) {
      date = nextday(date);
    } else {
      return date;
    }
  }
  return date;
};

// You can request a Facebook longlivetoken by this function, and use the callback function to catch the response,
function requestLongLiveToken(token, callback) {
  /*
  graph.extendAccessToken({
      "access_token":   token
    , "client_id":      '209749319230763'									 // crawler_local facebook app id by Kevin Bear
    , "client_secret":  'f5d17864b2d54a0f7c03f4374efc0e45' // crawler_local facebook app secret by Kevin Bear
  }, facebookResponse);
  */

  graph.extendAccessToken({
    "access_token": token,
    "client_id": '776254465843486', // crawler_local facebook app id by Villager
    "client_secret": '4733b03c0200c4cc61bbcfe466557362' // crawler_local facebook app secret by Villager
  }, facebookResponse);

  // callback of graph.extendAccessToken
  function facebookResponse(err, res) {
    logger.log('info', "Facebook response the longlivetoken requst.");
    logger.log('info', "The longlivetoken is: " + res.access_token);
    // same as setCrawlingSchedule(res.access_token)
    callback(res.access_token); // this token expiry time is 60 days
  };
};

function setCrawlingSchedule(longLiveToken) {
  var jobinit = new CronJob({
    cronTime: '00 * * * * *', // Crawling the data every 1 hour.
    //cronTime: '* * * * * *',
    onTick: function () {
      crawlingData(longLiveToken);
      logger.log('info', '---------------------initjob at: ' + Date(Date.now()) + '---------------------');
      if (untildate === finaldate) {
        logger.log('info', "reset sincedate and untildate");
        sincedate = initsincedate;
        untildate = inituntildate;
        this.stop();
      }
    },
    start: true,
    onComplete: function () {
      logger.log('info', '!--------------------comlete initjob fire--------------------!')
    },
    //runOnInit: true,
  });
  logger.log('info', 'jobinit status', jobinit.running);
};

function crawlingData(longlive_token) {
  //query setting
  graph.setAccessToken(longlive_token)
    .setOptions(options);

  var job = new CronJob({
    cronTime: '* * * * * *',
    onTick: function () {
      logger.log('info', '---------------------job at: ' + Date(Date.now()) + '---------------------');
      crawler(step, longlive_token);
      job.stop(); //stop cronjob after fire
    },
    start: true,
    onComplete: function () {
      logger.log('info', '---------------------comlete job fire---------------------')
    },
  });
  logger.log('info', 'job status', job.running);
};

async function crawler(step, longlive_token) {
  for (var i = 0; i < step.length; i++) {
    await getData(i, step);
  }
  /*for(const item of step) {}*/
  /*step.forEach(async(item) => {})*/
};

function getData(i, step) {
  return new Promise((resolve, reject) => {
    var item = step[i];
    var userid = item[0];
    var sincedate = item[1];
    var untildate = item[2];
    //console.log(userid)
    graph.get(userid, {
      fields: ""
    }, function (err, res0) {
      if (err && !res0) {
        console.log("res0 === null ");
        logger.log('error', {
          "error": {
            "message": JSON.stringify(err)
          }
        });
        reject([i, step]);
      } else {
        //console.log("res0.id: " + res0.id);
        userid = res0.id;
        serverUtilities.createfolder(userid);

        //check if links data exist
        var data = serverUtilities.openjson("posts_" + sincedate + "_" + untildate + "_" + userid); //postid+"_"+shared.fields
        if (data) {
          console.log("[Find cache!!!!");
          //console.log("C"+connectionCountSinceStart+": "+new Date().toLocaleString().substring(0, 33)+" ]");
          console.log("C" + ": " + new Date().toLocaleString().substring(0, 33) + " ]");
        } else {
          // collect data in async way, then convert to links and nodes
          // query in facebook api explorer,i.e ptttw?fields=posts.fields(id,object_id,type,message,story,from,shares,likes.limit(1).summary(true),comments.limit(1).summary(true))
          //var queryfield = "?fields=id,object_id,type,message,story,from,shares,likes.limit(1).summary(true),comments.limit(1).summary(true)&since="+sincedate+"&until="+untildate+"&limit=100";
          var queryfield = "?fields=id,object_id,created_time,type,message,story,picture,from,shares,attachments,sharedposts,reactions.limit(0).summary(true),comments.limit(0).summary(true)&since=" + sincedate + "&until=" + untildate + "&limit=100";
          //var queryfield = "?fields=id,object_id,created_time,type,message,story,from,shares,likes.limit(1).summary(true),comments.limit(1).summary(true)&since=" + sincedate + "&until=" + untildate + "&limit=100";
          serverUtilities.get_recursive(userid, "posts", queryfield, 50, 1000, function (err, res_posts) {
            if (err || !res_posts) {
              if (!res_posts) {
                logger.log('error', userid + " Err res_posts === null: ");
                console.dir(res_posts);
                //callback({"error": {"message": "No feed."}}, res_posts);
              }
              reject([i, step]);
            } else if (res_posts.data.length != 0) {
              res_posts = serverUtilities.fill_zero_field(res_posts);
              var picture = serverUtilities.getpicture(userid, res_posts);
              var postid = [];
              var res_comments = [];
              var res_reactions = [];
              var reactionusers = [];
              var reactioncounts = [];

              for (var c = 0; c < res_posts.data.length; c++) {
                var counts = [0, 0, 0, 0, 0, 0, 0];
                reactioncounts.push(counts);
              }
              //console.log("l=" + res_posts.data.length);
              for (var i = 0; i < res_posts.data.length; i++) {
                postid[i] = res_posts.data[i].id;
              }
              //console.log(res_posts);
              resolve(asy(postid, res_posts, res_comments, res_reactions, reactionusers, sincedate, untildate, userid));

            } else {
              logger.log('info', "---no post in the time range!---");
              resolve(true);
              //console.dir(res_posts);
            }
          }); //create direction
        } //graph.get(userid, {fields: ""}, function(err, res0) {
      }
    }); // end of graph.get()
    logger.log('info', "sincedate: " + sincedate + " untildate: " + untildate + " crawling page: " + userid + " fire");
  }).catch(function (err) {
    logger.log('info', 'try getData : '+ err +' again');
    getData(err[0], err[1]);
  });
};

async function asy(postid, res_posts, res_comments, res_reactions, reactionusers, sincedate, untildate, userid) {
  try {
    //console.log("hello a0 and start main");
    if (postid.length > 0) {
      var length = postid.length;
      /*Paralle
      var res = await Promise.all(postid.map(async function (item) {
        var id = item;
        //console.log("start: id = " + id)
        return await main(id, length, res_comments, res_reactions, reactionusers, sincedate, untildate, userid);
        //.then(console.log("end: id = " + id));
      }));*/
      var res = [];
      await push();
      async function push() {
        for (var i = 0; i < length; i++) {
          var id = postid[i];
          var result = await main(id, length, res_comments, res_reactions, reactionusers, sincedate, untildate, userid);
          //console.log(result);
        }
        res.push(result);
      }
      //console.log("l=" + res.length);
      await end(res);

      function end(result) {
        res_comments = result[0][0];
        reactionusers = result[0][1];
        res_reactions = result[0][2];
        logger.log('info', "-------- res done: " + userid + " --------");
        //console.log(res_comments)
        //console.log(reactionusers)
        //console.log(res_reactions)
        return next(res_posts, res_comments, res_reactions, reactionusers, sincedate, untildate, userid);
      };
    }
  } catch (err) {
    logger.log('error', err);
  }
};

async function main(id, length, res_comments, res_reactions, reactionusers, sincedate, untildate, userid) {
  try {
    logger.log('info', "---------- main loop: " + id + " ----------")
    //var mtimeout = 1000 * length;
    var mtimeout = 1000;
    logger.log('info', "mtimeout = " + mtimeout + " ------------")
    /*Paralle
    //var result = await Promise.all([get_recursive_comments(id, res_comments, mtimeout), get_recursive_reactions(id, reactionusers, mtimeout), get_reaction_counts(id, res_reactions)]);
    //console.log(res);
    //console.log("hello end main");
    return result;*/
    var result = [];
    await get_recursive_comments(id, res_comments, mtimeout);
    await get_recursive_reactions(id, reactionusers, mtimeout);
    await get_reaction_counts(id, res_reactions);
    return await push();

    function push() {
      result.push(res_comments);
      result.push(reactionusers);
      result.push(res_reactions);
      //console.log('push result');
      return result;
    };
  } catch (err) {
    logger.log('error', err);
  }
};

function get_recursive_comments(id, res_comments, timeout) {
  //console.log("get_recursive_comments")
  return new Promise((resolve, reject) => {
    var ctimeout = timeout;
    //var ctimeout = 1;
    serverUtilities.get_recursive(id, "comments", "?fields=from,like_count,message,comments{from,like_count,message,comment_count,user_likes,created_time},comment_count,user_likes,created_time&limit=100", 1000, ctimeout, function (err, res) {
      // serverUtilities.savejson("res_" + sincedate + "_" + untildate + "_" + userid, res.data);
      //console.log(res.data.length)
      if (err || !res) {
        if (!res) {
          logger.log('error', id + " Err res_comments === null: ");
          console.dir(res);
          //callback({"error": {"message": "No reaction."}}, res_reactions);
        }
        res_comments = [];
        reject([id, res_comments, timeout])
      } else if (res.data.length != 0) {
        // console.log(data_query.data[i].comments)
        var data_query = {
          "data": []
        };
        data_query.data = res.data; //data_query.data.concat(res.data);
        data_query.postid = id;
        // console.log("page " + 1 + " " + field_query + ".length: " + data_query.data.length);
        console.log(data_query.postid)
        // console.log(data_query.data)
        var l = res.data.length;
        //console.log("rl=" + l)
        var pc = 0;
        logger.log('info', "resolve comments: " + id);
        resolve(each_comment(res, id, l, pc, res_comments, data_query, timeout));
      } else {
        res_comments.push(res);
        resolve(res_comments);
      }
    });
  }).catch(function (err) {
    logger.log('info', 'try get_recursive_comments: '+ err +' again');
    get_recursive_comments(err[0], err[1], err[2]);
  });
};

function each_comment(res, id, l, pc, res_comments, data_query, timeout) {
  //console.log("---------- each subcomments loops ----------")
  return new Promise(function (resolve, reject) {
    var stimeout = timeout;
    //var stimeout = 1;
    if (!res) {
      logger.log('error', id + " Err res_subcomments === null: ");
      reject([res, id, l, pc, res_comments, data_query, timeout])
    } else if (l === 0) {
      logger.log('info', "no comments: " + id);
      resolve(res_comments);
    } else {
      resolve(sub());
      async function sub() {
        for (var index = 0; index < l; index++) {
          var item = res.data[index];
          if (item.comments) {
            var reply = item.comments,
              tar = data_query.data[index].comments;
            await page();

            function page() {
              return new Promise((resolve) => {
                paging(reply, tar, 1, 1000, stimeout, function (err, res) {
                  if(err){
                    reject(err);
                  }
                  pc++;
                  if (pc >= l) {
                    res_comments.push(data_query);
                    logger.log('info', "resolve subcomments: " + id);
                  }
                  resolve('true');
                });
              }).catch(function (err) {
                logger.log('info', 'try page() again');
                reply = item.comments;
                tar = data_query.data[index].comments;
                page();
              });
            }
          } else {
            pc++;
            if (pc >= l) {
              res_comments.push(data_query);
              //console.log("push: " + id);
              logger.log('info', "no subcomments: " + id);
            }
          }
        }
        return res_comments;
      };
      /*Paralle
      res.data.forEach(function (item, index) {
        if (item.comments) {
          var reply = item.comments,
            tar = data_query.data[index].comments;
          paging(reply, tar, 1, 1000, stimeout, function (err, res) {
            //console.log("reply: " + index)
            //console.log("rl=" + l)
            pc++;
            if (pc >= l) {
              res_comments.push(data_query);
              //console.log("push: " + id);
              logger.log('info', "resolve subcomments: " + id);
              resolve(res_comments);
            }
          });
        } else {
          pc++;
          if (pc >= l) {
            res_comments.push(data_query);
            //console.log("push: " + id);
            logger.log('info', "no subcomments: " + id);
            resolve(res_comments);
          }
        }
      });*/
    }
  }).catch(function (err) {
    logger.log('info', 'try each_comment: '+ err +' again');
    each_comment(err[0], err[1], err[2], err[3], err[4], err[5], err[6]);
  });
};

function get_recursive_reactions(id, reactionusers, timeout) {
  //console.log("get_recursive_reactions")
  return new Promise((resolve, reject) => {
    // var qur = ",reactions.type(LOVE).limit(10).summary(true).as(love),reactions.type(WOW).limit(10).summary(true).as(wow),reactions.type(HAHA).limit(10).summary(true).as(haha),reactions.type(SAD).limit(10).summary(true).as(sad),reactions.type(ANGRY).limit(10).summary(true).as(angry), reactions.type(THANKFUL).limit(10).summary(true).as(thankful)";
    var rtimeout = timeout;
    //var rtimeout = 1;
    serverUtilities.get_recursive(id, "reactions", "?limit=100", 10000, rtimeout, function (err, res) {
      // serverUtilities.savejson("res_" + sincedate + "_" + untildate + "_" + userid, res.data);
      if (err || !res) {
        if (!res) {
          logger.log('error', id + " Err res_reactionusers === null: ");
          console.dir(res);
          //callback({"error": {"message": "No reaction."}}, res_reactions);
        }
        reactionusers = [];
        reject([id,reactionusers,timeout])
      } else {
        // console.log("id=" + id)
        reactionusers.push(res);
        //console.log("err");
        logger.log('info', "resolve reactionusers: " + id);
        resolve(reactionusers);
      }
    });
  }).catch(function (err) {
    logger.log('info', 'try get_recursive_reactions: '+ err +' again');
    get_recursive_reactions(err[0], err[1], err[2]);
  });
};

function get_reaction_counts(id, res_reactions) {
  //console.log("get_reaction_counts")
  return new Promise((resolve/*, reject*/) => {
    var params = "?fields=reactions.type(LIKE).limit(0).summary(true).as(like),reactions.type(LOVE).limit(0).summary(true).as(love),reactions.type(WOW).limit(0).summary(true).as(wow),reactions.type(HAHA).limit(0).summary(true).as(haha),reactions.type(SAD).limit(0).summary(true).as(sad),reactions.type(ANGRY).limit(0).summary(true).as(angry), reactions.type(THANKFUL).limit(0).summary(true).as(thankful)";
    graph.get(id + params, function (err, res) {
      if (err || !res) {
        if (!res) {
          logger.log('error', id + " Err res_reactions === null: ");
          console.dir(res);
          //callback({"error": {"message": "No reaction."}}, res_reactions);
        }
        res_reactions = [];
        reject([id, res_reactions])
        //res.send({ "error": { "message": JSON.stringify(err) } });
      } else {
        // console.log("id=" + id)
        res_reactions.push(res);
        //console.log("err");
        logger.log('info', "resolve reactions: " + id);
        resolve(res_reactions);
      }
    });
  }).catch(function (err) {
    logger.log('info', 'try get_reaction_counts: '+ err +' again');
    get_reaction_counts(err[0], err[1]);
  });
};

var next = function next(res_posts, res_comments, res_reactions, reactionusers, sincedate, untildate, userid) {
  logger.log('info', "---------- next: " + userid + " ----------")
  var save_posts = [];
  //serverUtilities.savejson("comments_" + sincedate + "_" + untildate + "_" + userid, res_comments); //*
  //serverUtilities.savejson("reactions_" + sincedate + "_" + untildate + "_" + userid, res_reactions); //*
  //serverUtilities.savejson("reactionusers_" + sincedate + "_" + untildate + "_" + userid, reactionusers); //*
  save_posts = fill_reactions(res_posts, res_reactions);
  save_posts = fill_comments(save_posts, res_comments);
  //serverUtilities.savejson("preposts_" + sincedate + "_" + untildate + "_" + userid, save_posts);
  save_posts = serverUtilities.format_json(res_posts, save_posts);
  save_posts = serverUtilities.add_reactionuser(save_posts, reactionusers);
  serverUtilities.savejson("posts_" + sincedate + "_" + untildate + "_" + userid, save_posts);
  //console.log(res_posts);
  logger.log('info', "saving data: " + sincedate + "_" + untildate + "_" + userid + " done");
  return true;
  //}
};

var paging = function paging(res, tar, depth, MAX_DEPTH, timeout, callback) {
  // console.log("depth=" + depth)
  if (depth >= MAX_DEPTH) {
    //console.log("resursive paging: " + MAX_DEPTH);
    callback(null, tar);
    return;
  }
  if (res.data && res.paging && res.paging.next) {
    graph.get(res.paging.next, function (err, res) {
      if (err) {
        callback(err, res);
      }
      depth++;
      console.log("page " + depth + " " + ".length: " + res.data.length);
      Array.prototype.push.apply(tar.data, res.data);
      setTimeout(function () {
        paging(res, tar, depth, MAX_DEPTH, timeout, callback);
      }, timeout);
    });
  } else {
    callback(null, tar);
    return;
  }
};

var fill_reactions = function fill_reactions(res_posts, res_reactions) {
  for (var i = 0; i < res_posts.data.length; i++) {
    for (var j = 0; j < res_reactions.length; j++) {
      if (!(res_posts.data[i].reaction_detail)) {
        if (res_posts.data[i].id === res_reactions[j].id) {
          res_posts.data[i].reaction_detail = {
            "LIKE": res_reactions[j].like.summary.total_count,
            "LOVE": res_reactions[j].love.summary.total_count,
            "WOW": res_reactions[j].wow.summary.total_count,
            "HAHA": res_reactions[j].haha.summary.total_count,
            "SAD": res_reactions[j].sad.summary.total_count,
            "ANGRY": res_reactions[j].angry.summary.total_count,
            "THANKFUL": res_reactions[j].thankful.summary.total_count,
          }
        }
      }
    }
  }
  //console.log(res_posts);
  return res_posts;
};

var fill_comments = function fill_comments(res_posts, res_comments) {
  for (var i = 0; i < res_posts.data.length; i++) {
    for (var j = 0; j < res_comments.length; j++) {
      if (res_posts.data[i].id === res_comments[j].postid) {
        res_posts.data[i].comments.data = res_comments[j].data;
      }
    }
  }
  //console.log(res_posts);
  return res_posts;
};

var callback = function callback(req, res) {
  // CSP headers
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Headers", "X-Requested-With");

  //var fanpageId_query;
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  //var longlive_token;
  //var offset = req.query.offset;
  var limit = 100;

  requestLongLiveToken(req.query.token, setCrawlingSchedule);
};

var exports = module.exports = {};
exports.callback = callback;