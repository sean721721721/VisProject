/* eslint-disable */
var fs = require('fs');
var readFiles = require('./readfile.js');


function user_list(files) {
    var userlist = [];
    var data, reaction, user, post, reactionlength;
    var filelength = files.length;
    var find = false;
    for (var i = 0; i < filelength; i++) {
        var datalength = files[i].contents.data.length;
        //console.log(userlist.length)
        for (var j = 0; j < datalength; j++) {
            data = files[i].contents.data[j];
            //console.log(data.id)
            if (data.reactions.list !== undefined) {
                reactionlength = data.reactions.list.length;
                if (reactionlength !== 0) {
                    //console.log(userlist.length)
                    for (var k = 0; k < reactionlength; k++) {
                        reaction = data.reactions.list[k];
                        post = {};
                        post["id"] = data.id
                        post["like"] = post_liketype(post, reaction);
                        post["commentcount"] = 0;
                        //console.log(post)
                        user = {};
                        user["id"] = reaction.id;
                        user["name"] = reaction.name;
                        user["posts"] = [];
                        //console.log(userlist.length)
                        find = false;
                        for (var a = 0; a < userlist.length; a++) {
                            if (userlist[a].id == user.id) {
                                userlist[a].posts.push(post);
                                a = userlist.length;
                                find = true;
                            }
                        }
                        if (find == false) {
                            user.posts.push(post);
                            //console.log(post)
                            //console.log(user.posts[0])
                            userlist.push(user);
                            //people++;
                            //console.log(user)
                            //console.log("---------------------")
                        }
                    }
                }
            }
        }
    }
    console.log(userlist.length)
    comment_count(files, userlist);
    //console.log("people "+people)
    return userlist;
}

function post_liketype(post, reaction) {
    if (reaction.type === "LIKE") {
        return 1;
    } else if (reaction.type === "LOVE") {
        return 2;
    } else if (reaction.type === "HAHA") {
        return 3;
    } else if (reaction.type === "WOW") {
        return 4;
    } else if (reaction.type === "SAD") {
        return 5;
    } else if (reaction.type === "ANGRY") {
        return 6;
    } else {
        return 7;
    }
}

function comment_count(files, userlist) {
    var data, comment, user, post, commentlength;
    var filelength = files.length;
    var listlength = userlist.length;
    var findid = false;
    var findpost = false;
    for (var i = 0; i < filelength; i++) {
        var datalength = files[i].contents.data.length;
        for (var j = 0; j < datalength; j++) {
            data = files[i].contents.data[j];
            if (data.comments.context !== undefined) {
                commentlength = data.comments.context.length;
                if (commentlength !== 0) {
                    //console.log(userlist.length)
                    for (var k = 0; k < commentlength; k++) {
                        comment = data.comments.context[k];
                        findid = false;
                        for (var a = 0; a < listlength; a++) {
                            if (comment.from.id == userlist[a].id) {
                                findid = true;
                                //console.log("find")
                                var length = userlist[a].posts.length;
                                //console.log(length)
                                findpost = false;
                                for (var b = 0; b < length; b++) {
                                    if (data.id == userlist[a].posts[b].id) {
                                        findpost = true;
                                        //console.log("find")
                                        userlist[a].posts[b].commentcount++;
                                        b = length;
                                    }
                                }
                                if (!findpost) {
                                    //console.log("no post!")
                                    post = {
                                        "id": data.id,
                                        "like": 0,
                                        "commentcount": 1
                                    }
                                    userlist[a].posts.push(post);
                                }
                            }
                        }
                        if (!findid) {
                            //console.log("no user!")
                            post = {
                                "id": data.id,
                                "like": 0,
                                "commentcount": 1
                            }
                            user = {
                                "id": comment.from.id,
                                "name": comment.from.name,
                                "posts": []
                            }
                            user.posts.push(post)
                            userlist.push(user)
                        }
                    }
                }
            }
        }
    }
}

function csv1(userlist) {
    var string = ",";
    var csv = [];
    var user = [];
    var postlist = [];
    var findpost = false;
    var length = userlist.length;
    for (var i = 0; i < length; i++) {
        //console.log(userlist[i].id)
        user = [];
        user.push(userlist[i].id);
        user.push(userlist[i].name);
        //console.log(user)
        var posts = userlist[i].posts;
        //console.log(postlist.length)
        for (var j = 0; j < posts.length; j++) {
            findpost = false;
            for (var k = 0; k < postlist.length; k++) {
                var index = k * 2 + 2;
                //console.log(postlist.length)
                if (posts[j].id == postlist[k]) {
                    findpost = true;
                    user[index] = posts[j].like;
                    user[index + 1] = posts[j].commentcount;
                } else {
                    user[index] = "";
                    user[index + 1] = "";
                }
            }
            if (!findpost) {
                //console.log("no post!")
                user.push(posts[j].like);
                user.push(posts[j].commentcount);
                postlist.push(posts[j].id);
                //user.push(posts[j].like);
            }
        }
        //console.log(user[0])
        csv.push(user);
    }
    //console.log("postlist.length=" + postlist.length)
    for (var a = 0; a < postlist.length; a++) {
        //console.log(postlist[a])
        string += ",";
        string += postlist[a];
        //console.log(typeof(postlist[i]));
        string += ",";
        string += postlist[a];
    }
    string += "\n";
    string += "user-id,user-name";
    for (var a = 0; a < postlist.length; a++) {
        //console.log(postlist[a])
        string += ",like";
        string += ",comment";
    }
    //console.log(string)
    string += "\n";
    var people = csv.length;
    for (var x = 0; x < people; x++) {
        //console.log(csv[x][0])
        var id = csv[x][0];
        string += id.toString();
        string += ",";
        string += csv[x][1];
        for (var y = 0; y < postlist.length; y++) {
            string += ",";
            if (csv[x][y + 2] != undefined) {
                var num = csv[x][y + 2];
                string += num;
            }
            //string += ",";
            //console.log(csv[x][y])
        }
        string += "\n";
    }
    //console.log(csv[300].length)
    return string;
}

function csv2(files) {
    var string = "post-id,post-message/attachment,user-id,comment-message,user-id,subcomment-message\n";
    var data, comment, subcomment, commentlength, subcomment;
    var filelength = files.length;
    for (var i = 0; i < filelength; i++) {
        var datalength = files[i].contents.data.length;
        //console.log(userlist.length)
        for (var j = 0; j < datalength; j++) {
            data = files[i].contents.data[j];
            //console.log(data.id)
            var id = data.id;
            string += id.toString();
            string += ",";
            string += "'";
            if (data.message !== undefined) {
                string += clearString(data.message);
            } else if (data.attachments.description !== undefined) {
                string += "attachment description : ";
                string += clearString(data.attachments.description);
            } else {
                string += "attachment title : ";
                string += clearString(data.attachments.title);
            }
            string += "'";
            commentlength = data.comments.context.length;
            if (commentlength !== 0) {
                //console.log(userlist.length)
                for (var k = 0; k < commentlength; k++) {
                    comment = data.comments.context[k];
                    string += ",";
                    var id = comment.from.id;
                    string += id.toString();
                    string += ",";
                    string += "'";
                    string += clearString(comment.message);
                    string += "'";
                    subcomment = comment.comments
                    if (subcomment !== undefined) {
                        console.log(i + " " + j + " " + k)
                        var sublength = subcomment.length;
                        for (var l = 0; l < sublength; l++) {
                            string += ",";
                            var id = subcomment[l].from.id
                            string += id.toString();
                            console.log(id.toString())
                            string += ",";
                            string += "'";
                            string += clearString(subcomment[l].message);
                            string += "'";
                            string += "\n";
                            if (l !== sublength - 1) {
                                string += ",,,";
                            }
                        }
                    } else {
                        string += "\n";
                    }
                    if (k != commentlength - 1) {
                        string += ",";
                    }
                }
            } else {
                string += "\n";
            }
        }
    }
    return string;
}

function clearString(s) {
    //var pattern = new RegExp("[`':;',‘；：”“'。，、？]") 
    var pattern1 = new RegExp("[,]")
    var pattern2 = new RegExp("[\r\n]")
    var rs1 = "";
    var rs2 = "";
    var l1=s.length;
    for (var i = 0; i < l1; i++) {
        rs1 = rs1 + s.substr(i, 1).replace(pattern1, '，');
    }
    var l2=rs1.length;
    for (var i = 0; i < l2; i++) {
        rs2 = rs2 + rs1.substr(i, 1).replace(pattern2, ' ');
    }
    return rs2;
}
//makecsv

var folders = ['2010', '2011', '2012'];
folders.forEach(folder => {
    var root = "/windows/D/Crawler_data/greenpeace";
    //console.log(typeof(root + '/' + folder))
    readFiles.readFiles(root + '/' + folder)
        .then(function (files) {
            console.log("loaded ", files.length)
            //fs.writeFileSync(root + "_" + folder + ".json", JSON.stringify(user_list(files)))
            fs.writeFile(root + "_" + folder + "_form1.csv", csv1(user_list(files)), err => {
                if (err) throw err;
                console.log("save" + folder + "_form1");
            })
            fs.writeFile(root + "_" + folder + "_form2.csv", csv2(files), err => {
                if (err) throw err;
                console.log("save" + folder + "_form2");
            })
            var list = user_list(files)
            //console.log(list[0])

            files.forEach((item, index) => {
                console.log("item", index, "posts: ", item.contents.data.length);
            });
            return user_list(files);
        })
        .catch(error => {
            console.log(error);
        });
});