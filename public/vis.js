console.log(data);
/*
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
inputs.push(big5dist(fbdata, normal));
inputs.push(propertydist(fbdata, normal));
tsne1.initDataDist(inputs[0]);
tsne2.initDataDist(inputs[1]);
let btn = document.querySelector('input[id="submit"]');
btn.addEventListener('click', function () {
    // console.log("on")
    submit(fbdata, tsne1, tsne2);
});
let ubtn = document.querySelector('input[id="update"]');
ubtn.addEventListener('click', function () {
    // console.log("on")
    for (let k = 0; k < iteration; k++) {
        // setInterval(function () {
        tsne1.step(); // every time you call this, solution gets better
        tsne2.step(); // every time you call this, solution gets better
        update(tsne1, tsne2, fbdata);
        // }, 1000);
    }
});
*/
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
        // console.log(temp[200])
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
    let Z = tsne2.getSolution();
    console.log(Y);
    // console.log(Z);
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
    };
    console.log('update');
    d3.select('.svg').select('.big5').remove();
    d3.select('.svg').select('.property').remove();
    drawbig5(Y, data, 500);
    drawproperty(Z, data, 500);
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
        .x((d) => x(d.BPLOT.x))
        .y((d) => y(d.BPLOT.y))
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
                const dx = x(d.BPLOT.x);
                const dy = y(d.BPLOT.y);
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
        radarchart('.radarChart', brushedNodes, radarChartOptions);
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
        .attr('cx', (d) => x(d.BPLOT.x))
        .attr('cy', (d) => y(d.BPLOT.y))
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
            tooltip1.html('ID=' + d.AUTHID + '<br/>' + 'sAGR=' + d.BIG5.sAGR + '<br/>' + 'sCON=' + d.BIG5.sCON + '<br/>' + 'sEXT=' + d.BIG5.sEXT + '<br/>' + 'sNEU=' + d.BIG5.sNEU + '<br/>' + 'sOPN=' + d.BIG5.sOPN)
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
    console.log('g');
}

/**
 * render property plot
 * @param {object} P
 * @param {object} data
 * @param {number} px - pixel
 */
function drawproperty(P, data, px) {
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

    let tooltip2 = d3.select('body').select('.b')
        // .attr('class', 'tooltip2')
        .style('opacity', 0);
    // .style("width","200px")
    // .style("height","30px");

    let graph = d3.select('.svg').append('div')
        .attr('class', 'property');
    swapcolor(data, graph, '#property', 'defult', '460px', '50px', 'defult');
    swapcolor(data, graph, '#property', 'BETWEENNESS', '500px', '50px', 'PROPERTY.BETWEENNESS');
    swapcolor(data, graph, '#property', 'BROKERAGE', '540px', '50px', 'PROPERTY.BROKERAGE');
    swapcolor(data, graph, '#property', 'DENSITY', '580px', '50px', 'PROPERTY.DENSITY');
    swapcolor(data, graph, '#property', 'NBETWEENNESS', '620px', '50px', 'PROPERTY.NBETWEENNESS');
    swapcolor(data, graph, '#property', 'NBROKERAGE', '660px', '50px', 'PROPERTY.NBROKERAGE');
    swapcolor(data, graph, '#property', 'NETWORKSIZE', '700px', '50px', 'PROPERTY.NETWORKSIZE');
    swapcolor(data, graph, '#property', 'TRANSITIVITY', '740px', '50px', 'PROPERTY.TRANSITIVITY');

    d3.select('.svg').select('#property').remove();

    let svg = d3.select('.svg').append('svg')
        .attr('id', 'property')
        .attr('width', width)
        .attr('height', height)
        .style('fill', 'none')
        .style('pointer-events', 'all')
        .call(d3.zoom()
            .scaleExtent([1 / 2, 4])
            .on('zoom', function () {
                g.attr('transform', d3.event.transform);
                let k = this.__zoom.k;
                g.selectAll('.circle').attr('r', 5 / k)
                    .attr('stroke-width', 1 / k);
            }));
    let g = svg.append('g')
        .attr('id', 'property');

    g.append('g').attr('class', 'circle').selectAll('circle').data(data).enter().append('circle')
        .attr('class', 'circle')
        .attr('cx', function (d) {
            return x(d.PPLOT.x);
        })
        .attr('cy', function (d) {
            return y(d.PPLOT.y);
        })
        .attr('r', 5)
        .style('fill', function (d) {
            // return color(d.BIG5.sEXT);
            // console.log("rgb("+d.BIG5.sEXT * 51+","+d.BIG5.sCON*51+","+d.BIG5.sAGR*51+")")
            return defultcolor('#property', d);
        })
        .on('mouseover', function (d) {
            d3.select('#big5').selectAll('circle')
                .style('fill', function (s) {
                    // console.log(d.AUTHID)
                    if (d.AUTHID === s.AUTHID) {
                        return 'black';
                    } else {
                        return defultcolor('#big5', s);
                    }
                });
            tooltip2.transition()
                .duration(200)
                .style('opacity', .9);
            tooltip2.html('ID=' + d.AUTHID + '<br/>' + 'BETWEENNESS=' + d.PROPERTY.BETWEENNESS + '<br/>' + 'BROKERAGE=' + d.PROPERTY.BROKERAGE + '<br/>' + 'DENSITY=' + d.PROPERTY.DENSITY + '<br/>' + 'NBETWEENNESS=' + d.PROPERTY.NBETWEENNESS + '<br/>' + 'NBROKERAGE=' + d.PROPERTY.NBROKERAGE + '<br/>' + 'NETWORKSIZE=' + d.PROPERTY.NETWORKSIZE + '<br/>' + 'TRANSITIVITY=' + d.PROPERTY.TRANSITIVITY)
                .style('left', (d3.event.pageX + 5) + 'px')
                .style('top', (d3.event.pageY - 30) + 'px');
        })
        .on('mouseout', function (d) {
            tooltip2.transition()
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
        return 'rgb(' + Math.round(d.BIG5.sEXT * 51) + ',' + Math.round(d.BIG5.sCON * 51) + ',' + Math.round(d.BIG5.sAGR * 51) + ')';
    }
}

/**
 * make radar chart
 * @param {string} id - select id
 * @param {object} data - input data
 * @param {object} option - chart options
 */
function radarchart(id, data, option) {
    let cfg = {
        w: 450, // Width of the circle
        h: 450, // Height of the circle
        margin: {
            top: 20,
            right: 20,
            bottom: 20,
            left: 20,
        }, // The margins of the SVG
        levels: 5, // How many levels or inner circles should there be drawn
        maxValue: 0, // What is the value that the biggest circle will represent
        labelFactor: 1.25, // How much farther than the radius of the outer circle should the labels be placed
        wrapWidth: 60, // The number of pixels after which a label needs to be given a new line
        opacityArea: 0, // The opacity of the area of the blob
        dotRadius: 4, // The size of the colored circles of each blog
        opacityCircles: 0.1, // The opacity of the circles of each blob
        strokeWidth: 2, // The width of the stroke around each blob
        roundStrokes: true, // If true the area and stroke will follow a round path (cardinal-closed)
        color: d3.interpolateRdBu, // Color function
    };
    // console.log(cfg.color);
    // Put all of the options into a letiable called cfg
    if ('undefined' !== typeof options) {
        for (let i in options) {
            if ('undefined' !== typeof options[i]) {
                cfg[i] = options[i];
            }
        } // for i
    } // if

    // If the supplied maxValue is smaller than the actual one, replace by the max in the data
    let maxValue = 5;
    // Math.max(cfg.maxValue, d3.max(data, minmax(d, 'Big5', ['sEXT', 'sNEU', 'sAGR', 'sCON', 'sOPN'])));

    let allAxis = ['sEXT', 'sNEU', 'sAGR', 'sCON', 'sOPN'];
    /* (data[0].map(function (i, j) {
        return i.axis;
    })); // Names of each axis */
    let total = allAxis.length; // The number of different axes
    let radius = Math.min(cfg.w / 2.5, cfg.h / 2.5); // Radius of the outermost circle
    let Format = d3.format(' '); // Percentage formatting
    let angleSlice = Math.PI * 2 / total; // The width in radians of each "slice"

    // Scale for the radius
    let rScale = d3.scaleLinear()
        .range([0, radius])
        .domain([0, maxValue]);

    // ///////////////////////////////////////////////////////
    // ////////// Create the container SVG and g /////////////
    // ///////////////////////////////////////////////////////

    // Remove whatever chart with the same id/class was present before
    d3.select(id).select('svg').remove();

    // Initiate the radar chart SVG
    let svg = d3.select(id).append('svg')
        .attr('width', cfg.w + cfg.margin.left + cfg.margin.right)
        .attr('height', cfg.h + cfg.margin.top + cfg.margin.bottom)
        .attr('class', 'radar' + id);
    // Append a g element
    let g = svg.append('g')
        .attr('transform', 'translate(' + (cfg.w / 2 + cfg.margin.left) + ',' + (cfg.h / 2 + cfg.margin.top) + ')');

    // ///////////////////////////////////////////////////////
    // //////// Glow filter for some extra pizzazz ///////////
    // ///////////////////////////////////////////////////////

    // Filter for the outside glow
    let filter = g.append('defs').append('filter').attr('id', 'glow');
    // let feGaussianBlur =
    filter.append('feGaussianBlur').attr('stdDeviation', '2.5').attr('result', 'coloredBlur');
    let feMerge = filter.append('feMerge');
    // let feMergeNode1 =
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    // let feMergeNode2 =
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    let indata = [];
    for (let i = 0; i < data.length; i++) {
        let temp = [];
        for (let j = 0; j < allAxis.length; j++) {
            let str = allAxis[j];
            temp.push(Number(data[i].BIG5[str]));
        }
        indata.push(temp);
    }
    // console.log(indata);

    // ///////////////////////////////////////////////////////
    // ///////////// Draw the Circular grid //////////////////
    // ///////////////////////////////////////////////////////

    // Wrapper for the grid & axes
    let axisGrid = g.append('g').attr('class', 'axisWrapper');

    // Draw the background circles
    axisGrid.selectAll('.levels')
        .data(d3.range(1, (cfg.levels + 1)).reverse())
        .enter()
        .append('circle')
        .attr('class', 'gridCircle')
        .attr('r', function (d, i) {
            return radius / cfg.levels * d;
        })
        .style('fill', '#CDCDCD')
        .style('stroke', '#CDCDCD')
        .style('fill-opacity', cfg.opacityCircles)
        .style('filter', 'url(#glow)');

    // Text indicating at what % each level is
    axisGrid.selectAll('.axisLabel')
        .data(d3.range(1, (cfg.levels + 1)).reverse())
        .enter().append('text')
        .attr('class', 'axisLabel')
        .attr('x', 4)
        .attr('y', function (d) {
            return -d * radius / cfg.levels;
        })
        .attr('dy', '0.4em')
        .style('font-size', '10px')
        .attr('fill', '#737373')
        .text(function (d, i) {
            return (maxValue * d / cfg.levels);
        });

    // ///////////////////////////////////////////////////////
    // ////////////////// Draw the axes //////////////////////
    // ///////////////////////////////////////////////////////

    // Create the straight lines radiating outward from the center
    let axis = axisGrid.selectAll('.axis')
        .data(allAxis)
        .enter()
        .append('g')
        .attr('class', 'axis');
    // Append the lines
    axis.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', function (d, i) {
            return rScale(maxValue * 1.1) * Math.cos(angleSlice * i - Math.PI / 2);
        })
        .attr('y2', function (d, i) {
            return rScale(maxValue * 1.1) * Math.sin(angleSlice * i - Math.PI / 2);
        })
        .attr('class', 'line')
        .style('stroke', 'white')
        .style('stroke-width', '2px');

    // Append the labels at each axis
    axis.append('text')
        .attr('class', 'legend')
        .style('font-size', '11px')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('x', function (d, i) {
            return rScale(maxValue * cfg.labelFactor) * Math.cos(angleSlice * i - Math.PI / 2);
        })
        .attr('y', function (d, i) {
            return rScale(maxValue * cfg.labelFactor) * Math.sin(angleSlice * i - Math.PI / 2);
        })
        .text(function (d) {
            return d;
        })
        .call(wrap, cfg.wrapWidth);

    // ///////////////////////////////////////////////////////
    // /////////// Draw the radar chart blobs ////////////////
    // ///////////////////////////////////////////////////////

    // The radial line function
    let radarLine = d3.radialLine()
        .curve(d3.curveBasisClosed)
        .radius(function (d, i) {
            return rScale(d);
        })
        .angle(function (d, i) {
            return i * angleSlice;
        });

    if (cfg.roundStrokes) {
        radarLine.curve(d3.curveCardinalClosed);
    }

    // Create a wrapper for the blobs
    let blobWrapper = g.selectAll('.radarWrapper')
        .data(indata)
        .enter().append('g')
        .attr('class', 'radarWrapper');

    // Append the backgrounds
    blobWrapper
        .append('path')
        .attr('class', 'radarArea')
        .attr('d', (d) => radarLine(d))
        .style('fill', function (d, i) {
            return cfg.color(i / indata.length);
        })
        .style('fill-opacity', cfg.opacityArea)
        .on('mouseover', function (d, i) {
            // Dim all blobs
            d3.selectAll('.radarArea')
                .transition().duration(200)
                .style('fill-opacity', 0.1);
            // Bring back the hovered over blob
            d3.select(this)
                .transition().duration(200)
                .style('fill-opacity', 0.7);
        })
        .on('mouseout', function () {
            // Bring back all blobs
            d3.selectAll('.radarArea')
                .transition().duration(200)
                .style('fill-opacity', cfg.opacityArea);
        });

    // Create the outlines
    blobWrapper.append('path')
        .attr('class', 'radarStroke')
        .attr('d', (d) => radarLine(d))
        .style('stroke-width', cfg.strokeWidth + 'px')
        .style('stroke', function (d, i) {
            return cfg.color(i / indata.length);
        })
        .style('fill', 'none')
        .style('filter', 'url(#glow)');

    // Append the circles
    blobWrapper.selectAll('.radarCircle')
        .data(function (d, i) {
            let key = i;
            d3.select(this).style('fill', function (d, i) {
                return cfg.color(key / indata.length);
            });
            return d;
        })
        .enter().append('circle')
        .attr('class', 'radarCircle')
        .attr('r', cfg.dotRadius * 0.75)
        .attr('cx', function (d, i) {
            return rScale(d) * Math.cos(angleSlice * i - Math.PI / 2);
        })
        .attr('cy', function (d, i) {
            return rScale(d) * Math.sin(angleSlice * i - Math.PI / 2);
        })
        .style('fill-opacity', 0.8);

    // ///////////////////////////////////////////////////////
    // ////// Append invisible circles for tooltip ///////////
    // ///////////////////////////////////////////////////////

    // Wrapper for the invisible circles on top
    let blobCircleWrapper = g.selectAll('.radarCircleWrapper')
        .data(indata)
        .enter().append('g')
        .attr('class', 'radarCircleWrapper');

    // Append a set of invisible circles on top for the mouseover pop-up
    blobCircleWrapper.selectAll('.radarInvisibleCircle')
        .data(function (d, i) {
            return d;
        })
        .enter().append('circle')
        .attr('class', 'radarInvisibleCircle')
        .attr('r', cfg.dotRadius * 1.5)
        .attr('cx', function (d, i) {
            return rScale(d) * Math.cos(angleSlice * i - Math.PI / 2);
        })
        .attr('cy', function (d, i) {
            return rScale(d) * Math.sin(angleSlice * i - Math.PI / 2);
        })
        .style('fill', 'none')
        .style('pointer-events', 'all')
        .on('mouseover', function (d, i) {
            newX = parseFloat(d3.select(this).attr('cx')) - 10;
            newY = parseFloat(d3.select(this).attr('cy')) - 10;

            tooltip
                .attr('x', newX)
                .attr('y', newY)
                .text(Format(d))
                .transition().duration(200)
                .style('opacity', 1);
        })
        .on('mouseout', function () {
            tooltip.transition().duration(200)
                .style('opacity', 0);
        });

    // Set up the small tooltip for when you hover over a circle
    let tooltip = g.append('text')
        .attr('class', 'tooltip')
        .style('opacity', 0);

    // ///////////////////////////////////////////////////////
    // ///////////////// Helper Function /////////////////////
    // ///////////////////////////////////////////////////////

    /**
     * Taken from http://bl.ocks.org/mbostock/7555321
     * Wraps SVG text
     * @param {*} text
     * @param {*} width
     */
    function wrap(text, width) {
        text.each(function () {
            let text = d3.select(this);
            let words = text.text().split(/\s+/).reverse();
            let word;
            let line = [];
            let lineNumber = 0;
            let lineHeight = 1.4; // ems
            let y = text.attr('y');
            let x = text.attr('x');
            let dy = parseFloat(text.attr('dy'));
            let tspan = text.text(null).append('tspan').attr('x', x).attr('y', y).attr('dy', dy + 'em');

            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(' '));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(' '));
                    line = [word];
                    tspan = text.append('tspan').attr('x', x).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word);
                }
            }
        });
    } // wrap
}