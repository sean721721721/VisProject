/**
 * visualization main
 * @param {object} data - inputdata
 */
function visMain(data) {
    // console.log(data);
    // let userlist = activitymatrix(data);
    // console.log(userlist);
    /* for (let i = 0; i < data[1].length; i++) {
        if (!data[1][i].posts) {
            console.log(i);
        }
    }

    let epsilon = getparam('epsilon');
    let perplexity = getparam('perplexity');
    let dim = 2;
    let iteration = getparam('iteration');
    let normalized = document.getElementsByName('normalize');*/
    // let normal = normalized[0].checked;
    // console.log(normalized[0].checked);
    /* let opt = {};
    opt.epsilon = epsilon; // epsilon is learning rate (10 = default)
    opt.perplexity = perplexity; // roughly how many neighbors each point influences (30 = default)
    opt.dim = dim; // dimensionality of the embedding (2 = default)

    let tsne1 = new tsnejs.tSNE(opt); // create a tSNE instance
    let tsne2 = new tsnejs.tSNE(opt);*/
    // initialize data. Here we have 3 points and some example pairwise dissimilarities
    /* let inputs = [];
    inputs.push(userdist(userlist, false));*/
    // inputs.push(propertydist(fbdata, normal));
    /* tsne1.initDataDist(inputs[0]);
    tsne2.initDataDist(inputs[0]);
    let init = false;
    let width = document.querySelector('div#over').offsetWidth;
    let btn = document.querySelector('input[id="submit"]');
    btn.addEventListener('click', function (e) {
        e.preventDefault();
        update(tsne1, tsne2, data[1], width, init);
        init = true;
    });
    let ubtn = document.querySelector('input[id="update"]');
    ubtn.addEventListener('click', function (e) {
        e.preventDefault();
        console.log('k=' + iteration);
        if (init) {
            for (let k = 0; k < iteration; k++) {
                // setInterval(function () {
                tsne1.step(); // every time you call this, solution gets better
                tsne2.step(); // every time you call this, solution gets better
                // }, 1000);
            }
            update(tsne1, tsne2, data[1], width, init);
        }
    });*/
    overlapvis(data);
    overview(data);
    // data manipulate
    let pd = pagedata(data);
    pageview(data, pd);
    // console.log(data);
}


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
/*
let myRequest = new Request('/searching', {
    method: 'get',
});

let rawTemplate = document.getElementById('template').innerHTML;
let template = Handlebars.compile(rawTemplate);
// let slideList = document.querySelector('.slider__list');
let coreaction = document.getElementById('coreaction');

coreaction.addEventListener('click', get_cr,fasle);

function get_cr(){
    let para = { coreaction.value};
    fetch(myRequest)
    .then(function (response) {
        return response.json();
    })
    .then(function (json) {

        let html = template(json[0]);
        slideList.innerHTML += html;
    });
}*/

/**
 * return user reactions activity list
 * @param {array} data - inputdata
 * @return {object} - array
 */
function activitymatrix(data) {
    let posts = data[0];
    let users = data[1];
    let list = [];
    for (let i = 0; i < users.length; i++) {
        let A = users[i].posts.A;
        let B = users[i].posts.B;
        let row = [];
        for (let i = 0; i < posts.length; i++) {
            let findpost = false;
            // console.log(A);
            for (let a = 0; a < A.length; a++) {
                if (A[a].id === posts[i].id) {
                    findpost = true;
                    row.push(A[a].like);
                    a = A.length;
                }
            }
            for (let b = 0; b < B.length; b++) {
                if (B[b].id === posts[i].id) {
                    findpost = true;
                    row.push(B[b].like);
                    b = B.length;
                }
            }
            if (!findpost) {
                row.push(0);
            }
        }
        list.push(row);
    }
    return list;
};

/**
 * return n*n matrix
 * @param {number} n - *n matrix
 * @return {object} - array
 */
function initMat(n) {
    let mat = [];
    for (let i = 0; i < n; i++) {
        let temp = [];
        for (let j = 0; j < n; j++) {
            temp.push(0);
        }
        mat.push(temp);
    }
    return mat;
}

/**
 * calculate point distance
 * @param {object} a - point a
 * @param {object} b - point b
 * @return {number}
 */
function distance(a, b) {
    let d = 0;
    let n = a.length;
    for (let i = 1; i < n; i++) {
        d += (a[i] - b[i]) * (a[i] - b[i]);
    }
    return Math.sqrt(d);
}

/**
 * get attribute minmax value object
 * @param {object} d - data
 * @param {string} type - attributes type
 * @param {array} attributes - attributes array
 * @return {object}
 */
function minmax(d, type, attributes) {
    let minmax = [];
    let pointlist = [];
    for (let i = 0; i < d.length; i++) {
        let point = [];
        point.push(d[i].AUTHID);
        for (let j = 0; j < attributes.length; j++) {
            point.push(d[i][type][attributes[j]]);
            /*
            point.push(d[i].BIG5.sEXT);
            point.push(d[i].BIG5.sNEU);
            point.push(d[i].BIG5.sAGR);
            point.push(d[i].BIG5.sCON);
            point.push(d[i].BIG5.sOPN);
            */
        }
        pointlist.push(point);
    }
    let n = pointlist.length;
    let m = pointlist[0].length;
    let temp = [];
    for (let i = 1; i < m; i++) {
        let array = [];
        for (let j = 0; j < n; j++) {
            array.push(pointlist[j][i]);
        }
        temp.push(array);
    }
    // console.log(temp);
    for (let j = 0; j < m - 1; j++) {
        // console.log(temp[j]);
        let value = [];
        let max = Math.max.apply(null, temp[j]);
        let min = Math.min.apply(null, temp[j]);
        value.push(min);
        value.push(max);
        minmax.push({
            'type': value,
        });
    }
    return minmax;
};

/**
 * normalize a dist
 * @param {object} pointlist - dist array
 * @return {object} - array
 */
function normalize(pointlist) {
    // console.log(max)
    let n = pointlist.length;
    let m = pointlist[0].length;
    let temp = [];
    for (let i = 1; i < m; i++) {
        let array = [];
        for (let j = 0; j < n; j++) {
            array.push(pointlist[j][i]);
        }
        temp.push(array);
    }
    // console.log(temp);
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < m - 1; j++) {
            // console.log(temp[j]);
            let max = Math.max.apply(null, temp[j]);
            let min = Math.min.apply(null, temp[j]);
            pointlist[i][j + 1] = (pointlist[i][j + 1] - min) / (max - min);
        }
    }
    // console.log(pointlist);
    return pointlist;
}

/**
 * get users dists
 * @param {object} userlist - source list object
 * @param {bool} normal - normalize or not
 * @return {object} - array
 */
function userdist(userlist, normal) {
    if (normal) {
        pointlist = normalize(userlist);
    } else {
        pointlist = userlist;
    }
    let dists = initMat(pointlist.length);
    for (let i = 0; i < dists.length; i++) {
        for (let j = i + 1; j < dists.length; j++) {
            dists[i][j] = distance(pointlist[i], pointlist[j]);
            dists[j][i] = distance(pointlist[i], pointlist[j]);
        }
        // console.log(temp[200]);
    }
    // console.log(dists);
    return dists;
}

/**
 * make users co-activities links list
 * @param {object} userlist - users
 * @return {object} - linklist
 */
function linklist(userlist) {
    // let undouser = userlist;
    let linklist = [];
    let len = userlist.length;
    for (let i = 0; i < len; i++) {
        for (let j = i + 1; j < userlist.length; j++) {
            let Alen1 = userlist[i].posts.A.length;
            let Alen2 = userlist[j].posts.A.length;
            let find = false;
            for (let a1 = 0; a1 < Alen1; a1++) {
                for (let a2 = 0; a2 < Alen2; a2++) {
                    let A1 = userlist[i].posts.A[a1];
                    let A2 = userlist[j].posts.A[a2];
                    if (A1 != undefined && A2 != undefined) {
                        if (A1.id === A2.id) {
                            find = true;
                            a1 = Alen1;
                            a2 = Alen2;
                        }
                    }
                }
            }
            let Blen1 = userlist[i].posts.B.length;
            let Blen2 = userlist[j].posts.B.length;
            // let find = false;
            for (let b1 = 0; b1 < Blen1; b1++) {
                for (let b2 = 0; b2 < Blen2; b2++) {
                    let B1 = userlist[i].posts.B[b1];
                    let B2 = userlist[j].posts.B[b2];
                    if (B1 != undefined && B2 != undefined) {
                        if (B1.id === B2.id) {
                            find = true;
                            b1 = Blen1;
                            b2 = Blen2;
                        }
                    }
                }
            }
            if (find === true) {
                let link = {
                    'source': userlist[i].PLOT,
                    'target': userlist[j].PLOT,
                };
                linklist.push(link);
            }
        }
    }
    return linklist;
}
/**
 * render data plot
 * @param {object} tsne1 - method object
 * @param {object} tsne2 - method object
 * @param {object} data - datapoint list
 * @param {number} px - pixel
 * @param {boolean} init - init or not
 */
function update(tsne1, tsne2, data, px, init) {
    // setTimeout(function () {
    let P = tsne1.getSolution();
    // let Z = tsne2.getSolution();
    // console.log(P);
    for (let i = 0; i < data.length; i++) {
        data[i]['PLOT'] = {
            x: P[i][0],
            y: P[i][1],
        };
    }
    let max;
    let min;
    for (let i = 0; i < P.length; i++) {
        for (let j = 0; j < 2; j++) {
            if (P[i][j] > max || max === undefined) {
                max = P[i][j];
            }
            if (P[i][j] < min || min === undefined) {
                min = P[i][j];
            }
        }
    }

    let width = px;
    let height = px;

    let x = d3.scaleLinear()
        .domain([min, max])
        .range([15, width - 15]);

    let y = d3.scaleLinear()
        .domain([min, max])
        .range([15, height - 15]);

    // generate a quadtree for faster lookups for brushing
    let quadtree = d3.quadtree()
        .x((d) => x(d.PLOT.x))
        .y((d) => y(d.PLOT.y))
        .addAll(data);

    let brush = d3.brush()
        .extent([
            [0, 0],
            [width, height],
        ])
        .on('brush end', updateBrush);

    let linkdata = linklist(data);

    let tooltip1 = d3.select('body').select('.a')
        // .attr('class', 'tooltip1')
        .style('opacity', 0);
    // .style("width","200px")
    // .style("height","30px");

    /**
     * callback when the brush updates / ends
     * @param {object} quadtree - d3.quadtree
     */
    function updateBrush() {
        // The following two functions taken from vis-utils: https://github.com/pbeshai/vis-utils
        const X = 0;
        const Y = 1;
        const TOP_LEFT = 0;
        const BOTTOM_RIGHT = 1;
        /**
         * Determines if two rectangles overlap by looking at two pairs of points [[r1x1, r1y1], [r1x2, r1y2]]
         * for rectangle 1 and similarly for rectangle2.
         * @param {object} rect1
         * @param {object} rect2
         * @return {bool}
         */
        function rectIntersects(rect1, rect2) {
            return (rect1[TOP_LEFT][X] <= rect2[BOTTOM_RIGHT][X] &&
                rect2[TOP_LEFT][X] <= rect1[BOTTOM_RIGHT][X] &&
                rect1[TOP_LEFT][Y] <= rect2[BOTTOM_RIGHT][Y] &&
                rect2[TOP_LEFT][Y] <= rect1[BOTTOM_RIGHT][Y]);
        }

        /**
         * Determines if a point is inside a rectangle. The rectangle is
         * defined by two points [[rx1, ry1], [rx2, ry2]]
         * @param {object} rect
         * @param {object} point
         * @return {bool}
         */
        function rectContains(rect, point) {
            return rect[TOP_LEFT][X] <= point[X] && point[X] <= rect[BOTTOM_RIGHT][X] &&
                rect[TOP_LEFT][Y] <= point[Y] && point[Y] <= rect[BOTTOM_RIGHT][Y];
        }

        /**
         * highlightBrushed
         * @param {object} brushedNodes - brush selection data
         */
        function highlightBrushed(brushedNodes) {
            d3.selectAll('.circles-brushed').remove();

            if (brushedNodes.lenght !== 0) {
                const circles = d3.select('#plot').select('.circle').selectAll('.circle'); // .data(brushedNodes);
                let t = brushedNodes.length;
                const color = d3.interpolateRdBu;
                circles.filter(function (d, i) {
                    let find = false;
                    let index = 0;
                    for (let i = 0; i < t; i++) {
                        if (d === brushedNodes[i]) {
                            find = true;
                            index = i;
                            i = brushedNodes.length;
                        }
                    }
                    if (find) {
                        d3.select(this).style('fill', color(index / t))
                            .style('stroke', 'black');
                    } else {
                        d3.select(this).style('fill', defultcolor('#plot', data, d))
                            .style('stroke', 'none');
                    }
                    return find;
                });
            }
        }

        const {
            selection,
        } = d3.event;
        // console.log(selection);
        // if we have no selection, just reset the brush highlight to no nodes
        if (!selection) {
            highlightBrushed([]);
            return;
        }
        // begin an array to collect the brushed nodes
        const brushedNodes = [];

        // traverse the quad tree, skipping branches where we do not overlap
        // with the brushed selection box
        quadtree.visit((node, x1, y1, x2, y2) => {
            // check that quadtree node intersects
            let overlaps = rectIntersects(selection, [
                [x1, y1],
                [x2, y2],
            ]);

            // skip if it doesn't overlap the brush
            if (!overlaps) {
                return true;
            }

            // if this is a leaf node (node.length is falsy), verify it is within the brush
            // we have to do this since an overlapping quadtree box does not guarantee
            // that all the points within that box are covered by the brush.
            if (!node.length) {
                let d = node.data;
                let dx = x(d.PLOT.x);
                let dy = y(d.PLOT.y);
                if (rectContains(selection, [dx, dy])) {
                    brushedNodes.push(d);
                }
            }

            // return false so that we traverse into branch (only useful for non-leaf nodes)
            return false;
        });

        // update the highlighted brushed nodes
        highlightBrushed(brushedNodes);
        // Call function to draw the Radar chart
        // radarchart('.radarChart', brushedNodes, radarChartOptions);
    }

    if (!init) {
        let graph = d3.select('.svg').append('div')
            .attr('class', 'plot');

        swapcolor(data, graph, '#plot', 'defult', '220px', '50px', 'defult');
        swapcolor(data, graph, '#plot', 'A', '260px', '50px', 'posts.A.length');
        swapcolor(data, graph, '#plot', 'B', '300px', '50px', 'posts.B.length');

        d3.select('.svg').select('#plot').remove();

        let zoom = d3.zoom()
            .scaleExtent([1, 5])
            .on('zoom', function () {
                g.attr('transform', d3.event.transform);
                let k = this.__zoom.k;
                g.attr('r', 5 / k)
                    .attr('stroke-width', 1 / k);
            });

        let svg = d3.select('.svg').append('svg')
            .attr('id', 'plot')
            .attr('width', width)
            .attr('height', height)
            .style('fill', 'none')
            .style('pointer-events', 'all')
            .call(zoom);

        let g = svg.append('g')
            .attr('id', 'plot');

        let gBrush = g.append('g')
            .attr('class', 'brush')
            .call(brush);

        // update the styling of the select box (typically done in CSS)
        gBrush.select('.selection')
            .style('stroke', 'skyblue')
            .style('stroke-opacity', 0.4)
            .style('fill', 'skyblue')
            .style('fill-opacity', 1);

        /*
        let line = d3.line()
            .x((d) => x(d.PLOT.x))
            .y((d) => x(d.PLOT.y));*/
        // console.log(linkdata);
        let link = g.append('g').attr('class', 'link').selectAll('line');
        // let link = d3.select('svg#plot').append('g').attr('class', 'link');
        link.data(linkdata).enter().append('line')
            .attr('class', 'link')
            .attr('fill', 'none')
            .attr('stroke', 'steelblue')
            .attr('opacity', '0')
            // .attr('stroke-linejoin', 'round')
            // .attr('stroke-linecap', 'round')
            .attr('stroke-width', 1)
            .attr('x1', (d) => x(d.source.x))
            .attr('y1', (d) => y(d.source.y))
            .attr('x2', (d) => x(d.target.x))
            .attr('y2', (d) => y(d.target.y));
        /*
        g.append('path')
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke', 'steelblue')
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round')
            .attr('stroke-width', 1.5)
            .attr('d', line);*/

        g.append('g').attr('class', 'circle').selectAll('circle').data(data).enter().append('circle')
            .attr('class', 'circle')
            .attr('cx', (d) => x(d.PLOT.x))
            .attr('cy', (d) => y(d.PLOT.y))
            .attr('r', 5)
            .style('fill', function (d) {
                // return color(d.BIG5.sEXT);
                // console.log("rgb("+d.BIG5.sEXT * 51+","+d.BIG5.sCON*51+","+d.BIG5.sAGR*51+")")
                return defultcolor('#plot', data, d);
            });
        // g.selectAll('.circle').selectAll('.circle')
    } else {
        /*
        quadtree = d3.quadtree()
            .x((d) => x(d.PLOT.x))
            .y((d) => y(d.PLOT.y))
            .addAll(data);*/
        d3.select('.brush').call(brush);
        d3.selectAll('line').data(linkdata)
            .attr('class', 'link')
            .attr('fill', 'none')
            .attr('stroke', 'steelblue')
            .attr('opacity', '0')
            // .attr('stroke-linejoin', 'round')
            // .attr('stroke-linecap', 'round')
            .attr('stroke-width', 1)
            .attr('x1', (d) => x(d.source.x))
            .attr('y1', (d) => y(d.source.y))
            .attr('x2', (d) => x(d.target.x))
            .attr('y2', (d) => y(d.target.y));

        let select = d3.select('#plot').select('.circle').selectAll('.circle');
        // console.log(select);
        select
            .data(data)
            .transition()
            .attr('cx', (d) => x(d.PLOT.x))
            .attr('cy', (d) => y(d.PLOT.y));
    }
    d3.select('#plot').select('.circle').selectAll('.circle')
        .on('mouseover', function (d) {
            d3.event.preventDefault();
            tooltip1.transition()
                .duration(200)
                .style('opacity', .9);
            tooltip1.html('ID=' + d.id + '<br/>' + 'Name = ' + d.name + '<br/>' +
                    'Activities on A = ' + d.posts.A.length + '<br/>' +
                    'Activities on B = ' + d.posts.B.length)
                .style('left', (d3.event.pageX + 5) + 'px')
                .style('top', (d3.event.pageY - 30) + 'px');
        })
        .on('mouseout', function (d) {
            d3.event.preventDefault();
            tooltip1.transition()
                .duration(500)
                .style('opacity', 0);
        })
        .on('click', function (d) {
            d3.event.preventDefault();
            d3.selectAll('line').data(linkdata).attr('opacity', function (u) {
                // console.log(data);
                // console.log(d);
                if (u.source === d.PLOT || u.target === d.PLOT) {
                    return 1;
                } else {
                    return 0;
                }
            });
            status(d);
        });
}

/**
 * get input param value
 * @param {string} id -getelementbyid
 * @return {number}
 */
function getparam(id) {
    let param = document.getElementById(id);
    let value = param.value;
    return value;
}

/**
 * form checked
 * @param {string} query - getelementsbyname
 * @return {object} - array
 */
function formchecked(query) {
    // let checkedValue = document.querySelector('Big5:checked').value;
    let checked = {};
    let form = document.getElementsByName(query);
    for (let i = 0; i < form.length; i++) {
        let id = form[i].id;
        checked[id] = form[i].checked;
    }
    // console.log(checked);
    // return value;
    return checked;
}

/**
 * swap color
 * @param {object} data - ref data
 * @param {object} select - element
 * @param {string} id
 * @param {string} value
 * @param {string} top
 * @param {string} left
 * @param {string} attribute
 */
function swapcolor(data, select, id, value, top, left, attribute) {
    // console.log(select.select(id).selectAll('circle'));
    d3.select('svg').select('input').remove();
    select.append('input')
        .attr('type', 'button')
        .attr('class', 'btn btn-primary btn-xs')
        .attr('value', value)
        // .style('position', 'absolute')
        // .style('top', top)
        // .style('left', left)
        .on('click', function () {
            d3.event.preventDefault();
            d3.select(id).selectAll('circle')
                .style('fill', function (d) {
                    if (attribute === 'defult') {
                        return defultcolor(id, data, d);
                    } else {
                        let domain = attrdomain(data, attribute);
                        return colorscale(domain, setDescendantProp(d, attribute), 'lightgrey', 'black');
                    }
                });
        });
}

/**
 * setDescendantProp
 * @param {object} obj
 * @param {string} desc
 * @return {any} - obj
 */
function setDescendantProp(obj, desc) {
    let arr = desc.split('.');
    // console.log(obj);
    while (arr.length > 1) {
        // console.log(arr);
        obj = obj[arr.shift()];
    }
    return obj[arr[0]];
}

/**
 * get array element value range
 * @param {object} data
 * @param {string} attribute
 * @return {object}
 */
function attrdomain(data, attribute) {
    let array = [];
    for (let i = 0; i < data.length; i++) {
        array.push(setDescendantProp(data[i], attribute));
    }
    let min;
    let max;
    for (let i = 0; i < array.length; i++) {
        if (Number(array[i]) < min || min === undefined) {
            min = Number(array[i]);
        }
        if (Number(array[i]) > max || max === undefined) {
            max = Number(array[i]);
        }
    }
    return {
        'min': min,
        'max': max,
    };
}

/**
 * color scale
 * @param {object} domain
 * @param {number} value
 * @param {string} color1 - string
 * @param {string} color2 - string
 * @return {number}
 */
function colorscale(domain, value, color1, color2) {
    let color = d3.scaleLinear()
        .domain([domain.min, domain.max])
        .range([color1, color2]);
    return color(value);
}

/**
 * set defultcolor
 * @param {string} id
 * @param {object} data
 * @param {object} d
 * @return {color}
 */
function defultcolor(id, data, d) {
    if (id === '#plot') {
        let domainA = attrdomain(data, 'posts.A.length');
        let domainB = attrdomain(data, 'posts.B.length');
        let domain = {
            'min': domainA.min + domainB.min,
            'max': domainA.max + domainB.max,
        };
        // console.log(d);
        let len = d.posts.A.length + d.posts.B.length;
        return colorscale(domain, len, 'red', 'blue');
    }
}

/**
 * make status table
 * @param {object} point - user point object
 */
function status(point) {
    let table = '<table><thead>';
    table += '<tr>' +
        '<th width="45%">PageA</th>' +
        '<th width="45%">PageB</th>' +
        '</tr>' + '</thead>' + '<tbody>';
    let subtable = '<table><thead>' + '<tr>' +
        '<th width="5%">#</th>' +
        '<th width="45%">Acivities on Posts</th>' +
        '</tr>' + '</thead>' + '<tbody>';
    let subtableend = '</tbody></table>';
    table += '<tr>' + '<td>' + subtable;
    for (let i = 0; i < point.posts.A.length; i++) {
        let s = '<tr>' + '<th>' + (i + 1) + '</th>' +
            '<td>' + '<ul>' + point.posts.A[i].id + '</ul>' +
            '<ul>' + 'comment count: ' + point.posts.A[i].commentcount + '</ul>' +
            '<ul>' + 'reaction type: ' + liketype(point.posts.A[i].like) + '</ul>' +
            '<ul>' + 'share post: ' + point.posts.A[i].share + '</ul>' +
            '</td>' + '</tr>';
        table += s;
    }
    table += subtableend + '</td>';
    table += '<td>' + subtable;
    for (let i = 0; i < point.posts.B.length; i++) {
        let s = '<tr>' + '<th>' + (i + 1) + '</th>' +
            '<td>' + '<ul>' + point.posts.B[i].id + '</ul>' +
            '<ul>' + 'comment count: ' + point.posts.B[i].commentcount + '</ul>' +
            '<ul>' + 'reaction type: ' + liketype(point.posts.B[i].like) + '</ul>' +
            '<ul>' + 'share post: ' + point.posts.B[i].share + '</ul>' +
            '</td>' + '</tr>';
        table += s;
    }
    table += subtableend + '</td>';
    table += '</tbody></table>';
    let div = document.getElementById('cooltable');
    // console.log(div);
    let index = div.innerHTML.indexOf('<table');
    div.innerHTML = div.innerHTML.slice(0, index);
    div.innerHTML += table;
}

/**
 * change liketype number to string name
 * @param {number} typenum
 * @return {string}
 */
function liketype(typenum) {
    if (typenum === 1) {
        return 'like';
    }
    if (typenum === 2) {
        return 'love';
    }
    if (typenum === 3) {
        return 'haha';
    }
    if (typenum === 4) {
        return 'wow';
    }
    if (typenum === 5) {
        return 'sad';
    }
    if (typenum === 6) {
        return 'angry';
    } else {
        return 'thankful';
    }
}

/**
 * overlap vis
 * @param {object} data - inputdata
 */
function overlapvis(data) {
    // let width = document.querySelector('#overlap').offsetWidth;
    let height = '100%';
    let width = height;
    let color = d3.scaleQuantize()
        .domain([0, 10])
        .range(['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee08b',
            '#ffffbf', '#d9ef8b', '#a6d96a', '#66bd63', '#1a9850', '#006837',
        ]);

    let zoom = d3.zoom()
        .scaleExtent([1 / 10, 10])
        .on('zoom', function () {
            g.attr('transform', d3.event.transform);
            let k = this.__zoom.k;
            g.attr('stroke-width', 1 / k);
        });
    /*
        function zoom(d) {
            let focus0 = focus;
            focus = d;
            // console.log(view);
            let x = focus.x1 - focus.x0;
            let y = focus.y1 - focus.y0;
            let r = x === w && y === w ? w : x > y ? 2 * x : 2 * y;
            d3.transition()
                .duration(d3.event.altKey ? 7500 : 750)
                .tween('zoom', (d) => {
                    let i = d3.interpolateZoom(view, [focus.x0, focus.y0, r]);
                    return function (t) {
                        zoomTo(i(t));
                    };
                });
        }

        function zoomTo(v) {
            let k = w / v[2];
            view = v;
            // console.log(v);
            cell.attr('transform', function (d) {
                // console.log(d);
                return 'translate(' + ((d.x0 - v[0]) * k) + ',' + ((d.y0 - v[1]) * k) + ')';
            });
            rect.attr('width', function (d) {
                    return (d.x1 - d.x0) * k;
                })
                .attr('height', function (d) {
                    return (d.y1 - d.y0) * k;
                });
        }*/

    let svg = d3.select('#overlap')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', '0 0 1000 1000')
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .style('fill', 'none')
        .style('pointer-events', 'all')
        .call(zoom);

    let g = svg.append('g')
        .attr('id', 'overlapmap');

    let posts = data.data[0];
    let users = data.data[1];
    let overlap = data.data[2];

    // let nextline = parseInt(((0.8 * 1000) / cellSize1), 10);
    let nextline = parseInt(Math.sqrt(2 * data.summary[1][2]), 10) - 1;
    let ratio = (1000 * 0.95) / (nextline * 50);
    let cellSize1 = 50 * ratio;
    let cellSize2 = 40 * ratio;
    let cellSize3 = 30 * ratio;

    let initx = 1000 * 0.025 + cellSize1 / 2;
    let inity = initx / 2;

    // construct degree y checklist
    let degylist = [];
    for (let i = 0; i < overlap.length; i++) {
        let deg = overlap[i];
        let count = 0;
        for (let j = 0; j < deg.length; j++) {
            let group = deg[j];
            count += group.length;
        }
        degylist.push(parseInt(count / nextline, 10) + 1);
    }

    // usercount in degree[i] list
    let uclist = [];
    for (let i = 0; i < overlap.length; i++) {
        let deg = overlap[i];
        let temp = [];
        for (let j = 0; j < deg.length; j++) {
            let group = deg[j];
            temp.push(group.length);
        }
        uclist.push(temp);
    }

    function gety(list, index) {
        let result = 0;
        for (let i = 0; i < index; i++) {
            result += list[i];
        }
        return result;
    }

    function modify(list, datasource, index) {
        let l = datasource.length;
        let count = 0;
        for (let j = 0; j < l; j++) {
            let group = datasource[j];
            count += group.length;
        }
        let yc = parseInt(count / nextline, 10) + 1;
        if (list[index] === 1) {
            list[index] = yc;
        } else {
            list[index] = 1;
        }
        return list;
    }

    function uccount(check, list) {
        let result = [];
        let l = check.length;
        for (let i = 0; i < l; i++) {
            let h = list[i].length;
            let temp = [];
            let x = 0;
            let y = 0;
            for (let j = 0; j < h; j++) {
                temp.push({
                    'x': x,
                    'y': y,
                });
                if (check[i] !== 1) {
                    y += list[i][j];
                }
                x += list[i][j];
            }
            result.push(temp);
        }
        return result;
    }

    function count(data) {
        let c = 0;
        let l = data.length;
        for (let i = 0; i < l; i++) {
            c += data[i].length;
        }
        return c;
    }

    let rect = g.selectAll('g')
        .data(overlap)
        .enter().append('g')
        .attr('id', (d, i) => 'degree' + i)
        .attr('transform', (d, i) => {
            return 'translate(0,' + gety(degylist, i) * cellSize1 + ')';
        });

    let deggrid = rect.append('rect').attr('class', (d, i) => 'degree' + ' ' + i)
        .attr('fill', 'none')
        .attr('stroke', '#f00')
        .attr('opacity', 1)
        .attr('width', (d) => {
            if (widthcount(d) < nextline) {
                return widthcount(d) * cellSize1;
            } else {
                return nextline * cellSize1;
            }
        })
        .attr('height', (d, i) => {
            return cellSize1 * degylist[i];
        })
        .attr('x', initx)
        .attr('y', inity);

    let degcounts = overlap.length;
    let botton = rect.append('rect')
        .attr('class', (d, i) => 'botton' + ' ' + i)
        .attr('fill', '#aaa')
        .attr('stroke', '#f00')
        .attr('opacity', 1)
        .attr('width', cellSize1)
        .attr('height', (d, i) => {
            return cellSize1 * degylist[i];
        })
        .attr('x', initx - cellSize1)
        .attr('y', inity)
        .on('click', function (d, k) {
            d3.event.preventDefault();
            degylist = modify(degylist, d, k);
            uylist = uccount(degylist, uclist);
            // console.log(uylist);
            rect.attr('transform', (d, i) => {
                return 'translate(0,' + gety(degylist, i) * cellSize1 + ')';
            });
            d3.selectAll('.degree')
                .attr('height', (d, i) => {
                    return cellSize1 * degylist[i];
                });
            d3.selectAll('.botton')
                .attr('height', (d, i) => {
                    return cellSize1 * degylist[i];
                });
            text.attr('y', (d, i) => {
                return (cellSize1 * (degylist[i] + 0.66)) / 2 + inity;
            });

            for (let i = 0; i < degcounts; i++) {
                let did = '#degree' + i;
                d3.selectAll(did).selectAll('.ggrid').attr('transform', (d, j) => {
                    let offsetx = uylist[i][j].x % nextline;
                    let resultx = initx + offsetx * cellSize1 + (cellSize1 - cellSize2) / 2;
                    let offsety = 0;
                    if (degylist[i] !== 1) {
                        offsety = parseInt(uylist[i][j].y / nextline, 10);
                    }
                    let resulty = offsety * cellSize1 + (cellSize1 - cellSize2) / 2;
                    // console.log(offsetx);
                    return 'translate(' + resultx + ',' + resulty + ')';
                });
                d3.selectAll(did).selectAll('.grect')
                    .attr('height', (d) => {
                        if (degylist[i] === 1) {
                            return cellSize1 - (cellSize1 - cellSize2);
                        } else {
                            let h = parseInt(d.length / nextline, 10) + 1;
                            return h * cellSize1 - (cellSize1 - cellSize2);
                        }
                    });
                let gcount = overlap[i].length;
                for (let j = 0; j < gcount; j++) {
                    let gid = '#d' + i + 'g' + j;
                    d3.selectAll(gid).selectAll('.user')
                        .attr('y', (d, k) => {
                            function usery(check, index) {
                                if (check === 1) {
                                    return (cellSize2 - cellSize3) / 2;
                                } else {
                                    let offsety = parseInt(index / nextline, 10);
                                    let result = offsety * cellSize1 + (cellSize2 - cellSize3) / 2;
                                    return result;
                                }
                            }
                            return usery(degylist[i], k) + inity;
                        });
                }
            }
        });

    let text = rect.append('text')
        .attr('x', initx - cellSize1)
        .attr('y', (d, i) => {
            return (cellSize1 * (degylist[i] + 0.66)) / 2 + inity;
        })
        // .attr('dy', '.35em')
        .attr('font-size', 50 * ratio)
        .attr('fill', '#aaa')
        .attr('stroke', '#f00')
        .text((d) => {
            let data = d[0][0].posts;
            return getlength(data, 'A') + getlength(data, 'B');
        });

    for (let i = 0; i < degcounts; i++) {
        let degree = overlap[i];
        let did = '#degree' + i;
        let x = 0;
        let yc = 0;
        let groupgrid = g.selectAll(did)
            .selectAll('g')
            .data(degree)
            .enter().append('g')
            .attr('class', 'ggrid')
            .attr('id', (d, l) => 'd' + i + 'g' + l)
            .attr('transform', (d) => {
                resultx = initx + x + (cellSize1 - cellSize2) / 2;
                x += widthcount(d) * cellSize1;
                while (x >= nextline * cellSize1) {
                    x -= nextline * cellSize1;
                }
                let offsety = parseInt(yc / nextline, 10);
                resulty = offsety * cellSize1 + (cellSize1 - cellSize2) / 2;
                yc += d.length;
                return 'translate(' + resultx + ',' + resulty + ')';
            })
            .append('rect')
            .attr('class', 'grect')
            .attr('fill', 'none')
            .attr('stroke', '#0f0')
            .attr('opacity', 1)
            .attr('width', (d) => {
                if (widthcount(d) < nextline) {
                    return widthcount(d) * cellSize1 - (cellSize1 - cellSize2);
                } else {
                    return nextline * cellSize1 - (cellSize1 - cellSize2);
                }
            })
            .attr('height', (d) => {
                let h = parseInt(d.length / nextline, 10) + 1;
                return h * cellSize1 - (cellSize1 - cellSize2);
            })
            .attr('x', 0)
            .attr('y', inity);

        let gcount = degree.length;
        for (let j = 0; j < gcount; j++) {
            let group = degree[j];
            let gid = '#d' + i + 'g' + j;
            if (group.length > 0) {
                let usergrid = g.selectAll(gid)
                    .selectAll('g')
                    .data(group)
                    .enter().append('rect')
                    .attr('class', 'user')
                    .attr('fill', (d) => color(Math.sqrt(d.posts.A.length)))
                    .attr('stroke', '#00f')
                    .attr('opacity', 1)
                    .attr('width', cellSize3)
                    .attr('height', cellSize3)
                    .attr('x', (d, k) => {
                        result = (k % nextline) * cellSize1 + (cellSize2 - cellSize3) / 2;
                        return result;
                    })
                    .attr('y', (d, k) => {
                        let offsety = parseInt(k / nextline, 10);
                        result = offsety * cellSize1 + (cellSize2 - cellSize3) / 2;
                        return result + inity;
                    });
            }
        }
    }

    let tooltip3 = d3.select('body').select('.c')
        // .attr('class', 'tooltip1')
        .style('opacity', 0);
    // .style("width","200px")
    // .style("height","30px");
    d3.selectAll('.user')
        .on('mouseover', function (d) {
            d3.event.preventDefault();
            tooltip3.transition()
                .duration(200)
                .style('opacity', .9);
            tooltip3.html('ID=' + d.id + '<br/>' + 'Name = ' + d.name + '<br/>' +
                    'Activities on A = ' + getlength(d.posts, 'A') + '<br/>' +
                    'Activities on B = ' + getlength(d.posts, 'B'))
                .style('left', (d3.event.pageX + 5) + 'px')
                .style('top', (d3.event.pageY - 30) + 'px');
        })
        .on('mouseout', function (d) {
            d3.event.preventDefault();
            tooltip3.transition()
                .duration(500)
                .style('opacity', 0);
        })
        .on('click', function (d) {
            d3.event.preventDefault();
            status(d);
        });

    // .attr('transform', 'translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")');

    /*
    svg.append('g')
        .attr('fill', 'none')
        .attr('stroke', '#000')
        .selectAll('path')
        .data(function (d) {
            return d3.timeMonths(new Date(d, 0, 1), new Date(d + 1, 0, 1));
        })
        .enter().append('path')
        .attr('d', pathMonth);*/
}

/**
 * return width
 * @param {object} d - datum
 * @return {number}
 */
function widthcount(d) {
    let count = 0;
    for (let i = 0; i < d.length; i++) {
        if (d[i] instanceof Array) {
            count += d[i].length;
        } else {
            count++;
        }
    }
    return count;
}

/**
 * get array length
 * @param {array} data - inputarray
 * @param {string} attr - attr array
 * @return {number}
 */
function getlength(data, attr) {
    let dl = 0;
    if (data[attr] !== undefined) {
        dl = data[attr].length;
    }
    return dl;
}

function sortlength(sortlist) {
    function compareNumbers(a, b) {
        // console.log(a.length + " " + b.length);
        return a.length - b.length;
    }
    var len = sortlist.length;
    for (var i = 0; i < len; i++) {
        sortlist[i].sort(compareNumbers);
    }
    return sortlist;
}

/**
 * overview
 * @param {object} data - inputdata
 */
function overview(data) {
    // data manipulate
    let ov = countactivities(data.data);
    // console.log(data);
    // postcount
    // usercount
    let oarc = [];
    let obrc = [];
    let orc = [];
    for (let i = 0; i < 7; i++) {
        oarc.push(ov.A[0][i]);
        obrc.push(ov.B[0][i]);
        orc.push((ov.A[0][i] + ov.B[0][i]));
    }
    let allpostcount = data.summary[0][0] + data.summary[0][1];

    let ovdata = [
        [data.summary[0][0], data.summary[0][1], allpostcount], // postcount
        [data.summary[1][0], data.summary[1][1], data.summary[1][2]], // usercount
        [ov.A[1], ov.B[1], (ov.A[1] + ov.B[1])], // commentcount
        [ov.A[2], ov.B[2], (ov.A[2] + ov.B[2])], // sharecount
    ];

    for (let i = 0; i < 7; i++) {
        ovdata.push([oarc[i], obrc[i], orc[i]]); // reactioncount
    }
    let axis = ['post', 'user', 'comment', 'share', 'like', 'love', 'haha', 'wow', 'sad', 'angry'];
    console.log('ovdata', ovdata);

    // graph draw
    // let width = document.querySelector('#over').offsetWidth;
    let width = '100%';
    let height = '50%';
    let margin = {
        top: 30,
        right: 60,
        bottom: 30,
        left: 60,
    };

    let zoom = d3.zoom()
        .scaleExtent([1, 5])
        .on('zoom', function () {
            g.attr('transform', d3.event.transform);
            let k = this.__zoom.k;
            g.attr('r', 5 / k)
                .attr('stroke-width', 1 / k);
        });

    let svg = d3.select('#over')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', '0 0 500 250')
        .attr('preserveAspectRatio', 'xMinYMin')
        .style('fill', 'none')
        .style('pointer-events', 'all');
    // .call(zoom);

    let w = 500 - margin.left - margin.right;
    let h = 250 - margin.top - margin.bottom;
    let wx = w / ovdata.length;

    let x = d3.scaleBand()
        .rangeRound([0, w])
        .padding(0.1)
        .align(0.1);

    let g = svg.append('g')
        .attr('id', 'over')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    let rectA = g.selectAll('g')
        .append('g').attr('class', 'A')
        .data(ovdata)
        .enter().append('rect')
        .attr('fill', '#aaa')
        .attr('width', wx)
        .attr('height', (d, i) => {
            return (d[0] / d[2]) * h;
        })
        .attr('x', (d, i) => {
            return i * wx;
        })
        .attr('y', 0);

    let rectB = g.selectAll('g')
        .append('g').attr('class', 'B')
        .data(ovdata)
        .enter().append('rect')
        .attr('fill', '#333')
        .attr('width', wx)
        .attr('height', (d, i) => {
            return (d[1] / d[2]) * h;
        })
        .attr('x', (d, i) => {
            return i * wx;
        })
        .attr('y', (d) => {
            return (d[0] / d[2]) * h;
        });

    let xaxis = g.selectAll('g')
        .append('g')
        .data(axis)
        .enter().append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', 'translate(0,' + h + ')')
        .call(d3.axisBottom(x));

    /*
    let darc = [0, 0, 0, 0, 0, 0, 0, 0];
    let dacc = 0;
    let dasc = 0;
    let dbrc = [0, 0, 0, 0, 0, 0, 0, 0];
    let dbcc = 0;
    let dbsc = 0;

    let garc = [0, 0, 0, 0, 0, 0, 0, 0];
    let gacc = 0;
    let gasc = 0;
    let gbrc = [0, 0, 0, 0, 0, 0, 0, 0];
    let gbcc = 0;
    let gbsc = 0;

    let arc = [0, 0, 0, 0, 0, 0, 0, 0];
    let acc = 0;
    let asc = 0;
    let brc = [0, 0, 0, 0, 0, 0, 0, 0];
    let bcc = 0;
    let bsc = 0;*/
}

/**
 * pageview
 * @param {object} data - inputdata
 * @param {object} pagedata - pagedata
 */
function pageview(data, pagedata) {
    // graph draw
    // let width = document.querySelector('#page').offsetWidth;
    let height = '100%';
    let width = height;
    let w = 500;
    let h = 500;
    // let wx = w / ovdata.length;
    /* let zoom = d3.zoom()
        .scaleExtent([1, 5])
        .on('zoom', function () {
            g.attr('transform', d3.event.transform);
            let k = this.__zoom.k;
            g.attr('r', 5 / k)
                .attr('stroke-width', 1 / k);
        });*/

    let svg = d3.select('#page')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', '0 0 500 500')
        .attr('preserveAspectRatio', 'xMinYMin')
        .style('fill', 'none')
        .style('pointer-events', 'all');
    // .call(zoom);

    let g = svg.append('g')
        .attr('id', 'pagepmap');

    let format = d3.format(',d');

    let treemap = d3.treemap()
        .tile(d3.treemapSquarify)
        .size([w, h])
        .round(false)
        // .paddingInner(1)
        .paddingOuter(1);

    let n = 100;
    let root = d3.hierarchy(pagedata)
        .eachBefore(function (d) {
            d.data.id = (d.parent ? d.parent.data.id + '.' : '') + d.data.name;
            let page = d.data.id.split('.')[1];
            let post = d.data.id.split('.')[2];
            d.data.page = page === undefined ? 0 : page === pagedata.children[0].name ? 1 : 2;
            d.data.post = post === undefined ? 0 : post.match(/\d{1,}/);
            d.data.type = d.data.name === 'comment' ? 2 : d.data.name === 'share' ? 3 : 1;
            // console.log(d.data.post[0]);
            if (d.data.post[0] > n) {
                n = d.data.post[0];
            }
        })
        .sum(sumBySize)
        .sort(function (a, b) {
            return b.height - a.height || b.value - a.value;
        });

    let focus = root;
    let view;

    treemap(root);

    let cell = g.selectAll('g')
        .data(root.leaves())
        .enter().append('g')
        .attr('transform', function (d) {
            return 'translate(' + d.x0 + ',' + d.y0 + ')';
        });

    let rect = cell.append('rect')
        .data(root.leaves())
        .datum(function (d) {
            d.width = d.x1 - d.x0;
            d.height = d.y1 - d.y0;
            // console.log(d);
            return d;
        })
        .attr('class', (d) => {
            return 'depth' + d.depth;
        })
        .attr('id', function (d) {
            return d.data.id;
        })
        .attr('width', (d) => d.width)
        .attr('height', (d) => d.height)
        .attr('fill', function (d) {
            return chcolor(n, d.data.post[0], d.data.type, d.data.page, 0.5);
        })
        .on('click', (d) => {
            console.log('click', d);
            let pagedata = data.data[0];
            // d.data.id.split('.');
            let select = d.data.id.split('.');
            let page = select[1];
            let post = select[2];
            let i = page === data.query.page1 ? 0 : 1;
            let j = parseInt(post.match(/\d{1,}/)[0]) - 1;
            // console.log(i, j);
            let id = pagedata[i][j].id;
            detailview(data, d.data.id.split('.'));
            let s = d3.selectAll('.user')
                .attr('fill', (d) => {
                    for (let i = 0, l = d.posts.A.length; i < l; i++) {
                        if (d.posts.A[i].id === id) {
                            return '#000';
                        }
                    }
                    for (let i = 0, l = d.posts.B.length; i < l; i++) {
                        if (d.posts.B[i].id === id) {
                            return '#000';
                        }
                    }
                });
            if (focus !== d) zoom(d);
            else zoom(root);
            // console.log(s._groups);
        });

    cell.append('clipPath')
        .attr('id', function (d) {
            return 'clip-' + d.data.id;
        })
        .append('use')
        .attr('href', function (d) {
            return '#' + d.data.id;
        });

    let text = cell.append('text')
        .attr('clip-path', function (d) {
            return 'url(#clip-' + d.data.id + ')';
        })
        .datum(function (d) {
            d.size = Math.sqrt(d.value);
            let arr = d.data.id.split('.');
            d.text = d.depth === 4 && d.data.name === 'like' ? arr[2] : '';
            // console.log(d);
            return d;
        })
        /* .selectAll('tspan')*/
        /*.data(function (d) {
            // return d.data.name.split(/(?=[A-Z][^A-Z])/g);
            console.log(d);
            let arr = d.data.id.split('.');
            // console.log(d, arr);
            return d.depth === 4 && d.data.name === 'like' ? arr[2] : '';
        })*/
        /*.enter().append('tspan')*/
        .text(function (d) {
            return d.text;
            // return d;
        })
        .attr('fill', '#fff');

    /* rect.selectAll('.depth2')
        .moveToFront();*/

    cell.append('title')
        .text(function (d) {
            return d.data.id + '\n' + format(d.value);
        });

    function getr(d) {
        let focus = d;
        let x = focus.x1 - focus.x0;
        let y = focus.y1 - focus.y0;
        let r = Math.sqrt(x * y);
        return r;
    }
    console.log('root', root);
    zoomTo([root.x0, root.y0, getr(root)]);
    /*
    d3.selectAll('input')
        .data([sumBySize, sumByCount], function (d) {
            return d ? d.name : this.value;
        })
        .on('change', changed);

    let timeout = d3.timeout(function () {
        d3.select('input[value=\"sumByCount\"]')
            .property('checked', true)
            .dispatch('change');
    }, 2000);

    function changed(sum) {
        timeout.stop();

        treemap(root.sum(sum));

        cell.transition()
            .duration(750)
            .attr('transform', function (d) {
                return 'translate(' + d.x0 + ',' + d.y0 + ')';
            })
            .select('rect')
            .attr('width', function (d) {
                return d.x1 - d.x0;
            })
            .attr('height', function (d) {
                return d.y1 - d.y0;
            });
    }

    function sumByCount(d) {
        return d.children ? 0 : 1;
    }*/

    function sumBySize(d) {
        return d.size;
    }

    function zoom(d) {
        let focus0 = focus;
        focus = d;
        // console.log(view);
        let x = focus.x1 - focus.x0;
        let y = focus.y1 - focus.y0;
        let r = x === w && y === w ? w : x > y ? 2 * x : 2 * y;
        d3.transition()
            .duration(d3.event.altKey ? 7500 : 750)
            .tween('zoom', (d) => {
                let i = d3.interpolateZoom(view, [focus.x0, focus.y0, r]);
                return function (t) {
                    zoomTo(i(t));
                };
            });

        /* transition.selectAll('text')
            .filter(function (d) {
                return d.parent === focus || this.style.display === 'inline';
            })
            .style('fill-opacity', function (d) {
                return d.parent === focus ? 1 : 0;
            })
            .on('start', function (d) {
                if (d.parent === focus) this.style.display = 'inline';
            })
            .on('end', function (d) {
                if (d.parent !== focus) this.style.display = 'none';
            });*/
    }

    function zoomTo(v) {
        let k = w / v[2];
        view = v;
        // console.log(v);
        cell.attr('transform', function (d) {
            // console.log(d);
            return 'translate(' + ((d.x0 - v[0]) * k) + ',' + ((d.y0 - v[1]) * k) + ')';
        });
        rect.attr('width', function (d) {
                return d.width * k;
            })
            .attr('height', function (d) {
                return d.height * k;
            });
        text.attr('font-size', (d) => {
                return d.size * k;
            })
            .attr('x', (d, i) => {
                return d.size * k;
                // return 9 * i + 4;
            })
            .attr('y', function (d, i) {
                return d.size * k;
                // return 13 + i * 10;
            });
    }
}

/*
    var sl = sortlist.length;
    for (var i = 0; i < sl; i++) {
        var deglist = sortlist[i];
        sortlist[i] = sortlength(deglist);
    }*/
/*
function countactivities(data){
    let posts = data[0];
    let users = data[1];
    let overlap = data[2];
    let l=overlap.length;
    for(let i=0;i<l;i++){
        let degree = overlap[i];
        let dl=degree.length;
        for(let j=0;j<dl;j++){
            let group=degree[j];
            let gl = group.lenght;
            for(let k=0;k<gl;k++){
                let user = group[k];
            }
        }
    }
}*/

/**
 * showcomments in detail
 * @param {object} data -
 * @param {array} select -
 */
function detailview(data, select) {
    let rawTemplate = document.getElementById('detail-view').innerHTML;
    let template = Handlebars.compile(rawTemplate);
    let detail = document.querySelector('#detail');
    let initdetail = '';
    let content = {};
    let pagedata = data.data[0];
    // d.data.id.split('.');
    let page = select[1];
    let post = select[2];
    let i = page === data.query.page1 ? 0 : 1;
    let j = parseInt(post.match(/\d{1,}/)[0]) - 1;
    // console.log(i, j);
    content.page = data.query.page1;
    content.post = post;
    content.id = pagedata[i][j].id;
    content.message = pagedata[i][j].message;
    content.reactions = {};
    // content.reactions.total=pagedata[0][0][0].reactions;
    content.reactions.like = pagedata[i][j].reactions.like;
    content.reactions.love = pagedata[i][j].reactions.love;
    content.reactions.haha = pagedata[i][j].reactions.haha;
    content.reactions.wow = pagedata[i][j].reactions.wow;
    content.reactions.sad = pagedata[i][j].reactions.sad;
    content.reactions.angry = pagedata[i][j].reactions.angry;
    content.commentcount = pagedata[i][j].comments.summary;
    content.comments = pagedata[i][j].comments.context;
    content.shares = pagedata[i][j].shares;
    console.log('detail', content);
    detail.innerHTML = initdetail;
    let html = template(content);
    detail.innerHTML += html;
    if (pagedata[i][j].comments.summary !== 0) {
        commentdetail(pagedata[i][j].comments.context);
    }

    // accordion
    let acc = document.getElementsByClassName('accordion');
    for (let i = 0; i < acc.length; i++) {
        acc[i].onclick = function () {
            this.classList.toggle('active');
            let panel = this.nextElementSibling;
            let paccordion = this.parentElement.parentElement;
            // console.log(paccordion);
            if (panel.style.maxHeight) {
                panel.style.maxHeight = null;
                paccordion.style.maxHeight = (paccordion.scrollHeight - panel.scrollHeight) + 'px';
            } else {
                panel.style.maxHeight = panel.scrollHeight + 'px';
                paccordion.style.maxHeight = (paccordion.scrollHeight + panel.scrollHeight) + 'px';
            }
        };
    }
}

/**
 * get comment instance by index
 * @param {array} data - comment
 */
function commentdetail(data) {
    let rawTemplate = document.getElementById('comments-detail').innerHTML;
    let template = Handlebars.compile(rawTemplate);
    let cdetail = document.querySelector('#comment');
    let init = '';
    cdetail.innerHTML = init;
    let content = {};
    for (let ci = 0, l = data.length; ci < l; ci++) {
        let comment = data[ci];
        content.time = comment.created_time;
        content.from = comment.from.name;
        content.message = comment.message === '' ? 'no text' : comment.message;
        content.commentcount = comment.comment_count;
        content.comment = comment.comments;
        content.divid = '"subcomment' + ci + '"';
        // console.log('comment', content);
        let html = template(content);
        cdetail.innerHTML += html;
        if (comment.comments.length !== 0) {
            let id = 'subcomment' + ci;
            subcommentdetail(comment.comments, id);
        }
    }
}

/**
 * get comment instance by index
 * @param {array} data - subcomment
 * @param {string} id - to querySelector
 */
function subcommentdetail(data, id) {
    let rawTemplate = document.getElementById('subcomments-detail').innerHTML;
    let template = Handlebars.compile(rawTemplate);
    let scdetail = document.querySelector('#' + id);
    let init = '';
    scdetail.innerHTML = init;
    let content = {};
    let l = data.length;
    // console.log(l);
    for (let sci = 0, l = data.length; sci < l; sci++) {
        let subcomment = data[sci];
        content.time = subcomment.created_time;
        content.from = subcomment.from.name;
        content.message = subcomment.message === '' ? 'no text' : subcomment.message;
        // console.log('subcomment', content);
        let html = template(content);
        scdetail.innerHTML += html;
    }
}

/**
 * get pagedata object
 * @param {object} data - inputarray
 * @return {object}
 */
function pagedata(data) {
    let pagedata = data.data[0];
    let tm = {};
    let tmdata = [];
    for (let i = 0, l = pagedata.length; i < l; i++) {
        let page = {};
        let posttemp = [];
        let posts = pagedata[i];
        for (let j = 0, l = posts.length; j < l; j++) {
            let post = {};
            let comment = {};
            let reaction = {};
            let like = {};
            let love = {};
            let haha = {};
            let wow = {};
            let sad = {};
            let angry = {};
            let share = {};
            comment.name = 'comment';
            comment.size = posts[j].comments.summary;
            like.name = 'like';
            like.size = posts[j].reactions.like;
            love.name = 'love';
            love.size = posts[j].reactions.love;
            haha.name = 'haha';
            haha.size = posts[j].reactions.haha;
            wow.name = 'wow';
            wow.size = posts[j].reactions.wow;
            sad.name = 'sad';
            sad.size = posts[j].reactions.sad;
            angry.name = 'angry';
            angry.size = posts[j].reactions.angry;
            reaction.name = 'reaction';
            reaction.children = [like, love, haha, wow, sad, angry];
            share.name = 'share';
            share.size = posts[j].shares;
            let temp = [];
            temp.push(comment);
            temp.push(reaction);
            temp.push(share);
            // post.name = posts[j].id;
            post.name = 'p' + (j + 1);
            post.children = temp;
            posttemp.push(post);
        }
        let pi = 'page' + (i + 1);
        page.name = data.query[pi];
        page.children = posttemp;
        tmdata.push(page);
    }
    tm.name = 'root';
    tm.children = tmdata;
    console.log('pagedata', tm);
    return tm;
};

/**
 * get activitiy counts
 * @param {object} data - inputdata
 * @return {object} countvalue object
 */
function countactivities(data) {
    let posts = data[0];
    // let users = data[1];
    let overlap = data[2];
    let count = {};
    let oarc = [0, 0, 0, 0, 0, 0, 0, 0];
    let oacc = 0;
    let oasc = 0;
    let obrc = [0, 0, 0, 0, 0, 0, 0, 0];
    let obcc = 0;
    let obsc = 0;
    let l = overlap.length;
    let dtemp = [];
    for (let i = 0; i < l; i++) {
        let degree = overlap[i];
        let deg = {};
        let darc = [0, 0, 0, 0, 0, 0, 0, 0];
        let dacc = 0;
        let dasc = 0;
        let dbrc = [0, 0, 0, 0, 0, 0, 0, 0];
        let dbcc = 0;
        let dbsc = 0;
        let dl = degree.length;
        let gtemp = [];
        for (let j = 0; j < dl; j++) {
            let group = degree[j];
            let g = {};
            let garc = [0, 0, 0, 0, 0, 0, 0, 0];
            let gacc = 0;
            let gasc = 0;
            let gbrc = [0, 0, 0, 0, 0, 0, 0, 0];
            let gbcc = 0;
            let gbsc = 0;
            let gl = group.length;
            let utemp = [];
            for (let k = 0; k < gl; k++) {
                let user = group[k];
                // user.id;
                // user.name;
                let arc = [0, 0, 0, 0, 0, 0, 0, 0];
                let acc = 0;
                let asc = 0;
                let brc = [0, 0, 0, 0, 0, 0, 0, 0];
                let bcc = 0;
                let bsc = 0;
                let pa = user.posts;
                if (pa.A instanceof Array) {
                    let al = pa.A.length;
                    for (let a = 0; a < al; a++) {
                        if (pa.A[a].commentcount !== 0) {
                            acc += pa.A[a].commentcount;
                        }
                        if (pa.A[a].like !== 0) {
                            let num = pa.A[a].like;
                            arc[0]++;
                            arc[num]++;
                        }
                        if (pa.A[a].share !== false) {
                            asc++;
                        }
                    }
                }
                if (pa.B instanceof Array) {
                    let bl = pa.B.length;
                    for (let b = 0; b < bl; b++) {
                        if (pa.B[b].commentcount !== 0) {
                            bcc += pa.B[b].commentcount;
                        }
                        if (pa.B[b].like !== 0) {
                            let num = pa.B[b].like;
                            brc[0]++;
                            brc[num]++;
                        }
                        if (pa.B[b].share !== false) {
                            bsc++;
                        }
                    }
                }
                let temp = {
                    'A': [arc, acc, asc],
                    'B': [brc, bcc, bsc],
                };
                // console.log(temp);
                utemp.push(temp);
                for (let i = 0; i < 7; i++) {
                    garc[i] += arc[i];
                    gbrc[i] += brc[i];
                }
                gacc += acc;
                gasc += asc;
                gbcc += bcc;
                gbsc += bsc;
            }
            g.A = [garc, gacc, gasc];
            g.B = [gbrc, gbcc, gbsc];
            g.user = utemp;
            gtemp.push(g);
            for (let i = 0; i < 7; i++) {
                darc[i] += garc[i];
                dbrc[i] += gbrc[i];
            }
            dacc += gacc;
            dasc += gasc;
            dbcc += gbcc;
            dbsc += gbsc;
        }
        deg.A = [darc, dacc, dasc];
        deg.B = [dbrc, dbcc, dbsc];
        deg.group = gtemp;
        dtemp.push(deg);
        for (let i = 0; i < 7; i++) {
            oarc[i] += darc[i];
            obrc[i] += dbrc[i];
        }
        oacc += dacc;
        oasc += dasc;
        obcc += dbcc;
        obsc += dbsc;
    }
    count.A = [oarc, oacc, oasc];
    count.B = [obrc, obcc, obsc];
    count.degree = dtemp;
    return count;
}

/**
 * cubehelix color
 * @param {number} c - maxh
 * @param {number} h - h
 * @param {number} s -
 * @param {number} l -
 * @param {number} o -
 * @return {color}
 */
function chcolor(c, h, s, l, o) {
    let parah = d3.scaleLinear().domain([0, c]).range([0, 360]);
    let paras = d3.scaleLinear().domain([0, 4]).range([0, 2]);
    let paral = d3.scaleLinear().domain([0, 3]).range([0, 1]);
    // console.log(parah(h), paras(s), paral(l));
    return d3.cubehelix(parah(h), paras(s), paral(l), o);
};

// https://github.com/wbkd/d3-extended
d3.selection.prototype.moveToFront = function () {
    return this.each(function () {
        this.parentNode.appendChild(this);
    });
};
d3.selection.prototype.moveToBack = function () {
    return this.each(function () {
        let firstChild = this.parentNode.firstChild;
        if (firstChild) {
            this.parentNode.insertBefore(this, firstChild);
        }
    });
};