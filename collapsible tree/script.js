// Edited from https://observablehq.com/@d3/collapsible-tree to manually update when anything changes rather than Observable system syncing

(function () {

const width = 1200;
const marginTop = 10;
const marginRight = 50;
const marginBottom = 10;
const marginLeft = 200;

// File reader implemented as data is being read locally
document.getElementById("fileInput").addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const data = JSON.parse(e.target.result);
    render(data);
  };
  reader.readAsText(file);
});

// Defining dimensions and take SVG from HTML
const svg = d3.select("#chart")
  .attr("viewBox", [-marginLeft, -marginTop, width, 600]);

  // gLink holds the edges
const gLink = svg.append("g")
  .attr("fill", "none")
  .attr("stroke", "#555")
  .attr("stroke-opacity", 0.4)
  .attr("stroke-width", 1.5);

// gNode holds the nodes (text)
const gNode = svg.append("g")
  .attr("cursor", "pointer");

 
function render(data) {
const root = d3.hierarchy(data);

const dx = 30;
const dy = (width - marginRight - marginLeft) / (1 + root.height);

// Positioning the tree
const tree = d3.tree().nodeSize([dx, dy]);

// Converts parent-child relationship into links in SVG
const diagonal = d3.linkHorizontal()
  .x(d => d.y)
  .y(d => d.x);

root.x0 = dy / 2;
root.y0 = 0;

// Clicking alternating hiding and showing a node's children
root.descendants().forEach((d, i) => {
  d.id = i;
  d._children = d.children;
  if (d.depth && d.data.name.length !== 7) {
    d.children = null;
  }
});

function update(event, source) {
  const duration = (event && event.altKey) ? 2500 : 250;

  // Recomputes layout
  tree(root);

  // Builds arrays for all nodes and links
  const nodes = root.descendants().reverse();
  const links = root.links();

  let left = root;
  let right = root;

  root.eachBefore(d => {
    if (d.x < left.x) left = d;
    if (d.x > right.x) right = d;
  });

  const height = right.x - left.x + marginTop + marginBottom;

  const transition = svg.transition()
    .duration(duration)
    .attr("viewBox", [-marginLeft, left.x - marginTop, width, height]);

  // Enter/update/exit join for nodes
  const node = gNode.selectAll("g")
    .data(nodes, d => d.id);

  const nodeEnter = node.enter().append("g")
    .attr("transform", `translate(${source.y0},${source.x0})`)
    .attr("fill-opacity", 0)
    .attr("stroke-opacity", 0)
    // Clicking function 
    .on("click", function (event, d) {
      d.children = d.children ? null : d._children;
      update(event, d);
    });

  nodeEnter.append("circle")
    .attr("r", 2.5)
    .attr("fill", d => d._children ? "#555" : "#999");

  nodeEnter.append("text")
    .attr("dy", "0.31em")
    .attr("x", d => d._children ? -6 : 6)
    .attr("text-anchor", d => d._children ? "end" : "start")
    .text(d => d.data.name)
    .attr("stroke", "white")
    .attr("stroke-width", 3)
    .attr("paint-order", "stroke");

  node.merge(nodeEnter).transition(transition)
    .attr("transform", d => `translate(${d.y},${d.x})`)
    .attr("fill-opacity", 1)
    .attr("stroke-opacity", 1);

  node.exit().transition(transition).remove()
    .attr("transform", `translate(${source.y},${source.x})`)
    .attr("fill-opacity", 0)
    .attr("stroke-opacity", 0);

    // Same join for links
  const link = gLink.selectAll("path")
    .data(links, d => d.target.id);

  const linkEnter = link.enter().append("path")
    .attr("d", function () {
      const o = { x: source.x0, y: source.y0 };
      return diagonal({ source: o, target: o });
    });

  link.merge(linkEnter).transition(transition)
    .attr("d", diagonal);

  link.exit().transition(transition).remove()
    .attr("d", function () {
      const o = { x: source.x, y: source.y };
      return diagonal({ source: o, target: o });
    });

  root.eachBefore(d => {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}


update(null, root);
}
})();