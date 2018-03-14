var RECT_HEIGHT = 40;
var HEAT_WIDTH = 605;
var PADDING_HEAT = 5;
var TS_HEIGHT = 50;
var TS_WIDTH = 200;

function update_timeseries(data, svg){
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
    var total = d3.sum(d.values, d=>d.value);
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

  var y = d3.scaleLinear()
  .rangeRound([TS_HEIGHT, 0])
  .domain([d3.min(min_arr),d3.max(max_arr)]);

  heat_data.forEach(function(d, i){
    var y = d3.scaleLinear()
    .rangeRound([TS_HEIGHT, 0])
    .domain(d3.extent(d.data));

    var line = d3.line()
        .curve(d3.curveBasis)
        .x(function(d,i) { return year_x(Number(i)); })
        .y(function(d) { return y(Number(d)); });

    var base = d3.min(d.data);

    var area = d3.area()
    .curve(d3.curveBasis)
    .x(function(d,i) { return year_x(Number(i)); })
    .y1(function(d) { return y(Number(d)); })
    .y0(function(d) { return y(Number(base)); });

    // opacity_scales.domain(d3.extent(d.data));
    hue_scale.range(["#111111",d3.hsl(i*360/HUEBIN+180/HUEBIN,0.5,0.5)]);
    var g = svg.select('#hue_axis'+String(i));
    var path = g.select(".shade").datum(d.data);

    path.exit().remove();
    path.transition()
    .duration(500).attr("d", area);

    // thick line at y = 0

    var time = g.select(".timeseries").datum(d.data);

    time.exit().remove();
    time.transition()
    .duration(500).attr("d", line);
  });
}

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

  var y = d3.scaleLinear()
  .rangeRound([TS_HEIGHT, 0])
  .domain([d3.min(min_arr),d3.max(max_arr)]);

  var y_store = [];

  var mouseG = svg.append("g")
      .attr("class", "mouse-over-effects")
      .attr("transform", translate(WIDTH+3*PADDING, (2) * (PADDING_HEAT+TS_HEIGHT)-10));

  mouseG.datum(year_array)
  .enter()
      .append("g")
      .attr("class", "mouse-per-line");

  mouseG.append("path") // this is the black vertical line to follow mouse
      .attr("class", "mouse-line")
      .style('pointer-events', null)
      .style("stroke", "gray")
      .style("stroke-width", "1px")
      .style("stroke-opacity", 0.4)

  mouseG.append("text") // this is the black vertical line to follow mouse
      .attr("class", "current_year")
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'central')
      .attr('font-size', '10px')
      .attr("transform", translate(0,15+HUEBIN * (PADDING_HEAT+TS_HEIGHT)))

  heat_data.forEach(function(d, i){
    var y = d3.scaleLinear()
    .rangeRound([TS_HEIGHT, 0])
    .domain(d3.extent(d.data));

    y_store.push(y);

    var line = d3.line()
        .curve(d3.curveBasis)
        .x(function(d,i) { return year_x(Number(i)); })
        .y(function(d) { return y(Number(d)); });

    var base = d3.min(d.data);

    var line2 = d3.line()
        .curve(d3.curveBasis)
        .x(function(d,i) { return year_x(Number(i)); })
        .y(function(d) { return y(Number(base)); });

    var area = d3.area()
    .curve(d3.curveBasis)
    .x(function(d,i) { return year_x(Number(i)); })
    .y1(function(d) { return y(Number(d)); })
    .y0(function(d) { return y(Number(base)); });

    var area2 = d3.area()
    .curve(d3.curveBasis)
    .x(function(d,i) { return year_x(Number(i)); })
    .y1(function(d) { return y(Number(base)); })
    .y0(function(d) { return y(Number(base)); });

    var zero_line = d3.line()
        .x(function(d, i) { return year_x(Number(i)); })
        .y(function(d) { return y(Number(base)); });

    // opacity_scales.domain(d3.extent(d.data));
    hue_scale.range(["#111111",d3.hsl(i*360/HUEBIN+180/HUEBIN,0.5,0.5)]);
    var g = svg.append('g')
    .attr('id', 'hue_axis'+String(i))
    .style('pointer-events', null)
    .attr('transform', translate(WIDTH+3*PADDING, (i+2) * (PADDING_HEAT+TS_HEIGHT)));

    g.append("path")
         .datum(d.data)
         .attr('class', 'shade')
         .attr("fill", d3.hsl(i*360/HUEBIN+180/HUEBIN,0.5,0.5))
         .attr("d", area2)
         .style('pointer-events', null)
         .attr("opacity", 0.1)
         .transition()
         .ease(d3.easePoly)
         .duration(1000)
         .attr("d", area);

    // thick line at y = 0
    g.append("path")
      .datum(d.data)
      .attr("class", "timeseries")
      .style('pointer-events', null)
      .attr("fill", "none")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 1.5)
      .attr("stroke", d3.hsl(i*360/HUEBIN+180/HUEBIN,0.5,0.5))
      .attr("d", line2)
      .transition()
      .ease(d3.easePoly)
      .duration(1000)
      .attr("d", line);
  });

  var mouse_scale = d3.scaleLinear()
  .domain([0,TS_WIDTH])
  .range([0,49]);

  mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
      .attr('width', TS_WIDTH) // can't catch mouse events on a g element
      .attr('height', HUEBIN * (2*PADDING_HEAT+TS_HEIGHT))
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mousemove', function(){
        var mouse = d3.mouse(this);
        var pos = Math.floor(mouse_scale(mouse[0]));
        if (pos < 0){
          pos = 0
        }
        if (pos > 49){
          pos = 49;
        }
        d3.select(".mouse-line")
          .attr("d", function() {
            var d = "M" + year_x(pos) + "," + HUEBIN*(2*PADDING_HEAT+TS_HEIGHT);
            d += " " + year_x(pos) + "," + 0;
            return d;
          });

        d3.select(".current_year")
        .text(pos + 1968)
        .attr('x', year_x(pos));

        var temp_data = [];
        for (var i = 0; i < HUEBIN; i++){
          temp_data.push(pos)
        }
        // d3.selectAll('.hover_circle').remove();
        // temp_data.forEach(function(d,i){
        //   var g = d3.select('#hue_axis'+String(i));
        //   g.append('circle')
        //   .attr('class', 'hover_circle')
        //   .attr('cx', year_x(d))
        //   .attr('cy', y_store[i](heat_data[i].data[d]))
        //   .attr('r', 3)
        //   .attr('fill', 'white')
        //   .attr("stroke", d3.hsl(i*360/HUEBIN+180/HUEBIN,0.5,0.5));
        // })
        filter_year_r(newdata,svg,1968+Math.floor(mouse_scale(mouse[0])));
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
