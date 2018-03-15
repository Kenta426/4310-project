// constants
var HIST_WIDTH = 150;
var HIST_HEIGHT = 150;
var PADDING = 35;
var WIDTH = 550;
var HEIGHT = 550;
var INFO_BOX_HEIGHT = 200;
var YEAR_SEARCH_HEIGHT = 30;

// generate histogram data
function generate_hist(data){
  var res = {}
  var result = [];
  // count the frequency of each huebin
  for (var i = 0; i < HUEBIN; i++){ res[i] = 0; }
  data.forEach(function(d){
    if (d.show){ res[d.hue] += 1;}
  });
  // create JSON
  for (var key in res) {
    result.push({'hue':key, 'count':res[key]})
  }
  // sort by hue
  result.sort(function(a,b){
    return a.hue - b.hue;
  })
  return result;
}

// plot histogram
function color_hist(svg, data){
  // generate data
  var result = generate_hist(data);

  // scale function
  var y = d3.scaleBand()
          .domain(result.map(d=>d.hue))
          .range([0, HIST_HEIGHT])
          .padding(0.15);
  var x = d3.scaleLinear()
          .domain([0.0, d3.max(result, d=>(d.count))])
          .range([0, HIST_WIDTH]);
  // plot rect
  svg.selectAll('.color_hist')
    .data(result).enter()
      .append('rect')
      .attr('class', 'color_hist')
      .attr('x', 0)
      .attr('y', d=>y(d.hue))
      .attr('height', y.bandwidth())
      .attr('width', function(d){
        return d3.select(this).attr('width');
      })
      .attr('fill', d=>d3.hsl(d.hue*360/HUEBIN+180/HUEBIN,0.8,0.5))
      .transition()
      .duration(500)
      .attr('width', d=>x(d.count))
}

// plot radial scatter plot
function radial_scatter(data, svg){
  var temp = data;
  var centroid = svg.append('g')
  .attr('id', 'centroid')
  .attr('transform', translate(WIDTH/2+PADDING, HEIGHT/2+PADDING));
// implement gradient scale
  var radialGradient = svg.append("defs")
    .append("radialGradient")
      .attr("id", "radial-gradient");
  // 0% stop
  radialGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#777777");
  // 75% stop
  radialGradient.append("stop")
      .attr("offset", "45%")
      .attr("stop-color", "#eeeeee");
  // 100% stop
  radialGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#eeeeee");

  // frame circle
  centroid.append('circle')
  .attr('r', (WIDTH+PADDING)/2)
  .attr('fill', 'url(#radial-gradient)');
  // color thick (the scaling is pretty much hard-coded)
  var arc = d3.arc()
    .outerRadius((WIDTH-PADDING)/2+27)
    .innerRadius((WIDTH-PADDING)/2+25)
    .padAngle(0.15)
    .cornerRadius(3);
  // pie layout
  var pie = d3.pie()
      .sort(null)
      .value(function(d) { return d; });
  // dummy data
  var labels = [];
  for (var i = 0; i < HUEBIN; i++){
    labels.push(1);
  }
  // insert pie chart
  var g = centroid.selectAll(".arc")
    .data(pie(labels))
  .enter().append("g")
    .attr("class", "arc");

  g.append("path")
      .attr("d", arc)
      .style("opacity", 0.9)
      .style("fill", function(d, i){return d3.hsl(i*360/HUEBIN+180/HUEBIN,0.8,0.5)});

  var ticks = centroid.selectAll(".ticks")
  .data([0.2, 0.5, 0.8])
  .enter()
  .append('circle')
  .attr('class', 'ticks')
  .attr('r', d => WIDTH/2*d)
  .attr('fill', 'none')
  .attr('stroke', '#222222')
  .attr('stroke-width', '1.2')
  .attr('opacity', 0.6)
  .attr('stroke-dasharray', '4, 5');

  // scale functions
  // radius by lightness
  var x = d3.scaleLinear()
  .domain(d3.extent(data, d=>d.dominant_hsl.l))
  .range([WIDTH/2-PADDING/2, 0]);
  // angle by hue
  var y = d3.scaleLinear()
  .domain(d3.extent(data, d=>d.hue_loc))
  .range([0, 360]);
  // each plot can be scaled by popularity
  // I think we shouldn't anymore
  var r = d3.scaleLog()
  .domain(d3.extent(data, d=>d.watched))
  .range([1,10]);

  // scatter plot
  centroid.selectAll('.movie_plot')
  .data(temp)
  .enter()
    .append('circle')
    .style('pointer-events', null)
    .attr('class', 'movie_plot')
    .attr('cx', d => Math.cos(y(d.hue_loc)*Math.PI/180)*x(d.dominant_hsl.l))
    .attr('cy', d => Math.sin(y(d.hue_loc)*Math.PI/180)*x(d.dominant_hsl.l))
    .attr('r', 3)
    .attr('fill', d => d.show ? d3.hsl(d.dominant_hsl) : 'None')
    .style('fill-opacity', 0.7)
    .style('stroke-opacity', function(d){
      return 0.0;
    });

    // potentially plot histogram to show the color distribution
    var hist = svg.append('g')
    .attr('id', 'hist')
    .attr('transform', translate(1.4*WIDTH+50, 1.2*HEIGHT));
    // color_hist(hist, temp);
    // implement_hover(centroid, data, 5);
}

// filter by genre
function filter_genre_r(data, svg, genre){
  svg.selectAll('#hover').remove();
  svg.selectAll('.tooltip').remove();
  svg.selectAll(".poster_img").remove();
  // if there is an image, make them not visible
  svg.selectAll(".poster_img")
  .transition()
  .duration(100)
  .attr("opacity", 0)
  .style("visibility", 'hidden');

  var r = d3.scaleLog()
  .domain(d3.extent(data, d=>d.watched))
  .range([1,14]);

  // change the show attribute of mathced data to true
  var filtered = data.map(function(d){
    if (genre == 'all'){
      d.show = true;
    }
    else{
      d.show = d.genre.includes(genre);
    }
    return d
  });



  // animation for histogram
  var result = generate_hist(filtered);
  var hist = svg.select('#hist').selectAll(".color_hist").data(result);
  hist.exit().remove();
  var hist_x = d3.scaleLinear()
          .domain([0.0, d3.max(result, d=>(d.count))])
          .range([0, HIST_WIDTH]);
  hist.transition()
  .duration(500)
  .attr('width', d=>hist_x(d.count));


  // insert new data
  var newplot = svg.selectAll(".movie_plot")
    .data(filtered);
  // remove old ones
  newplot.exit().remove();
  // update
  newplot
  .transition().ease(d3.easePoly).duration(500)
  .style('stroke-width', d => (d.show) ? 1 : 0.3)
  .style('fill-opacity', d => (d.show) ? 0.9 : 0.15)
  .attr('r', d => (d.show) ? 4.5 : 2);

  var centroid = svg.select('#centroid');

  implement_hover(centroid, filtered, 8);
  update_timeseries(filtered, svg);
};


function filter_year_r(data, svg, year){
  svg.selectAll('#hover').remove();
  svg.selectAll('.tooltip').remove();
  svg.selectAll(".poster_img").remove();
  // if there is an image, make them not visible
  svg.selectAll(".poster_img")
  .attr("opacity", 0)
  .style("visibility", 'hidden');

  var r = d3.scaleLog()
  .domain(d3.extent(data, d=>d.watched))
  .range([1,14]);

  // change the show attribute of mathced data to true
  var filtered = data.map(function(d){
    d.show = (d.year === year);
    return d
  });
  // animation for histogram
  var result = generate_hist(filtered);
  var hist = svg.select('#hist').selectAll(".color_hist").data(result);
  hist.exit().remove();
  var hist_x = d3.scaleLinear()
          .domain([0.0, d3.max(result, d=>(d.count))])
          .range([0, HIST_WIDTH]);
  hist
  .attr('width', d=>hist_x(d.count));


  // insert new data
  var newplot = svg.selectAll(".movie_plot")
    .data(filtered);
  // remove old ones
  newplot.exit().remove();
  // update
  newplot
  .style('stroke-width', d => (d.show) ? 1 : 0.3)
  .style('fill-opacity', d => (d.show) ? 0.9 : 0.15)
  .attr('r', d => (d.show) ? 6 : 2);

  var centroid = svg.select('#centroid');

  implement_hover(centroid, filtered, 8);
};

function filter_yearANDgenre_r(data, svg, year, genre){
  svg.selectAll(".poster_img")
  .transition()
  .duration(100)
  .attr("opacity", 0);
  var PADDING = 100;
  var width = 900;
  var height = 900;
  var r = d3.scaleLog()
  .domain(d3.extent(data, d=>d.watched))
  .range([1,25]);

  var filtered = data.map(function(d){
    d.show = (d.year==year) && (d.genre.includes(genre));
    return d
  });
  // JOIN new data with old elements.
  var newplot = svg.selectAll(".movie_plot")
    .data(filtered);

  newplot.exit().remove();

  newplot
  .transition()
  .ease(d3.easeCubic).duration(1000)
  .style('stroke-width', function(d){
    if (d.show){
      return 1
    }
    else{
      return 0.1
    }
  })
  .style('fill-opacity', function(d){
    if (d.show){
      return 0.8
    }
    else{
      return 0
    }
  })
  .attr('r', function(d){
    if (d.show){
      // this.parentNode.appendChild(this);
      return r(d.watched)
    }
    else{
      return 2;
    }
  });
};

function filter_hue_r(data, svg, hue){
  var PADDING = 100;
  var width = 900;
  var height = 900;
  var r = d3.scaleLog()
  .domain(d3.extent(data, d=>d.watched))
  .range([1,10]);

  var filtered = data.map(function(d){
    d.show = (d.hue==hue);
    return d
  });
  // JOIN new data with old elements.
  var newplot = svg.selectAll(".movie_plot")
    .data(filtered);

  newplot.exit().remove();

  newplot
  .transition()
  .ease(d3.easeCubic).duration(1000)
  .style('stroke-width', function(d){
    if (d.show){
      return 1
    }
    else{
      return 0.1
    }
  })
  .style('fill-opacity', function(d){
    if (d.show){
      return 0.8
    }
    else{
      return 0
    }
  })
  .attr('r', function(d){
    if (d.show){
      return r(d.watched)
    }
    else{
      return 2;
    }
  });
};
