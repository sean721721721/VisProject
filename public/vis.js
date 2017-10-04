console.log(data);
let userlist = activitymatrix(data);
console.log(userlist);
for (let i = 0; i < data[1].length; i++) {
    if (!data[1][i].posts) {
        console.log(i);
    }
}

let epsilon = getparam('epsilon');
let perplexity = getparam('perplexity');
let dim = 2;
let iteration = getparam('iteration');
let normalized = document.getElementsByName('normalize');
// let normal = normalized[0].checked;
// console.log(normalized[0].checked);
let opt = {};
opt.epsilon = epsilon; // epsilon is learning rate (10 = default)
opt.perplexity = perplexity; // roughly how many neighbors each point influences (30 = default)
opt.dim = dim; // dimensionality of the embedding (2 = default)

let tsne1 = new tsnejs.tSNE(opt); // create a tSNE instance
let tsne2 = new tsnejs.tSNE(opt);
// initialize data. Here we have 3 points and some example pairwise dissimilarities
let inputs = [];
inputs.push(userdist(userlist, false));
// inputs.push(propertydist(fbdata, normal));
tsne1.initDataDist(inputs[0]);
tsne2.initDataDist(inputs[0]);
let init = false;
let width = document.querySelector('div.svg').offsetWidth;
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
});

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
let coreaction = document.getElementById('coreaction');
let coreaction = document.getElementById('coreaction');
let coreaction = document.getElementById('coreaction');
let coreaction = document.getElementById('coreaction');
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
            tooltip1.html('ID=' + d.id + '<br/>' + 'Name = ' + d.name + '<br/>' + 'Activities on A = ' + d.posts.A.length + '<br/>' + 'Activities on B = ' + d.posts.B.length)
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