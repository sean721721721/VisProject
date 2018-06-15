d3.starglyph = function () {
    let star = false; // true: starglyph, false: whisker
    let width = 200;
    let maxattr = 100;
    let margin = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    };
    let labelMargin = 20;
    let includeGuidelines = true;
    let includeLabels = true;
    let properties = [];
    let scales = [];
    let labels = [];
    let title = nop;
    let ratio = 1;
    let g;
    let datum;
    let radius;
    let origin;
    let scale;
    let radii = properties.length;
    let sangle = Math.PI / radii;
    let radians = 2 * Math.PI / radii;
    let scalelog = d3.scaleLog()
        .domain([1, 32])
        .range([0, 100]);

    /** */
    function setscale() {
        scalelog = d3.scaleLog()
            .domain([1, maxattr + 1])
            .range([0, 100]);
        scale = d3.scaleLinear()
            .domain([0, 100])
            .range([/* 0.2 * radius*/0, radius]);
        // console.log(maxattr);
        scales.push(scalelog);
    }

    /** */
    function chart(selection) {
        datum = selection.datum();
        // set variable
        radius = width / 2;
        origin = [radius, radius];
        setscale();
        // console.log(datum);
        g = selection
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        if (includeGuidelines) {
            drawGuidelines();
        }
        if (includeLabels) {
            drawLabels();
        }
        // console.log('chart', datum, origin, radius, radii, radians, ratio);
        drawChart();
    }

    /** */
    function drawGuidelines() {
        /* let r = 0;
        properties.forEach(function (d, i) {
            let l = radius;
            let x = l * Math.cos(r);
            let y = l * Math.sin(r);
            g.append('line')
                .attr('class', 'star-axis')
                .attr('x1', origin[0])
                .attr('y1', origin[1])
                .attr('x2', origin[0] + x)
                .attr('y2', origin[1] + y)
                .attr('stroke-width', 2);

            r += radians;
        });*/
        let ticks = 5;
        for (let i = 0; i < ticks; i++) {
            g.append('circle')
                .attr('class', 'star-guideline')
                .attr('cx', origin[0])
                .attr('cy', origin[1])
                .attr('r', i * radius / ticks)
                .attr('fill', 'none')
                .attr('stroke-width', 1);
        }
        // console.log('drawGuidelines' /* , origin, guidelineData*/ );
    }

    /** */
    function drawLabels() {
        let r = sangle;
        properties.forEach(function (d, i) {
            let l = radius;
            let x = (l + labelMargin) * Math.cos(r);
            let y = (l + labelMargin) * Math.sin(r);
            g.append('text')
                .attr('class', 'star-label')
                .attr('x', origin[0] + x)
                .attr('y', origin[1] + y)
                .text(labels[i])
                .attr('font-size', 3 * ratio)
                .style('display', 'none')
                .style('text-anchor', 'middle')
                .style('dominant-baseline', 'central');
            r += radians;
        });
        // console.log('drawLabels');
    }

    /** */
    function drawChart() {
        let path = d3.lineRadial();
        let pathData = [];
        let r = Math.PI / 2 + sangle;
        properties.forEach(function (d, i) {
            let userScale = scales[i] || scales[0];
            let value;
            let property = d.split('.');
            // console.log(property);
            if (property.length === 1) {
                value = datum.count[property[0]];
            } else {
                value = datum.count[property[0]][parseInt(property[1], 10)];
            }
            /* let value = datum.count[d];
            if (value === undefined) {
                value = [0];
            }*/
            let axisvalue = scale(userScale(value + 1 /* .length*/ ));
            // console.log(scale(userScale(1)), scale(userScale(2)), scale(userScale(4)), scale(userScale(8)));
            pathData.push([
                r,
                axisvalue,
            ]);
            if (!star) {
                g.append('line')
                    .attr('class', 'star-line')
                    .attr('x1', origin[0])
                    .attr('y1', origin[1])
                    .attr('x2', (d, i) => {
                        let x = axisvalue * Math.cos(r - Math.PI / 2);
                        return origin[0] + x;
                    })
                    .attr('y2', (d, i) => {
                        let y = axisvalue * Math.sin(r - Math.PI / 2);
                        return origin[1] + y;
                    })
                    .attr('stroke-width', 3);
            }
            r += radians;
            // console.log('drawChart', origin, d, i, scale(userScale(value.length)), margin);
        });

        if (star) {
            g.append('path')
                .attr('class', 'star-path')
                .attr('transform', 'translate(' + origin[0] + ',' + origin[1] + ')')
                .attr('d', path(pathData) + 'Z')
                .attr('stroke-width', 2);
        }

        g.append('circle')
            .attr('class', 'star-origin')
            .attr('cx', origin[0])
            .attr('cy', origin[1])
            .attr('r', 1 * ratio);

        g.append('text')
            .attr('class', 'star-title')
            .attr('x', origin[0])
            .attr('y', -radius / 5)
            .text(title(datum))
            .style('display', 'none')
            .attr('font-size', 5 * ratio)
            .style('text-anchor', 'middle');
    }

    /** */
    function drawInteraction() {
        let path = d3.lineRadial();

        // `*Interaction` variables are used to build the interaction layer.
        // `*Extent` variables are used to compute (and return) the x,y
        // positioning of the attribute extents. `*Value` variables are used
        // for the attribute values.
        let rInteraction = Math.PI / 2 + sangle;
        let rExtent = 0;
        properties.forEach(function (d, i) {
            let lInteraction = radius;
            let xInteraction = lInteraction * Math.cos(rInteraction);
            let yInteraction = lInteraction * Math.sin(rInteraction);

            let lExtent = radius + labelMargin;
            let xExtent = lExtent * Math.cos(rExtent) + origin[0] + margin.left;
            let yExtent = lExtent * Math.sin(rExtent) + origin[1] + margin.top;

            let userScale = scales[i] || scales[0];
            // lValue = scale(userScale(datum[d]));
            let value;
            let property = d.split('.');
            if (property.length === 1) {
                value = datum.count[property[0]];
            } else {
                value = datum.count[property[0]][parseInt(property[1], 10)];
            }
            /* let value = datum.posts[d];
            if (value === undefined) {
                value = [0];
            }*/
            let lValue = scale(userScale(value + 1 /* .length*/ ));
            // let x = lValue * Math.cos(rExtent) + origin[0] + margin.left;
            // let y = lValue * Math.sin(rExtent) + origin[1] + margin.top;
            let x = lValue * Math.cos(rExtent) + origin[0];
            let y = lValue * Math.sin(rExtent) + origin[1];

            let halfRadians = radians / 2;
            let pathData = [
                [rInteraction - halfRadians, 0],
                [rInteraction - halfRadians, lInteraction],
                [rInteraction, lInteraction],
                [rInteraction + halfRadians, lInteraction],
            ];

            let datumToBind = {
                xExtent: xExtent,
                yExtent: yExtent,
                x: x,
                y: y,
                key: labels[i],
                datum: datum,
                value: value,
            };

            g.append('path')
                .datum(datumToBind)
                .attr('class', 'star-interaction')
                .attr('transform', 'translate(' + origin[0] + ',' + origin[1] + ')')
                .attr('d', path(pathData) + 'Z');

            rInteraction += radians;
            rExtent += radians;
            // console.log('drawInteraction', origin, d, i, lValue, x, y, margin);
        });
    }

    /** */
    function nop() {
        return;
    }

    chart.interaction = function () {
        drawInteraction();
    };

    chart.properties = function (_) {
        if (!arguments.length) return properties;
        properties = _;
        radii = properties.length;
        sangle = Math.PI / radii;
        radians = 2 * Math.PI / radii;
        return chart;
    };

    chart.scales = function (_) {
        if (!arguments.length) return scales;
        if (Array.isArray(_)) {
            scales = _;
        } else {
            scales = [_];
        }
        return chart;
    };

    chart.maxattr = function (_) {
        if (!arguments.length) return maxattr;
        maxattr = _;
        return chart;
    };

    chart.width = function (_) {
        if (!arguments.length) return width;
        width = _;
        // scale.range([0, radius]);
        return chart;
    };

    chart.ratio = function (_) {
        if (!arguments.length) return ratio;
        ratio = _;
        return chart;
    };

    chart.margin = function (_) {
        if (!arguments.length) return margin;
        margin = _;
        origin = [radius, radius];
        return chart;
    };

    chart.labelMargin = function (_) {
        if (!arguments.length) return labelMargin;
        labelMargin = _;
        return chart;
    };

    chart.title = function (_) {
        if (!arguments.length) return title;
        title = _;
        return chart;
    };

    chart.labels = function (_) {
        if (!arguments.length) return labels;
        labels = _;
        return chart;
    };

    chart.includeGuidelines = function (_) {
        if (!arguments.length) return includeGuidelines;
        includeGuidelines = _;
        return chart;
    };

    chart.includeLabels = function (_) {
        if (!arguments.length) return includeLabels;
        includeLabels = _;
        return chart;
    };

    return chart;
};

// d3.legend.js
// (C) 2012 ziggy.jonsson.nyc@gmail.com
// MIT licence
d3.legend = function (g) {
    g.each(function () {
        let g = d3.select(this);
        let items = {};
        let svg = d3.select(g.property('nearestViewportElement'));
        let legendPadding = g.attr('data-style-padding') || 5;
        let lb = g.selectAll('.legend-box').data([true]);
        let li = g.selectAll('.legend-items').data([true]);

        lb = lb.enter().append('rect').classed('legend-box', true).merge(lb);
        li = li.enter().append('g').classed('legend-items', true).merge(li);

        svg.selectAll('[data-legend]').each(function () {
            let self = d3.select(this);
            items[self.attr('data-legend')] = {
                pos: self.attr('data-legend-pos') || this.getBBox().y,
                color: self.attr('data-legend-color') !== undefined ? self.attr('data-legend-color') : self.style('fill') !== 'none' ? self.style('fill') : self.style('stroke'),
                textcolor: g.attr('textcolor') !== undefined ? g.attr('textcolor') : self.attr('data-legend-textcolor') !== undefined ? self.attr('data-legend-textcolor') : self.style('fill') !== 'none' ? self.style('fill') : self.style('stroke'),
            };
        });

        items = d3.entries(items).sort(function (a, b) {
            return a.value.pos - b.value.pos;
        });

        let text = li.selectAll('text')
            .data(items, function (d) {
                return d;
            });

        text.call(function (d) {
                d.enter().append('text').merge(text)
                    .attr('y', function (d, i) {
                        return i + 'em';
                    })
                    .attr('x', '1em')
                    .attr('fill', function (d) {
                        return d.value.textcolor;
                    })
                    .text(function (d) {
                        return d.key;
                    });
            })
            .call(function (d) {
                d.exit().remove();
            });

        let circle = li.selectAll('circle')
            .data(items, function (d) {
                return d;
            });

        circle.call(function (d) {
                d.enter().append('circle')
                    .merge(circle)
                    .attr('cy', function (d, i) {
                        return i - 0.25 + 'em';
                    })
                    .attr('cx', 0)
                    .attr('r', '0.4em')
                    .style('fill', function (d) {
                        return d.value.color;
                    });
            })
            .call(function (d) {
                d.exit().remove();
            });

        // Reposition and resize the box
        let lbbox = li.node().getBBox();
        // console.log(items, li, text, circle, lbbox);
        lb.attr('x', (lbbox.x - legendPadding))
            .attr('y', (lbbox.y - legendPadding))
            .attr('height', (lbbox.height + 2 * legendPadding))
            .attr('width', (lbbox.width + 2 * legendPadding));
    });
    return g;
};