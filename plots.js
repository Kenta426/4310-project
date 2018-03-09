function radial_scatter(data, svg){
  var temp = data;
  var PADDING = 100;
  var width = 900;
  var height = 900;
  var centroid = svg.append('g')
  .attr('transform', translate(width/2, height/2));

  centroid.append('circle')
  .attr('r', (width-PADDING)/2)
  .attr('stroke', 'white')
  .attr('fill', 'None')

  var x = d3.scaleLinear()
  .domain(d3.extent(data, d=>d.dominant_hsl.l))
  .range([width/2-PADDING, 0]);

  var y = d3.scaleLinear()
  .domain(d3.extent(data, d=>d.hue_loc))
  .range([0, 360]);

  var r = d3.scaleLog()
  .domain(d3.extent(data, d=>d.watched))
  .range([0.1,12]);


  var color = temp.filter(function(d){
    return ! isNaN(d.dominant_hsl.h)
  });
  // console.log(color);


  centroid.selectAll('.movie_plot')
  .data(color)
  .enter()
    .append('circle')
    .attr('class', 'movie_plot')
    .attr('cx', d => Math.cos(y(d.hue_loc)*Math.PI/180)*x(d.dominant_hsl.l))
    .attr('cy', d => Math.sin(y(d.hue_loc)*Math.PI/180)*x(d.dominant_hsl.l))
    .attr('r', d => r(d.watched))
    .on('mouseover', function(d){
      console.log(d);
    })
    .attr('fill', function(d){
      if (d.show){
        return d3.hsl(d.dominant_sat)
      }
      return 'None'
    })
    .attr('opacity', 0.6)
    .style('stroke', 'white')
    .style('stroke-width', '1')
    .style('stroke-opacity', function(d){
      if (d.show){
        return 0.5;
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

function filter_genre_r(data, svg, genre){
  svg.selectAll(".movie_plot").remove();
  var temp = data.map(
    function(d){
      d.show = d.genre.includes(genre);
      return d
    });
  // console.log(temp);
  radial_scatter(temp, svg);
}


function filter_year_r(data, svg, year){
  svg.selectAll(".movie_plot").remove();
  var temp = data.map(
    function(d){
      d.show = (d.year === year);
      return d
    });
  // console.log(temp);
  radial_scatter(temp, svg);
}

function filter_decade_r(data, svg, decade){
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
  radial_scatter(temp, svg);
}
