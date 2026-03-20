// I am remaking my heatmap to use the enter/update/exit pattern, rather than the previous version which uses one render. 
// I will also make the creation of the heatmap and bar chart into reuseable functions and better separate processing from rendering.

// Processing data function
function processData(rawData) {
    return rawData.map(d => {
    const freq = d.frequencies.split("|").map(Number);
    const total = d3.sum(freq);

    const avg = total === 0 ? 0 :
      (freq[0]*1 + freq[1]*2 + freq[2]*3 + freq[3]*4 + freq[4]*5) / total;

    return {
      day: +d.day,
      hour: +d.hour,
      avg,
      freq
    };
  });
}

// Making heatmap
function createHeatmap({ container, data }) {
  // Rearranging setup of heatmap size, margins, and scales
  const width = 900;
  const height = 320;

  const margin = { top: 40, right: 30, bottom: 40, left: 70 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const svg = d3.select(container)
    .attr("width", width)
    .attr("height", height);

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x_axis = d3.scaleBand()
    .domain(d3.range(24))
    .range([0, innerWidth]);

  const y_axis = d3.scaleBand()
    .domain(d3.range(7))
    .range([0, innerHeight])
    .paddingInner(0.05);

  const colorScale = d3.scaleSequential()
    .domain([1, 5])
    .interpolator(d3.interpolateRgbBasis(["#bd1708", "#ffdb26", "#66ac28"]));

  // Initialises hover text that is used instead of tooltip 
  const hoverLayer = g.append("text")
    .attr("class", "hover-layer")
    .attr("font-size", "12px")
    .attr("font-weight", "bold")
    .style("pointer-events", "none")
    .style("opacity", 0);

 function update(selectedDay = "all") {

    const cells = g.selectAll(".cell")
      .data(data, d => `${d.day}-${d.hour}`);

    cells.join(
      enter => enter.append("rect")
        .attr("class", "cell")
        .attr("x", d => x_axis(d.hour))
        .attr("y", d => y_axis(d.day))
        .attr("width", x_axis.bandwidth())
        .attr("height", y_axis.bandwidth())
        .attr("fill", d => d.avg === 0 ? "#ffffff" : colorScale(d.avg))
        .attr("stroke", "#000")
        .attr("stroke-width", 0.5),

      update => update,

      exit => exit.remove()
    )
    .on("mouseover", (event, d) => {
        g.node().appendChild(hoverLayer.node())
        // Moving the text to be above the heatmap for every hover event
      hoverLayer
        .attr("x", x_axis(d.hour) + x_axis.bandwidth() / 2)
        .attr("y", y_axis(d.day) + y_axis.bandwidth() / 2)  
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")               
        .text(d.avg.toFixed(2))
        .style("opacity", 1);
    })
    .on("mousemove", (event) => {
      const [x, y] = d3.pointer(event);
    })
    .on("mouseout", () => {
      hoverLayer.style("opacity", 0)
    })
    .on("click", (event, d) => {
      createBarChart("#distribution-chart", d.freq, d);
    })
  }

  // Adding axes
  g.append("g")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(
      d3.axisBottom(x_axis)
        .tickFormat(d => `${String(d).padStart(2, "0")}:00`)
    );

  g.append("g")
    .call(
      d3.axisLeft(y_axis)
        .tickFormat(d => ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"][d])
    );

  // The initial render of the heatmap
  update("all");
}

function createBarChart(container, freq, d) {
// Sorting size and margins and scale
  const width = 400;
  const height = 220;
  const margin = { top: 20, right: 20, bottom: 40, left: 40 };

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const svg = d3.select(container)
    .html("")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand()
    .domain([1,2,3,4,5])
    .range([0, innerWidth])
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(freq)])
    .nice()
    .range([innerHeight, 0]);

// Setting bar colour
  const colorScale = d3.scaleSequential()
    .domain([1,5])
    .interpolator(d3.interpolateRgbBasis(["#d73027", "#ffde21", "#1a9850"]));

    // Creating bars and adds animation
  g.selectAll("rect")
    .data(freq)
    .join("rect")
    .attr("x", (d, i) => x(i + 1))
    .attr("width", x.bandwidth())
    .attr("fill", (d, i) => colorScale(i + 1))
    .attr("y", y(0))
    .attr("height", 0)
    .transition()
    .duration(800)
    .attr("y", d => y(d))
    .attr("height", d => innerHeight - y(d));

  g.append("g")
    .style("font-family", "Georgia")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x));

  g.append("g")
    .style("font-family", "Georgia")
    .call(d3.axisLeft(y).ticks(d3.max(d.freq)));

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 15)
    .attr("text-anchor", "middle")
    .text(`Productivity (Day ${d.day}, Hour ${d.hour})`);
}

// Initialisation
d3.csv("../data/productivity.csv").then(rawData => {
  const data = processData(rawData);

  const heatmap = createHeatmap({
    container: "#heatmap",
    data
  });
});