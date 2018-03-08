function year_strip(data, year, hue, svg){
  var filtered = data.filter(d => d.year === year && d.hue === hue);
  // console.log(filtered);
  var x = d3.scaleBand()
    .domain(filtered.map(function(d,i){return i}))
    .range([0,50]);

  svg.selectAll('#strip')
  .data(filtered)
  .enter()
    .append('line')
    .attr('id', 'strip')
    .attr('y1', 10)
    .attr('y2', 60)
    .attr('x1', function(d,i){return x(i)})
    .attr('x2', function(d,i){return x(i)})
    // .style("stroke", function(d){return (d3.hsl((360/HUEBIN)*d.hue, 100,100))})
    .style("stroke", function(d){return d3.hsl(d.dominant_hsl)})
    .style("opacity", 1)
}

function heat_timeseries(data, svg){
  var width = 40;
  var height = 75;
  var OLDEST = 1968;
  for (var i = 0; i < 50; i++){
    var year_g = svg.append('g')
    .attr("transform", translate(width*i,0));

    for (var h = 0; h < 6; h++){
      var strip_g = year_g.append('g')
      .attr("transform", translate(0,h*height));
      year_strip(data, OLDEST+i, h, strip_g);
    }
  }
}

function stacked_bar(data, svg){

  var OLDEST = 1968;
  var stack_data = [];
  for (var i = 0; i < 50; i++){
    var year = data.filter(d=>d.year === OLDEST+i);
    var year_sum = year.length;
    for (var h = 0; h < 6; h++){
      var hue = year.filter(d=> d.hue === h);
      // var key = ;
      var point = {};
      point["prop-"+h] = hue.length/year_sum;
      point["year"] = OLDEST+i;
      stack_data.push(point);
    }
  }

  var col = [];
  for (var h = 0; h < 6; h++){
    col.push("prop-"+h);
  }

  // var stack = .offset(d3.stackOffsetExpand);
  var year = stack_data.filter(d=>d.year === 2017);
  console.log(col);
  console.log(stack_data);
  console.log(d3.stack().order(d3.stackOrderNone).offset(d3.stackOffsetNone).keys(col)(year));

  var width = 1000;
  var height = 75;
  var x = d3.scaleBand()
      .domain(d3.extent(stack_data, d=>d.year))
      .rangeRound([0, width])
      .padding(0.3);
  var y = d3.scaleLinear()
    .rangeRound([height, 0])
    .domain(d3.extent(stack_data, d=>d.prop));

  svg.selectAll('.colorStack')
  .data(stack_data)
  .enter()
    .append('rect')
    .attr('class', 'colorStack');
}

function scatter(data, svg){
  var temp = data;
  var PADDING = 100;
  var width = 1200;
  var height = 800;
  var x = d3.scaleLinear()
  .domain(d3.extent(data, d=>d.dominant_hsl.l))
  .range([PADDING,width-PADDING]);

  var y = d3.scaleLinear()
  .domain(d3.extent(data, d=>d.hue_loc))
  .range([height-PADDING,PADDING]);

  var r = d3.scaleLog()
  .domain(d3.extent(data, d=>d.watched))
  .range([1,9]);


  var color = temp.filter(function(d){
    return ! isNaN(d.dominant_hsl.h)
  });
  // console.log(color);


  svg.selectAll('.movie_plot')
  .data(color)
  .enter()
    .append('circle')
    .attr('class', 'movie_plot')
    .attr('cx', d => x(d.dominant_hsl.l))
    .attr('cy', d => y(d.hue_loc))
    .attr('r', 5)
    .attr('fill', function(d){
      if (d.show){
        return d3.hsl(d.dominant_sat)
      }
      return 'None'
    })
    .attr('opacity', 0.9)
    .style('stroke', 'white')
    .style('stroke-width', '0.5')
    .style('stroke-opacity', function(d){
      if (d.show){
        return 0.5
      }
      return 0.1
    })
}

function filter_genre(data, svg, genre){
  svg.selectAll(".movie_plot").remove();
  var temp = data.map(
    function(d){
      d.show = d.genre.includes(genre);
      return d
    });
  // console.log(temp);
  scatter(temp, svg);
}


function filter_year(data, svg, year){
  svg.selectAll(".movie_plot").remove();
  var temp = data.map(
    function(d){
      d.show = (d.year === year);
      return d
    });
  // console.log(temp);
  scatter(temp, svg);
}

function filter_decade(data, svg, decade){
  years = [];
  for (var i = 0; i < 10; i++){
    years.push(decade + i);
  };
  svg.selectAll(".movie_plot").remove();
  var temp = data.map(
    function(d){
      d.show = (years.includes(d.year));
      return d
    });
  // console.log(temp);
  scatter(temp, svg);
}
