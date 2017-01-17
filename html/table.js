var myRequest = new Request('table', {
    method: 'get'
});

fetch(myRequest)
    .then(function (response) {
        return response.json();
    })
    .then(function (json) {
        //console.log(json);
        var userlist = [];
        make_userlist(json, userlist);
        console.log(userlist);
        var table = make_table(json, userlist);
        render_table(table);
    })
    .catch(function (err) {});

//ok
function new_user(userlist, userid) {
    //console.log("fk");
    for (var n = 0, ul = userlist.length; n < ul; n++) {
        //console.log(userlist[n]);
        if (userid == userlist[n].id) {
            return false;
        }
    }
    return true;
}

//ok
function user_index(userlist, userid) {
    //console.log("sure")
    var index = 0;
    for (var n = 0, ul = userlist.length; n < ul; n++) {
        //console.log(n);
        if (userid == userlist[n].id) {
            index = n;
        }
    }
    return index;
}

//ok
function make_userlist(json, userlist) {
    for (var p = 0, pl = json.data.length; p < pl; p++) {
        var post = json.data[p];
        //console.log("post.comments "+p)
        for (var c = 0, cl = post.comments.context.length; c < cl; c++) {
            var comments = post.comments.context[c];
            //console.log("comments "+c);
            var userid = comments.from.id;
            //console.log(userid);
            //console.log(userlist);
            if (new_user(userlist, userid) == true) {
                //console.log("gg");
                var postlist = [];
                postlist.push(post.id);
                var newuser = {
                    // "name": user.name,
                    // "id": user.id,
                    // "post": post.id
                };
                newuser["name"] = comments.from.name;
                newuser["id"] = comments.from.id;
                newuser["post"] = postlist;
                //console.log(newuser);
                userlist.push(newuser);
            } else {
                var index = user_index(userlist, userid);
                //console.log(userlist[index]["post"]);
                userlist[index]["post"].push(post.id);
            }
        }
    }
    console.log("done");
}

function make_table(json, userlist) {
    var table = [];
    //table head
    var row0 = ["posts/users"];
    for (var p = 0, pl = json.data.length; p < pl; p++) {
        var post = json.data[p];
        row0.push(post.id);
    }
    table.push(row0);
    for (var n = 0, ul = userlist.length; n < ul; n++) {
        var row = [];
        var username = userlist[n].name;
        row.push(username);
        for (var p = 0, pl = json.data.length; p < pl; p++) {
            var post = json.data[p];
            var count = 0;
            for (var k = 0, al = userlist[n].post.length; k < al; k++) {
                var action = userlist[n].post[k];
                if (action == post.id) {
                    count += 1;
                }
            }
            row.push(count);
        }
        table.push(row);
    }
    console.log(table);
    return table;
}

function render_table(table) {
    var tbody = document.getElementById("table");
    //console.log("do");
    for (var i = 0, il = table.length; i < il; i++) {
        var row = tbody.insertRow(i);
        console.log("i");
        for (var j = 0, jl = table[i].length; j < jl; j++) {
            var cell = row.insertCell(j);
            cell.innerHTML = table[i][j];
        }
    }
    console.log("gg");
}