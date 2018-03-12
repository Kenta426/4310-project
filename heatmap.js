var RECT_HEIGHT = 20;
var HEAT_WIDTH = 605;
var PADDING_HEAT = 2;

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

  var opacity_scales = d3.scaleLinear()
    .domain([0,100])
    .range([0, 1]);

  heat_data.forEach(function(d, i){
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
      .attr('fill', function(d){return d3.hsl(i*360/HUEBIN+180/HUEBIN,opacity_scales(d),0.5)});
  })
}
