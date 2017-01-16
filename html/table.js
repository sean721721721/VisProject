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
        console.log(userlist.length);
        make_table(json, userlist);
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
    var table = document.getElementById("table");
    console.log("do");
    table.innerHTML = "";
    table.innerHTML += "<tr id = table head>" +
        "<th>" + " " + "</th>";
    for (var i = 0, l = userlist.length; i < l; i++) {
        var user = userlist[i];
        // Create an empty <tr> element and add it to the 1st position of the table
        var row = table.insertRow(i);
        // Insert new cells (<td> elements) at the position of the "new" <tr> element
        var cell = row.insertCell(j);
        // Add some text to the new cells
        cell.innerHTML = "NEW CELL";
        //console.log(user.name);
        table.innerHTML += "<th>" + user.name + "</th>";
    }

    table.innerHTML += "</tr>";
    //console.log(table.innerHTML);
}