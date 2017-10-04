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
    let rawTemplate = document.getElementById('template').innerHTML;
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

    let para = {
        'minlike': minlike.value,
        'maxlike': maxlike.value,
        'mincomment': mincomment.value,
        'maxcomment': maxcomment.value,
        'posttype': posttype.value,
        'page1': pagename1.value,
        'time1': date1.value,
        'time2': date2.value,
        'page2': pagename2.value,
        'time3': date3.value,
        'time4': date4.value,
        'co': coreaction.value,
        // 'cocomment': cocomment.value,
        // 'coshare': coshare.value,
    };

    var form = new FormData(document.getElementById('para'));
    var url = 'http://140.119.164.22:3000/query?minlike=0&maxlike=&mincomment=0&maxcomment=&posttype=&page1=%E5%AE%A2%E5%8F%B0&page2=%E5%8B%9E%E5%8B%95%E4%B9%8B%E7%8E%8B&time1=2017-03-27&time2=2017-04-27&time3=2017-03-27&time4=2017-04-27&co=Co%20reaction';
    let myRequest = new Request(url, {
        method: 'get',
    });
    fetch(myRequest)
        .then(function (response) {
            console.log(response);
            return response.json();
        })
        .then(function (json) {
            let html = template(json[0]);
            slideList.innerHTML += html;
        });
}