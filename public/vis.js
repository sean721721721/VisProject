console.log(data);
let userlist = activitymatrix(data);
console.log(userlist);

let epsilon = getparam('epsilon');
let perplexity = getparam('perplexity');
let dim = 2;
let iteration = getparam('iteration');
let normalized = document.getElementsByName('normalize');
let normal = normalized[0].checked;
// console.log(normalized[0].checked);
let opt = {};
opt.epsilon = epsilon; // epsilon is learning rate (10 = default)
opt.perplexity = perplexity; // roughly how many neighbors each point influences (30 = default)
opt.dim = dim; // dimensionality of the embedding (2 = default)

let tsne1 = new tsnejs.tSNE(opt); // create a tSNE instance
let tsne2 = new tsnejs.tSNE(opt);
// initialize data. Here we have 3 points and some example pairwise dissimilarities
let inputs = [];
inputs.push(userdist(userlist, normal));
// inputs.push(propertydist(fbdata, normal));
tsne1.initDataDist(inputs[0]);
tsne2.initDataDist(inputs[0]);
let btn = document.querySelector('input[id="submit"]');
btn.addEventListener('click', function () {
    // console.log("on")
    submit(data[1], tsne1, tsne2);
});
let ubtn = document.querySelector('input[id="update"]');
ubtn.addEventListener('click', function () {
    // console.log("on")
    for (let k = 0; k < iteration; k++) {
        // setInterval(function () {
        tsne1.step(); // every time you call this, solution gets better
        tsne2.step(); // every time you call this, solution gets better
        update(tsne1, tsne2, data[1]);
        // }, 1000);
    }
});

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
 * get big5dist dists
 * @param {object} data - source data object
 * @param {bool} normal - normalize or not
 * @return {object} - array
 */

/**
 * get users dists
 * @param {object} data - source data object
 * @param {bool} normal - normalize or not
 * @return {object} - array
 */
function userdist(userlist, normal) {
    if (normal) {
        pointlist = normalize(userlist);
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

function big5dist(data, normal) {
    let checked = formchecked('Big5');
    let pointlist = [];
    for (let i = 0; i < data.length; i++) {
        let point = [];
        point.push(data[i].AUTHID);
        if (checked.sEXT) {
            point.push(data[i].BIG5.sEXT);
        }
        if (checked.sNEU) {
            point.push(data[i].BIG5.sNEU);
        }
        if (checked.sAGR) {
            point.push(data[i].BIG5.sAGR);
        }
        if (checked.sCON) {
            point.push(data[i].BIG5.sCON);
        }
        if (checked.sOPN) {
            point.push(data[i].BIG5.sOPN);
        }
        pointlist.push(point);
    }
    // console.log(pointlist)
    if (normal) {
        pointlist = normalize(pointlist);
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
 * get network properties dist
 * @param {object} data - source data object
 * @param {bool} normal - normalize or not
 * @return {object}
 */
function propertydist(data, normal) {
    let checked = formchecked('Property');
    let pointlist = [];
    for (let i = 0; i < data.length; i++) {
        let point = [];
        point.push(data[i].AUTHID);
        if (checked.BETWEENNESS) {
            point.push(data[i].PROPERTY.BETWEENNESS);
        }
        if (checked.BROKERAGE) {
            point.push(data[i].PROPERTY.BROKERAGE);
        }
        if (checked.DENSITY) {
            point.push(data[i].PROPERTY.DENSITY);
        }
        if (checked.NBETWEENNESS) {
            point.push(data[i].PROPERTY.NBETWEENNESS);
        }
        if (checked.NBROKERAGE) {
            point.push(data[i].PROPERTY.NBROKERAGE);
        }
        if (checked.NETWORKSIZE) {
            point.push(data[i].PROPERTY.NETWORKSIZE);
        }
        if (checked.TRANSITIVITY) {
            point.push(data[i].PROPERTY.TRANSITIVITY);
        }
        pointlist.push(point);
    }
    // console.log(pointlist)
    if (normal) {
        pointlist = normalize(pointlist);
    }
    let dists = initMat(pointlist.length);
    for (let i = 0; i < dists.length; i++) {
        for (let j = i + 1; j < dists.length; j++) {
            dists[i][j] = distance(pointlist[i], pointlist[j]);
            dists[j][i] = distance(pointlist[i], pointlist[j]);
        }
        // console.log(temp[200])
    }
    // console.log(dists);
    return dists;
}

/**
 * get scatterplot {x:,y:}
 * @param {number} epsilon
 * @param {number} perplexity
 * @param {number} dim
 * @param {number} iteration
 * @param {object} data
 * @return {object}
 */
function getplot(tsne1, tsne2, data) {
    // console.log(dists);
    update(tsne1, tsne2, data);
    // console.log(data);
    // return tsne.getSolution();
}

function update(tsne1, tsne2, data) {
    let Y = tsne1.getSolution();
    // let Z = tsne2.getSolution();
    console.log(Y);
    // console.log(Z);
    for (let i = 0; i < data.length; i++) {
        data[i]['PLOT'] = {
            x: Y[i][0],
            y: Y[i][1],
        };
    }
    /*
    for (let i = 0; i < data.length; i++) {
        data[i]['PPLOT'] = {
            x: Z[i][0],
            y: Z[i][1],
        };
    };*/
    console.log('update');
    d3.select('.svg').select('.big5').remove();
    // d3.select('.svg').select('.property').remove();
    drawbig5(Y, data, 500);
    // drawproperty(Z, data, 500);
}

/**
 * render big5 plot
 * @param {object} P
 * @param {object} data
 * @param {number} px - pixel
 */
function drawbig5(P, data, px) {
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

    let tooltip1 = d3.select('body').select('.a')
        // .attr('class', 'tooltip1')
        .style('opacity', 0);
    // .style("width","200px")
    // .style("height","30px");

    let zoom = d3.zoom()
        .scaleExtent([1 / 2, 4])
        .on('zoom', function () {
            g.attr('transform', d3.event.transform);
            let k = this.__zoom.k;
            g.selectAll('.circle').attr('r', 5 / k)
                .attr('stroke-width', 1 / k);
        });

    let brush = d3.brush()
        .extent([
            [0, 0],
            [width, height],
        ])
        .on('brush end', updateBrush);

    // generate a quadtree for faster lookups for brushing
    const quadtree = d3.quadtree()
        .x((d) => x(d.PLOT.x))
        .y((d) => y(d.PLOT.y))
        .addAll(data);

    /**
     * callback when the brush updates / ends
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
            // const brushedCircles = g.append('g').attr('class', 'circles-brushed');
            // overlap colored circles to indicate the highlighted ones in the chart
            // really slow
            /*
            let circle = g.selectAll('circle')._groups[0];
            for (let i = 0; i < circle.length; i++) {
                for (let j = 0; j < brushedNodes.length; j++) {
                    console.log(circle[i]['__data__']);
                    if (circle[i]['__data__'] === brushedNodes[j]) {
                        d3.select(circle[i]).style('fill', 'red');
                    }
                }
            }*/
            if (brushedNodes.lenght !== 0) {
                const circles = g.selectAll('circle'); // .data(brushedNodes);
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
                        d3.select(this).style('fill', defultcolor('#big5', d))
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
            const overlaps = rectIntersects(selection, [
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
                const d = node.data;
                const dx = x(d.PLOT.x);
                const dy = y(d.PLOT.y);
                if (rectContains(selection, [dx, dy])) {
                    brushedNodes.push(d);
                }
            }

            // return false so that we traverse into branch (only useful for non-leaf nodes)
            return false;
        });

        // update the highlighted brushed nodes
        highlightBrushed(brushedNodes);

        let margin = {
            top: 100,
            right: 100,
            bottom: 100,
            left: 100,
        };
        let width = Math.min(700, window.innerWidth - 10) - margin.left - margin.right;
        let height = Math.min(width, window.innerHeight - margin.top - margin.bottom - 20);
        let color = d3.scaleOrdinal(['#EDC951', '#CC333F', '#00A0B0']);

        let radarChartOptions = {
            'w': width,
            'h': height,
            'margin': margin,
            'maxValue': 0.5,
            'levels': 5,
            'roundStrokes': true,
            'color': color,
        };
        // Call function to draw the Radar chart
        // radarchart('.radarChart', brushedNodes, radarChartOptions);
    }

    let graph = d3.select('.svg').append('div')
        .attr('class', 'big5');
    swapcolor(data, graph, '#big5', 'defult', '220px', '50px', 'defult');
    swapcolor(data, graph, '#big5', 'sEXT', '260px', '50px', 'BIG5.sEXT');
    swapcolor(data, graph, '#big5', 'sNEU', '300px', '50px', 'BIG5.sNEU');
    swapcolor(data, graph, '#big5', 'sAGR', '340px', '50px', 'BIG5.sAGR');
    swapcolor(data, graph, '#big5', 'sCON', '380px', '50px', 'BIG5.sCON');
    swapcolor(data, graph, '#big5', 'sOPN', '420px', '50px', 'BIG5.sOPN');

    d3.select('.svg').select('#big5').remove();

    let svg = d3.select('.svg').append('svg')
        .attr('id', 'big5')
        .attr('width', width)
        .attr('height', height)
        .style('fill', 'none')
        .style('pointer-events', 'all')
        .call(zoom);

    let g = svg.append('g')
        .attr('id', 'big5');

    let gBrush = g.append('g')
        .attr('class', 'brush')
        .call(brush);

    // update the styling of the select box (typically done in CSS)
    gBrush.select('.selection')
        .style('stroke', 'skyblue')
        .style('stroke-opacity', 0.4)
        .style('fill', 'skyblue')
        .style('fill-opacity', 1);

    circles = g.append('g').attr('class', 'circle').selectAll('circle').data(data).enter().append('circle')
        .attr('class', 'circle')
        .attr('cx', (d) => x(d.PLOT.x))
        .attr('cy', (d) => y(d.PLOT.y))
        .attr('r', 5)
        .style('fill', function (d) {
            // return color(d.BIG5.sEXT);
            // console.log("rgb("+d.BIG5.sEXT * 51+","+d.BIG5.sCON*51+","+d.BIG5.sAGR*51+")")
            return defultcolor('#big5', d);
        })
        .on('mouseover', function (d) {
            d3.select('#property').selectAll('circle')
                .style('fill', function (s) {
                    // console.log(d.AUTHID)
                    if (d.AUTHID === s.AUTHID) {
                        return 'black';
                    } else {
                        return defultcolor('#property', s);
                    }
                });
            tooltip1.transition()
                .duration(200)
                .style('opacity', .9);
            tooltip1.html('ID=' + d.id + '<br/>' + 'Name=' + d.name + '<br/>' + 'Activities on A=' + d.posts.A.length + '<br/>' + 'Activities on B=' + d.posts.B.length)
                .style('left', (d3.event.pageX + 5) + 'px')
                .style('top', (d3.event.pageY - 30) + 'px');
        })
        .on('mouseout', function (d) {
            tooltip1.transition()
                .duration(500)
                .style('opacity', 0);
        })
        .on('click', function (d) {
            status(d);
        });
}

/**
 * make status table
 * @param {object} point - user point object
 */
function status(point) {
    let table = '<table><tbody>';
    table += '<tr>' +
        '<th width="6%">#</th>' +
        '<th width="90%">Status</th>' +
        '</tr>';
    for (let i = 0; i < point.STATUS.length; i++) {
        let s = '<tr>' +
            '<th>' + (i + 1) + '</th>' +
            '<td>' + point.STATUS[i] + '</td>' +
            '</tr>';
        table += s;
    }
    table += '</tbody></table>';
    let div = document.getElementById('table');
    // console.log(div);
    let index = div.innerHTML.indexOf('<table');
    div.innerHTML = div.innerHTML.slice(0, index);
    div.innerHTML += table;
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
 * sumit option and render
 * @param {object} data - source data
 */
function submit(data, tsne1, tsne2) {
    getplot(tsne1, tsne2, data);
    // let Y = getplot(epsilon, perplexity, dim, iteration, big5dist(data, normal));
    // let Z = getplot(epsilon, perplexity, dim, iteration, propertydist(data, normal));
    // console.log(Y);
    /*
    for (let i = 0; i < data.length; i++) {
        data[i]['BPLOT'] = {
            x: Y[i][0],
            y: Y[i][1],
        };
    }
    for (let i = 0; i < data.length; i++) {
        data[i]['PPLOT'] = {
            x: Z[i][0],
            y: Z[i][1],
        };
    }
    console.log(data);
    d3.select('.svg').selectAll('div').remove();
    drawbig5(Y, data, 500);
    drawproperty(Z, data, 500);
    */
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
            d3.select(id).selectAll('circle')
                .style('fill', function (d) {
                    if (attribute === 'defult') {
                        return defultcolor(id, d);
                    } else {
                        let domain = attrdomain(data, attribute);
                        return colorscale(domain, setDescendantProp(d, attribute));
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
    while (arr.length > 1) {
        obj = obj[arr.shift()];
    }
    return obj[arr[0]];
}

/**
 * get array domain
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
 * @return {number}
 */
function colorscale(domain, value) {
    let color = d3.scaleLinear()
        .domain([domain.min, domain.max])
        .range(['lightgrey', 'black']);
    return color(value);
}

/**
 * set defultcolor
 * @param {string} id
 * @param {object} d
 * @return {color}
 */
function defultcolor(id, d) {
    if (id === '#property') {
        return 'rgb(' + Math.round(d.PROPERTY.NBETWEENNESS) + ',' + Math.round(d.PROPERTY.NETWORKSIZE * 0.1) + ',' + Math.round(d.PROPERTY.TRANSITIVITY * 500) + ')';
    }
    if (id === '#big5') {
        return 'rgb(' + Math.round(51) + ',' + Math.round(51) + ',' + Math.round(51) + ')';
    }
}