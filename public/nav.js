// jquery ajax example
/*
$(function () {
    let source = $('#search-results').html();
    let dataTemplate = Handlebars.compile(source);
    $results = $('#results');

    $('#search').on('keyup', function (e) {
        if (e.keyCode === 13) {
            let parameters = {
                search: $(this).val(),
            };
            $.get('/searching', parameters, function (data) {
                if (data instanceof Array) {
                    $results.html(dataTemplate({
                        resultsArray: data,
                    }));
                } else {
                    $results.html(data);
                };
            });
        };
    });
});*/
/*
let partial='<script id="search-results" type="text/x-handlebars-template">'+
    '<h1>{{{query}}}結果：</h1>'+
    '<div>'+
        '<table class="query">'+
            '<thead>'+
                '<tr>'+
                    '<th>Page name</th>'+
                    '<th>from</th>'+
                    '<th>to</th>'+
                    '<th>貼文數</th>'+
                    '<th>使用者數</th>'+
                '</tr>'+
            '</thead>'+
            '<tbody>'+
                '<tr>'+
                    '<th>{{query.page1}}</th>'+
                    '<th>{{query.time1}}</th>'+
                    '<th>{{query.time2}}</th>'+
                    '<th>{{summary.[0].[0]}}</th>'+
                    '<th>{{summary.[1].[0]}}</th>'+
                '</tr>'+
                '<tr>'+
                    '<th>{{query.page2}}</th>'+
                    '<th>{{query.time3}}</th>'+
                    '<th>{{query.time4}}</th>'+
                    '<th>{{summary.[0].[1]}}</th>'+
                    '<th>{{summary.[1].[1]}}</th>'+
                '</tr>'+
            '</tbody>'+
        '</table>'+
    '</div>'+
    '<div>'+
        '<table class="summary">'+
            '<tbody>'+
                '<tr>'+
                    '<th>所有貼文數:</th>'+
                    '<th>{{data.[0].length}}</th>'+
                '</tr>'+
                '<tr>'+
                    '<th>所有使用者數:</th>'+
                    '<th>{{summary.[1].[2]}}</th>'+
                '</tr>'+
                '<tr>'+
                    '<th>{{query.co}}使用者數:</th>'+
                    '<th>{{data.[1].length}}</th>'+
                '</tr>'+
            '</tbody>'+
        '</table>'+
    '</div>'+
    '<div>'+
        '<table class=“cooltable”>'+
            '<thead>'+
                '<tr>'+
                    '<th>User</th>'+
                    '<th>Activity in query1</th>'+
                    '<th>Activity in query2</th>'+
                '</tr>'+
            '</thead>'+
            '{{#each data.[1]}}'+
            '<tbody>'+
                '<tr>'+
                    '<td>'+
                        '<ul>{{{toURL id}}}</ul>'+
                        '<ul>username: {{name}}</ul>'+
                    '</td>'+
                    '<td>'+
                        '<ul>'+
                            '<li>count: {{{count posts.A}}}</li>'+
                            '{{#each posts.A}}'+
                            '<li>{{{toURL id}}}, like: {{like}}, commentcount: {{commentcount}}, share: {{share}}</li>'+
                            '{{/each}}'+
                        '</ul>'+
                    '</td>'+
                    '<td>'+
                        '<ul>'+
                            '<li>count: {{{count posts.B}}}</li>'+
                            '{{#each posts.B}}'+
                            '<li>{{{toURL id}}}, like: {{like}}, commentcount: {{commentcount}}, share: {{share}}</li>'+
                            '{{/each}}'+
                        '</ul>'+
                    '</td>'+
                '</tr>'+
            '</tbody>'+
            '{{/each}}'+
        '</table>'+
    '</div>'+
'</script>';
Handlebars.registerPartial(partial);*/

// for import search.html
let link = document.querySelector('link[rel="import"]');

// Clone the <template> in the import.
let temp = link.import.querySelector('template');
let clone = document.importNode(temp.content, true);
let body = document.querySelector('#template');
// console.log(body);
body.appendChild(clone);

let submissions = [];
// compile template
// let rawTemplate = document.getElementById('search-results').innerHTML;
let rawTemplate = document.getElementById('search-vis').innerHTML;
let template = Handlebars.compile(rawTemplate);

// initslidelist and add loading effect
let slideList = document.querySelector('.slider__list');
let initslideList = slideList.innerHTML;
// fetch

/**
 * //get cr
 * @param {string} type - co type
 */
function getCR(type) {
    let loading = '<div class="wrapperloading"><div class="loading up"></div><div class="loading down"></div></div>';
    slideList.innerHTML += loading;

    let minlike = document.getElementById('minlike');
    let maxlike = document.getElementById('maxlike');
    let mincomment = document.getElementById('mincomment');
    let maxcomment = document.getElementById('maxcomment');
    let posttype = document.getElementById('posttype');
    let pagename1 = document.getElementById('pagename1');
    let date1 = document.getElementById('date1');
    let date2 = document.getElementById('date2');
    let pagename2 = document.getElementById('pagename2');
    let date3 = document.getElementById('date3');
    let date4 = document.getElementById('date4');
    // let coreaction = document.getElementById('coreaction');
    let cocomment = document.getElementById('cocomment');
    let coshare = document.getElementById('coshare');

    // make url string for request data
    let strminlike = 'minlike=' + minlike.value;
    let strmaxlike = 'maxlike=' + maxlike.value;
    let strmincomment = 'mincomment=' + mincomment.value;
    let strmaxcomment = 'maxcomment=' + maxcomment.value;
    let strposttype = 'posttype=' + posttype.value;
    let strpage1 = 'page1=' + pagename1.value;
    let strtime1 = 'time1=' + date1.value;
    let strtime2 = 'time2=' + date2.value;
    let strpage2 = 'page2=' + pagename2.value;
    let strtime3 = 'time3=' + date3.value;
    let strtime4 = 'time4=' + date4.value;
    let strco = 'co=' + type;
    let str = 'http://140.119.164.22:3000/searching?' + strminlike + '&' + strmaxlike + '&' + strmincomment + '&' + strmaxcomment + '&' + strposttype + '&' +
        strpage1 + '&' + strpage2 + '&' + strtime1 + '&' + strtime2 + '&' + strtime3 + '&' + strtime4 + '&' + strco;

    // let form = new FormData(document.getElementById('para'));
    // let url ='/searching';
    let url = encodeURI(str);
    console.log(url);
    let myRequest = new Request(url, {
        method: 'get',
        query: para,
    });
    // console.log(myRequest);
    if (document.getElementById('auth').text === 'Logout') {
        fetch(myRequest)
            .then(function (response) {
                if (response.ok) {
                    // console.log(response);
                    return response.json();
                }
                throw new Error('Network response was not ok.');
            })
            .then(function (json) {
                console.log(json);
                let index = submissions.length;
                json.query.co = 'Submit ' + (index + 1) + ' ';
                let html = template(json);
                // console.log(html);
                slideList.innerHTML = initslideList;
                // console.log(csv1(json.data[1]));
                slideList.innerHTML += html;
                let csv = document.querySelector('div#csv');
                csv.innerHTML += download(json);
                submissions.push(json);
                let btn = document.createElement('button');
                btn.innerHTML = '<button name="submit' + (index + 1)+'"' + 'onclick="getsubmission(' + index + ')">Submit ' + (index + 1) + '</button>';
                let submission = document.getElementById('Submit');
                submission.appendChild(btn);
                visMain(json);
            }).catch(function (error) {
                console.log('There has been a problem with your fetch operation: ' + error.message);
            });
    } else {
        window.alert('Access Deny!!!');
        slideList.innerHTML = initslideList;
    }
}

function getsubmission(index) {
    let json = submissions[index];
    let html = template(json);
    // console.log(html);
    slideList.innerHTML = initslideList;
    // console.log(csv1(json.data[1]));
    slideList.innerHTML += html;
    visMain(json);
}

/**
 * // make download url
 * @param {object} data - data
 * @return {string} - html
 */
function download(data) {
    let html = '<div id="csv">';
    let csvstr1 = csv1(data.data[1]);
    let blob1 = new Blob([csvstr1], {
        type: 'text/csv',
    });
    let url1 = URL.createObjectURL(blob1);
    if (data.query.page1 === data.query.page2) {
        html += '<h1 id="csv">csv1<a download = "' + data.query.page1 + '_' + data.query.time1 + '_' + data.query.time2 + '_1.csv" href = "' + url1 + '">' + '<img src="img/download.jpg" class="img-circle" style="width:32px;height:32px">' + '</a></h1>';
    } else {
        html += '<h1 id="csv">csv1<a download = "' + data.query.page1 + '_' + data.query.page2 + '_' + data.query.time1 + '_' + data.query.time2 + '_1.csv" href = "' + url1 + '">' + '<img src="img/download.jpg" class="img-circle" style="width:32px;height:32px">' + '</a></h1>';
    }
    let csvstr2 = csv2(data.data[0]);
    let blob2 = new Blob([csvstr2], {
        type: 'text/csv',
    });
    let url2 = URL.createObjectURL(blob2);
    if (data.query.page1 === data.query.page2) {
        html += '<h1 id="csv">csv2<a download = "' + data.query.page1 + '_' + data.query.time1 + '_' + data.query.time2 + '_2.csv" href = "' + url2 + '">' + '<img src="img/download.jpg" class="img-circle" style="width:32px;height:32px">' + '</a></h1>';
    } else {
        html += '<h1 id="csv">csv2<a download = "' + data.query.page1 + '_' + data.query.page2 + '_' + data.query.time1 + '_' + data.query.time2 + '_2.csv" href = "' + url2 + '">' + '<img src="img/download.jpg" class="img-circle" style="width:32px;height:32px">' + '</a></h1>';
    }
    html += '</div>';
    // console.log(html);
    return html;
}

/**
 * // get csv1 string
 * @param {object} userlist - data
 * @return {string}
 */
function csv1(userlist) {
    let string = ',';
    let csv = [];
    let user = [];
    let postlist = [];
    let findpost = false;
    let length = userlist.length;
    for (let i = 0; i < length; i++) {
        // console.log(userlist[i].id)
        user = [];
        user.push(userlist[i].id);
        user.push(userlist[i].name);
        // console.log(user)
        let posts = userlist[i].posts.A;
        // console.log(postlist.length)
        for (let j = 0; j < posts.length; j++) {
            findpost = false;
            if (postlist != []) {
                let len = postlist.length;
                for (let k = 0; k < len; k++) {
                    let index = k * 3 + 2;
                    // console.log(postlist.length)
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
                // console.log("no post!")
                user.push(posts[j].like);
                user.push(posts[j].commentcount);
                user.push(posts[j].share);
                postlist.push(posts[j].id);
                // user.push(posts[j].like);
            }
        }
        // console.log(user)
        csv.push(user);
    }
    // console.log("postlist.length=" + postlist.length)
    for (let a = 0; a < postlist.length; a++) {
        // console.log(postlist[a])
        string += ',';
        string += postlist[a];
        // console.log(typeof(postlist[i]));
        string += ',';
        string += postlist[a];
        string += ',';
        string += postlist[a];
    }
    string += '\n';
    string += 'user-id,user-name';
    for (let a = 0; a < postlist.length; a++) {
        // console.log(postlist[a])
        string += ',like';
        string += ',comment';
        string += ',share';
    }
    // console.log(string)
    string += '\n';
    let people = csv.length;
    for (let x = 0; x < people; x++) {
        // console.log(csv[x][0])
        let id = csv[x][0];
        string += id.toString();
        string += ',';
        string += csv[x][1];
        let len = postlist.length * 3;
        for (let y = 0; y < len; y += 3) {
            string += ',';
            if (csv[x][y + 2] !== undefined && csv[x][y + 2] !== null) {
                let num = csv[x][y + 2];
                string += num;
            } else {
                string += '0';
            }
            string += ',';
            if (csv[x][y + 3] !== undefined && csv[x][y + 3] !== null) {
                let num = csv[x][y + 2];
                string += num;
            } else {
                string += '0';
            }
            string += ',';
            if (csv[x][y + 4] !== undefined && csv[x][y + 4] !== null) {
                let num = csv[x][y + 4];
                string += num;
            } else {
                string += 'false';
            }
            // string += ",";
            // console.log(csv[x][y])
        }
        // console.log(csv[x]);
        string += '\n';
    }
    // console.log(csv[300].length)
    return string;
};

/**
 * // get csv2 string
 * @param {object} files - data
 * @return {string}
 */
function csv2(files) {
    let string = 'post-id,post-message/attachment,user-id,comment-message,user-id,subcomment-message\n';
    /**
     * csv string
     * @param {array} files - page
     * @param {string} string - csv
     * @return {string}
     */
    function page2csv(files, string) {
        let data;
        let comment;
        let subcomment;
        let commentlength;
        let filelength = files.length;
        for (let i = 0; i < filelength; i++) {
            // let datalength = files[i].contents.data.length;
            // console.log(userlist.length)
            // for (let j = 0; j < datalength; j++) {
            data = files[i]; // .contents.data[j];
            // console.log(data.id)
            let id = data.id;
            string += id.toString();
            string += ',';
            string += '"';
            if (data.message !== undefined) {
                string += clearString(data.message);
            } else if (data.attachments.description !== undefined) {
                string += 'attachment description : ';
                string += clearString(data.attachments.description);
            } else {
                string += 'attachment title : ';
                string += clearString(data.attachments.title);
            }
            string += '"';
            commentlength = data.comments.context.length;
            if (commentlength !== 0) {
                // console.log(userlist.length)
                for (let k = 0; k < commentlength; k++) {
                    comment = data.comments.context[k];
                    string += ',';
                    let id = comment.from.id;
                    string += id.toString();
                    string += ',';
                    string += '"';
                    string += clearString(comment.message);
                    string += '"';
                    string += ',';
                    subcomment = comment.comments;
                    if (subcomment !== undefined) {
                        // console.log(i + " " + j + " " + k)
                        let sublength = subcomment.length;
                        for (let l = 0; l < sublength; l++) {
                            string += ',';
                            let id = subcomment[l].from.id;
                            string += id.toString();
                            // console.log(id.toString())
                            string += ',';
                            string += '"';
                            string += clearString(subcomment[l].message);
                            string += '"';
                            string += '\n';
                            if (l !== sublength - 1) {
                                string += '\n,,,';
                            }
                        }
                    } else {
                        string += '\n';
                    }
                    if (k != commentlength - 1) {
                        string += '\n,';
                    }
                }
            }
            string += '\n';
            // }
        }
        return string;
    }
    for (let i = 0; i < files.lengthl; i++) {
        let page = files[i];
        string = page2csv(page, string);
    }
    return string;
};

/**
 * // clear string
 * @param {string} s - string
 * @return {string}
 */
function clearString(s) {
    // var pattern = new RegExp("[`':;',‘；：”“'。，、？]");
    let pattern1 = new RegExp('[,]');
    let pattern2 = new RegExp('[\r\n]');
    let rs1 = '';
    let rs2 = '';
    let l1 = s.length;
    for (let i = 0; i < l1; i++) {
        rs1 = rs1 + s.substr(i, 1).replace(pattern1, '，');
    }
    let l2 = rs1.length;
    for (let i = 0; i < l2; i++) {
        rs2 = rs2 + rs1.substr(i, 1).replace(pattern2, ' ');
    }
    return rs2;
};

/**
 * openTab
 * @param {event} evt -
 * @param {string} tabName -
 */
function openTab(evt, tabName) {
    let i;
    let tabcontent;
    let tablinks;
    tabcontent = document.getElementsByClassName('tabcontent');
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = 'none';
    }
    tablinks = document.getElementsByClassName('tablinks');
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(' active', '');
    }
    document.getElementById(tabName).style.display = 'block';
    evt.currentTarget.className += ' active';
}

// Get the element with id="defaultOpen" and click on it
// document.getElementById('defaultOpen').click();