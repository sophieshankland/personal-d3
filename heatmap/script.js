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

        // Calls interactivity to the cells.
        .on("mouseover", function (event, d) {

        })


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