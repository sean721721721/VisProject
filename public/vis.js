/**
 * visualization main
 * @param {object} data - inputdata from fetch
 */
function visMain(data) {
    let select = {};
    select.post = [];
    select.user = [];
    select.ci = {
        'post': 0,
        'user': 0,
    };
    select.actpost = [
        [],
        [],
    ];
    select.actuser = [];
    userview(data, select);
    overview(data, select);
    // data manipulate
    let pd = pagedata(data);
    pageview(data, pd, select);
}

/**
 * overview
 * @param {object} data - inputdata
 * @param {object} select - select
 */
function overview(data, select) {
    // data manipulate
    let ov = countactivities(data.data, select);
    let ptt = data.query.posttype === 'PTT';
    // console.log(data);
    // postcount
    // usercount
    let oarc = [];
    let obrc = [];
    let orc = [];
    for (let i = 0; i < 7; i++) {
        let ova = ov.O.A[0][i] + ov.A.A[0][i] + ov.B.A[0][i];
        let ovb = ov.O.B[0][i] + ov.A.B[0][i] + ov.B.B[0][i];
        oarc.push(ova);
        obrc.push(ovb);
        orc.push(ova + ovb);
    }
    let allpostcount = data.summary[0][0] + data.summary[0][1];
    let ca = ov.O.A[1] + ov.A.A[1] + ov.B.A[1];
    let cb = ov.O.B[1] + ov.A.B[1] + ov.B.B[1];
    let sa = ov.O.A[2] + ov.A.A[2] + ov.B.A[2];
    let sb = ov.O.B[2] + ov.A.B[2] + ov.B.B[2];
    let ovdata;
    let axis;
    if (ptt) {
        ovdata = [
            ['post', data.summary[0][0], data.summary[0][1], allpostcount], // postcount
            ['user', data.summary[1][0], data.summary[1][1], data.summary[1][2]], // usercount
            ['messages', ca, cb, ca + cb], // messagecount
            ['posts', sa, sb, sa + sb], // postcount
        ];
        axis = ['post', 'user', 'message', 'post', 'count', 'push', 'neutral', 'boo'];
    } else {
        ovdata = [
            ['post', data.summary[0][0], data.summary[0][1], allpostcount], // postcount
            ['user', data.summary[1][0], data.summary[1][1], data.summary[1][2]], // usercount
            ['comment', ca, cb, ca + cb], // commentcount
            ['share', sa, sb, sa + sb], // sharecount
        ];
        axis = ['post', 'user', 'comment', 'share', 'reaction', 'like', 'love', 'haha', 'wow', 'sad', 'angry'];
    }

    let loop = axis.length - 4;
    for (let i = 0; i < loop; i++) {
        let j = i + 4;
        ovdata.push([axis[j], oarc[i], obrc[i], orc[i]]); // reactioncount
    }
    console.log('ovdata', ovdata);

    if (d3.select('#over').select('#barchart')._groups[0][0] !== undefined) {
        d3.select('#over').select('#barchart')._groups[0][0].remove();
    }

    // graph draw
    // let width = document.querySelector('#over').offsetWidth;
    let width = '100%';
    let height = '100%';
    let margin = {
        top: 80,
        right: 80,
        bottom: 30,
        left: 80,
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
        .attr('id', 'barchart')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', '0 0 500 400')
        .attr('preserveAspectRatio', 'xMinYMin')
        .style('fill', 'none')
        .style('pointer-events', 'all');
    // .call(zoom);

    let w = 500 - margin.left - margin.right;
    let h = 400 - margin.top - margin.bottom;
    let wx = w / ovdata.length;
    let hy = h / ovdata.length;

    let axisname = ovdata.map((d) => {
        return d[0];
    });

    let axissum = ovdata.map((d) => {
        return d[3];
    });

    console.log(axissum);

    let y = d3.scaleBand()
        .domain(axisname)
        .rangeRound([0, h]);
    // .padding(0.1)

    let x = d3.scaleLinear()
        .domain([0, 1])
        .range([0, w]);

    let g = svg.append('g')
        .attr('id', 'over')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    let tooltip2 = d3.select('body').select('.b');

    let ypadding = 2;
    const colorA = d3.interpolateRdBu;
    let rectA = g.selectAll('g')
        .append('g')
        .data(ovdata)
        .enter().append('rect')
        .attr('class', 'A')
        .attr('data-legend', function (d) {
            return `${data.query.page1} from ${data.query.time1} to ${data.query.time2}`;
        })
        .attr('data-legend-color', function (d) {
            return colorA(0.75);
        })
        .attr('fill', (d, i) => {
            let diff = getBaseLog(10, d[1]) > 5 ? 5 : getBaseLog(10, d[1]);
            let cvalue = 0.5 - (diff / 10);
            return colorA(cvalue);
        })
        .attr('stroke', 'white 5px')
        .attr('width', (d, i) => {
            if (d[3] === 0) {
                return 0;
            } else {
                let wa = (d[1] / d[3]) * w;
                if (i === 1) {
                    ratio = d[1] / (2 * d[1] + 2 * d[2] - d[3]);
                    return w * ratio;
                } else {
                    return wa;
                }
            }
        })
        .attr('height', hy - 2 * ypadding)
        .attr('x', 0)
        .attr('y', (d, i) => {
            return i * hy + ypadding;
        })
        .on('mouseover', function (d, i) {
            d3.event.preventDefault();
            tooltip2.transition()
                .duration(200)
                .style('opacity', .9);
            tooltip2.html('Page= ' + data.query.page1 + '<br/>' +
                    'Activities Type = ' + axis[i] + '<br/>' +
                    'Activities Count = ' + d[1] + '<br/>' +
                    'Activities % = ' + d[1] / d[3] * 100 + '%')
                .style('left', (d3.event.pageX + 5) + 'px')
                .style('top', (d3.event.pageY - 30) + 'px');
        })
        .on('mouseout', function (d) {
            d3.event.preventDefault();
            tooltip2.transition()
                .duration(500)
                .style('opacity', 0);
        });

    const colorB = d3.interpolateRdBu;
    let rectB = g.selectAll('g')
        .append('g')
        .data(ovdata)
        .enter().append('rect')
        .attr('class', 'B')
        .attr('data-legend', function (d) {
            return `${data.query.page2} from ${data.query.time3} to ${data.query.time4}`;
        })
        .attr('data-legend-color', function (d) {
            return colorB(0.25);
        })
        .attr('fill', (d, i) => {
            let diff = getBaseLog(10, d[2]) > 5 ? 5 : getBaseLog(10, d[2]);
            let cvalue = diff / 10 + 0.5;
            return colorB(cvalue);
        })
        .attr('stroke', 'white 5px')
        .attr('width', (d, i) => {
            if (d[3] === 0) {
                return 0;
            } else {
                let wb = (d[2] / d[3]) * w;
                if (i === 1) {
                    let ratio = d[2] / (2 * d[1] + 2 * d[2] - d[3]);
                    return w * ratio;
                } else {
                    return wb;
                }
            }
        })
        .attr('height', hy - 2 * ypadding)
        .attr('x', (d, i) => {
            if (d[3] === 0) {
                return 0;
            } else {
                if (i === 1) {
                    let ratio = (2 * d[1] + d[2] - d[3]) / (2 * d[1] + 2 * d[2] - d[3]);
                    return w * ratio;
                } else {
                    return (d[1] / d[3]) * w;
                }
            }
        })
        .attr('y', (d, i) => {
            return i * hy + ypadding;
        }).on('mouseover', function (d, i) {
            d3.event.preventDefault();
            tooltip2.transition()
                .duration(200)
                .style('opacity', .9);
            tooltip2.html('Page= ' + data.query.page2 + '<br/>' +
                    'Activities Type = ' + axis[i] + '<br/>' +
                    'Activities Count = ' + d[2] + '<br/>' +
                    'Activities % = ' + d[2] / d[3] * 100 + '%')
                .style('left', (d3.event.pageX + 5) + 'px')
                .style('top', (d3.event.pageY - 30) + 'px');
        })
        .on('mouseout', function (d) {
            d3.event.preventDefault();
            tooltip2.transition()
                .duration(500)
                .style('opacity', 0);
        });

    const colorC = d3.interpolateGreens;
    let rectC = g.selectAll('g')
        .append('g')
        .data(ovdata)
        .enter().append('rect')
        .attr('class', 'C')
        .attr('data-legend', function (d) {
            return `${data.query.page1} & ${data.query.page2} 's overlaps`;
        })
        .attr('data-legend-color', function (d) {
            return colorC(0.75);
        })
        .attr('fill', (d, i) => {
            if (i === 1) {
                let diff = getBaseLog(10, d[1] + d[2] - d[3]) > 5 ? 5 : getBaseLog(10, d[1] + d[2] - d[3]);
                let cvalue = diff / 10 + 0.5;
                return colorC(cvalue);
            } else {
                return colorC(0.75);
            }
        })
        .attr('stroke', 'white 5px')
        .attr('width', (d, i) => {
            if (i === 1) {
                let ratio = (d[1] + d[2] - d[3]) / (2 * d[1] + 2 * d[2] - d[3]);
                if (d[3] === 0) {
                    return 0;
                } else {
                    return w * ratio;
                }
            }
        })
        .attr('height', hy - 2 * ypadding)
        .attr('x', (d, i) => {
            if (i === 1) {
                let ratio = (d[1]) / (2 * d[1] + 2 * d[2] - d[3]);
                if (d[3] === 0) {
                    return 0;
                } else {
                    return w * ratio;
                }
            }
        })
        .attr('y', (d, i) => {
            if (i === 1) {
                return i * hy + ypadding;
            }
        }).on('mouseover', function (d, i) {
            if (i === 1) {
                d3.event.preventDefault();
                tooltip2.transition()
                    .duration(200)
                    .style('opacity', .9);
                tooltip2.html('Page= ' + data.query.page1 + '&' + data.query.page2 + '<br/>' +
                        'Activities Type = ' + 'overlap ' + axis[i] + '<br/>' +
                        'Activities Count = ' + (d[1] + d[2] - d[3]) + '<br/>' +
                        'Activities % = ' + (d[1] + d[2] - d[3]) / d[3] * 100 + '%')
                    .style('left', (d3.event.pageX + 5) + 'px')
                    .style('top', (d3.event.pageY - 30) + 'px');
            }
        })
        .on('mouseout', function (d) {
            d3.event.preventDefault();
            tooltip2.transition()
                .duration(500)
                .style('opacity', 0);
        });

    let numarray = [];
    for (let i = 0, l = ovdata.length; i < l; i++) {
        numarray.push(ovdata[i][3]);
    }
    let offset = numoffset(numarray);
    // console.log(offset);

    let xvalue = g.selectAll('g')
        .append('g')
        .data(ovdata).enter()
        .append('text')
        .attr('size', 16)
        .attr('x', w + 16)
        .attr('y', (d, i) => {
            return i * hy + 16;
        })
        .text((d) => {
            // return d[3];
            return numalign(d[3], offset);
        })
        .attr('fill', '#000');

    let xaxis = g.append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', 'translate(' + '0' + ',0)')
        .call(d3.axisLeft(y));

    let yaxis = g.append('g')
        .attr('class', 'axis axis--y')
        .attr('transform', 'translate(0,' + h + ')')
        .call(d3.axisBottom(x).ticks(10, '%'));

    for (let i = 1; i < 10; i++) {
        g.append('line')
            .attr('class', 'line')
            .attr('x1', x(i / 10))
            .attr('y1', -10)
            .attr('x2', x(i / 10))
            .attr('y2', h + 10)
            .attr('stroke', 'white');
    }

    let legend = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', 'translate(60,30)')
        .style('font-size', '20px')
        .attr('textcolor', 'black')
        .call(d3.legend);

    /* let line = g.append('line')
        .attr('class', 'line')
        .attr('x1', x(0.5))
        .attr('y1', -10)
        .attr('x2', x(0.5))
        .attr('y2', h + 10)
        .attr('stroke', 'lightblue');*/
}

/**
 * show select elements
 * @param {object} data -
 * @param {object} select -
 */
function showselect(data, select) {
    let ptt = data.query.posttype === 'PTT';
    /*let poststr = '';
    let userstr = '';
    for (let i = 0, l = select.post.length; i < l; i++) {
        // poststr += '_';
        poststr += (select.post[i].page + '_' + select.post[i].post);
        poststr += i < l ? ', ' : '';
    }
    for (let i = 0, l = select.user.length; i < l; i++) {
        // userstr += '_';
        if (ptt) {
            userstr += select.user[i].id;
        } else {
            userstr += select.user[i].name;
        }
        userstr += i < l ? ', ' : '';
    }*/
    let sdiv = document.getElementById('select');
    /*sdiv.innerHTML = '';
    sdiv.innerHTML += '<h1>posts: ' + poststr + '</h1>';
    sdiv.innerHTML += '<h1>users: ' + userstr + '</h1>';
    console.log(poststr, userstr);*/
    let color = d3.scaleQuantize()
        .domain([0, 10])
        .range(['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee08b',
            '#ffffbf', '#d9ef8b', '#a6d96a', '#66bd63', '#1a9850', '#006837',
        ]);
    sdiv = d3.select('#select');
    console.log(sdiv);
    let userdiv = sdiv.selectAll('.showuser').data(select.user);
    userdiv.exit().remove();
    userdiv.enter().append('button').merge(userdiv)
        .attr('class', 'showuser').text(function (d) {
            if (ptt) {
                return d.id;
            } else {
                return d.name;
            }
        })
        .on('click', function (d) {
            d3.event.preventDefault();
            let preselect = {};
            let user = [];
            let actpost = [
                [],
                [],
            ];
            for (let i = 0, l = select.user.length; i < l; i++) {
                user.push(select.user[i]);
            }
            for (let i = 0, l = select.actpost.length; i < l; i++) {
                for (let j = 0, l = select.actpost[i].length; j < l; j++) {
                    let post = select.actpost[i][j];
                    actpost[i].push(post);
                }
            }
            preselect.user = user;
            preselect.actpost = actpost;
            let selectobj = d;
            for (let i = 0, l = select.user.length; i < l;) {
                if (select.user[i].id === selectobj.id) {
                    select.user.splice(i, 1);
                    select.ci.user = i - 1 > 0 ? i - 1 : 0;
                    i = l + 1;
                } else {
                    i++;
                }
                if (i === l) {
                    select.user.push(selectobj);
                    select.ci.user = l;
                }
            }
            console.log(select.user);
            // user color update
            let bug = d3.selectAll('.user');
            console.log(bug);
            bug.attr('fill', (d) => {
                console.log(d);
                let rcolor;
                if (ptt) {
                    rcolor = color(Math.sqrt(d.posts.A.length));
                } else {
                    rcolor = color(Math.sqrt(d.posts.A.length));
                }
                for (let i = 0, l = select.user.length; i < l; i++) {
                    if (d.id === select.user[i].id) {
                        rcolor = '#000';
                    }
                }
                return rcolor;
            });
            // activepost(data, preselect, select);
            select.actpost = activepost(data, preselect, select, 'intersection');
            userdetailview(data, select);
            overview(data, select);
            showselect(data, select);
        });
    // document.querySelector('.showuser').onclick = function () {};
    let postdiv = sdiv.selectAll('.showpost').data(select.post);
    postdiv.exit().remove();
    postdiv.enter().append('button').merge(postdiv)
        .attr('class', 'showpost').text(function (d) {
            return `${d.page}_${d.post}`;
        })
        .on('click', function (d) {
            d3.event.preventDefault();
            console.log('click', d);
            let pagenum = d.page === data.query.page1 ? 1 : 2;
            let postnum = d.post.match(/\d{1,}/)[0];
            selectivepost(pagenum, postnum);
            let preselect = {};
            let post = [];
            let actuser = [];
            for (let i = 0, l = select.post.length; i < l; i++) {
                post.push(select.post[i]);
            }
            for (let i = 0, l = select.actuser.length; i < l; i++) {
                let user = select.actuser[i];
                actuser.push(user);
            }
            preselect.post = post;
            preselect.actuser = actuser;
            // select postobj manipulate
            let selectobj = {};
            selectobj.page = d.page;
            selectobj.post = d.post;
            for (let i = 0, l = select.post.length; i < l;) {
                if (select.post[i].page === selectobj.page && select.post[i].post === selectobj.post) {
                    select.post.splice(i, 1);
                    select.ci.post = i - 1 > 0 ? i - 1 : 0;
                    i = l + 1;
                } else {
                    i++;
                }
                if (i === l) {
                    select.post.push(selectobj);
                    select.ci.post = l;
                }
            }
            console.log(select);
            postdetailview(data, select);
            showselect(data, select);
            let mode = 'intersection';
            select.actuser = activeuser(data, preselect, select, mode);
        });
}

/**
 * pageview
 * @param {object} data - inputdata
 * @param {object} pagedata - pagedata
 * @param {array} select - record selectpost and ci
 */
function pageview(data, pagedata, select) {
    // graph draw
    // let width = document.querySelector('#page').offsetWidth;
    let ptt = data.query.posttype === 'PTT';
    let height = '100%';
    let width = height;
    let w = 500;
    let h = 500;
    let radius = Math.min(w, h) / 2;
    let n = 100;
    // let wx = w / ovdata.length;

    d3.selectAll('input')
        .on('change', changed);

    let timeout = d3.timeout(function () {
        d3.select('input[value=\"sunburst\"]')
            .property('checked', true)
            .dispatch('change');
    }, 0);

    function changed() {
        if (d3.select('#page').select('svg')._groups[0][0] !== undefined) {
            d3.select('#page').select('svg')._groups[0][0].remove();
        }

        let svg = d3.select('#page')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', '0 0 500 500')
            .attr('preserveAspectRatio', 'xMinYMin')
            .style('fill', 'none')
            .style('pointer-events', 'all');

        let g = svg.append('g')
            .attr('id', 'pagepmap');

        let mode = document.querySelector('input[name="mode"]:checked').value;
        let sorting = document.querySelector('input[name="sort"]:checked').value;

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
            .sum(sumBySize);

        console.log('change mode', mode, sorting, root);

        if (mode === 'sunburst') {
            if (sorting === 'time') {
                drawsb(g, root.sort(sortByTime));
            } else if (sorting === 'size') {
                drawsb(g, root.sort(sortBySize));
            }
        } else if (mode === 'treemap') {
            drawtm(g, root.sort(sortBySize));
        }
    }

    function drawsb(g, root) {
        let totalSize = 0;
        g.attr('transform', 'translate(' + w / 2 + ',' + h / 2 + ')');

        let partition = d3.partition()
            .size([2 * Math.PI, radius * radius]);

        partition(root);

        let arc = d3.arc()
            .startAngle(function (d) {
                return d.x0;
            })
            .endAngle(function (d) {
                return d.x1;
            })
            .innerRadius(function (d) {
                return Math.sqrt(d.y0);
            })
            .outerRadius(function (d) {
                return Math.sqrt(d.y1);
            });

        let nodes = g.selectAll('path')
            .data(root.descendants())
            .enter().append('path')
            .attr('display', function (d) {
                return d.depth ? null : 'none';
            })
            .attr('d', arc)
            .attr('class', (d) => {
                return 'page' + d.data.page + ' p' + d.data.post + ' depth' + d.depth;
            })
            .attr('id', function (d) {
                return d.data.id;
            })
            .attr('stroke', '#fff')
            .attr('stroke-width', 0.5)
            .attr('fill', function (d) {
                return chcolor(n, d.data.post[0], d.data.type, d.data.page, 0.5);
            })
            .on('mouseover', (d) => {
                mouseover(d, totalSize);
            })
            .on('click', (d) => {
                click(d);
            });

        totalSize = nodes.datum().value;

        let text = g.append('text')
            .style('visibility', 'hidden')
            .style('text-anchor', 'middle')
            .attr('id', 'info');
        text.append('tspan')
            .attr('id', 'id');
        text.append('tspan')
            .attr('id', 'percentage');
        console.log(text);
    }

    function drawtm(g, root) {
        let zoom = d3.zoom()
            .scaleExtent([1, 5])
            .on('zoom', function () {
                g.attr('transform', d3.event.transform);
                let k = this.__zoom.k;
                g.attr('r', 5 / k)
                    .attr('stroke-width', 1 / k);
            });

        g.call(zoom);

        let format = d3.format(',d');

        let treemap = d3.treemap()
            .tile(d3.treemapSquarify)
            .size([w, h])
            .round(false)
            .paddingInner(1);
        // .paddingOuter(1);

        let focus = root;
        let view;

        treemap(root);

        let cell = g.selectAll('g')
            .data(root.descendants())
            .enter().append('g')
            .attr('class', (d) => {
                return 'page' + d.data.page + ' p' + d.data.post + ' depth' + d.depth;
            })
            .attr('transform', function (d) {
                return 'translate(' + d.x0 + ',' + d.y0 + ')';
            });

        let rect = cell.append('rect')
            // .data(root.leaves())
            .datum(function (d) {
                d.width = d.x1 - d.x0;
                d.height = d.y1 - d.y0;
                // console.log(d);
                return d;
            })
            .attr('id', function (d) {
                return d.data.id;
            })
            .attr('width', (d) => d.width)
            .attr('height', (d) => d.height)
            .attr('stroke', (d) => {
                if (d.depth >= 2) {
                    return '#000';
                }
            })
            .attr('stroke-dasharray', (d) => {
                if (d.depth > 2) {
                    return 1, 1;
                }
            }).attr('fill', function (d) {
                if (d === d.leaves()[0]) {
                    return chcolor(n, d.data.post[0], d.data.type, d.data.page, 0.5);
                } else {
                    return null;
                }
            })
            .on('click', (d) => {
                click(d);
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
                // console.log(d, arr);
                if (ptt) {
                    d.text = d.depth === 4 && d.data.name === 'push' ? arr[2] : '';
                } else {
                    d.text = d.depth === 4 && d.data.name === 'like' ? arr[2] : '';
                }
                // console.log(d);
                return d;
            })
            /* .selectAll('tspan')*/
            /* .data(function (d) {
                // return d.data.name.split(/(?=[A-Z][^A-Z])/g);
                console.log(d);
                let arr = d.data.id.split('.');
                // console.log(d, arr);
                return d.depth === 4 && d.data.name === 'like' ? arr[2] : '';
            })*/
            /* .enter().append('tspan')*/
            .text(function (d) {
                return d.text;
                // return d;
            })
            .attr('font-size', (d) => {
                return d.size;
            })
            .attr('x', (d, i) => {
                return d.size / 5;
                // return 9 * i + 4;
            })
            .attr('y', function (d, i) {
                return d.size;
                // return 13 + i * 10;
            })
            .attr('fill', '#000');

        /* rect.selectAll('.depth2')
            .moveToFront();*/

        cell.append('title')
            .text(function (d) {
                return d.data.id + '\n' + format(d.value);
            });

        // console.log('root', root);
        // zoomTo([root.x0, root.y0, getr(root)]);
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

        /* function zoom(d) {
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
        }*/
    }

    function mouseover(d, totalSize) {
        // console.log(d);
        let id = d.data.id;
        let percentage = (100 * d.value / totalSize).toPrecision(3);
        let string = percentage + '%';
        if (percentage < 0.01) {
            string = '< 0.01%';
        }
        d3.select('#info').style('visibility', '');
        d3.select('#percentage')
            .attr('x', 0)
            .attr('y', 0)
            .attr('fill', 'red')
            .text(string);

        d3.select('#id')
            .attr('x', 0)
            .attr('y', 20)
            .attr('fill', 'red')
            .text((d) => {
                return id;
            });
    }

    function click(d) {
        d3.event.preventDefault();
        console.log('click', d);
        selectivepost(d.data.page, d.data.post);
        let pagedata = data.data[0];
        // d.data.id.split('.');
        // create preselect obj
        let preselect = {};
        let post = [];
        let actuser = [];
        for (let i = 0, l = select.post.length; i < l; i++) {
            post.push(select.post[i]);
        }
        for (let i = 0, l = select.actuser.length; i < l; i++) {
            let user = select.actuser[i];
            actuser.push(user);
        }
        preselect.post = post;
        preselect.actuser = actuser;
        // select postobj manipulate
        let selectobj = {};
        let idarray = d.data.id.split('.');
        selectobj.page = idarray[1];
        selectobj.post = idarray[2];
        if (select.post.length !== 0) {
            for (let i = 0, l = select.post.length; i < l;) {
                if (select.post[i].page === selectobj.page && select.post[i].post === selectobj.post) {
                    select.post.splice(i, 1);
                    select.ci.post = i - 1 > 0 ? i - 1 : 0;
                    i = l + 1;
                } else {
                    i++;
                }
                if (i === l) {
                    select.post.push(selectobj);
                    select.ci.post = l;
                }
            }
        } else {
            select.post.push(selectobj);
        }
        console.log(select);
        postdetailview(data, select);
        showselect(data, select);
        let mode = 'intersection';
        select.actuser = activeuser(data, preselect, select, mode);
        // detailview(data, d.data.id.split('.'));
        /* if (focus !== d) zoom(d);
        else zoom(root);*/
        // console.log(s._groups);
    }

    function getr(d) {
        let focus = d;
        let x = focus.x1 - focus.x0;
        let y = focus.y1 - focus.y0;
        let r = Math.sqrt(x * y);
        return r;
    }

    function sumBySize(d) {
        return d.size;
    }

    function sortByTime(d) {
        return d;
    }

    function sortBySize(a, b) {
        return b.height - a.height || b.value - a.value;
    }
}

/**
 * adjust overlap data by mode
 * @param {object} overlap -
 * @param {string} mode -
 * @return {object}
 */
function showmodes(overlap, mode) {
    let show = [];

    switch (mode) {
        case 'push':
            makeshow('pushing.length');
            return show;
            break;
        case 'neutral':
            makeshow('neutral.length');
            return show;
            break;
        case 'boo':
            makeshow('boo.length');
            return show;
            break;
        case 'reaction':
            makeshow('reaction');
            return show;
            break;
        case 'comment':
            makeshow('comment');
            return show;
            break;
        case 'share':
            makeshow('share');
            return show;
            break;
        default:
            return overlap;
    }

    function makeshow(propname) {
        for (let i = 0, l = overlap.length; i < l; i++) { // degree
            if (overlap[i].length > 0) {
                let degree = [];
                let find = false;
                for (let j = 0, l = overlap[i].length; j < l; j++) { // group
                    let group = [];
                    for (let k = 0, gl = overlap[i][j].length; k < gl; k++) { // user
                        let user = overlap[i][j][k];
                        // console.log(user);
                        for (let a = 0, al = user.posts.A.length; a < al; a++) {
                            if (getProperty(propname, user.posts.A[a]) !== 0) {
                                find = true;
                                a = al;
                            }
                        }
                        if (!find) {
                            for (let b = 0, bl = user.posts.B.length; b < bl; b++) {
                                if (getProperty(propname, user.posts.B[b]) !== 0) {
                                    find = true;
                                    b = bl;
                                }
                            }
                        }
                        if (find) {
                            group.push(user);
                        }
                    }
                    if (group.length != 0) {
                        degree.push(group);
                    }
                }
                if (degree.length != 0) {
                    show.push(degree);
                }
            }
        }
    }
}

/**
 * showcomments in detail
 * @param {object} data - inputdata
 * @param {object} select - selectobj
 */
function userview(data, select) {
    let ptt = data.query.posttype === 'PTT';
    document.querySelector('#olbutton').innerHTML = '';
    let div = d3.select('#olbutton');
    div.append('button').attr('class', 'overlap default').text('default');
    overlapvis(data, select, 'default');
    if (ptt) {
        div.append('button').attr('class', 'overlap push').text('push');
        div.append('button').attr('class', 'overlap neutral').text('neutral');
        div.append('button').attr('class', 'overlap boo').text('boo');
        document.querySelector('.overlap.default').onclick = function () {
            overlapvis(data, select, 'default');
        };
        document.querySelector('.overlap.push').onclick = function () {
            overlapvis(data, select, 'push');
        };
        document.querySelector('.overlap.neutral').onclick = function () {
            overlapvis(data, select, 'neutral');
        };
        document.querySelector('.overlap.boo').onclick = function () {
            overlapvis(data, select, 'boo');
        };
    } else {
        div.append('button').attr('class', 'overlap reaction').text('reaction');
        div.append('button').attr('class', 'overlap comment').text('comment');
        div.append('button').attr('class', 'overlap share').text('share');
        document.querySelector('.overlap.default').onclick = function () {
            overlapvis(data, select, 'default');
        };
        document.querySelector('.overlap.reaction').onclick = function () {
            overlapvis(data, select, 'reaction');
        };
        document.querySelector('.overlap.comment').onclick = function () {
            overlapvis(data, select, 'comment');
        };
        document.querySelector('.overlap.share').onclick = function () {
            overlapvis(data, select, 'share');
        };
    }
    console.log(select);
}

/**
 * overlap vis
 * @param {object} data - inputdata
 * @param {object} select - selectobj
 * @param {string} mode -mode
 */
function overlapvis(data, select, mode) {
    // let width = document.querySelector('#overlap').offsetWidth;
    let ptt = data.query.posttype === 'PTT';
    let height = '100%';
    let width = height;
    let color = d3.scaleQuantize()
        .domain([0, 10])
        .range(['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee08b',
            '#ffffbf', '#d9ef8b', '#a6d96a', '#66bd63', '#1a9850', '#006837',
        ]);
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

    if (d3.select('#overlap').select('#user')._groups[0][0] !== undefined) {
        d3.select('#overlap').select('#user')._groups[0][0].remove();
    }
    let svg = d3.select('#overlap')
        .append('div')
        .attr('class', 'wrapper')
        .append('svg')
        .attr('id', 'user')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', '0 0 1000 1000')
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .style('fill', 'none')
        .style('pointer-events', 'all');

    let g = svg.append('g')
        .attr('id', 'overlapmap');

    let posts = data.data[0];
    let users = data.data[1];
    let overlap = [];
    let oucount = 0; // to decide nextline
    // make overlap array
    for (let i = 0, l = data.data[2].O.length; i < l; i++) {
        if (data.data[2].O[i].length > 0) {
            overlap.push(data.data[2].O[i]);
        }
    }
    overlap = showmodes(overlap, mode);

    // count elements in overlap
    for (let i = 0, l = overlap.length; i < l; i++) {
        if (overlap[i].length > 0) {
            let degl = overlap[i].length;
            for (let j = 0; j < degl; j++) {
                oucount += overlap[i][j].length;
            }
        }
    }

    // how many elements in one line
    // let nextline = parseInt(((0.8 * 1000) / cellSize1), 10);
    let nextline = Math.sqrt(2 * oucount) > overlap.length ? parseInt(Math.sqrt(2 * oucount), 10) - 2 : overlap.length + 1;
    let ratio = (1000 * 0.9) / (nextline * 50);
    let cellSize1 = 50 * ratio;
    let cellSize2 = 40 * ratio;
    let cellSize3 = 30 * ratio;

    let initx = 1000 * 0.025 + cellSize1 * 2;
    let inity = 1000 * 0.025;

    // construct degree[i]'s y checklist
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

    // list[index]'s y value
    function gety(list, index) {
        let result = 0;
        for (let i = 0; i < index; i++) {
            result += list[i];
        }
        return result + index; // one line space between degrees
    }

    // modify elements' dy in the same degree
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

    // elements' (x,y) corrdinate array
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

    // count elements in array
    function count(data) {
        let c = 0;
        let l = data.length;
        for (let i = 0; i < l; i++) {
            c += data[i].length;
        }
        return c;
    }

    // users' x
    function xof(k) {
        result = (k % nextline) * cellSize1 + (cellSize2 - cellSize3) / 2;
        return result;

    }

    // users' y
    function yof(k) {
        let offsety = parseInt(k / nextline, 10);
        result = offsety * cellSize1 + (cellSize2 - cellSize3) / 2;
        return result + inity;
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
        .attr('width', cellSize1 * nextline)
        .attr('height', (d, i) => {
            return cellSize1;
        })
        .attr('x', initx)
        .attr('y', inity - cellSize1 * 1)
        /* .attr('width', cellSize1 * 2)
        .attr('height', (d, i) => {
            return cellSize1 * degylist[i];
        })
        .attr('x', initx - cellSize1 * 2)
        .attr('y', inity)*/
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
            /* d3.selectAll('.botton')
                .attr('height', (d, i) => {
                    return cellSize1 * degylist[i];
                });
            text.attr('y', (d, i) => {
                return (cellSize1 * (degylist[i] + 0.66)) / 2 + inity;
            });*/

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
                        .attr('transform', (d, k) => {
                            resultx = (k % nextline) * cellSize1 + (cellSize2 - cellSize3) / 2;
                            let offsety = parseInt(k / nextline, 10);
                            if (degylist[i] === 1) {
                                resulty = inity;
                            } else {
                                resulty = offsety * cellSize1 + (cellSize2 - cellSize3) / 2;
                                resulty += inity;
                            }
                            return 'translate(' + resultx + ',' + resulty + ')';
                        });
                    /* .attr('y', (d, k) => {
                        // calculate users' y
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
                    });*/
                }
            }
        });

    let maxi = overlap.length - 1;
    let num = []; // degrees' degree value
    let maxd = overlap[maxi][0][0].posts;
    num.push(getlength(maxd, 'A') + getlength(maxd, 'B'));
    let offset = numoffset(num);
    // console.log(offset);
    let text = rect.append('text')
        .attr('x', initx)
        .attr('y', (d, i) => {
            return (cellSize1 * (-1 + 0.66)) / 2 + inity;
        })
        /* .attr('x', initx - cellSize1 * 2)
        .attr('y', (d, i) => {
            return (cellSize1 * (degylist[i] + 0.66)) / 2 + inity;
        })*/
        // .attr('dy', '.35em')
        .attr('font-size', 50 * ratio)
        .attr('fill', '#aaa')
        .attr('stroke', '#f00')
        .text((d) => {
            let data = d[0][0].posts;
            let len = getlength(data, 'A') + getlength(data, 'B');
            return numalign(len, offset);
        });

    let interactionLabel = d3.select('.c').select('.interaction.label');

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
                resultx = initx + x * cellSize1 + (cellSize1 - cellSize2) / 2;
                x += widthcount(d);
                while (x > (nextline - 1)) {
                    x -= nextline;
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
                function glyphmargin(k) {
                    let result = {
                        top: yof(k),
                        right: 0,
                        bottom: 0,
                        left: xof(k),
                    };
                    return result;
                };
                let labelMargin = 1;
                let scale = d3.scaleLog()
                    .domain([1, 32])
                    .range([0, 100]);

                function glyph(k) {
                    let glyph = d3.starglyph()
                        .width(cellSize3)
                        .properties([
                            'A',
                            'B',
                            'C',
                            /* function (d) {
                                return scale(d.Smoky);
                            },*/
                        ])
                        .scales(scale)
                        .labels([
                            'A',
                            'B',
                            'C',
                            /* 'Smoky',*/
                        ])
                        .title(function (d) {
                            return d.name;
                        })
                        .ratio(ratio)
                        .margin(glyphmargin(k))
                        .labelMargin(labelMargin);
                    return glyph;
                };

                let usergrid = g.selectAll(gid)
                    .selectAll('g')
                    .data(group)
                    .enter().append('g')
                    .attr('class', 'user')
                    .attr('fill', (d) => color(Math.sqrt(d.posts.A.length)))
                    // .attr('stroke', '#00f')
                    .attr('opacity', 1)
                    .attr('width', cellSize3)
                    .attr('height', cellSize3)
                    /* .attr('x', (d, k) => {
                        result = (k % nextline) * cellSize1 + (cellSize2 - cellSize3) / 2;
                        return result;
                    })
                    .attr('y', (d, k) => {
                        let offsety = parseInt(k / nextline, 10);
                        result = offsety * cellSize1 + (cellSize2 - cellSize3) / 2;
                        return result + inity;
                    });*/
                    .each(function (d, i) {
                        let star = glyph(i);
                        d3.select(this)
                            .datum(d)
                            .call(star)
                            .call(star.interaction);
                    });

                let circle = usergrid.append('circle')
                    .attr('class', (d, i) => {
                        return 'interaction circle ' + gid + i;
                    })
                    .attr('r', 1 * ratio);

                let interaction = svg.selectAll('.interaction')
                    .style('display', 'none');

                // let transform = d3.zoomTransform(svg.node());

                usergrid.selectAll('.star-interaction')
                    .on('mouseover', function (d) {
                        // console.log(this);
                        usergrid.selectAll('.star-title')
                            .style('display', 'block');

                        usergrid.selectAll('.star-label')
                            .style('display', 'block');

                        usergrid.selectAll('.interaction')
                            .style('display', 'block');

                        usergrid.selectAll('circle')
                            .attr('cx', d.x)
                            .attr('cy', d.y);

                        // interactionLabel = interactionLabel.node();
                        interactionLabel
                            .datum(d)
                            .text((d) => {
                                // console.log(d);
                                let post = d.datum.posts[d.key];
                                let value = post === undefined ? 0 : post.length;
                                return d.key + ':' + value;
                            });
                        /* .style('left', function (d) {
                            console.log(svg.node(), transform);
                            let left = transform.x * transform.k + d.xExtent - (this.clientWidth / 2);
                            console.log(left);
                            return left + 'px';
                        })
                        .style('top', function (d) {
                            let top = transform.y * transform.k + d.yExtent - (this.clientHeight / 2);
                            console.log(top);
                            return top + 'px';
                        });*/
                    })
                    .on('mouseout', function (d) {
                        usergrid.selectAll('.star-title')
                            .style('display', 'none');

                        usergrid.selectAll('.star-label')
                            .style('display', 'none');

                        interaction
                            .style('display', 'none');

                        usergrid.selectAll('circle')
                            .style('display', 'none');
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
            tooltip3
                /* .html('ID=' + d.datum.id + '<br/>' + 'Name = ' + d.datum.name + '<br/>' +
                    'Activities on A = ' + getlength(d.datum.posts, 'A') + '<br/>' +
                    'Activities on B = ' + getlength(d.datum.posts, 'B'))*/
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
            // console.log(d, this);
            /* let i = selectobj.page === data.query.page1 ? 0 : 1;
            let j = 0;
            if (selectobj.post !== 0) {
                j = parseInt(selectobj.post.match(/\d{1,}/)[0]) - 1;
            }
            // console.log(i, j);*/
            let preselect = {};
            let user = [];
            let actpost = [
                [],
                [],
            ];
            for (let i = 0, l = select.user.length; i < l; i++) {
                user.push(select.user[i]);
            }
            for (let i = 0, l = select.actpost.length; i < l; i++) {
                for (let j = 0, l = select.actpost[i].length; j < l; j++) {
                    let post = select.actpost[i][j];
                    actpost[i].push(post);
                }
            }
            preselect.user = user;
            preselect.actpost = actpost;
            let la = d.posts.A.length;
            let lb = d.posts.B.length;
            let deg = la + lb;
            let selectobj = d;
            if (select.user.length !== 0) {
                for (let i = 0, l = select.user.length; i < l;) {
                    if (select.user[i].id === selectobj.id) {
                        select.user.splice(i, 1);
                        select.ci.user = i - 1 > 0 ? i - 1 : 0;
                        i = l + 1;
                    } else {
                        i++;
                    }
                    if (i === l) {
                        select.user.push(selectobj);
                        select.ci.user = l;
                    }
                }
            } else {
                select.user.push(selectobj);
            }
            console.log(select.user);
            // user color update
            let bug = d3.selectAll('.user');
            console.log(bug);
            bug.attr('fill', (d) => {
                console.log(d);
                let rcolor;
                if (ptt) {
                    rcolor = color(Math.sqrt(d.posts.A.length));
                } else {
                    rcolor = color(Math.sqrt(d.posts.A.length));
                }
                for (let i = 0, l = select.user.length; i < l; i++) {
                    if (d.id === select.user[i].id) {
                        rcolor = '#000';
                    }
                }
                return rcolor;
            });
            // status(d);
            console.log('#degree' + deg.toString());
            // activepost(data, preselect, select);
            select.actpost = activepost(data, preselect, select, 'intersection');
            userdetailview(data, select);
            overview(data, select);
            showselect(data, select);
        });

    let strokewidth = 1;
    let zoom = d3.zoom()
        .scaleExtent([1 / 10, 10])
        .on('zoom', function () {
            g.attr('transform', d3.event.transform);
            let k = this.__zoom.k;
            g.attr('stroke-width', 1 / k);
            g.selectAll('.star-path')
                .attr('stroke-width', 2 / k);
            g.selectAll('.star-axis')
                .attr('stroke-width', 2 / k);
            strokewidth = 1 / k;
        });

    svg.call(zoom);

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

/**
 * sortbylength
 * @param {*} sortlist -
 * @return {*}
 */
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
 * add button paccordion
 */
function paccordion() { // accordion
    let acc = document.getElementsByClassName('accordion');
    for (let i = 0; i < acc.length; i++) {
        acc[i].onclick = function () {
            // let el = document.getElementsByClassName('detailview')[0];
            // let st = el.scrollTop;
            // console.log(st);
            this.classList.toggle('active');
            let panel = this.nextElementSibling;
            let divc = this.parentElement;
            let paccordion = this.parentElement.parentElement;
            // console.log(paccordion);
            if (panel.style.maxHeight) {
                panel.style.maxHeight = null;
                paccordion.style.maxHeight = (paccordion.scrollHeight - panel.scrollHeight) + 'px';
                divc.style.maxHeight = (divc.scrollHeight - panel.scrollHeight) + 'px';
            } else {
                panel.style.maxHeight = panel.scrollHeight + 'px';
                paccordion.style.maxHeight = (paccordion.scrollHeight + panel.scrollHeight) + 'px';
                divc.style.maxHeight = (divc.scrollHeight + panel.scrollHeight) + 'px';
            }
            // document.getElementsByClassName('detailview')[0].scrollTop = st;
            // console.log(document.getElementsByClassName('detailview')[0].scrollTop);
        };
    }
    let subacc = document.getElementsByClassName('subaccordion');
    for (let i = 0; i < subacc.length; i++) {
        subacc[i].onclick = function () {
            this.classList.toggle('active');
            let panel = this.nextElementSibling;
            let paccordion = this.parentElement.parentElement;
            let divc = paccordion.parentElement;
            let pre = paccordion.parentElement.parentElement;
            // console.log(paccordion);
            if (panel.style.maxHeight) {
                panel.style.maxHeight = null;
                paccordion.style.maxHeight = (paccordion.scrollHeight - panel.scrollHeight) + 'px';
                divc.style.maxHeight = (divc.scrollHeight - panel.scrollHeight) + 'px';
                pre.style.maxHeight = (pre.scrollHeight - panel.scrollHeight) + 'px';
            } else {
                panel.style.maxHeight = panel.scrollHeight + 'px';
                paccordion.style.maxHeight = (paccordion.scrollHeight + panel.scrollHeight) + 'px';
                divc.style.maxHeight = (divc.scrollHeight + panel.scrollHeight) + 'px';
                pre.style.maxHeight = (pre.scrollHeight + panel.scrollHeight) + 'px';
            }
        };
    }
}

/**
 * next post detail
 * @param {object} data -
 * @param {array} select -
 * @param {number} count -
 */
function nextpost(data, select, count) {
    if (select.post.length > 1) {
        select.ci.post = (select.ci.post + count) % select.post.length;
        if (select.ci.post < 0) {
            select.ci.post = select.post.length + select.ci.post;
        }
    }
    postdetail(data, select);
    // console.log(select.ci.post);
}

/**
 * showcomments in detail
 * @param {object} data -
 * @param {array} select -
 */
function postdetailview(data, select) {
    postdetail(data, select);
    document.querySelector('.next').onclick = function () {
        nextpost(data, select, 1);
    };
    document.querySelector('.previous').onclick = function () {
        nextpost(data, select, -1);
    };
    // console.log(select.ci.post);
}

/**
 * render postdetail
 * @param {object} data -
 * @param {array} select -
 */
function postdetail(data, select) {
    let ptt = data.query.posttype === 'PTT';
    let rawTemplate;
    if (ptt) {
        rawTemplate = document.getElementById('pttdetailpost-view').innerHTML;
    } else {
        rawTemplate = document.getElementById('detailpost-view').innerHTML;
    }
    let template = Handlebars.compile(rawTemplate);
    let detail = document.querySelector('#detail');
    let initdetail = '';
    let content = {};
    let pagedata = data.data[0];
    // d.data.id.split('.');
    let index = select.ci.post;
    // console.log(index);
    if (select.post[index] !== undefined) {
        let page = select.post[index].page;
        let post = select.post[index].post;
        let i = page === data.query.page1 ? 0 : 1;
        let j = 0;
        if (post !== undefined) {
            j = parseInt(post.match(/\d{1,}/)[0]) - 1;
        }
        // console.log(i, j);
        content.page = page;
        content.post = post;
        content.id = pagedata[i][j].id;
        content.word = pagedata[i][j].word;
        if (ptt) {
            content.url = pagedata[i][j].url;
            content.content = pagedata[i][j].content;
            content.message_count = {};
            content.message_count.all = pagedata[i][j].message_count.all;
            content.message_count.boo = pagedata[i][j].message_count.boo;
            content.message_count.count = pagedata[i][j].message_count.count;
            content.message_count.neutral = pagedata[i][j].message_count.neutral;
            content.message_count.push = pagedata[i][j].message_count.push;
        } else {
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
        }
        console.log('detail', content);
        detail.innerHTML = initdetail;
        let html = template(content);
        detail.innerHTML += html;
        if (ptt && pagedata[i][j].messages.length !== 0) {
            messagedetail(pagedata[i][j].messages);
        }
        if (!ptt && pagedata[i][j].comments.summary !== 0) {
            commentdetail(pagedata[i][j].comments.context);
        };
        paccordion();
    }
}

/**
 * get message instance by index
 * @param {array} data - message
 */
function messagedetail(data) {
    let rawTemplate = document.getElementById('messages-detail').innerHTML;
    let template = Handlebars.compile(rawTemplate);
    let cdetail = document.querySelector('#message');
    let init = '';
    cdetail.innerHTML = init;
    let content = {};
    for (let ci = 0, l = data.length; ci < l; ci++) {
        let message = data[ci];
        content.push_ipdatetime = message.push_ipdatetime;
        content.push_userid = message.push_userid;
        content.push_content = message.push_content === '' ? 'no text' : message.push_content;
        content.push_tag = message.push_tag;
        content.divid = ci >= 10 ? ci : ' ' + ci;
        // console.log('comment', content);
        let html = template(content);
        cdetail.innerHTML += html;
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
 * objarray1 - objarray2
 * @param {array} objarray1 -
 * @param {array} objarray2 -
 * @param {string} compare -
 * @return {array} - diff
 */
function diffobj(objarray1, objarray2, compare) {
    let diff = [];
    let postsl = objarray1.length;
    let presl = objarray2.length;
    // console.log(presl, postsl);
    for (let i = 0; i < postsl; i++) {
        if (presl > 0) {
            for (let j = 0; j < presl;) {
                if (objarray2[j][compare] !== objarray1[i][compare]) {
                    j++;
                } else {
                    j = presl + 1;
                }
                if (j === presl) {
                    diff.push(objarray1[i]);
                }
            }
        } else {
            diff.push(objarray1[i]);
        }
    }
    // console.log(diff);
    return diff;
}


/**
 * show selective posts' active user
 * @param {object} data -
 * @param {object} preselect -
 * @param {object} postselect -
 * @param {string} mode -
 * @return {array} - activeuser
 */
function activeuser(data, preselect, postselect, mode) {
    let pagedata = data.data[0];
    let result = preselect.actuser;
    // console.log(preselect, postselect);
    let pres = preselect.post;
    let presl = preselect.post.length;
    let posts = postselect.post;
    let postsl = postselect.post.length;
    // console.log(presl, postsl, data);
    let oldata = data.data[2].O;
    if (postsl > presl) {
        // get every user obj color index by the intersect counts then read index to color;
        let newpost = diffobj(posts, pres, 'post');
        modifycolor(newpost, true, mode);
    } else {
        let delpost = diffobj(pres, posts, 'post');
        modifycolor(delpost, false, mode);
    }

    /**
     * modify users' color by d.act value
     * @param {array} postchange -
     * @param {boolean} add -
     * @param {string} mode -
     */
    function modifycolor(postchange, add, mode) {
        console.log(postchange);
        let ptt = data.query.posttype === 'PTT';
        let colormod;
        if (mode === 'intersection') {
            colormod = postselect.post.length;
        } else if (mode === 'union') {
            colormod = 1;
        }
        d3.selectAll('.user')
            .datum((d) => {
                if (!d.act) {
                    d.act = 0;
                }
                return d;
            })
            .attr('fill', (d) => {
                let rcolor;
                for (let i = 0, l = d.posts.A.length; i < l; i++) {
                    for (let j = 0, l = postchange.length; j < l; j++) {
                        let x = postchange[j].page === data.query.page1 ? 0 : 1;
                        let y = 0;
                        if (postchange[j].post !== undefined) {
                            y = parseInt(postchange[j].post.match(/\d{1,}/)[0]) - 1;
                        }
                        console.log(x, y);
                        let id;
                        let eqid;
                        if (ptt) {
                            id = pagedata[x][y].article_id;
                            eqid = d.posts.A[i].article_id === id;
                        } else {
                            id = pagedata[x][y].id;
                            eqid = d.posts.A[i].id === id;
                        }
                        if (eqid) {
                            if (add) {
                                d.act++;
                            } else {
                                d.act--;
                            }
                            a = l;
                        }
                    }
                }
                for (let i = 0, l = d.posts.B.length; i < l; i++) {
                    for (let j = 0, l = postchange.length; j < l; j++) {
                        let x = postchange[j].page === data.query.page1 ? 0 : 1;
                        let y = 0;
                        if (postchange[j].post !== undefined) {
                            y = parseInt(postchange[j].post.match(/\d{1,}/)[0]) - 1;
                        }
                        // console.log(x, y);
                        let id;
                        let eqid;
                        if (ptt) {
                            id = pagedata[x][y].article_id;
                            eqid = d.posts.B[i].article_id === id;
                        } else {
                            id = pagedata[x][y].id;
                            eqid = d.posts.B[i].id === id;
                        }
                        if (eqid) {
                            if (add) {
                                d.act++;
                            } else {
                                d.act--;
                            }
                            a = l;
                        }
                    }
                }
                if (d.act >= colormod) {
                    rcolor = '#000';
                };
                return rcolor;
            });
    }
    return result;
}

/**
 * postid to postnumber
 * @param {object} data -
 * @param {number} page - page index
 * @param {string} postid - postud
 * @return {number}
 */
function postidtonum(data, page, postid) {
    let ptt = data.query.posttype === 'PTT';
    let pagedata = data.data[0][page];
    let id;
    for (let i = 0, la = pagedata.length; i < la; i++) {
        if (ptt) {
            id = pagedata[i].article_id;
        } else {
            id = pagedata[i].id;
        }
        if (id === postid) {
            return i + 1;
        }
    }
}

/**
 * show user active post
 * @param {object} data -
 * @param {object} preselect - pre
 * @param {object} postselect - post
 * @param {string} mode - mode
 * @return {array}
 */
function activepost(data, preselect, postselect, mode) {
    let ptt = data.query.posttype === 'PTT';
    let result = preselect.actpost;
    console.log(preselect, postselect);
    let presl = preselect.user.length;
    let postsl = postselect.user.length;
    console.log(presl, postsl);
    // union
    if (mode === 'union') {
        if (postsl > presl) {
            for (let i = 0; i < postsl; i++) {
                console.log(postselect.user[i]);
                showunionpost(i, postselect, 'A', result[0], true, 0);
                // if pageA !== pageB
                if (!(eqpost(postselect.user[i].posts.A, postselect.user[i].posts.B))) {
                    console.log(postselect.user[i].posts);
                    showunionpost(i, postselect, 'B', result[1], true, 1);
                }
            }
        } else {
            result = [
                [],
                [],
            ];
            // rebuild result by postselect
            for (let i = 0; i < postsl; i++) {
                rebuildsp(i, postselect, 'A', result[0]);
                rebuildsp(i, postselect, 'B', result[1]);
            }
            // show result
            for (let i = 0; i < presl; i++) {
                showunionpost(i, preselect, 'A', result[0], false, 0);
                // if pageA !== pageB
                if (!(eqpost(preselect.user[i].posts.A, preselect.user[i].posts.B))) {
                    // console.log(result);
                    showunionpost(i, preselect, 'B', result[1], false, 1);
                }
            }
        }
    } else if (mode === 'intersection') {
        // intersection
        // result = postselect.actpost;
        if (postsl > presl) {
            for (let i = 0; i < postsl; i++) {
                if (presl > 0) {
                    // console.log('>');
                    result[0] = showaddpost(i, postselect, 'A', result[0], 0);
                    result[1] = showaddpost(i, postselect, 'B', result[1], 1);
                } else {
                    for (let j = 0, ual = postselect.user[i].posts.A.length; j < ual; j++) {
                        let id;
                        if (ptt) {
                            id = postselect.user[i].posts.A[j].article_id;
                        } else {
                            id = postselect.user[i].posts.A[j].id;
                        }
                        let postnum = postidtonum(data, 0, id);
                        selectivepost(1, postnum);
                        result[0].push(id);
                        // console.log(id, postnum);
                    }
                    for (let j = 0, ubl = postselect.user[i].posts.B.length; j < ubl; j++) {
                        let id;
                        if (ptt) {
                            id = postselect.user[i].posts.B[j].article_id;
                        } else {
                            id = postselect.user[i].posts.B[j].id;
                        }
                        let postnum = postidtonum(data, 1, id);
                        selectivepost(2, postnum);
                        result[1].push(id);
                        // console.log(id, postnum);
                    }
                }
            }
        } else {
            let userlistA = getlower(postselect, 'A', 10);
            let userlistB = getlower(postselect, 'B', 10);
            // console.log(userlistA, userlistB, result);
            let pl = postselect.user.length;
            if (pl > 0) {
                showdelpost(userlistA, postselect, 'A', result[0], 0);
                showdelpost(userlistB, postselect, 'B', result[1], 1);
            } else {
                let deluser = preselect.user;
                let ual = deluser[0].posts.A.length;
                for (let i = 0; i < ual; i++) {
                    let id;
                    if (ptt) {
                        id = deluser[0].posts.A[i].article_id;
                    } else {
                        id = deluser[0].posts.A[i].id;
                    }
                    result[0] = [];
                    let postnum = postidtonum(data, 0, id);
                    selectivepost(1, postnum);
                }
                let ubl = deluser[0].posts.B.length;
                for (let i = 0; i < ubl; i++) {
                    let id;
                    if (ptt) {
                        id = deluser[0].posts.B[i].article_id;
                    } else {
                        id = deluser[0].posts.B[i].id;
                    }
                    result[1] = [];
                    let postnum = postidtonum(data, 1, id);
                    selectivepost(2, postnum);
                }
            }
        }
    }

    /**
     * 
     * @param {*} ui 
     * @param {*} select 
     * @param {*} page 
     * @param {*} result 
     * @param {*} push 
     * @param {*} pi 
     */
    function showunionpost(ui, select, page, result, push, pi) {
        for (let j = 0, ul = select.user[ui].posts[page].length; j < ul; j++) {
            console.log(select.user[ui].posts[page]);
            let id;
            if (ptt) {
                id = select.user[ui].posts[page][j].article_id;
            } else {
                id = select.user[ui].posts[page][j].id;
            }
            if (result.length > 0) {
                for (let x = 0, l = result.length; x < l;) {
                    if (result[x] === id) {
                        /* let postnum = postidtonum(data, 0, id);
                        selectivepost(1, postnum);*/
                        x = l + 1;
                    } else {
                        x++;
                    }
                    if (x === l) {
                        if (push) {
                            result.push(id);
                        }
                        let postnum = postidtonum(data, pi, id);
                        selectivepost((pi + 1), postnum);
                    }
                }
            } else {
                if (push) {
                    result.push(id);
                }
                let postnum = postidtonum(data, pi, id);
                let spi = pi + 1;
                selectivepost(spi, postnum);
            }
        }
    }

    /**
     * 
     * @param {*} ui 
     * @param {*} select 
     * @param {*} page 
     * @param {*} result 
     */
    function rebuildsp(ui, select, page, result) {
        for (let j = 0, ubl = select.user[ui].posts[page].length; j < ubl; j++) {
            let id;
            if (ptt) {
                id = select.user[ui].posts[page][j].article_id;
            } else {
                id = select.user[ui].posts[page][j].id;
            }
            if (result.length > 0) {
                for (let x = 0, l = result.length; x < l;) {
                    if (result[x] === id) {
                        x = l + 1;
                    } else {
                        x++;
                    }
                    if (x === l) {
                        result.push(id);
                    }
                }
            } else {
                result.push(id);
            }
        }
    }

    /**
     * 
     * @param {*} arr1 
     * @param {*} arr2 
     */
    function eqpost(arr1, arr2) {
        let l1 = arr1.length;
        let l2 = arr2.length;
        if (l1 !== l2) {
            return false;
        } else {
            for (let i = 0; i < l1;) {
                if (ptt) {
                    if (arr1[i].article_id === arr2[i].article_id) {
                        i++;
                    } else {
                        return false;
                    }
                    if (i = l1) {
                        return true;
                    }
                } else {
                    if (arr1[i].id === arr2[i].id) {
                        i++;
                    } else {
                        return false;
                    }
                    if (i = l1) {
                        return true;
                    }
                }
            }
        }
    }

    /**
     * 
     * @param {*} ui 
     * @param {*} select 
     * @param {*} page 
     * @param {*} result 
     * @param {*} pi 
     */
    function showaddpost(ui, select, page, result, pi) {
        let del = [];
        for (let x = 0, l = result.length; x < l; x++) {
            for (let j = 0, ual = select.user[ui].posts[page].length; j < ual;) {
                let id;
                if (ptt) {
                    id = select.user[ui].posts[page][j].article_id;
                } else {
                    id = select.user[ui].posts[page][j].id;
                }
                if (result[x] === id) {
                    // console.log('===', result[0], id);
                    j = ual + 1;
                } else {
                    j++;
                }
                if (j === ual) {
                    let postnum = postidtonum(data, pi, result[x]);
                    selectivepost((pi + 1), postnum);
                    del.push(result[x]);
                    // console.log(result[0][x], postnum);
                }
            }
        }
        result = result.filter((x) => !del.includes(x));
        return result;
    }

    /**
     * 
     * @param {*} select 
     * @param {*} page 
     * @param {*} times 
     */
    function getlower(select, page, times) {
        function getRandomInt(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min)) + min; // The maximum is exclusive and the minimum is inclusive
        }
        let ul = select.user.length - 1;
        let num = 0;
        if (times > ul) {
            times = ul;
        }

        function getlowercase(num, ul) {
            let num1 = num;
            let num2 = getRandomInt(0, ul);
            if (ul > 2) {
                while (num1 === num2) {
                    num2 = getRandomInt(0, ul);
                }
            }
            let c1 = select.user[num1].posts[page].length;
            let c2 = select.user[num2].posts[page].length;
            console.log(num1, c1, num2, c2);
            if (c1 <= c2) {
                return num1;
            } else {
                return num2;
            }
        }
        for (let i = 0; i < times; i++) {
            num = getlowercase(num, ul);
        }
        return num;
    }

    /**
     * 
     * @param {*} ui 
     * @param {*} select 
     * @param {*} page 
     * @param {*} result 
     * @param {*} pi 
     */
    function showdelpost(ui, select, page, result, pi) {
        let pl = select.user.length;
        for (let x = 0, ul = select.user[ui].posts[page].length; x < ul; x++) {
            let xid;
            if (ptt) {
                xid = select.user[ui].posts[page][x].article_id;
            } else {
                xid = select.user[ui].posts[page][x].id;
            }
            let update = false;
            let rl = result.length;
            if (rl > 0) {
                for (let a = 0; a < rl;) {
                    // console.log(a, result[a]);
                    if (xid !== result[a]) {
                        a++;
                    } else {
                        // console.log('noway');
                        a = rl + 1;
                    }
                    if (a === rl) {
                        // console.log('what');
                        update = true;
                    }
                }
            } else {
                update = true;
            }
            // console.log(xid, update);
            if (update) {
                for (let j = 0; j < pl;) {
                    // console.log('j = ', j, pl);
                    for (let y = 0, ual = select.user[j].posts[page].length; y < ual;) {
                        let yid;
                        if (ptt) {
                            yid = select.user[j].posts[page][y].article_id;
                        } else {
                            yid = select.user[j].posts[page][y].id;
                        }
                        // console.log(yid);
                        if (xid === yid) {
                            // console.log('===');
                            y = ual + 1;
                            j++;
                        } else {
                            // console.log('next y');
                            y++;
                        }
                        if (y === ual) {
                            // console.log('end y');
                            j = pl + 1;
                        }
                        if (j === pl && y === ual + 1) {
                            // console.log('push', xid);
                            result.push(xid);
                            let postnum = postidtonum(data, pi, xid);
                            selectivepost((pi + 1), postnum);
                        }
                    }
                }
            }
        }
    }

    console.log(result);
    return result;
}

/**
 * selectivepost highlight
 * @param {number} page - pagenum
 * @param {number} post - postnum
 */
function selectivepost(page, post) {
    console.log(page, post);
    let sel = d3.selectAll('.page' + page + '.p' + post);
    let mode = document.querySelector('input[name="mode"]:checked').value;
    if (mode === 'sunburst') {
        let node = sel._groups[0];
        let text = sel.select('text')._groups[0];
        console.log(mode, node);
        for (let i = 2, l = node.length; i < l; i++) {
            node[i].classList.toggle('selective');
        }
    } else if (mode === 'treemap') {
        let rect = sel.select('rect')._groups[0];
        let text = sel.select('text')._groups[0];
        // console.log(rect[2], text);
        for (let i = 2, l = rect.length; i < l; i++) {
            rect[i].classList.toggle('selective');
        }
        text[4].classList.toggle('selectext'); // text[4] is 'like' rect's text}
    }
}

/**
 * next user detail
 * @param {object} data -
 * @param {array} select -
 * @param {number} count -
 */
function nextuser(data, select, count) {
    if (select.user.length > 1) {
        select.ci.user = (select.ci.user + count) % select.user.length;
        if (select.ci.user < 0) {
            select.ci.user = select.user.length + select.ci.user;
        }
    }
    userdetail(data, select);
    // console.log(select.ci.post);
}

/**
 * showcomments in detail
 * @param {object} data -
 * @param {array} select -
 */
function userdetailview(data, select) {
    userdetail(data, select);
    document.querySelector('.next').onclick = function () {
        nextuser(data, select, 1);
    };
    document.querySelector('.previous').onclick = function () {
        nextuser(data, select, -1);
    };
    // console.log(select.ci.post);
}

/**
 * make detailuser
 * @param {object} data - for data.query
 * @param {object} select - select user
 */
function userdetail(data, select) {
    let ptt = data.query.posttype === 'PTT';
    let rawTemplate;
    if (ptt) {
        rawTemplate = document.getElementById('detailpttuser-view').innerHTML;
    } else {
        rawTemplate = document.getElementById('detailuser-view').innerHTML;
    }
    let template = Handlebars.compile(rawTemplate);
    let detail = document.querySelector('#detail');
    let initdetail = '';
    let index = select.ci.user;
    let point;
    if (select.user[index] !== undefined) {
        point = select.user[index];
        for (let i = 0, l = point.posts.A.length; i < l; i++) {
            let id;
            if (ptt) {
                id = point.posts.A[i].article_id;
            } else {
                id = point.posts.A[i].id;
            }
            let postnum = postidtonum(data, 0, id);
            point.posts.A[i].num = postnum;
        }
        for (let i = 0, l = point.posts.B.length; i < l; i++) {
            let id;
            if (ptt) {
                id = point.posts.B[i].article_id;
            } else {
                id = point.posts.B[i].id;
            }
            let postnum = postidtonum(data, 1, id);
            point.posts.B[i].num = postnum;
        }
        let content = point;
        content.page1 = data.query.page1;
        content.page2 = data.query.page2;
        if (ptt) {
            content.activities1 = point.posts.A.length;
            content.activities2 = point.posts.B.length;
            content.summary = point.posts.A.length + point.posts.B.length;
        } else {
            content.activities1 = point.posts.A.length;
            content.activities2 = point.posts.B.length;
            content.summary = point.posts.A.length + point.posts.B.length;
        }
        console.log('detail', content);
        detail.innerHTML = initdetail;
        let html = template(content);
        detail.innerHTML += html;
        paccordion();
        // highlight author if self post
        let author = document.querySelectorAll('#author');
        for (let i = 0; i < author.length; i++) {
            console.log(point);
            if (author[i].innerHTML.split(' ')[0] === point.id) {
                author[i].classList.toggle('author');
            };
        }
    }
}

/**
 * get pagedata object
 * @param {object} data - inputarray
 * @return {object}
 */
function pagedata(data) {
    let ptt = data.query.posttype === 'PTT';
    let pagedata = data.data[0];
    let tm = {};
    let tmdata = [];
    for (let i = 0, l = pagedata.length; i < l; i++) { // page
        let page = {};
        let posttemp = [];
        let posts = pagedata[i];
        for (let j = 0, l = posts.length; j < l; j++) { // post
            let post = {};
            let temp = [];
            if (ptt) {
                let message = {};
                let pushing = {};
                let neutral = {};
                let boo = {};
                pushing.name = 'push';
                pushing.size = posts[j].message_count.push;
                neutral.name = 'neutral';
                neutral.size = posts[j].message_count.neutral;
                boo.name = 'boo';
                boo.size = posts[j].message_count.boo;
                message.name = 'comment';
                message.children = [pushing, neutral, boo];
                temp.push(message);
            } else {
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
                temp.push(comment);
                temp.push(reaction);
                temp.push(share);
            }
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
    if (tmdata[0].name === tmdata[1].name) {
        tm.children = [tmdata[0]];
    } else {
        tm.children = tmdata;
    }
    console.log('pagedata', tm);
    return tm;
};

/**
 * get activitiy counts
 * @param {object} data - inputdata
 * @param {object} select - selectuser
 * @return {object} countvalue object
 */
function countactivities(data, select) {
    // let posts = data[0];
    // let users = data[1];let overlap = data[2].O;
    /**
     * get subdata activities count
     * @param {object} sub - subdata A/B/O
     * @param {object} select - selectuser
     * @return {object}
     */
    function subcount(sub, select) {
        let count = {};
        // sum, like, love, haha, wow, sad, angry, others
        let oarc = [0, 0, 0, 0, 0, 0, 0, 0];
        let oacc = 0;
        let oasc = 0;
        let obrc = [0, 0, 0, 0, 0, 0, 0, 0];
        let obcc = 0;
        let obsc = 0;
        let l = sub.length;
        let dtemp = [];
        for (let i = 0; i < l; i++) { // degree
            let degree = sub[i];
            let deg = {};
            let darc = [0, 0, 0, 0, 0, 0, 0, 0];
            let dacc = 0;
            let dasc = 0;
            let dbrc = [0, 0, 0, 0, 0, 0, 0, 0];
            let dbcc = 0;
            let dbsc = 0;
            let dl = degree.length;
            let gtemp = [];
            for (let j = 0; j < dl; j++) { // group
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
                for (let k = 0; k < gl; k++) { // user
                    let user = group[k];
                    let arc = [0, 0, 0, 0, 0, 0, 0, 0];
                    let acc = 0;
                    let asc = 0;
                    let brc = [0, 0, 0, 0, 0, 0, 0, 0];
                    let bcc = 0;
                    let bsc = 0;
                    let pa = user.posts;

                    function docount() {
                        if (pa.A instanceof Array) {
                            let al = pa.A.length;
                            for (let a = 0; a < al; a++) {
                                if (pa.A[a].commentcount) {
                                    acc += pa.A[a].commentcount;
                                }
                                if (pa.A[a].like) {
                                    let num = pa.A[a].like;
                                    arc[0]++;
                                    arc[num]++;
                                }
                                if (pa.A[a].share === true) {
                                    asc++;
                                }
                                // for ptt data below
                                if (pa.A[a].pushing) {
                                    acc += pa.A[a].pushing.length;
                                    arc[0] += pa.A[a].pushing.length;
                                    arc[1] += pa.A[a].pushing.length;
                                }
                                if (pa.A[a].neutral) {
                                    acc += pa.A[a].neutral.length;
                                    arc[2] += pa.A[a].neutral.length;
                                }
                                if (pa.A[a].boo) {
                                    acc += pa.A[a].boo.length;
                                    arc[0] -= pa.A[a].boo.length;
                                    arc[3] += pa.A[a].boo.length;
                                }
                                if (pa.A[a].publish === true) {
                                    asc++;
                                }
                            }
                        }
                        if (pa.B instanceof Array) {
                            let bl = pa.B.length;
                            for (let b = 0; b < bl; b++) {
                                if (pa.B[b].commentcount) {
                                    bcc += pa.B[b].commentcount;
                                }
                                if (pa.B[b].like) {
                                    let num = pa.B[b].like;
                                    brc[0]++;
                                    brc[num]++;
                                }
                                if (pa.B[b].share === true) {
                                    bsc++;
                                } // for ptt data below
                                if (pa.B[b].pushing) {
                                    bcc += pa.B[b].pushing.length;
                                    brc[0] += pa.B[b].pushing.length;
                                    brc[1] += pa.B[b].pushing.length;
                                }
                                if (pa.B[b].neutral) {
                                    bcc += pa.B[b].neutral.length;
                                    brc[2] += pa.B[b].neutral.length;
                                }
                                if (pa.B[b].boo) {
                                    bcc += pa.B[b].boo.length;
                                    brc[0] -= pa.B[b].boo.length;
                                    brc[3] += pa.B[b].boo.length;
                                }
                                if (pa.B[b].publish === true) {
                                    bsc++;
                                }
                            }
                        }
                    }
                    if (select.user.length === 0) {
                        docount();
                    } else {
                        for (let x = 0, sl = select.user.length; x < sl;) {
                            if (select.user[x].id === user.id) {
                                docount();
                                x = sl;
                            } else {
                                x++;
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
                    // user.id;
                    // user.name;
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

    let result = {};
    if (select.user.length === 0) {
        result.O = subcount(data[2].O, select);
        result.A = subcount(data[2].A, select);
        result.B = subcount(data[2].B, select);
    } else {
        let zeroreaction = [0, 0, 0, 0, 0, 0, 0, 0];
        let zeroactivity = [zeroreaction, 0, 0];
        let zerouser = {};
        zerouser.A = zeroactivity;
        zerouser.B = zeroactivity;
        let zerogroup = {};
        zerogroup.A = zeroactivity;
        zerogroup.B = zeroactivity;
        zerogroup.user = zerouser;
        let zerodegree = {};
        zerodegree.A = zeroactivity;
        zerodegree.B = zeroactivity;
        zerodegree.group = zerogroup;
        result.O = subcount(data[2].O, select);
        result.A = zerodegree;
        result.B = zerodegree;
    }
    return result;
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

/**
 * align numbers
 * @param {number} num - number
 * @param {number} offset - offset
 * @return {string}
 */
function numalign(num, offset) {
    let str = '';
    let ioffset = 0;
    let numstr = num.toString();
    while (num >= 10) {
        num = (num / 10);
        ioffset++;
    }
    for (let i = ioffset; i < offset; i++) {
        str += '\xa0\xa0';
    }
    str += numstr;
    return str;
}

/**
 * get number offset
 * @param {array} numarray - number array
 * @return {number}
 */
function numoffset(numarray) {
    let max = Math.max(...numarray);
    let offset = 0;
    while (max >= 10) {
        max = Math.round(max / 10);
        offset++;
    }
    return offset;
}

/**
 * property string bind to object
 * @param {string} propertyName - string
 * @param {object} object - target obj
 * @return {object}
 */
function getProperty(propertyName, object) {
    let parts = propertyName.split('.');
    let length = parts.length;
    let i;
    let property = object || this;

    for (i = 0; i < length; i++) {
        property = property[parts[i]];
    }
    return property;
}

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