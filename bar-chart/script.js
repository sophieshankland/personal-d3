// Learning with:
// YouTube video https://www.youtube.com/watch?v=C4t6qfHZ6Tw&list=PLenXHPi80PGzNWUHro_O3NzYlcIZC6rFt&index=6
// Observable tutorial https://observablehq.com/@d3/lets-make-a-bar-chart

// BAR CHART

// Dataset being visualised, with each number representing the height of a bar
var dataset = [50, 40, 65, 80, 35, 70, 45, 50, 90];

// For loading in a CSV file.
// d3.csvParse(await FileAttachment("numbers.csv").text(), d3.autoType)

// SVG dimensions
var svgWidth = 1000, svgHeight = 500, barPadding = 5;

// Defines margins so axes have space
var margin = {top: 20, right: 20, bottom: 40, left: 50};

// Defines inner chart size
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Selects the existing svg element in HTML and sets width and height
var svg = d3.select('svg')
  .attr("width", svgWidth)
  .attr("height", svgHeight)

  // Creates a group that is shifted inside the margins
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Creates a band scale for bar positions
var xScale = d3.scaleBand()
  .domain(d3.range(dataset.length))
  .range([0, width])
  .padding(0.1);

  // Creates a linear mapping function so that the bars always fit in the diagram
var yScale = d3.scaleLinear()
  .domain([0, d3.max(dataset) + 10])
  .range([height, 0]);

// Creates axes that fit the scale
var x_axis = d3.axisBottom().scale(xScale);
var y_axis = d3.axisLeft().scale(yScale);

svg.append("g")
  .call(y_axis);

svg.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(x_axis);

var barChart = svg.selectAll("rect")
  // Creates a placeholder for each datapoint and then appends a rectangle to each
  .data(dataset)
  .enter()
  .append("rect")

  // Moves each bar horizontally based on index
  .attr("x", function(d, i) { return xScale(i); })

  // Positions bars vertically and makes them grow upward (SVG origin is 0,0)
  .attr("y", function(d) { return yScale(d);})

  // The height of each bar is based on the scaled data value
  .attr("height", function(d) { return height - yScale(d);})
  .attr("width", xScale.bandwidth())

  // Assgns CSS class for styling
  .attr("class", "bar")

  // Adds text labels showing the numeric value on top of each bar
svg.selectAll(".label")
    .data(dataset)
    .enter()
    .append("text")
    .text(function(d) {return d})
    // Positions labels above bars
    .attr("y", function(d) { return yScale(d) - 5; })
    .attr("x", function(d,i) { return xScale(i) + xScale.bandwidth()/2; })
    .attr("text-anchor", "middle")
    .attr("class", "label");