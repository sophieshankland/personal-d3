var dataset = [50, 40, 65, 80, 35, 70, 45, 50, 90];

var svgWidth = 500, svgHeight = 200, barPadding = 5;
var barWidth = (svgWidth / dataset.length);

var svg = d3.select('svg')
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var barChart = svg.selectAll("rect")
  .data(dataset)
  .enter()
  .append("rect")
  .attr("y", function(d) { return svgHeight - d})
  .attr("height", function(d) { return d;})
  .attr("width", barWidth - barPadding)
  .attr("class", "bar")
  .attr("transform", function(d, i) {
    var translate = [barWidth * i, 0];
    return "translate("+ translate +")";
  });

  var text = svg.selectAll("text")
    .data(dataset)
    .enter()
    .append("text")
    .text(function(d) {return d})
    .attr("y", function(d,i) {return svgHeight - d - 5;})
    .attr("x", function(d,i) {return barWidth * i;})
    .attr("fill", "#4d7d1e")
