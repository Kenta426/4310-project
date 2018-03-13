var RECT_HEIGHT = 40;
var HEAT_WIDTH = 605;
var PADDING_HEAT = 20;
var TS_HEIGHT = 40;
var TS_WIDTH = 350;

function plot_timeseries(data, svg){
  // data {'hue' : [{"year": x, "value": y},{"year": x, "value": y},{"year": x, "value": y}]}
  var temp  = generate_streamgraph(data);
  var heat_data = [];
  for (var i = 0; i < HUEBIN; i++){
    heat_data.push({
      'hue': i, 'data': []
    })
  };
  // sort by year
  var sorted = temp.sort(function(a,b){
    return Number(a.key)-Number(b.key)
  })
  sorted.forEach(function(d){
    var total = d3.sum(d.values, function(i){
      return i.value;
    });
    for (var i = 0; i < HUEBIN; i++){
      var found = false;
      d.values.forEach(function(kv){
        if (i == Number(kv.key)){
          found = true;
          heat_data[i]['data'].push(kv.value)
        }
      });
      if (!found){
        heat_data[i]['data'].push(0)
      }
    };
  });

  var year_array = [];
  for (var i = 0; i < 50; i ++){
    year_array.push(i);
  }

  var year_x = d3.scaleBand()
    .domain(year_array)
    .range([0, TS_WIDTH])
    .padding(0.2);

  var max_arr = heat_data.map(function(d){return d3.max(d.data)});
  var min_arr = heat_data.map(function(d){return d3.min(d.data)});


  var opacity_scales = d3.scaleLinear()
    .domain([d3.min(min_arr),d3.max(max_arr)])
    .range([0, 1]);

  var hue_scale = d3.scaleLinear()
  // .domain([d3.min(min_arr),d3.max(max_arr)])
  .domain([d3.min(min_arr),28])
  // .range(["#111111",d3.hsl(i*360/HUEBIN+180/HUEBIN,0.5,0.5)]);

  heat_data.forEach(function(d, i){
    var y = d3.scaleLinear()
    .rangeRound([TS_HEIGHT, 0])
    .domain(d3.extent(d.data));

    var line = d3.line()
        .curve(d3.curveMonotoneX)
        .x(function(d,i) { return year_x(Number(i))+year_x.bandwidth()/2; })
        .y(function(d) { return y(Number(d)); });

    var base = d3.min(d.data);
    var zero_line = d3.line()
        .x(function(d, i) { return year_x(Number(i))+year_x.bandwidth()/2; })
        .y(function(d) { return y(Number(base)); });

    // opacity_scales.domain(d3.extent(d.data));
    hue_scale.range(["#111111",d3.hsl(i*360/HUEBIN+180/HUEBIN,0.5,0.5)]);
    // .domain(d3.extent(d.data))
    // .range(["#111111",d3.hsl(i*360/HUEBIN+180/HUEBIN,0.5,0.5)]);
    // console.log(d3.extent(d.data))
    var g = svg.append('g')
    .attr('transform', translate(650, i * (PADDING_HEAT+TS_HEIGHT)));

    g.append("path")
      .datum(d.data)
      .attr("fill", "none")
      .attr("stroke", 'white')
      .attr("d", zero_line);

    // thick line at y = 0
    g.append("path")
      .datum(d.data)
      .attr("fill", "none")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 1.5)
      .attr("stroke", d3.hsl(i*360/HUEBIN+180/HUEBIN,0.5,0.5))
      .attr("d", line);

    g.selectAll(".plot").data(d.data)
    .enter()
    .append("circle")
      .attr("class", "plot")
      .attr("cx", function(d,i) { return year_x(Number(i))+year_x.bandwidth()/2; })
      .attr("cy", function(d) { return y(Number(d)); })
      .attr("r", 2)
      .attr("fill", d3.hsl(i*360/HUEBIN+180/HUEBIN,0.5,0.5))
      .style("opacity", 1);
  })
}


function plot_heatmap(data, svg){
  // data {'hue' : [{"year": x, "value": y},{"year": x, "value": y},{"year": x, "value": y}]}
  var temp  = generate_streamgraph(data);
  var heat_data = [];
  for (var i = 0; i < HUEBIN; i++){
    heat_data.push({
      'hue': i, 'data': []
    })
  };
  // sort by year
  var sorted = temp.sort(function(a,b){
    return Number(a.key)-Number(b.key)
  })
  sorted.forEach(function(d){
    var total = d3.sum(d.values, function(i){
      return i.value;
    });
    for (var i = 0; i < HUEBIN; i++){
      var found = false;
      d.values.forEach(function(kv){
        if (i == Number(kv.key)){
          found = true;
          heat_data[i]['data'].push(kv.value)
        }
      });
      if (!found){
        heat_data[i]['data'].push(0)
      }
    };
  });

  var year_array = [];
  for (var i = 0; i < 50; i ++){
    year_array.push(i);
  }

  var heat_x = d3.scaleBand()
    .domain(year_array)
    .range([0, HEAT_WIDTH])
    .padding(0.15);


  var max_arr = heat_data.map(function(d){return d3.max(d.data)});
  var min_arr = heat_data.map(function(d){return d3.min(d.data)});


  var opacity_scales = d3.scaleLinear()
    .domain([d3.min(min_arr),d3.max(max_arr)])
    .range([0, 1]);

  var hue_scale = d3.scaleLinear()
  // .domain([d3.min(min_arr),d3.max(max_arr)])
  .domain([d3.min(min_arr),28])
  // .range(["#111111",d3.hsl(i*360/HUEBIN+180/HUEBIN,0.5,0.5)]);


  heat_data.forEach(function(d, i){
    // opacity_scales.domain(d3.extent(d.data));
    hue_scale.range(["#111111",d3.hsl(i*360/HUEBIN+180/HUEBIN,0.5,0.5)]);
    // .domain(d3.extent(d.data))
    // .range(["#111111",d3.hsl(i*360/HUEBIN+180/HUEBIN,0.5,0.5)]);
    // console.log(d3.extent(d.data))
    var g = svg.append('g')
    .attr('transform', translate(33, i * (RECT_HEIGHT+PADDING_HEAT)));
    g.selectAll('.heat_cell')
    .data(d.data)
    .enter()
      .append('rect')
      .attr('calss', 'heat_cell')
      .attr('x', function(d,i){return heat_x(i)})
      .attr('width', heat_x.bandwidth())
      .attr('height', RECT_HEIGHT)
      // .attr('opacity', d => opacity_scales(d))
      .attr('fill', function(d){return hue_scale(d)});
  })
}
