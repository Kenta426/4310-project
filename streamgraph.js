// generate streamgraph data; returns an Object
// e.g. {1968: {0: 40, 1: 24, 2: 6, 3: 2, 4: 3, 5: 10, 6: 6, 7: 2, 8: 6}}
let generate_streamgraph = function(data) {
  return d3.nest()
    .key(function(d) { return String(d.year); })
    .key(function(d) { if (d.show===true) {return String(d.hue)}})
    .rollup(function(v) { return v.length; })
    .entries(data);
}

var test;

let plot_streamgraph = function(data, svg) {
  // conform data to acceptable format
  // e.g. [{"year": 1968, 0: 40, 1: 24, 2: 6, 3: 2, 4: 3, 5: 10, 6: 6, 7: 2, 8: 6}]
  let new_array = []; // create JSON
  let m = 50;
  let td = generate_streamgraph(data)
  td.forEach(function(d) {
  	let temp = {};
    for (var i = 0; i < HUEBIN; i++){
      temp[String(i)] = 0;
    }
  	d.values.forEach(function(v) {
  		temp[v.key] = v.value
    })
  	temp["year"] = d.key;
  	new_array.push(temp);
  })

  let stack = d3.stack().keys(d3.range(HUEBIN))
        .order(d3.stackOrderInsideOut)
        .offset(d3.stackOffsetWiggle),
      layers = stack(new_array);
  test = layers;
  let width = 600,
      height = 300;

  let x = d3.scaleLinear()
    .domain([0, m - 1])
    .range([0, width]);

  let y = d3.scaleLinear()
    .domain([d3.min(layers, stackMin), d3.max(layers, stackMax)])
    .range([height, 0]);

  // let z = d3.interpolateCool; //temporarily not using our own colors

  let area = d3.area()
    .curve(d3.curveMonotoneX)
    .x(function(d, i) { return x(i); })
    .y0(function(d) { return y(d[0]); })
    .y1(function(d) { return y(d[1]); });

  svg.selectAll("path")
    .data(layers)
    .enter().append("path")
      .attr("d", area)
      .attr("stroke", (d, i) => d3.hsl(i*360/HUEBIN+180/HUEBIN, 0.4, 0.5))
      .attr("stroke-width", (d, i) => "1px")
      .attr("fill", (d, i) => d3.hsl(i*360/HUEBIN+180/HUEBIN, 0.4, 0.5))
      .attr("fill-opacity", (d, i) => 0.8)
      .attr('transform', translate(PADDING, PADDING));

  // below are two helper functions to return the min and max values
  // courtesy of Bostock https://bl.ocks.org/mbostock/4060954
  function stackMax(layer) {
    return d3.max(layer, function(d) { return d[1]; });
  }

  function stackMin(layer) {
    return d3.min(layer, function(d) { return d[0]; });
  }
}
