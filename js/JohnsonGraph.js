class JohnsonGraph {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.nodes = {};
    this.edges = [];

    this.nodeRadius = 25;
    this.selectedNode = null;

    this.showMatrix = false;
    this.highlightedPath = [];

    this.johnsonReady = false;
    this.allPaths = {};

    this.initCanvas();
  }

  
  initCanvas() {
    this.canvas.addEventListener("click", e => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const clicked = this.getNodeAt(x, y);

      if (clicked) {
        if (this.selectedNode && this.selectedNode !== clicked) {
          const w = parseFloat(prompt("Weight:"));
          if (isNaN(w)) return alert("Invalid weight");
          this.addLink(this.selectedNode, clicked, w);
          this.selectedNode = null;
        } else {
          this.selectedNode = clicked;
        }
      } else {
        const name = prompt("Node name:");
        if (name) this.addNode(name, x, y);
        this.selectedNode = null;
      }
    });
  }

  getNodeAt(x, y) {
    for (let n in this.nodes) {
      const node = this.nodes[n];
      if (Math.hypot(node.x - x, node.y - y) <= this.nodeRadius) return n;
    }
    return null;
  }

  addNode(name, x, y) {
    if (this.nodes[name]) return alert("Node exists");
    this.nodes[name] = { x, y, edges: [] };
    this.johnsonReady = false;
    this.draw();
  }

  deleteNode(name) {
    delete this.nodes[name];
    this.edges = this.edges.filter(e => e.from !== name && e.to !== name);
    for (let n in this.nodes) {
      this.nodes[n].edges = this.nodes[n].edges.filter(e => e.to !== name);
    }
    this.johnsonReady = false;
    this.draw();
  }

  
  addLink(a, b, w) {
    if (!this.nodes[a] || !this.nodes[b]) return;

    if (!this.nodes[a].edges.some(e => e.to === b)) {
      this.nodes[a].edges.push({ to: b, w });
      this.edges.push({ from: a, to: b, w });
    }

    this.johnsonReady = false;
    this.draw();
  }

  deleteLink(a, b) {
    if (!this.nodes[a] || !this.nodes[b]) return;

    this.nodes[a].edges = this.nodes[a].edges.filter(e => e.to !== b);
    this.edges = this.edges.filter(e => !(e.from === a && e.to === b));

    this.johnsonReady = false;
    this.draw();
  }

  
  runShortestPath(start, end) {
    if (!this.johnsonReady) {
      alert("Run Johnson first!");
      return;
    }

    if (!this.allPaths[start]) {
      alert("Invalid start node!");
      return;
    }

    this.highlightedPath = [];
    let cur = end;

    while (cur !== undefined) {
      this.highlightedPath.unshift(cur);
      cur = this.allPaths[start].prev[cur];
    }

    if (this.highlightedPath[0] !== start) {
      alert("No path found!");
      this.highlightedPath = [];
    }

    this.draw();
  }

  
  bellmanFord() {
    const Q = "__Q__";
    let dist = {};
    Object.keys(this.nodes).forEach(n => dist[n] = Infinity);
    dist[Q] = 0;

    let edges = [...this.edges];
    Object.keys(this.nodes).forEach(v => edges.push({ from: Q, to: v, w: 0 }));

    const V = Object.keys(this.nodes).length + 1;
    for (let i = 0; i < V - 1; i++) {
      for (let e of edges) {
        if (dist[e.from] + e.w < dist[e.to]) dist[e.to] = dist[e.from] + e.w;
      }
    }

    for (let e of edges) {
      if (dist[e.from] + e.w < dist[e.to]) {
        alert("Negative cycle detected");
        return null;
      }
    }

    delete dist[Q];
    return dist;
  }

  reweightEdges(h) {
    let g = {};
    Object.keys(this.nodes).forEach(n => g[n] = []);
    this.edges.forEach(e => {
      g[e.from].push({ to: e.to, w: e.w + h[e.from] - h[e.to] });
    });
    return g;
  }

  dijkstra(start, graph) {
    let dist = {}, prev = {}, visited = new Set();
    Object.keys(graph).forEach(n => dist[n] = Infinity);
    dist[start] = 0;

    while (true) {
      let u = null, best = Infinity;
      for (let n in dist) {
        if (!visited.has(n) && dist[n] < best) {
          best = dist[n];
          u = n;
        }
      }
      if (!u) break;

      visited.add(u);
      for (let e of graph[u]) {
        const nd = dist[u] + e.w;
        if (nd < dist[e.to]) {
          dist[e.to] = nd;
          prev[e.to] = u;
        }
      }
    }
    return { dist, prev };
  }

  
  runAllPairsShortestPaths() {
    const nodes = Object.keys(this.nodes);
    if (nodes.length === 0) return alert("No nodes in graph");

    const h = this.bellmanFord();
    if (!h) return;

    const graph = this.reweightEdges(h);

    this.allPaths = {};
    nodes.forEach(start => {
      const { dist, prev } = this.dijkstra(start, graph);
      this.allPaths[start] = { dist: {}, prev: {} };
      nodes.forEach(end => {
        if (start === end) this.allPaths[start].dist[end] = 0;
        else if (dist[end] === Infinity) this.allPaths[start].dist[end] = "∞";
        else this.allPaths[start].dist[end] = dist[end] + h[end] - h[start];
        this.allPaths[start].prev[end] = prev[end];
      });
    });

    this.johnsonReady = true;
    this.generateTable();
  }

  generateTable() {
    const container = document.getElementById("johnsonTableContainer");
    if (!container) return;

    const nodes = Object.keys(this.nodes);
    let html = "<table border='1' cellpadding='4' style='border-collapse:collapse;text-align:center'>";
    html += "<tr><th>From \\ To</th>";
    nodes.forEach(n => html += `<th>${n}</th>`);
    html += "</tr>";

    nodes.forEach(from => {
      html += `<tr><th>${from}</th>`;
      nodes.forEach(to => {
        html += `<td>${this.allPaths[from].dist[to]}</td>`;
      });
      html += "</tr>";
    });

    html += "</table>";
    container.innerHTML = html;
  }

  
  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    
    this.edges.forEach(e => {
      const A = this.nodes[e.from], B = this.nodes[e.to];

      
      const dx = B.x - A.x, dy = B.y - A.y, len = Math.hypot(dx, dy);
      const offset = this.nodeRadius;
      const startX = A.x + dx * offset / len;
      const startY = A.y + dy * offset / len;
      const endX = B.x - dx * offset / len;
      const endY = B.y - dy * offset / len;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.stroke();

      
      const headlen = 15;
      const angle = Math.atan2(endY - startY, endX - startX);
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(endX - headlen * Math.cos(angle - Math.PI/6), endY - headlen * Math.sin(angle - Math.PI/6));
      ctx.lineTo(endX - headlen * Math.cos(angle + Math.PI/6), endY - headlen * Math.sin(angle + Math.PI/6));
      ctx.lineTo(endX, endY);
      ctx.fillStyle = "#000";
      ctx.fill();

      
      const mx = (startX + endX)/2, my = (startY + endY)/2;
      const text = String(e.w);
      ctx.font = "14px Arial";
      const pad = 4;
      const w = ctx.measureText(text).width;
      const h = 14;
      ctx.fillStyle = "#fff";
      ctx.fillRect(mx - w/2 - pad, my - h/2 - pad, w + pad*2, h + pad*2);
      ctx.strokeRect(mx - w/2 - pad, my - h/2 - pad, w + pad*2, h + pad*2);
      ctx.fillStyle = "#000";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, mx, my);
    });

    // Highlight single path
    for (let i = 0; i < this.highlightedPath.length - 1; i++) {
      const A = this.nodes[this.highlightedPath[i]];
      const B = this.nodes[this.highlightedPath[i+1]];
      ctx.beginPath();
      ctx.moveTo(A.x, A.y);
      ctx.lineTo(B.x, B.y);
      ctx.strokeStyle = "red";
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    // Draw nodes
    for (let n in this.nodes) {
      const node = this.nodes[n];
      ctx.beginPath();
      ctx.arc(node.x, node.y, this.nodeRadius, 0, Math.PI*2);
      ctx.fillStyle = "#2196f3";
      ctx.fill();
      ctx.strokeStyle = "#000";
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 22px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(n, node.x, node.y);
    }

    if (this.showMatrix) this.drawMatrix();
  }

  
  toggleMatrix() {
    this.showMatrix = !this.showMatrix;
    this.draw();
  }

  drawMatrix() {
    const ctx = this.ctx;
    const nodes = Object.keys(this.nodes);
    const cell = 40;
    const sx = 0, sy = 0;

    ctx.font = "14px Arial";
    ctx.fillStyle = "#000";

    nodes.forEach((n, i) => {
      ctx.fillText(n, sx + (i+1)*cell + 12, sy + 20);
      ctx.fillText(n, sx + 10, sy + (i+1)*cell + 25);
    });

    for (let i = 0; i < nodes.length; i++) {
      for (let j = 0; j < nodes.length; j++) {
        let val = "-";
        this.edges.forEach(e => {
          if (e.from === nodes[i] && e.to === nodes[j]) val = e.w;
        });
        ctx.strokeRect(sx + (j+1)*cell, sy + (i+1)*cell, cell, cell);
        ctx.fillText(val, sx + (j+1)*cell + 15, sy + (i+1)*cell + 25);
      }
    }
  }
}

window.JohnsonGraph = JohnsonGraph;
