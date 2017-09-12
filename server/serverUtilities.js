/* eslint-disable */
var graph = require('fbgraph'), // npm install fbgraph

	fs = require('fs'), // File System
	MongoClient = require('mongodb').MongoClient;

// Transform 2015-02-07T07:59:09.614Z to 2015-02-07 and return it.
var eliminateISOFormatTimeString = function eliminateISOFormatTimeString(ISOTimeString) {
	var dateArray = ISOTimeString.split("T"),

		YearMonthDay = dateArray[0],
		YearMonthDayArray = YearMonthDay.split("-"),

		year = YearMonthDayArray[0],
		month = YearMonthDayArray[1],
		day = YearMonthDayArray[2];

	date = year + "-" + month + "-" + day;

	return date;
};

// If the current request date is 2015-02-07T07:59:09.614Z, result will be _2-7-(7)-2015 and return it.
var getdateformat = function getdateformat() {
	var d = new Date(),
		curr_hour = d.getHours(),
		curr_date = d.getDate(),
		curr_month = d.getMonth() + 1, //Months are zero based
		curr_year = d.getFullYear();

	//return "_" + curr_month + "-" + curr_date + "-(" + curr_hour + ")-" + curr_year;
	return "_" + curr_month + "-" + curr_date + "-" + curr_year;
};

var dirpath = "/windows/D/Crawler_data/", // G:\\Dropbox\\sharevis-data\\
	dirpathAfter20141202 = "/windows/D/pagedata after 20141202/";


var savejson = function savejson(name, jsondata) {
	//fs.writeFile(name +".json", JSON.stringify(jsondata));
	fs.writeFileSync(dirpath + name + getdateformat() + ".json", JSON.stringify(jsondata));
	//fs.writeFileSync(dirpathAfter20141202 + name + getdateformat() + ".json", JSON.stringify(jsondata));
};

var updatejson = function updatejson(name, jsondata) {
	fs.appendFile(dirpath + name + getdateformat() + ".json", JSON.stringify(jsondata));
};

var openjson = function openjson(name) {
	var data;
	try {
		//data = fs.readFileSync(name +".json", 'utf8');
		data = fs.readFileSync(dirpath + name + ".json", 'utf8');
		return JSON.parse(data);
	} catch (e) {
		if (e.code === 'ENOENT') {
			console.log('File not found! %s', dirpath + name + getdateformat() + ".json");
			return false;
		} else {
			throw e;
		}
	}
};

//for pagedata
var createfolder = function createfolder(id) {
	if (fs.existsSync("pagedata/")) {
		if (fs.existsSync("pagedata/" + id + getdateformat() + "/")) {
			dirpath = "pagedata/" + id + getdateformat() + "/";
		} else {
			dirpath = "pagedata/" + id + getdateformat() + "/";
			fs.mkdirSync(dirpath);
			console.log("Not find folder'" + id + getdateformat() + "', create new folder.");
		}
	} else {
		fs.mkdirSync("pagedata/");
		console.log("Not find folder 'pagedata', create new folder.");
		dirpath = "pagedata/" + id + getdateformat() + "/";
		fs.mkdirSync(dirpath);
		console.log("Not find folder '" + id + getdateformat() + "', create new folder.");
	}

	if (fs.existsSync("/windows/D/Crawler_data/" + id + getdateformat() + "/")) {
		dirpath = "/windows/D/Crawler_data/" + id + getdateformat() + "/";
	} else {
		dirpath = "/windows/D/Crawler_data/" + id + getdateformat() + "/";
		fs.mkdirSync(dirpath);
		console.log("Not find folder'" + id + getdateformat() + "', create new folder.");
	}
	/*
	// Temporary saving the files after 20141202 in dirpathAfter20141202, without checking dirpathAfter20141202 folder exist or not.
	if (fs.existsSync("/windows/D/pagedata after 20141202/" + id + getdateformat() + "/")) {
		dirpathAfter20141202 = "/windows/D/pagedata after 20141202/" + id + getdateformat() + "/";
	} else {
		dirpathAfter20141202 = "/windows/D/pagedata after 20141202/" + id + getdateformat() + "/";
		fs.mkdirSync(dirpathAfter20141202);
		console.log("Not find folder'" + id + getdateformat() + "', create new folder.");
	}*/
};

var save_photo_id = function save_photo_id(id) {
	var photo_id = 0;
	photo_id = id;
	console.log("photo_id = " + photo_id);
	return photo_id;
};

/*function createsubfolder(filepath)
{
	var subdirpath = filepath+"post/";
	fs.mkdirSync(subdirpath);
}*/

var fill_zero_field = function fill_zero_field(res_posts) {
	if (!res_posts.version) {
		res_posts.version = {
			"api version": 2.6
		};
	}
	for (var i = 0; i < res_posts.data.length; i++) {
		if (!(res_posts.data[i].shares)) {
			res_posts.data[i].shares = {
				"count": 0
			};
		}

		if (!(res_posts.data[i].likes)) {
			res_posts.data[i].likes = {
				"summary": {
					"total_count": 0
				}
			};
		}

		if (!(res_posts.data[i].comments)) {
			res_posts.data[i].comments = {
				"summary": {
					"total_count": 0
				}
			};
		}
	}
	return res_posts;
};

var getpicture = function getpicture(userid, res_posts) {
	var pictureurl;
	graph.get(userid, {
		fields: "picture.height(140).width(140)"
	}, function (err, res) {
		if (err && !res.picture.data.url) {
			console.log("picture.data.url === null ");
		} else {
			pictureurl = res.picture.data.url;
			//console.log(pictureurl);
		}
	});

	//console.log(pictureurl);
	return pictureurl;
};

var saveinformation = function saveinformation(results, res_data) {
	if (results.type !== "photo") {
		res_data = {
			"id": results.id,
			"from": results.from,
			"likesnum": results.likes.data.length,
			"message": results.message,
			"type": results.type,
			"created_time": results.created_time,
			"sharedpostsnum": results.sharedposts.data.length,
			"commentsnum": results.comments.data.length,
			"likesnum": results.likes.data.length
		};
	} else if (!(results.sharedposts)) {
		res_data = {
			"id": results.id,
			"object_id": results.object_id,
			"from": results.from,
			"likesnum": results.likes.data.length,
			"message": results.message,
			"type": results.type,
			"created_time": results.created_time,
			"sharedpostsnum": 0,
			"commentsnum": results.comments.data.length,
			"likesnum": results.likes.data.length
		};
	} else if (results.sharedposts) {
		res_data = {
			"id": results.id,
			"object_id": results.object_id,
			"from": results.from,
			"likesnum": results.likes.data.length,
			"message": results.message,
			"type": results.type,
			"created_time": results.created_time,
			"sharedpostsnum": results.sharedposts.count,
			"commentsnum": results.comments.data.length,
			"likesnum": results.likes.data.length
		};
	}
	return res_data;
};

//postid, field_query, subfield_query, MAX_DEPTH, callback
//postid, "sharedposts", "?fields=via,from,likes.limit(1000)&limit=100"
//postid, "likes", "?limit=1000"
var get_recursive = function get_recursive(postid, field_query, subfield_query, MAX_DEPTH, timeout, callback) {
	graph.get(postid + '/' + field_query + '/' + subfield_query, function (err, res) {
		if (err || !res) {
			if (!res) {
				console.log("Error %s===null.", field_query);
				console.dir(res);
				callback({
					"error": {
						"message": "No sharedpost."
					}
				}, res);
			}
			callback(err, res);
			return;
		}

		var recurpaging = function recurpaging(res, depth, MAX_DEPTH, callback) {
			if (depth >= MAX_DEPTH) {
				//console.log("resursive paging: " + MAX_DEPTH);
				//console.log(field_query + ".length: " + data_query.data.length);
				//savejson("data_query", data_query);
				callback(null, data_query);
				return;
			}

			if (res.data && res.paging && res.paging.next) {
				graph.get(res.paging.next, function (err, res) {
					if (err) {
						callback(err, res);
					}
					// page depth
					depth++;
					//console.log(res);
					console.log("page " + depth + " " + field_query /* + ".length: " + res.data.length*/ );

					//data_query.data = data_query.data.concat(res.data);
					Array.prototype.push.apply(data_query.data, res.data);

					//console.log("data_query: " + data_query.data );
					//savejson("data_query", data_query);

					setTimeout(function () {
						recurpaging(res, depth, MAX_DEPTH, callback);
					}, timeout);
				});
			} else {
				//console.log("[resursive paging: end --------------]");
				//console.log(field_query + ".length: " + data_query.data.length);
				//savejson("data_query", data_query);
				callback(null, data_query);
				return;
			}
		};

		//console.log(res);
		//console.log(res.data);
		//console.log("res.data.length: " + res.data.length );
		var data_query = {
			"data": []
		};
		data_query.data = res.data; //data_query.data.concat(res.data);
		data_query.postid = postid;
		//console.log("page " + 1 + " " + field_query + ".length: " + data_query.data.length);
		var id = postid;

		recurpaging(res, 1, MAX_DEPTH, callback);
		return;
	});
};

//format json
var format_json = function format_json(inputdata, outputjson) {
	var data = [];
	// console.log(inputdata.data)
	var sub = inputdata.data;
	for (var i = 0; i < sub.length; i++) {
		var reactions = {
			"like": sub[i].reaction_detail.LIKE,
			"love": sub[i].reaction_detail.LOVE,
			"haha": sub[i].reaction_detail.HAHA,
			"wow": sub[i].reaction_detail.WOW,
			"angry": sub[i].reaction_detail.ANGRY,
			"sad": sub[i].reaction_detail.SAD,
			"thankful": sub[i].reaction_detail.TNANKFUL
		};
		var context = [];
		if (sub[i].comments) {
			var sub1 = sub[i].comments.data
			// console.log(sub1);
			for (var j = 0; j < sub1.length; j++) {
				// console.log(sub1[j]);
				if (sub1[j].comments) {
					// console.log("sub+" + j);
					var sub2 = sub1[j].comments.data;
					// console.log(sub2);
					var reply = [];
					for (var k = 0; k < sub2.length; k++) {
						// console.log("l="+sub2.length);
						reply.push({
							"created_time": sub2[k].created_time,
							"from": sub2[k].from,
							"message": sub2[k].message,
							"like_count": sub2[k].like_count,
							"id": sub2[k].id
						});
						if (sub2[k]['message_tags']) {
							reply[k]['message_tags'] = sub2[k]['message_tags'];
						}
					}
					// console.log(reply)
					context.push({
						"from": sub1[j].from,
						"like_count": sub1[j].like_count,
						"message": sub1[j].message,
						"comments": reply,
						"comment_count": sub1[j].comment_count,
						"created_time": sub1[j].created_time,
						"id": sub1[j].id
					})
					// console.log(context)
				} else {
					context.push({
						"from": sub1[j].from,
						"like_count": sub1[j].like_count,
						"message": sub1[j].message,
						"comment_count": sub1[j].comment_count,
						"created_time": sub1[j].created_time,
						"id": sub1[j].id
					})
				}
				if (sub1[j]['message_tags']) {
					context[j]['message_tags'] = sub1[j]['message_tags'];
				}
				// console.log("sub0")
			}
		}

		var comments = {
			"context": context,
			"summary": sub[i].comments.summary.total_count
		};
		if (sub[i].attachments) {
			var attachments = {
				"description": sub[i].attachments.data[0].description,
				"url": sub[i].attachments.data[0].url,
				"title": sub[i].attachments.data[0].title,
				"type": sub[i].attachments.data[0].type
			}
		} else {
			var attachments = null;
		}
		data.push({
			"id": sub[i].id,
			"created_time": sub[i].created_time,
			"type": sub[i].type,
			"message": sub[i].message,
			"from": sub[i].from,
			"shares": sub[i].shares.count,
			"likes": reactions.like,
			"reactions": reactions,
			"comments": comments,
			"attachments": attachments
		});
	}
	inputdata.data = data;
	outputjson = {
		"data": data
	};
	return inputdata;
}

var add_reactionuser = function add_reactionuser(data, userlist) {
	for (var i = 0; i < data.data.length; i++) {
		for (var j = 0; j < userlist.length; j++) {
			if (userlist[j].postid === data.data[i].id) {
				data.data[i].reactions["list"] = userlist[j].data;
			}
		}
	}
	return data;
}
/*
		//batch
					var batch_recursive = function get_recursive(postid, field_query, subfield_query, MAX_DEPTH, callback) {
						var batch=[];
						batch.push({method:"GET",
							relative_url: "postid + \'/\' + field_query + \'/\' + subfield_query"});
						graph.batch(batch, function(err, res) {
							if (err || !res) {
								if (!res) {
									console.log("Error %s===null.", field_query);
									console.dir(res);
									callback({
										"error": {
											"message": "No sharedpost."
										}
									}, res);
								}
								callback(err, res);
								return;
							}
							var recurpaging = function recurpaging(res, depth, MAX_DEPTH, callback) {
								if (depth >= MAX_DEPTH) {
									console.log("resursive paging: " + MAX_DEPTH);
									console.log(field_query + ".length: " + data_query.data.length);
									//savejson("data_query", data_query);
									callback(null, data_query);
									return;
								}
								if (res.data && res.paging && res.paging.next) {
									graph.batch(res.paging.next, function(err, res) {
										if (err) {
											callback(err, res);
										}
										// page depth
										depth++;
										//console.log(res);
										console.log("page " + depth + " " + field_query + ".length: " + res.data.length);
										//data_query.data = data_query.data.concat(res.data);
										data_query.data.push.apply(data_query.data, res.data);
										//console.log("data_query: " + data_query.data );
										//savejson("data_query", data_query);
										setTimeout(function() {
											recurpaging(res, depth, MAX_DEPTH, callback);
										}, 1);
									});
								} else {
									console.log("[resursive paging: end --------------]");
									console.log(field_query + ".length: " + data_query.data.length);
									//savejson("data_query", data_query);
									callback(null, data_query);
								}
							};
							//console.log(res);
							//console.log(res.data);
							//console.log("res.data.length: " + res.data.length );
							var data_query = {
								"data": []
							};
							data_query.data = res.data; //data_query.data.concat(res.data);
							console.log("page " + 1 + " " + field_query + ".length: " + data_query.data.length);
							recurpaging(res, 1, MAX_DEPTH, callback);
							return;
						});
					};
*/
var insert2postdb = function insert2postdb(dburl, collection_name, inputjson) {
	MongoClient.connect('mongodb://' + dburl + '/fbvis', function (err, db) {
		if (err) throw err;

		console.log("Connected to Database");

		var collection = db.collection(collection_name);

		collection.insert(inputjson.data, function (err, docs) {
			if (err) throw err;
		});

		collection.count(function (err, count) {
			console.log("count = %s", count);
			// Let's close the db
			db.close();
		});
	});
};

var add_query_time = function add_query_time(res_posts) {
	var date = new Date();
	date.setHours(date.getHours() + 8);
	date = date.toISOString();
	date = date + "+0800";

	for (var i = 0; i < res_posts.data.length; i++) {
		res_posts.data[i].query_time = date;
		res_posts.data[i].query_user = "shareviscrawler";

	}
	return res_posts;
};

var exports = module.exports = {};
exports.eliminateISOFormatTimeString = eliminateISOFormatTimeString;
exports.getdateformat = getdateformat;
exports.savejson = savejson;
exports.updatejson = updatejson;
exports.openjson = openjson;
exports.createfolder = createfolder;
exports.save_photo_id = save_photo_id;
exports.fill_zero_field = fill_zero_field;
exports.getpicture = getpicture;
exports.saveinformation = saveinformation;
exports.get_recursive = get_recursive;
exports.format_json = format_json;
exports.add_reactionuser = add_reactionuser;
exports.insert2postdb = insert2postdb;
exports.add_query_time = add_query_time;