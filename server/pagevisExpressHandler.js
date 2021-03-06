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
	//console.log("["+connectionCountSinceStart+": "+new Date()+" ip:"+ip+" ]");

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
			// res.send({
			// 	"error": {
			// 		"message": JSON.stringify(err)
			// 	}
			// });
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
						// res.send({
						// 	"error": {
						//		"message": JSON.stringify(err)
						//	}
						// });
					} else if (res_posts.data.length != 0) {
						res_posts = serverUtilities.fill_zero_field(res_posts);
						var picture = serverUtilities.getpicture(userid, res_posts);
						//serverUtilities.savejson("post",res_posts);
						//add here
						//var queryfield2 = "?fields=reactions&since=" + sincedate + "&until=" + untildate + "&limit=100";
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
						postid.forEach(function (id) {
							serverUtilities.get_recursive(id, "comments", "?fields=from,like_count,message,comments{from,like_count,message,comment_count,user_likes,created_time},comment_count,user_likes,created_time&limit=100", 100, function (err, res) {
								// serverUtilities.savejson("res_" + sincedate + "_" + untildate + "_" + userid, res.data);
								console.log(res.data.length)
								if (res.data.length == 0) {
									console.log(res)
									res_comments.push(res);
									p1--;
								}
								//console.log(res);
								//console.log(res.data);
								//console.log("res.data.length: " + res.data.length );

								if (err || !res) {
									if (!res) {
										console.log("Err res.comments===null: ");
										console.dir(res);
										//callback({"error": {"message": "No reaction."}}, res_reactions);
									}
									console.dir(err);
									// res.send({
									// 	"error": {
									// 		"message": JSON.stringify(err)
									//	}
									// });
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
													next(p1, p2, p4);
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
												next(p1, p2, p4);
											}
										}
										// if (p3 >= l) {
										// 	res_comments.push(data_query);
										// 	p1--;
										// 	console.log("p1=" + p1);
										// 	console.log("push: " + id)
										// 	next(p1, p2);
										// }
									});
								}
							});
							// var qur = ",reactions.type(LOVE).limit(10).summary(true).as(love),reactions.type(WOW).limit(10).summary(true).as(wow),reactions.type(HAHA).limit(10).summary(true).as(haha),reactions.type(SAD).limit(10).summary(true).as(sad),reactions.type(ANGRY).limit(10).summary(true).as(angry), reactions.type(THANKFUL).limit(10).summary(true).as(thankful)";
							serverUtilities.get_recursive(id, "reactions", "", 100, function (err, res) {
								// serverUtilities.savejson("res_" + sincedate + "_" + untildate + "_" + userid, res.data);
								if (err || !res) {
									if (!res) {
										console.log("Err res.comments===null: ");
										console.dir(res);
										//callback({"error": {"message": "No reaction."}}, res_reactions);
									}
									console.dir(err);
									// res.send({
									//	"error": {
									//		"message": JSON.stringify(err)
									//	}
									// });
								} else {
									// console.log("id=" + id)
									reactionusers.push(res);
									//console.log("err");
									p4--;
									next(p1, p2, p4);
									//serverUtilities.savejson("reactions_" + sincedate + "_" + untildate + "_" + userid, res_reactions);
									//next();
								}
							});
							var params = "?fields=reactions.type(LIKE).limit(0).summary(true).as(like),reactions.type(LOVE).limit(0).summary(true).as(love),reactions.type(WOW).limit(0).summary(true).as(wow),reactions.type(HAHA).limit(0).summary(true).as(haha),reactions.type(SAD).limit(0).summary(true).as(sad),reactions.type(ANGRY).limit(0).summary(true).as(angry), reactions.type(THANKFUL).limit(0).summary(true).as(thankful)";
							graph.get(id + params, function (err, res) {
								if (err || !res) {
									if (!res) {
										console.log("Err res.reactions===null: ");
										console.dir(res);
										//callback({"error": {"message": "No reaction."}}, res_reactions);
									}
									console.dir(err);
									//res.send({ "error": { "message": JSON.stringify(err) } });
								} else {
									// console.log("id=" + id)
									res_reactions.push(res);
									//console.log("err");
									p2--;
									next(p1, p2, p4);
									//serverUtilities.savejson("reactions_" + sincedate + "_" + untildate + "_" + userid, res_reactions);
									//next();
								}
							});
						});

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

						var next = function next(p1, p2, p4) {

							if (p1 === 0 && p2 === 0 && p4 === 0) {
								var save_posts = [];
								// console.log(101);
								serverUtilities.savejson("comments_" + sincedate + "_" + untildate + "_" + userid, res_comments);
								serverUtilities.savejson("reactions_" + sincedate + "_" + untildate + "_" + userid, res_reactions);
								serverUtilities.savejson("reactionusers_" + sincedate + "_" + untildate + "_" + userid, reactionusers);
								//reactioncounts = countreactions(res_posts, res_reactions, reactioncounts);
								res_posts = fill_reactions(res_posts, res_reactions);
								res_posts = fill_comments(res_posts, res_comments);
								//serverUtilities.savejson("posts_" + sincedate + "_" + untildate + "_" + userid, res_posts);
								save_posts = serverUtilities.format_json(res_posts, save_posts);
								save_posts = serverUtilities.add_reactionuser(save_posts, reactionusers);
								serverUtilities.savejson("posts_" + sincedate + "_" + untildate + "_" + userid, save_posts);
								//serverUtilities.savejson("reactions_" + sincedate + "_" + untildate + "_" + userid, res_reactions);
								//var url = getpicture(userid);
								//console.log(url);
								//console.log(res_posts);
								console.log("done");
								/*
																database.save(save_posts, function (err) {
																	if (err) {
																		console.dir(err);
																		res.sned({ "error": { "message": JSON.stringify(err) } });
																	}
																	else {
																		console.log("success!!");
																	}
																});
								*/
								// res.send(res_posts);
							}
						}
						//res.send(res_posts);
					} else {
						console.log("res_posts.length === 0 ");
						console.dir(res_posts);
						// res.send({
						//	"message": "No posts!"
						// });
					}

				}); //create direction
			}; //graph.get(userid, {fields: ""}, function(err, res0) {
		};
	});
};

var exports = module.exports = {};
exports.callback = callback;