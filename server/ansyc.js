/* eslint-disable */
var graph = require('fbgraph'), // npm install fbgraph
    async = require('async'),
    fs = require('fs'),
    serverUtilities = require('./serverUtilities.js');
// database = require('./database.js');

graph.setVersion("2.9");

var callback = function callback(req, res) {
    // CSP headers
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "X-Requested-With");

    console.log("req=" + req.query.opt);
    //console.log("   test");

    var userid = req.query.userid,
        opt = req.query.opt,
        sincedate = req.query.sincedate,
        untildate = req.query.untildate,

        ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        //var offset = req.query.offset;
        limit = 100;

    sincedate = serverUtilities.eliminateISOFormatTimeString(sincedate);
    untildate = serverUtilities.eliminateISOFormatTimeString(untildate);

    //console.log("["+connectionCountSinceStart+": "+new Date().toUTCString()+" ip:"+ip+" ]");
    console.log("\n[page " + ": " + new Date().toLocaleString().substring(0, 33) + " ip: " + ip + " ]");

    console.log("userid= " + req.query.userid);
    console.log("ACCESS_TOKEN= " + req.query.token);

    //query setting
    graph
        .setAccessToken(req.query.token);
    //.setOptions(options);

    graph.get(userid, {
        fields: ""
    }, function (err, res0) {
        if (err && !res0.from) {
            console.log("res0 === null ");
            console.dir(err);
        } else {
            console.log("res0.id: " + res0.id);
            userid = res0.id;
            serverUtilities.createfolder(userid);

            //check if links data exist
            var data = serverUtilities.openjson("posts_" + sincedate + "_" + untildate + "_" + userid); //postid+"_"+shared.fields
            if (data) {
                //var links = [];
                //sharedpost2links(postid, data, links);
                // res.send(data);
                console.log("[Find cache!!!!");
                //console.log("C"+connectionCountSinceStart+": "+new Date().toLocaleString().substring(0, 33)+" ]");
                console.log("C" + ": " + new Date().toLocaleString().substring(0, 33) + " ]");
            } else {
                // collect data in async way, then convert to links and nodes
                // query in facebook api explorer,i.e ptttw?fields=posts.fields(id,object_id,type,message,story,from,shares,likes.limit(1).summary(true),comments.limit(1).summary(true))
                //var queryfield = "?fields=id,object_id,type,message,story,from,shares,likes.limit(1).summary(true),comments.limit(1).summary(true)&since="+sincedate+"&until="+untildate+"&limit=100";
                var queryfield = "?fields=id,object_id,created_time,type,message,story,picture,from,shares,attachments,sharedposts,reactions.limit(0).summary(true),comments.limit(0).summary(true)&since=" + sincedate + "&until=" + untildate + "&limit=100";
                //var queryfield = "?fields=id,object_id,created_time,type,message,story,from,shares,likes.limit(1).summary(true),comments.limit(1).summary(true)&since=" + sincedate + "&until=" + untildate + "&limit=100";
                serverUtilities.get_recursive(userid, "posts", queryfield, 50, function (err, res_posts) {
                    // console.log("OUTSIDE: ");
                    // console.dir(res);
                    if (err || !res_posts) {
                        if (!res_posts) {
                            console.log("Err res_posts === null: ");
                            console.dir(res_posts);
                            //callback({"error": {"message": "No feed."}}, res_posts);
                        }
                        console.dir(err);
                    } else if (res_posts.data.length != 0) {
                        res_posts = serverUtilities.fill_zero_field(res_posts);
                        var picture = serverUtilities.getpicture(userid, res_posts);

                        var postid = [];
                        var res_comments = [];
                        var res_reactions = [];
                        var reactionusers = [];
                        var p1 = res_posts.data.length;
                        var p2 = res_posts.data.length;
                        var p4 = res_posts.data.length;
                        var reactioncounts = [];

                        for (var c = 0; c < res_posts.data.length; c++) {
                            var counts = [0, 0, 0, 0, 0, 0, 0];
                            reactioncounts.push(counts);
                        }

                        console.log("l=" + res_posts.data.length);
                        for (var i = 0; i < res_posts.data.length; i++) {
                            postid[i] = res_posts.data[i].id;
                        }
                        //console.log(res_posts);
                        //each_posts(postid, res_posts, res_comments, res_reactions, reactionusers);

                        async function each_posts(id, res) {
                            console.log("---------- each loops ----------")
                            return new Promise(function (resolve, reject) {
                                if (id !== undefined) {
                                    resolve(main(id, res));
                                } else {
                                    reject(new Error('postslength=0'))
                                }
                                //postid.forEach(function (id) {})
                            })
                            /*.then(value => {
                                console.log(value);
                            }).catch(function (err) {
                                console.log(err.message)
                            });*/
                        };

                        async function a1(res_posts) {
                            console.log("hello a1 and start a2");
                            if (postid.length > 0) {
                                var id;
                                var res = [
                                    [],
                                    [],
                                    []
                                ];
                                await Promise.all(postid.map(async function (item) {
                                    id = item;
                                    console.log("start: id = " + id)
                                    return await each_posts(id, res);
                                    console.log("end: id = " + id)
                                }));
                                /*
                                for (var i = 0; i < postid.length; i++) {
                                    console.log(res);
                                    id = postid[i];
                                    console.log("start: id = " + id)
                                    await each_posts(id);
                                }*/
                                console.log("-------- res done --------");
                                next(res_posts, res_comments, res_reactions, reactionusers);
                                console.log("hello end a2");
                            }
                            //var value = await each_posts(postid, res_posts, res_comments, res_reactions, reactionusers)
                        }

                        async function a0(res_posts) {
                            console.log("hello a0 and start a1");
                            await a1(res_posts);
                            console.log("hello end a1");
                        }

                        a0(res_posts)

                        function get_recursive_comments(id) {
                            console.log("get_recursive_comments")
                            return new Promise((resolve, reject) => {
                                serverUtilities.get_recursive(id, "comments", "?fields=from,like_count,message,comments{from,like_count,message,comment_count,user_likes,created_time},comment_count,user_likes,created_time&limit=100", 100, function (err, res) {
                                    // serverUtilities.savejson("res_" + sincedate + "_" + untildate + "_" + userid, res.data);
                                    console.log(res.data.length)
                                    if (res.data.length == 0) {
                                        console.log(res)
                                        res_comments.push(res);
                                        p1--;
                                    }

                                    if (err || !res) {
                                        if (!res) {
                                            console.log("Err res.comments===null: ");
                                            console.dir(res);
                                            //callback({"error": {"message": "No reaction."}}, res_reactions);
                                        }
                                        console.dir(err);
                                        reject(new Error('error!'))
                                    } else {
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
                                        console.log("rl=" + l)
                                        var p3 = 0;
                                        console.log("resolve comments");
                                        resolve(each_comment(res, id, l, p3, res_comments, data_query));
                                    }
                                })
                            })
                            /*.catch(function (err) {
                                console.log(err.message)
                            });*/
                        }

                        async function each_comment(res, id, l, p3, res_comments, data_query) {
                            console.log("---------- each subcomments loops ----------")
                            return new Promise(function (resolve, reject) {
                                res.data.forEach(function (item, index) {
                                    if (item.comments) {
                                        var reply = item.comments,
                                            tar = data_query.data[index].comments;
                                        paging(reply, tar, 1, 100, function (err, res) {
                                            console.log("reply: " + index)
                                            console.log("rl=" + l)
                                            p3++;
                                            // console.log(id + " " + p3)
                                            if (p3 >= l) {
                                                res_comments.push(data_query);
                                                p1--;
                                                console.log("p1=" + p1);
                                                console.log("push: " + id)
                                                //next(p1, p2, p4);
                                            }
                                        })
                                    } else {
                                        p3++;
                                        // console.log(id + " " + p3)
                                        if (p3 >= l) {
                                            res_comments.push(data_query);
                                            p1--;
                                            console.log("p1=" + p1);
                                            console.log("push: " + id)
                                            //next(p1, p2, p4);
                                            console.log("resolve subcomments");
                                            resolve(res_comments);
                                        }
                                    }
                                });
                                //postid.forEach(function (id) {})
                            })
                            /*.catch(function (err) {
                                console.log(err.message)
                            });*/
                        };

                        function get_recursive_reactions(id) {
                            console.log("get_recursive_reactions")
                            return new Promise((resolve, reject) => { // var qur = ",reactions.type(LOVE).limit(10).summary(true).as(love),reactions.type(WOW).limit(10).summary(true).as(wow),reactions.type(HAHA).limit(10).summary(true).as(haha),reactions.type(SAD).limit(10).summary(true).as(sad),reactions.type(ANGRY).limit(10).summary(true).as(angry), reactions.type(THANKFUL).limit(10).summary(true).as(thankful)";
                                serverUtilities.get_recursive(id, "reactions", "", 100, function (err, res) {
                                    // serverUtilities.savejson("res_" + sincedate + "_" + untildate + "_" + userid, res.data);
                                    if (err || !res) {
                                        if (!res) {
                                            console.log("Err res.comments===null: ");
                                            console.dir(res);
                                            //callback({"error": {"message": "No reaction."}}, res_reactions);
                                        }
                                        console.dir(err);
                                        reject(new Error('error!'))
                                    } else {
                                        // console.log("id=" + id)
                                        reactionusers.push(res);
                                        //console.log("err");
                                        p4--;
                                        //next(p1, p2, p4);
                                        //serverUtilities.savejson("reactions_" + sincedate + "_" + untildate + "_" + userid, res_reactions);
                                        //next();
                                        console.log("resolve reactionusers");
                                        resolve(reactionusers);
                                    }
                                });
                            })
                            /*.catch(function (err) {
                                console.log(err)
                            })*/
                        }

                        function get_reaction_counts(id, p2) {
                            console.log("get_reaction_counts")
                            return new Promise((resolve, reject) => {
                                var params = "?fields=reactions.type(LIKE).limit(0).summary(true).as(like),reactions.type(LOVE).limit(0).summary(true).as(love),reactions.type(WOW).limit(0).summary(true).as(wow),reactions.type(HAHA).limit(0).summary(true).as(haha),reactions.type(SAD).limit(0).summary(true).as(sad),reactions.type(ANGRY).limit(0).summary(true).as(angry), reactions.type(THANKFUL).limit(0).summary(true).as(thankful)";
                                graph.get(id + params, function (err, res) {
                                    if (err || !res) {
                                        if (!res) {
                                            console.log("Err res.reactions===null: ");
                                            console.dir(res);
                                            //callback({"error": {"message": "No reaction."}}, res_reactions);
                                        }
                                        console.dir(err);
                                        reject(new Error('error!'))
                                        //res.send({ "error": { "message": JSON.stringify(err) } });
                                    } else {
                                        // console.log("id=" + id)
                                        res_reactions.push(res);
                                        //console.log("err");
                                        p2--;
                                        console.log("resolve reactions");
                                        resolve(res_reactions);
                                        //next(p1, p2, p4);
                                        //serverUtilities.savejson("reactions_" + sincedate + "_" + untildate + "_" + userid, res_reactions);
                                        //next();
                                    }
                                });
                            })
                            /*.catch(function (err) {
                                console.log(err)
                            })*/
                        }

                        async function main(id, res) {
                            try {
                                console.log("---------- main loop ----------")
                                var result = await Promise.all([get_recursive_comments(id), get_recursive_reactions(id), get_reaction_counts(id, p2)]);
                                console.log(result);
                                res[0].push(result[0]);
                                res[1].push(result[1]);
                                res[2].push(result[2]);
                                console.log(res);
                                return res;
                            } catch (e) {
                                console.log(e)
                            }
                        }

                        var paging = function paging(res, tar, depth, MAX_DEPTH, callback) {
                            // console.log("depth=" + depth)
                            if (depth >= MAX_DEPTH) {
                                console.log("resursive paging: " + MAX_DEPTH);
                                // p3++;
                                // console.log(p3);
                                callback(null, tar);
                                return;
                            }
                            if (res.data && res.paging && res.paging.next) {
                                graph.get(res.paging.next, function (err, res) {
                                    if (err) {
                                        callback(err, res);
                                    }
                                    depth++;
                                    Array.prototype.push.apply(tar.data, res.data);
                                    setTimeout(function () {
                                        paging(res, tar, depth, MAX_DEPTH, callback);
                                    }, 1);
                                });
                            } else {
                                // console.log("[resursive paging: depth = " + depth + "]");
                                // p3++;
                                // console.log(p3);
                                callback(null, tar);
                                return;
                            }
                        }

                        var fill_reactions = function fill_reactions(res_posts, res_reactions) {
                            for (var i = 0; i < res_posts.data.length; i++) {
                                for (var j = 0; j < res_reactions.length; j++) {
                                    if (!(res_posts.data[i].reaction_detail)) {
                                        if (res_posts.data[i].id == res_reactions[j].id) {
                                            res_posts.data[i].reaction_detail = {
                                                "LIKE": res_reactions[j].like.summary.total_count,
                                                "LOVE": res_reactions[j].love.summary.total_count,
                                                "WOW": res_reactions[j].wow.summary.total_count,
                                                "HAHA": res_reactions[j].haha.summary.total_count,
                                                "SAD": res_reactions[j].sad.summary.total_count,
                                                "ANGRY": res_reactions[j].angry.summary.total_count,
                                                "THANKFUL": res_reactions[j].thankful.summary.total_count,
                                            };
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
                                    if (res_posts.data[i].id == res_comments[j].postid) {
                                        res_posts.data[i].comments.data = res_comments[j].data;
                                    }
                                }
                            }
                            //console.log(res_posts);
                            return res_posts;
                        };

                        var next = function next(res_posts, res_comments, res_reactions, reactionusers) {
                            console.log("---------- next ----------")
                            //if (p1 === 0 && p2 === 0 && p4 === 0) {
                            var save_posts = [];
                            // console.log(101);
                            serverUtilities.savejson("comments_" + sincedate + "_" + untildate + "_" + userid, res_comments); //*
                            serverUtilities.savejson("reactions_" + sincedate + "_" + untildate + "_" + userid, res_reactions); //*
                            serverUtilities.savejson("reactionusers_" + sincedate + "_" + untildate + "_" + userid, reactionusers); //*
                            save_posts = fill_reactions(res_posts, res_reactions);
                            save_posts = fill_comments(save_posts, res_comments);
                            // serverUtilities.savejson("posts_" + sincedate + "_" + untildate + "_" + userid, save_posts);
                            save_posts = serverUtilities.format_json(res_posts, save_posts);
                            save_posts = serverUtilities.add_reactionuser(save_posts, reactionusers);
                            serverUtilities.savejson("posts_" + sincedate + "_" + untildate + "_" + userid, save_posts);
                            //console.log(res_posts);
                            console.log("done");
                            //}
                        }
                    } else {
                        console.log("res_posts.length === 0 ");
                        console.dir(res_posts);
                    }
                }); //create direction
            }; //graph.get(userid, {fields: ""}, function(err, res0) {
        };
    });
};

var exports = module.exports = {};
exports.callback = callback;