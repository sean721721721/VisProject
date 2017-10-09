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
// fetch

/**
 * //get cr
 * @param {string} type - co type
 */
function getCR(type) {
    // compile template
    let rawTemplate = document.getElementById('search-results').innerHTML;
    let template = Handlebars.compile(rawTemplate);

    // initslidelist and add loading effect
    let slideList = document.querySelector('.slider__list');
    let initslideList = slideList.innerHTML;
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
            let html = template(json);
            // console.log(html);
            slideList.innerHTML = initslideList;
            slideList.innerHTML += html;
        }).catch(function (error) {
            console.log('There has been a problem with your fetch operation: ' + error.message);
        });
}