var HIST_WIDTH = 150;

function generate_hist(data){
  var res = {}
  var result = [];

  for (var i = 0; i < HUEBIN; i++){
    res[i] = 0
  }
  data.forEach(function(d){
    if (d.show){
      res[d.hue] += 1
    }
  });
  for (var key in res) {
    result.push({'hue':key, 'count':res[key]})
  }
  result.sort(function(a,b){
    return a.hue - b.hue;
  })
  return result;
}

function color_hist(svg, data){
  var result = [];
  var width = 150;
  var height = 150;
  var result = generate_hist(data);

  var y = d3.scaleBand()
          .domain(result.map(d=>d.hue))
          .range([0, HIST_WIDTH])
          .padding(0.15);

  var x = d3.scaleLinear()
          .domain([0.0, d3.max(result, d=>(d.count))])
          .range([0, HIST_WIDTH]);

  var total = data.length;
  svg.selectAll('.color_hist')
  .data(result)
  .enter()
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


function radial_scatter(data, svg){
  var temp = data;
  var PADDING = 40;
  var width = 650;
  var height = 650;
  var centroid = svg.append('g')
  .attr('id', 'centroid')
  .attr('transform', translate(width-50, height));
  var radialGradient = svg.append("defs")
    .append("radialGradient")
      .attr("id", "radial-gradient");

  radialGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#000000");

  radialGradient.append("stop")
      .attr("offset", "75%")
      .attr("stop-color", "#333333");

  radialGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#444444");

  centroid.append('circle')
  .attr('r', (width-PADDING)/2)
  .attr('stroke', '#333333')
  .attr('fill', 'url(#radial-gradient)')

  var x = d3.scaleLinear()
  .domain(d3.extent(data, d=>d.dominant_hsl.l))
  .range([width/2-PADDING, 0]);

  var y = d3.scaleLinear()
  .domain(d3.extent(data, d=>d.hue_loc))
  .range([0, 360]);

  var r = d3.scaleLog()
  .domain(d3.extent(data, d=>d.watched))
  .range([1,10]);

  centroid.selectAll('.movie_plot')
  .data(temp)
  .enter()
    .append('circle')
    .attr('class', 'movie_plot')
    .attr('cx', d => Math.cos(y(d.hue_loc)*Math.PI/180)*x(d.dominant_hsl.l))
    .attr('cy', d => Math.sin(y(d.hue_loc)*Math.PI/180)*x(d.dominant_hsl.l))
    .attr('r', 5)
    .on('mouseover', function(d){
      if (d.show){

        // showimage(img, url, 10);
      }
    })
    .attr('fill', function(d){
      if (d.show){
        return d3.hsl(d.dominant_hsl)
      }
      return 'None'
    })
    .style('fill-opacity', 1)
    // .style('stroke', 'white')
    .style('stroke-width', '0.0')
    .style('stroke-opacity', function(d){
      return 0.0
    });

    var hist = svg.append('g')
    .attr('id', 'hist')
    .attr('transform', translate(1.4*width+50, 1.2*height));
    color_hist(hist, temp);
}

function filter_genre_r(data, svg, genre){
  svg.selectAll(".poster_img")
  .transition()
  .duration(500)
  .attr("opacity", 0);
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


  var result = generate_hist(filtered);
  var hist = svg.select('#hist').selectAll(".color_hist").data(result);
  hist.exit().remove();

  var hist_x = d3.scaleLinear()
          .domain([0.0, d3.max(result, d=>(d.count))])
          .range([0, HIST_WIDTH]);

  hist.transition()
  .duration(500)
  .attr('width', d=>hist_x(d.count))


  // JOIN new data with old elements.
  var newplot = svg.selectAll(".movie_plot")
    .data(filtered);

  newplot.exit().remove();

  newplot
  .transition()
  .ease(d3.easeCubic).duration(500)
  .style('stroke-width', function(d){
    if (d.show){
      return 1
    }
    else{
      return 0.3
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
      return 3;
    }
  });
};


function filter_year_r(data, svg, year){
  var PADDING = 40;
  var width = 650;
  var height = 650;

  var x = d3.scaleLinear()
  .domain(d3.extent(data, d=>d.dominant_hsl.l))
  .range([width/2-PADDING, 0]);

  var y = d3.scaleLinear()
  .domain(d3.extent(data, d=>d.hue_loc))
  .range([0, 360]);

  var r = d3.scaleLog()
  .domain(d3.extent(data, d=>d.watched))
  .range([1,40]);

  var filtered = data.map(function(d){
    d.show = (d.year==year);
    return d
  });
  // JOIN new data with old elements.
  var newplot = svg.selectAll(".movie_plot")
    .data(filtered);

  svg.selectAll(".poster_img")
  .transition()
  .duration(100)
  .attr("opacity", 0)
  .on("end", function(){
    // console.log('hi')
  });
  svg.selectAll(".poster_img").remove();
  newplot.exit().remove();



  svg.select('#centroid').selectAll(".poster_img").data(filtered)
  .enter()
  .append("image")
  .attr("class", 'poster_img')
  .attr("xlink:href", function(d){
    if (d.show){
      return d.url.split(/\'|, |\'/)[1]
    }
  })
  .attr("x", d => Math.cos(y(d.hue_loc)*Math.PI/180)*x(d.dominant_hsl.l)-r(d.watched)/1.5)
  .attr("y", d => Math.sin(y(d.hue_loc)*Math.PI/180)*x(d.dominant_hsl.l)-r(d.watched))
  .attr("height", d => 2*r(d.watched))
  .attr("opacity", 0)
  .style("visibility", function(d){return d.show ? "visible": 'hidden'});

  svg.select('#centroid').selectAll(".poster_img")
  .transition()
  .duration(1000)
  .attr("opacity", 0.8)



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
      return 0
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
      // this.parentNode.appendChild(this);
      return r(d.watched)
    }
    else{
      return 2;
    }
  });
};
