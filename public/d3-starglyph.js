d3.starglyph = function () {
    let width = 200;
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
    let radius = width / 2;
    let origin = [radius, radius];
    let radii = properties.length;
    let radians = 2 * Math.PI / radii;
    let scale = d3.scaleLinear()
        .domain([0, 100])
        .range([1, radius]);

    /** */
    function chart(selection) {
        datum = selection.datum();
        // console.log(datum);
        g = selection
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        if (includeGuidelines) {
            drawGuidelines();
        }
        if (includeLabels) {
            drawLabels();
        }
        // console.log('chart', scale, origin, radius, radii, radians);
        drawChart();
    }

    /** */
    function drawGuidelines() {
        let r = 0;
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
        });
        // console.log('drawGuidelines', origin);
    }

    /** */
    function drawLabels() {
        let r = 0;
        properties.forEach(function (d, i) {
            let l = radius;
            let x = (l + labelMargin) * Math.cos(r);
            let y = (l + labelMargin) * Math.sin(r);
            g.append('text')
                .attr('class', 'star-label')
                .attr('x', origin[0] + x)
                .attr('y', origin[1] + y)
                .text(labels[i])
                .attr('font-size', 11 * ratio)
                .style('display', 'none')
                .style('text-anchor', 'middle')
                .style('dominant-baseline', 'central');

            r += radians;
        });
        // console.log('drawLabels');
    }

    /** */
    function drawChart() {
        g.append('circle')
            .attr('class', 'star-origin')
            .attr('cx', origin[0])
            .attr('cy', origin[1])
            .attr('r', 1 * ratio);

        let path = d3.lineRadial();

        let pathData = [];
        let r = Math.PI / 2;
        properties.forEach(function (d, i) {
            let userScale = scales[i] || scales[0];
            let value = datum.posts[d];
            if (value === undefined) {
                value = [0];
            }
            pathData.push([
                r,
                scale(userScale(value.length)),
            ]);
            r += radians;
            // console.log('drawChart', origin, d, i, scale(userScale(value.length)), margin);
        });
        g.append('path')
            .attr('class', 'star-path')
            .attr('transform', 'translate(' + origin[0] + ',' + origin[1] + ')')
            .attr('d', path(pathData) + 'Z')
            .attr('stroke-width', 2);

        g.append('text')
            .attr('class', 'star-title')
            .attr('x', origin[0])
            .attr('y', -(margin.top / 2))
            .text(title(datum))
            .style('display', 'none')
            .attr('font-size', 12 * ratio)
            .style('text-anchor', 'middle');
    }

    /** */
    function drawInteraction() {
        let path = d3.lineRadial();

        // `*Interaction` variables are used to build the interaction layer.
        // `*Extent` variables are used to compute (and return) the x,y
        // positioning of the attribute extents. `*Value` variables are used
        // for the attribute values.
        let rInteraction = Math.PI / 2;
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
            let value = datum.posts[d];
            if (value === undefined) {
                value = [0];
            }
            let lValue = scale(userScale(value.length));
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
                key: properties[i],
                datum: datum,
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

    chart.width = function (_) {
        if (!arguments.length) return width;
        width = _;
        radius = width / 2;
        origin = [radius, radius];
        scale.range([0, radius]);
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