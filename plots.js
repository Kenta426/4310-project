function radial_scatter(data, svg){
  var temp = data;
  var PADDING = 50;
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
  .range([1,7]);


  // var color = temp.filter(function(d){
  //   return ! isNaN(d.dominant_hsl.h)
  // });
  // console.log(color);

  centroid.selectAll('.movie_plot')
  .data(temp)
  .enter()
    .append('circle')
    .attr('class', 'movie_plot')
    .attr('cx', d => Math.cos(y(d.hue_loc)*Math.PI/180)*x(d.dominant_hsl.l))
    .attr('cy', d => Math.sin(y(d.hue_loc)*Math.PI/180)*x(d.dominant_hsl.l))
    .attr('r', d => r(d.watched))
    .on('mouseover', function(d){
      if (d.show){
        console.log(d.title);
      }
    })
    .attr('fill', function(d){
      if (d.show){
        return d3.hsl(d.dominant_hsl)
      }
      return 'None'
    })
    .style('fill-opacity', 0.6)
    .style('stroke', 'white')
    .style('stroke-width', '0.2')
    .style('stroke-opacity', function(d){
      return 0.5
    })
}

function filter_genre_r(data, svg, genre){
  var PADDING = 100;
  var width = 900;
  var height = 900;
  var r = d3.scaleLog()
  .domain(d3.extent(data, d=>d.watched))
  .range([1,14]);

  var filtered = data.map(function(d){
    d.show = d.genre.includes(genre);
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


function filter_year_r(data, svg, year){
  var PADDING = 100;
  var width = 900;
  var height = 900;
  var r = d3.scaleLog()
  .domain(d3.extent(data, d=>d.watched))
  .range([1,21]);

  var filtered = data.map(function(d){
    d.show = (d.year==year);
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
