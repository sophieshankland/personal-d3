// With much less of a time constraint on producing a working product, for personal satisfaction I am now cleaning up this code from the hackathon through rearranging and renaming variables.
// (As well as better comments)

let svg = d3.select("#heatmap");

// Sets up sizing of SVG.
const svg_width = 900;
const svg_height = 320; 
let margin = {top: 40, right: 30, bottom: 40, left: 70};

// Sets up actual size of space for cells.
const heat_width = svg_width - (margin.left + margin.right)
const heat_height = svg_height - (margin.top + margin.bottom)

// Sets up starting coordinates for cells.
const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Initialises tooltip, allowing interactability
const tooltip = d3.select("body")
    .append("div")
    .attr("class","tooltip")
    .style("opacity",0);

// Creates a hover layer so that the text always shows over the cell
const hoverLayer = svg.append("g")
    .attr("class", "hover-layer")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Parse the data in the CSV file to be made into the heatmap.
d3.csv("../data/productivity.csv", d => {
    // Makes an array of the frequencies for a given hour slot.
    const freq = d.frequencies.split("|").map(Number);
    const total_freq = d3.sum(freq);

    // Finds the average of the reported productivity levels of that hour.
    const avg = total_freq === 0 ? 0 :
        (freq[0]*1 + freq[1]*2 + freq[2]*3 + freq[3]*4 + freq[4]*5) / total_freq;

    // Returns an object for each hour slot. Includes the numerical day and hour as well as the frequencies and their average.
    return {
        day: +d.day,
        hour: +d.hour,
        avg: avg,
        freq: freq 
    };
}).then(data => {
    // Makes x-axis of hours 00:00 to 23:00
    const x_axis = d3.scaleBand()
        .domain(d3.range(24))
        .range([0, heat_width]);

    // Makes y-axis of days Monday-Sunday
    const y_axis = d3.scaleBand()
        .domain(d3.range(7))
        .range([0, heat_height])
        .paddingInner(0.05);

    // Makes colour gradient from red (bad productivity) to yellow (middling productivity) to green (good productivity).
    const colour = d3.scaleSequential()
        .domain([1,5])
        .interpolator(d3.interpolateRgbBasis(["#bd1708", "#ffdb26 ", "#66ac28 " ]));

    // Creates each cell of the heatmap.
    g.selectAll("rect")
        // Establishes data is coming from CSV and cells are being made.
        .data(data)
        .enter()
        .append("rect")
        .attr("class","cell")
        // Adds the axes previously set up.
        .attr("x", d => x_axis(d.hour))
        .attr("y", d => y_axis(d.day))
        .attr("width", x_axis.bandwidth())
        .attr("height", y_axis.bandwidth())
        // Fills the colour of the cell according to the gradient previously set up.
        // If the hour has no reported productivity levels, the cell is displayed as white.
        .attr("fill", d => d.avg === 0 ? "#ffffff" : colour(d.avg))
        // Adds a border to each cell.
        .attr("stroke", "#000000")
        .attr("stroke-width", 0.5)

        // 
        .on("mouseover", (event, d) => {
            // Shows the average number inside the cell
            hoverLayer.append("text")
                .attr("class", "hover-label")
                .attr("x", x_axis(d.hour) + x_axis.bandwidth() / 2)
                .attr("y", y_axis(d.day) + y_axis.bandwidth() / 2 + 4)
                .attr("text-anchor", "middle")
                .text(d.avg.toFixed(2))
                .style("pointer-events", "none");
        })

        .on("mousemove", (event, d) => {
            const [mouseX, mouseY] = d3.pointer(event, svg.node());
            tooltip
                .style("left", (mouseX + margin.left + 10) + "px")
                .style("top", (mouseY + margin.top - 25) + "px");
            })

        // Removing the average showing when mouse leaves the cell
        .on("mouseout", () => {
            tooltip.style("opacity", 0);
            d3.selectAll(".hover-label").remove();
            })

        // When a cell is clicked on, its specific bar chart showing distribution of productivity 
            .on("click", (event, d) => {
            showDistribution(d);
            });

    // Adds the x-axis of each hour of the day.
    const x_axis_g = g.append("g")
    .attr("transform", `translate(0,${heat_height})`)
    .style("font-family", "Georgia")
    .call(
        d3.axisBottom(x_axis)
        .tickFormat(d => `${String(d).padStart(2, "0")}:00`)
    );

    // Moves the labels around so that the hours are positioned at the start of a column of cells, not in the middle.
    x_axis_g.selectAll(".tick")
    .attr("transform", d => `translate(${x_axis(d)},0)`);

    x_axis_g.selectAll(".tick text")
    .attr("text-anchor", "start")
    .attr("dx", "-1.25em");

    // Adds the y-axis of each day of the week.
    const y_axis_g = d3.axisLeft(y_axis)
      .tickFormat(d => ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"][d]);

    g.append("g")
      .style("font-family", "Georgia")
      .call(y_axis_g);


})

function showDistribution(d) {
  const container = d3.select("#distribution-chart");
  container.html("");

  // Sorting margins
  const width = 400;
  const height = 220;

  const margin = { top: 20, right: 20, bottom: 40, left: 40 };

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const svg = container
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const x = d3.scaleBand()
    .domain([1, 2, 3, 4, 5])
    .range([0, innerWidth])
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(d.freq)])
    .range([innerHeight, 0]);

  // Sets the bar colour based on 'level' of productivity
  const barColor = d3.scaleSequential()
    .domain([1, 5])
    .interpolator(d3.interpolateRgbBasis(["#d73027", "#ffde21", "#1a9850"]));

  // Adds all of the bars
  g.selectAll("rect")
    .data(d.freq)
    .enter()
    .append("rect")
    .attr("x", (v, i) => x(i + 1))
    .attr("y", y(0))
    .attr("width", x.bandwidth())
    .attr("height", 0)
    .attr("fill", (v, i) => barColor(i + 1))
    .attr("stroke", "#333")
    .attr("stroke-width", 0.5)
    .transition()
    .duration(900)
    .ease(d3.easeCubicOut)
    .attr("y", v => y(v))                
    .attr("height", v => innerHeight - y(v));


  // Moves along for next bar
  g.append("g")
    .style("font-family", "Georgia")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(x));

  g.append("g")
    .style("font-family", "Georgia")
    .call(d3.axisLeft(y).ticks(d3.max(d.freq)));

  // Bar chart title text
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", margin.top / 1.5 - 5)
    .attr("text-anchor", "middle")
    .style("font-family", "georgia")
    .style("font-size", "12px")
    .text(`Productivity Levels (Day ${d.day}, Hour ${d.hour})`);
}