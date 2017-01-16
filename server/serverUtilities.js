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

	return "_" + curr_month + "-" + curr_date + "-(" + curr_hour + ")-" + curr_year;
};

var dirpath = ""; // G:\\Dropbox\\sharevis-data\\


var savejson = function savejson(name, jsondata) {
	//fs.writeFile(name +".json", JSON.stringify(jsondata));
	fs.writeFile(dirpath + name + getdateformat() + ".json", JSON.stringify(jsondata));
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
};

var createfolder_sharevis = function createfolder_sharevis(id) {
	if (fs.existsSync("pagedata/")) {
		if (fs.existsSync("pagedata/" + id + getdateformat() + "/")) {
			dirpath = "pagedata/" + id + getdateformat() + "/";
		} else {
			dirpath = "pagedata/" + id + getdateformat() + "/";
			fs.mkdirSync(dirpath);
			console.log("Not find folder'" + id + getdateformat() + "', create new folder.");
		}

		if (fs.existsSync("pagedata/" + id + getdateformat() + "/" + "post/")) {

		} else {
			fs.mkdirSync(dirpath + "post/");
			console.log("Not find folder'" + id + getdateformat() + "post/" + "', create new folder.");
		}
	} else {
		fs.mkdirSync("pagedata/");
		console.log("Not find folder 'pagedata', create new folder.");

		dirpath = "pagedata/" + id + getdateformat() + "/";
		fs.mkdirSync(dirpath);
		console.log("Not find folder '" + id + getdateformat() + "', create new folder.");

		fs.mkdirSync(dirpath + "post/");
	}
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
			"api version": 2.8
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

	console.log(pictureurl);
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
var get_recursive = function get_recursive(postid, field_query, subfield_query, MAX_DEPTH, callback) {
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
				console.log("resursive paging: " + MAX_DEPTH);
				console.log(field_query + ".length: " + data_query.data.length);
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
					console.log("page " + depth + " " + field_query + ".length: " + res.data.length);

					//data_query.data = data_query.data.concat(res.data);
					data_query.data.push.apply(data_query.data, res.data);

					//console.log("data_query: " + data_query.data );
					//savejson("data_query", data_query);

					setTimeout(function () {
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
		data_query.postid = postid;
		console.log("page " + 1 + " " + field_query + ".length: " + data_query.data.length);
		var id = postid;

		recurpaging(res, 1, MAX_DEPTH, callback);
		return;
	});
};
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
exports.createfolder_sharevis = createfolder_sharevis;
exports.save_photo_id = save_photo_id;
exports.fill_zero_field = fill_zero_field;
exports.getpicture = getpicture;
exports.saveinformation = saveinformation;
exports.get_recursive = get_recursive;
exports.insert2postdb = insert2postdb;
exports.add_query_time = add_query_time;