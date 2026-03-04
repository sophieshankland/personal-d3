// Learning with YouTube video https://www.youtube.com/watch?v=C4t6qfHZ6Tw&list=PLenXHPi80PGzNWUHro_O3NzYlcIZC6rFt&index=6

// Dataset being visualised, with each number representing the height of a bar
var dataset = [50, 40, 65, 80, 35, 70, 45, 50, 90];

// SVG dimensions
var svgWidth = 500, svgHeight = 200, barPadding = 5;
var barWidth = (svgWidth / dataset.length);

// Selects the existing svg element in HTML and sets width and height
var svg = d3.select('svg')
  .attr("width", svgWidth)
  .attr("height", svgHeight);


  // Creates a linear mapping function so that the bars always fit in the diagram
var yScale = d3.scaleLinear()
  .domain([0, d3.max(dataset) + 10])
  .range([0, svgHeight]);

var barChart = svg.selectAll("rect")
  // Creates a placeholder for each datapoint and then appends a rectangle to each
  .data(dataset)
  .enter()
  .append("rect")

  // Positions bars vertically and makes them grow upward (SVG origin is 0,0)
  .attr("y", function(d) { return svgHeight - yScale(d);})

  // The height of each bar is based on the scaled data value
  .attr("height", function(d) { return yScale(d);})
  .attr("width", barWidth - barPadding)

  // Assgns CSS class for styling
  .attr("class", "bar")

  // Moves each subsequent bar horizontally using transform (index of data is i)
  .attr("transform", function(d, i) {
    var translate = [barWidth * i, 0];
    return "translate("+ translate +")";
  });


  // Adds text labels showing the numeric value on top of each bar
  var text = svg.selectAll("text")
    .data(dataset)
    .enter()
    .append("text")
    .text(function(d) {return d})
    .attr("y", function(d,i) {return svgHeight - yScale(d) - 5;})
    .attr("x", function(d,i) {return barWidth * i;})
    .attr("fill", "#4d7d1e")