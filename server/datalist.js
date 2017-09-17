/* eslint-disable */
//for csv
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

//for dbquery
var ualist = function ualist(files) {
    var userlist = [];
    var data, reaction, user, post, reactionlength;
    var filelength = files.length;
    console.log("file length: " + filelength)
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
                    post["share"] = false;
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
    console.log("userlist length: " + userlist.length)
    comment_countdb(files, userlist);
    share_db(files, userlist);
    //console.log("people "+people)
    return userlist;
}

//check like type
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

//count comments for csv
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

//count comments for dbquery
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
                                    "commentcount": 1,
                                    "share": false,
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
                            "commentcount": 1,
                            "share": false,
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

//share check for dbquery
function share_db(files, userlist) {
    var data, sharedpost, user, post, sharelength;
    var filelength = files.length;
    var listlength = userlist.length;
    var findid = false;
    var findpost = false;
    for (var i = 0; i < filelength; i++) {
        data = files[i];
        if (data.sharedposts.data !== undefined) {
            sharelength = data.sharedposts.data.length;
            if (sharelength !== 0) {
                //console.log(userlist.length)
                for (var k = 0; k < sharelength; k++) {
                    sharedpost = data.sharedposts.data[k];
                    findid = false;
                    for (var a = 0; a < listlength; a++) {
                        if (sharedposts.from.id == userlist[a].id) {
                            findid = true;
                            //console.log("find")
                            var length = userlist[a].posts.length;
                            //console.log(length)
                            findpost = false;
                            for (var b = 0; b < length; b++) {
                                if (data.id == userlist[a].posts[b].id) {
                                    findpost = true;
                                    //console.log("find")
                                    userlist[a].posts[b].share = true;
                                    b = length;
                                }
                            }
                            if (!findpost) {
                                //console.log("no post!")
                                post = {
                                    "id": data.id,
                                    "like": 0,
                                    "commentcount": 0,
                                    "share": true,
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
                            "commentcount": 0,
                            "share": true,
                        }
                        user = {
                            "id": sharedpost.from.id,
                            "name": sharedpost.from.name,
                            "posts": [],
                        }
                        user.posts.push(post)
                        userlist.push(user)
                    }
                }
            }
        }
    }
}

//slow code, need to improve
var bindpostlist = function bindpostlist(qobj1, qobj2) {
    function postobj(obj) {
        var posts = {};
        for (prop in obj) {
            //posts[prop] = obj[prop];
            if (prop.match(/^(id|created_time|type|message|from|shares|attachments|sharedposts)$/)) {
                posts[prop] = obj[prop];
            } else {
                var reactions = {};
                for (prop in obj.reactions) {
                    if (prop.match(/^(like|love|haha|wow|angry|sad|thankful)$/)) {
                        reactions[prop] = obj.reactions[prop];
                    }
                }
                posts.reactions = reactions;
                var comments = {};
                for (prop in obj.comments) {
                    if (prop.match(/^(summary)$/)) {
                        comments[prop] = obj.comments[prop];
                    }
                }
                posts.comments = comments;
            }
        }
        //delete posts.comments;
        //delete posts.reactions;
        /*
        var reactions = {};
        for (prop in obj.reactions) {
            if (prop == "list") {
                reactions[prop] = obj.reactions[prop];
                delete reactions.list;
            }
        }
        console.log(reactions)
        posts.reactions = reactions;
        var comments = {};
        for (prop in obj.comments) {
            if (prop == "context") {
                comments[prop] = obj.comments[prop];
                delete comments.context;
            }
        }
        posts.comments = comments;*/
        return posts;
    }
    var list = [];
    var l1 = qobj1.length;
    var l2 = qobj2.length;
    for (var i = 0; i < l1; i++) {
        var post = postobj(qobj1[i]);
        list.push(post);
    }
    for (var i = 0; i < l2; i++) {
        var find = false;
        for (var j = 0; j < l1;) {
            if (qobj1[j].id !== qobj2[i].id) {
                j++;
            } else {
                find = true;
                j = l1;
            }
            if (j === l1 && !find) {
                var post = postobj(qobj2[i]);
                list.push(post);
            }
        }
    }
    console.log("postlen: " + list.length);
    return list;
}

//bind two userlist
var binduserlist = function binduserlist(userlist1, userlist2) {
    var user = userlist1;
    var tuser = userlist2;
    var l1 = userlist1.length;
    var l2 = userlist2.length;
    for (var i = 0; i < l1; i++) {
        user[i].posts = {
            "A": userlist1[i].posts,
            "B": [],
        }
    }
    for (var i = 0; i < l2; i++) {
        var find = false;
        for (var j = 0; j < l1; j++) {
            if (tuser[i].id === user[j].id) {
                find = true;
                user[i].posts.B = tuser[i].posts;
                j = l1;
            }
        }
        if (!find) {
            tuser[i].posts = {
                "A": [],
                "B": userlist2[i].posts,
            }
            user.push(tuser[i]);
        }
    }
    //console.log(user);
    return user;
}

//insert activity state
var overlap = function overlap(userlist, type) {
    if (type === "like") {
        type = 1;
    }
    if (type === "love") {
        type = 2;
    }
    if (type === "haha") {
        type = 3;
    }
    if (type === "wow") {
        type = 4;
    }
    if (type === "sad") {
        type = 5;
    }
    if (type === "angry") {
        type = 6;
    }
    if (type === "other") {
        type = 7;
    }
    var len = userlist.length;
    for (var i = 0; i < len; i++) {
        var pal = userlist[i].posts.A.length;
        for (var j = 0; j < pal; j++) {
            if (type === "comment") {
                if (userlist[i].posts.A[j].commentcount != 0) {
                    userlist[i]["activity"] = {
                        "A": true,
                        "B": false,
                    }
                    j = pal;
                }
            } else if (type === "share") {
                if (userlist[i].post.A[j].share === true) {
                    userlist[i]["activity"] = {
                        "A": true,
                        "B": false,
                    }
                    j = pal;
                }
            } else {
                if (userlist[i].posts.A[j].like === type) {
                    userlist[i]["activity"] = {
                        "A": true,
                        "B": false,
                    }
                    j = pal;
                }
            }
        }
        var pbl = userlist[i].posts.B.length;
        for (var j = 0; j < pbl; j++) {
            if (userlist[i].activity) {
                if (type === "comment") {
                    if (userlist[i].posts.B[j].commentcount != 0) {
                        userlist[i]["activity"].B = true;
                        j = pbl;
                    }
                } else if (type === "share") {
                    if (userlist[i].post.A[j].share === true) {
                        userlist[i]["activity"].B = true;
                        j = pbl;
                    }
                } else {
                    if (userlist[i].posts.B[j].like === type) {
                        userlist[i]["activity"].B = true;
                        j = pbl;
                    }
                }
            } else {
                if (type === "comment") {
                    if (userlist[i].posts.B[j].commentcount != 0) {
                        userlist[i]["activity"] = {
                            "A": false,
                            "B": true,
                        }
                        j = pbl;
                    }
                } else if (type === "share") {
                    if (userlist[i].post.B[j].share === true) {
                        userlist[i]["activity"] = {
                            "A": false,
                            "B": true,
                        }
                        j = pbl;
                    }
                } else {
                    if (userlist[i].posts.B[j].like === type) {
                        userlist[i]["activity"] = {
                            "A": false,
                            "B": true,
                        }
                        j = pbl;
                    }
                }
            }
        }
    }
    console.log("ol length: " + len);
    return userlist;
};

//collect overlap results
var olresult = function olresult(ollist) {
    var result = [];
    var len = ollist.length;
    for (var i = 0; i < len; i++) {
        if (ollist[i].activity) {
            if ((ollist[i].activity.A === true) && (ollist[i].activity.B === true)) {
                result.push(ollist[i]);
            }
        }
    }
    console.log("fol length: " + result.length);
    return result;
}

var exports = module.exports = {};
exports.user_list = user_list;
exports.ualist = ualist;
//exports.post_type = post_type;
//exports.comment_count = comment_count;
exports.bindpostlist = bindpostlist;
exports.binduserlist = binduserlist;
exports.overlap = overlap;
exports.olresult = olresult;