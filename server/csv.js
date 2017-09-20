/* eslint-disable */
var fs = require('fs');
var readFiles = require('./readfile.js');
var ul = require('./datalist.js');

var csv1 = function csv1(userlist) {
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
            if (postlist != []) {
                var len = postlist.length;
                for (var k = 0; k < len; k++) {
                    var index = k * 3 + 2;
                    //console.log(postlist.length)
                    if (posts[j].id == postlist[k]) {
                        findpost = true;
                        user[index] = posts[j].like;
                        user[index + 1] = posts[j].commentcount;
                        user[index + 2] = posts[j].share;
                    } else {
                        user[index] = null;
                        user[index + 1] = null;
                        user[index + 2] = null;
                    }
                }
            }
            if (!findpost) {
                //console.log("no post!")
                user.push(posts[j].like);
                user.push(posts[j].commentcount);
                user.push(posts[j].share);
                postlist.push(posts[j].id);
                //user.push(posts[j].like);
            }
        }
        //console.log(user)
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
        string += ",";
        string += postlist[a];
    }
    string += "\n";
    string += "user-id,user-name";
    for (var a = 0; a < postlist.length; a++) {
        //console.log(postlist[a])
        string += ",like";
        string += ",comment";
        string += ",share";
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
        var len = postlist.length * 3;
        for (var y = 0; y < len; y++) {
            string += ",";
            if (csv[x][y + 2] !== null) {
                var num = csv[x][y + 2];
                string += num;
            } else {
                string += "";
            }
            //string += ",";
            //console.log(csv[x][y])
        }
        //console.log(csv[x]);
        string += "\n";
    }
    //console.log(csv[300].length)
    return string;
};

var csv2 = function csv2(files) {
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
                        //console.log(i + " " + j + " " + k)
                        var sublength = subcomment.length;
                        for (var l = 0; l < sublength; l++) {
                            string += ",";
                            var id = subcomment[l].from.id
                            string += id.toString();
                            //console.log(id.toString())
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
};

var clearString = function clearString(s) {
    //var pattern = new RegExp("[`':;',‘；：”“'。，、？]") 
    var pattern1 = new RegExp("[,]")
    var pattern2 = new RegExp("[\r\n]")
    var rs1 = "";
    var rs2 = "";
    var l1 = s.length;
    for (var i = 0; i < l1; i++) {
        rs1 = rs1 + s.substr(i, 1).replace(pattern1, '，');
    }
    var l2 = rs1.length;
    for (var i = 0; i < l2; i++) {
        rs2 = rs2 + rs1.substr(i, 1).replace(pattern2, ' ');
    }
    return rs2;
};
//makecsv

var folders = ['test']; /*, '2011', '2012'];*/
folders.forEach(folder => {
    var root = "/windows/D/Crawler_data/greenpeace";
    //console.log(typeof(root + '/' + folder))
    readFiles.readFiles(root + '/' + folder)
        .then(function (files) {
            console.log("loaded ", files.length)
            //fs.writeFileSync(root + "_" + folder + ".json", JSON.stringify(user_list(files)))
            fs.writeFile(root + "_" + folder + "_form1.csv", csv1(ul.user_list(files)), err => {
                if (err) throw err;
                console.log("save" + folder + "_form1");
            })
            fs.writeFile(root + "_" + folder + "_form2.csv", csv2(files), err => {
                if (err) throw err;
                console.log("save" + folder + "_form2");
            })
            var list = ul.user_list(files)
            //console.log(list[0])

            files.forEach((item, index) => {
                console.log("item", index, "posts: ", item.contents.data.length);
            });
            return ul.user_list(files);
        })
        .catch(error => {
            console.log(error);
        });
});

var exports = module.exports = {};
exports.csv1 = csv1;
exports.csv2 = csv2;