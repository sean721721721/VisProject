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

// fetch

/**
 * //get cr
 */
function getCR() {
    let rawTemplate = document.getElementById('search-results').innerHTML;
    let template = Handlebars.compile(rawTemplate);

    let slideList = document.querySelector('.slider__list');
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
    let coreaction = document.getElementById('coreaction');
    let cocomment = document.getElementById('cocomment');
    let coshare = document.getElementById('coshare');

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
    let strco = 'co=' + coreaction.value;
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
            slideList.innerHTML += html;
        }).catch(function (error) {
            console.log('There has been a problem with your fetch operation: ' + error.message);
        });
}