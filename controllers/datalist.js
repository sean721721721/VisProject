/* eslint-disable */
var jb = require('./text.js');
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
    }
    console.log("ul len: " + userlist.length)
    comment_count(files, userlist);
    share_count(files, userlist);
    //console.log("people "+people)
    return userlist;
}

//for dbquery
var ualist = function ualist(files) {
    var userlist = [];
    var data, reaction, user, post, reactionlength;
    var filelength = files.length;
    console.log("file length: " + filelength)
    files = jb.cut(files, function () {
        // list.push(data);
        //console.log(data.id)
        var find = false;
        for (var i = 0; i < filelength; i++) {
            //console.log(userlist.length)
            data = files[i];
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
                        post["clist"] = [];
                        post["word"] = data.word;
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
        comment_countdb(files, userlist);
        share_db(files, userlist);
        console.log("userlist length: " + userlist.length)
        //console.log("people "+people)
    });
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
                                "posts": [],
                            }
                            user.posts.push(post);
                            userlist.push(user);
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
    for (var i = 0; i < filelength; i++) {
        data = files[i];
        if (data.comments.context !== undefined) {
            commentlength = data.comments.context.length;
            if (commentlength !== 0) {
                //console.log(userlist.length)
                for (var k = 0; k < commentlength; k++) {
                    comment = data.comments.context[k];
                    commentcount(data, comment, userlist);
                    var subcommentlen = comment.length;
                    // for subcomment
                    for (var x = 0; x < subcommentlen; x++) {
                        var subcomment = comment[x];
                        commentcount(data, subcomment, userlist);
                    }
                }
            }
        }
    }
}

// commentcount and adjust userlist object
function commentcount(data, comment, userlist) {
    let findid = false;
    var listlength = userlist.length;
    for (var a = 0; a < listlength; a++) {
        if (comment.from.id == userlist[a].id) {
            findid = true;
            //console.log("find")
            var length = userlist[a].posts.length;
            //console.log(length)
            let findpost = false;
            for (var b = 0; b < length; b++) {
                if (data.id == userlist[a].posts[b].id) {
                    findpost = true;
                    //console.log("find")
                    userlist[a].posts[b].commentcount++;
                    userlist[a].posts[b].clist.push(comment);
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
                    "clist": [comment],
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
            "clist": [comment],
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

//share check for csv
function share_count(files, userlist) {
    var data, sharedpost, user, post, sharelength;
    var filelength = files.length;
    var listlength = userlist.length;
    var findid = false;
    var findpost = false;
    for (var i = 0; i < filelength; i++) {
        var datalength = files[i].contents.data.length;
        for (var j = 0; j < datalength; j++) {
            data = files[i].contents.data[j];
            if (data.sharedposts) {
                sharelength = data.sharedposts.data.length;
                if (sharelength !== 0) {
                    //console.log(userlist.length)
                    for (var k = 0; k < sharelength; k++) {
                        sharedpost = data.sharedposts.data[k];
                        findid = false;
                        for (var a = 0; a < listlength; a++) {
                            if (sharedpost.from.id == userlist[a].id) {
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
        if (data.sharedposts) {
            sharelength = data.sharedposts.data.length;
            if (sharelength !== 0) {
                //console.log(userlist.length)
                for (var k = 0; k < sharelength; k++) {
                    sharedpost = data.sharedposts.data[k];
                    findid = false;
                    for (var a = 0; a < listlength; a++) {
                        if (sharedpost.from.id == userlist[a].id) {
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
            if (prop.match(/^(id|created_time|type|message|from|shares|attachments|sharedposts|word)$/)) {
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
                    if (prop.match(/^(context|created_time|summary)$/)) {
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
    var pagea = [];
    var pageb = [];
    for (var i = 0; i < l1; i++) {
        var post = postobj(qobj1[i]);
        pagea.push(post);
    }
    list.push(pagea);
    /*pagea = jb.cut(pagea, function () {
        // console.log(pagea);
    });*/
    // for return single page query faster
    if (qobj1 !== qobj2) {
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
                    pageb.push(post);
                }
            }
        }
        list.push(pageb);
        /*pageb = jb.cut(pageb, function () {
            // console.log(pageb);
        });*/
    } else {
        list.push(pagea);
    }
    console.log("postlen: " + (list[0].length + list[1].length));
    return list;
}

//bind two userlist
var binduserlist = function binduserlist(userlist1, userlist2) {
    var user = userlist1;
    var tuser = userlist2;
    var result = [];
    var l1 = userlist1.length;
    var l2 = userlist2.length;
    // for return single page query faster
    if (userlist1 !== userlist2) {
        for (var i = 0; i < l1; i++) {
            user[i].posts = {
                "A": userlist1[i].posts,
                "B": [],
            }
            result.push(user[i]);
        }
        for (var i = 0; i < l2; i++) {
            var find = false;
            for (var j = 0; j < l1; j++) {
                if (tuser[i].id === result[j].id) {
                    find = true;
                    result[j].posts.B = tuser[i].posts;
                    j = l1;
                }
            }
            if (!find) {
                tuser[i].posts = {
                    "A": [],
                    "B": userlist2[i].posts,
                }
                result.push(tuser[i]);
            }
        }
    } else {
        for (var i = 0; i < l1; i++) {
            user[i].posts = {
                "A": userlist1[i].posts,
                "B": userlist1[i].posts,
            }
            result.push(user[i]);
        }
    }
    console.log("user length: " + result.length);
    return result;
}

//insert activity state
var overlap = function overlap(userlist, type) {
    if (type === "all") {
        var len = userlist.length;
        for (var i = 0; i < len; i++) {
            userlist[i]["activity"] = {
                "A": true,
                "B": true,
            }
        }
    } else {
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
                    if (userlist[i].posts.A[j].share === true) {
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
                        if (userlist[i].posts.A[j].share === true) {
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
                        if (userlist[i].posts.B[j].share === true) {
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
//sort overlap degree
var sortdegree = function sortdegree(olrlist) {
    // console.log(olrlist);
    function getdeg(item) {
        var alen = item.posts.A.length;
        var blen = item.posts.B.length;
        var deg = alen + blen;
        return deg;
    }

    function pushlist(obj, item) {
        // console.log(item);
        var degA = item[0].posts.A.length;
        var degB = item[0].posts.B.length;
        var temp = [item];
        if (degA === 0 || degB === 0) { // if item's deg eqaul 0
            if (degA === 0) {
                obj.O.push([]);
                obj.A.push([]);
                obj.B.push(temp);
            } else {
                obj.O.push([]);
                obj.A.push(temp);
                obj.B.push([]);
            }
        } else {
            obj.O.push(temp);
            obj.A.push([]);
            obj.B.push([]);
        }
    }

    function sort(obj, item, index) {
        function makelist(list, post, ipost) {
            var degi = post.length;
            for (var a = 0; a < degi;) { // compare list[i][0] and item 's postsA
                for (var b = 0; b < deg; b++) {
                    if (post[a].id === ipost[b].id) {
                        a++;
                        b = deg;
                    } else {
                        if (b === deg - 1) {
                            a = degi + 1;
                        }
                    }
                }
            }
            if (a === degi) { // if eqaul
                if (list[i].length > 0) {
                    list[i].push(item);
                    //console.log(list[i].length);
                } else {
                    var temp = [list[i]];
                    temp.push(item);
                    list[i] = temp;
                }
                eqdeg = true;
            } else { // if not
                list.push([item]);
            }
        }
        var list = obj.O[index];
        var deg = item.posts.A.length;
        var degB = item.posts.B.length;
        var temp = [];
        var eqdeg = false;
        if (deg === 0 || degB === 0) { // if item's deg eqaul 0
            if (deg === 0) {
                list = obj.B[index];
            } else {
                list = obj.A[index];
            }
        }
        //console.log(list);
        var l = list.length;
        /*if (l > 0) { //if list is not empty
            for (var i = 0; i < l; i++) { // find whitch list[i]'s deg eqaul item's deg
                var degi = list[i][0].posts.A.length;
                if (deg === degi) { // if find
                    var post = list[i][0].posts.A;
                    var ipost = item.posts.A;
                    if (deg === 0) { // if item's deg eqaul 0
                        var deg = degB;
                        degi = list[i][0].posts.B.length;
                        post = list[i][0].posts.B;
                        ipost = item.posts.B;
                    }
                    for (var a = 0; a < degi;) { // compare list[i][0] and item 's postsA
                        for (var b = 0; b < deg; b++) {
                            if (post[a].id === ipost[b].id) {
                                a++;
                                b = deg;
                            } else {
                                if (b === deg - 1) {
                                    a = degi + 1;
                                }
                            }
                        }
                    }
                    if (a === degi) { // if eqaul
                        if (list[i].length > 0) {
                            list[i].push(item);
                            //console.log(list[i].length);
                        } else {
                            var temp = [list[i]];
                            temp.push(item);
                            list[i] = temp;
                        }
                        eqdeg = true;
                    } else { // if not
                        list.push([item]);
                    }
                    i = l;
                } else if (deg > degi) { // push item in list to creat new list[deg]
                    if (!eqdeg && i === (l - 1)) {
                        list.push([item]);
                    }
                } else { // insert item in specific list[i]
                    list.splice(i, 0, [item]);
                    i = l;
                }
            }
        } else { //if list is empty
            list.push([item]);
        }*/
        if (l > 0) { //if list is not empty
            for (var i = 0; i < l; i++) { // find whitch list[i]'s deg eqaul item's deg
                var degi = list[i][0].posts.A.length;
                var post = list[i][0].posts.A;
                var ipost = item.posts.A;
                if (degi === 0) {
                    degi = list[i][0].posts.B.length;
                    post = list[i][0].posts.B;
                    ipost = item.posts.B;
                }
                if (deg === degi) { // if find
                    makelist(list, post, ipost);
                    i = l;
                } else if (deg > degi) { // push item in list to creat new list[deg]
                    if (!eqdeg && i === (l - 1)) {
                        list.push([item]);
                    }
                } else { // insert item in new list[i]
                    list.splice(i, 0, [item]);
                    i = l;
                }
            }
        } else { //if list is empty
            list.push([item]);
        }
    }

    function makeaddr(sortobj) {
        function addr(data) {
            var il = data.length
            for (var i = 0; i < il; i++) {
                var jl = data[i].length;
                for (var j = 0; j < jl; j++) {
                    var kl = data[i][j].length;
                    for (var k = 0; k < kl; k++) {
                        data[i][j][k].addr = i + ',' + j + ',' + k;
                    }
                }
            }
        }
        addr(sortobj.A);
        addr(sortobj.B);
        addr(sortobj.O);
        return sortobj;
    }
    //var sortlist = [];
    var sortobj = {};
    sortobj.A = [];
    sortobj.B = [];
    sortobj.O = [];
    var degree = [];
    var len = olrlist.length;
    for (var i = 0; i < len; i++) {
        var deg = getdeg(olrlist[i]);
        var finddeg = false;
        var l = degree.length;
        if (l > 0) {
            for (var d = 0; d < l; d++) {
                if (degree[d] === deg) {
                    finddeg = true;
                    //sortlist[d].push(olrlist[i]);
                    sort(sortobj, olrlist[i], d);
                    d = l;
                } else if (degree[d] < deg) {
                    // degree
                    if (!finddeg && d === l - 1) {
                        degree.push(deg);
                        pushlist(sortobj, [olrlist[i]]);
                    }
                } else {
                    //console.log(d + " : " + l + " | " + degree[d] + ">" + deg);
                    degree.splice(d, 0, deg);
                    //console.log(degree);
                    var list = [olrlist[i]];
                    //console.log(list);
                    var degA = list[0].posts.A.length;
                    var degB = list[0].posts.B.length;
                    if (degA === 0 || degB === 0) { // if item's deg eqaul 0
                        if (deg === 0) {
                            sortobj.O.splice(d, 0, []);
                            sortobj.A.splice(d, 0, []);
                            sortobj.B.splice(d, 0, [list]);
                        } else {
                            sortobj.O.splice(d, 0, []);
                            sortobj.A.splice(d, 0, [list]);
                            sortobj.B.splice(d, 0, []);
                        }
                    } else {
                        sortobj.O.splice(d, 0, [list]);
                        sortobj.A.splice(d, 0, []);
                        sortobj.B.splice(d, 0, []);
                    }
                    //console.log(getdeg(sortlist[d][0])+" "+deg);
                    d = l;
                }
            }
        } else {
            degree.push(deg);
            pushlist(sortobj, [olrlist[i]]);
            //console.log(degree);
        }
        //console.log(degree);
    }
    //console.log(degree.length === sortlist.length);
    makeaddr(sortobj);
    return sortobj;
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
exports.sortdegree = sortdegree;