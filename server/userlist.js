/* eslint-disable */
var user_list = function user_list(files) {
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

var ualist = function ualist(files) {
    var userlist = [];
    var data, reaction, user, post, reactionlength;
    var filelength = files.length;
    console.log("file length: "+filelength)
    var find = false;
    for (var i = 0; i < filelength; i++) {
        //console.log(userlist.length)
        data = files[i];
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
    console.log("userlist length: "+userlist.length)
    comment_countdb(files, userlist);
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

function comment_countdb(files, userlist) {
    var data, comment, user, post, commentlength;
    var filelength = files.length;
    var listlength = userlist.length;
    var findid = false;
    var findpost = false;
    for (var i = 0; i < filelength; i++) {
        data = files[i];
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

var exports = module.exports = {};
exports.user_list = user_list;
exports.ualist = ualist;
//exports.post_type = post_type;
//exports.comment_count = comment_count;