var TT_WIDTH = 200;
var TT_HEIGHT = 50;
var MAX_DIST = 30;

function showTooltips(loc, data, svg){
  svg.selectAll('.tooltip').remove();

  // console.log(textSize(data.title))
  var text = svg.append('g')
  .attr('class', 'tooltip')
  .attr('transform', translate(loc[0], loc[1]-50));

  text.append('text')
  .text(data.title)
  .attr('id', 'title')
  .attr('font-size', '8px')
  .style('pointer-events', null)
  .style("visibility", 'hidden');
  var text_element = text.select("#title");
  var textWidth = text_element.node().getComputedTextLength();

  text.append('text')
  .text('('+ data.year + ')')
  .attr('id', 'year')
  .attr('font-size', '8px')
  .style('pointer-events', null)
  .style("visibility", 'hidden');
  var text_element = text.select("#year");
  var textWidth2 = text_element.node().getComputedTextLength();

  text.append('text')
  .text(data.director)
  .attr('id', 'director')
  .attr('font-size', '8px')
  .style('pointer-events', null)
  .style("visibility", 'hidden');
  var text_element = text.select("#director");
  var textWidth3 = text_element.node().getComputedTextLength();

  text.append('text')
  .text(data.watched + '  views  |  rating : '+ data.rate + '/5  ')
  .attr('id', 'stats')
  .attr('font-size', '8px')
  .style('pointer-events', null)
  .style("visibility", 'hidden');
  var text_element = text.select("#stats");
  var textWidth4 = text_element.node().getComputedTextLength();

  var width = d3.max([textWidth,textWidth2,textWidth3,textWidth4]) + 25 * 2;
  text.selectAll('text').remove();

  text.append('rect')
  .attr('transform', translate(-width/2, -30))
  // .attr('id', 'frame')
  .attr('x', 0)
  .attr('y', 0)
  .attr('width', width)
  .attr('height', TT_HEIGHT)
  .style('pointer-events', null)
  .attr('opacity', 0.5);


  text.append('text')
  .attr('class', 'info')
  .text(data.title)
  .attr('transform', translate(0, -20))
  .attr('text-anchor', 'middle')
  .attr('alignment-baseline', 'central')
  .attr('font-size', '8px')
  .style('pointer-events', null)
  .attr('fill', 'white');

  text.append('text')
  .attr('class', 'info')
  .attr('transform', translate(0, -10))
  .text('('+ data.year + ')')
  .attr('text-anchor', 'middle')
  .attr('alignment-baseline', 'central')
  .attr('font-size', '6px')
  .style('pointer-events', null)
  .attr('fill', 'white');

  text.append('text')
  .attr('class', 'info')
  .text(data.director)
  .attr('text-anchor', 'middle')
  .attr('alignment-baseline', 'central')
  .attr('font-size', '6px')
  .style('pointer-events', null)
  .attr('fill', 'white');


  text.append('text')
  .attr('class', 'info')
  .attr('transform', translate(0, 10))
  .text(data.watched + '  views  |  rating : '+ data.rate + '/5  ')
  .attr('text-anchor', 'middle')
  .attr('alignment-baseline', 'central')
  .attr('font-size', '6px')
  .attr('fill', 'white')
  .style('pointer-events', null)
  .attr('opacity', 1);
}

function dist(a, b){
  return Math.round(Math.sqrt(Math.pow(a[0]-b[0], 2)+Math.pow(a[1]-b[1], 2)));
}

function implement_hover(svg, data, r){
  svg.selectAll('.voronoi').remove();
  var x = d3.scaleLinear()
  .domain(d3.extent(data, d=>d.dominant_hsl.l))
  .range([WIDTH/2-PADDING, 0]);

  var y = d3.scaleLinear()
  .domain(d3.extent(data, d=>d.hue_loc))
  .range([0, 360]);

  var voronoi = d3.voronoi()
  .x(d => Math.cos(y(d.hue_loc)*Math.PI/180)*x(d.dominant_hsl.l))
  .y(d => Math.sin(y(d.hue_loc)*Math.PI/180)*x(d.dominant_hsl.l))
  .extent([[-WIDTH/2-PADDING,-HEIGHT/2-PADDING],[WIDTH/2-PADDING, HEIGHT/2-PADDING]]);

  var voronoiGroup = svg.append("g")
      .attr("class", "voronoi");

  var filtered = data.filter(d => d.show);
  voronoiGroup.selectAll("path")
    .data(voronoi.polygons(filtered))
    .enter().append("path")
      .attr("d", function(d) { return d ? "M" + d.join("L") + "Z" : null; })
      .attr("opacity", "0")
      .on("mouseover", function(d){
        if (d.data.show){
          var loc = [Math.cos(y(d.data.hue_loc)*Math.PI/180)*x(d.data.dominant_hsl.l),
          Math.sin(y(d.data.hue_loc)*Math.PI/180)*x(d.data.dominant_hsl.l)];
          // if (dist(d3.mouse(this), loc) < MAX_DIST){
            voronoiGroup.selectAll('#hover').remove();
            voronoiGroup.append('circle')
            .attr('id', 'hover')
            .attr('cx', Math.cos(y(d.data.hue_loc)*Math.PI/180)*x(d.data.dominant_hsl.l))
            .attr('cy', Math.sin(y(d.data.hue_loc)*Math.PI/180)*x(d.data.dominant_hsl.l))
            .attr('r', r)
            .attr('fill', d3.hsl(d.data.dominant_hsl))
            .attr('fill-opacity', 1)
            .attr('stroke', 'white')
            .on('mouseover', function(){
              d3.select(this).style("cursor", "pointer");
              showTooltips(loc, d.data, svg);
            })
            .on('mouseout', function(){
              svg.selectAll('.tooltip').remove();
            })
            .transition()
            .attr('r', 1.2*r);
          // }
          // else{
          //   console.log('hi')
          //   svg.selectAll('.tooltip').remove();
          //   voronoiGroup.selectAll('#hover').remove();
          // }
        }
      })
      .on("mouseout", function(d){

      });
}
