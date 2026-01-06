class WelchPowelGraph {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.nodes = {}; 
    this.edges = []; 
    this.colors = ["#f44336", "#2196f3", "#ff9800", "#4caf50", "#9c27b0", "#00bcd4", "#ffc107"];
    this.selectedNode = null; 
    this.nodeRadius = 25;
    this.showMatrix = false;

    this.initCanvas();
  }

  initCanvas() {
    this.canvas.addEventListener("click", e => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const clickedNode = this.getNodeAt(x, y);

      if (clickedNode) {
        if (this.selectedNode && this.selectedNode !== clickedNode) {
          this.addLink(this.selectedNode, clickedNode);
          this.selectedNode = null;
        } else {
          this.selectedNode = clickedNode;
        }
      } else {
        const name = prompt("Enter node name:");
        if (!name) return;
        this.addNode(name, x, y);
        this.selectedNode = null;
      }
    });
  }

  getNodeAt(x, y) {
    for (let name in this.nodes) {
      const node = this.nodes[name];
      const dx = node.x - x;
      const dy = node.y - y;
      if (Math.sqrt(dx*dx + dy*dy) <= this.nodeRadius) return name;
    }
    return null;
  }

  addNode(name, x, y) {
    if (this.nodes[name]) {
      alert("Node name already exists!");
      return;
    }
    this.nodes[name] = {x, y, edges: [], color: null};
    this.colorGraph();
    this.draw();
  }

  deleteNode(name) {
    if (!this.nodes[name]) return;

    this.edges = this.edges.filter(e => e.from !== name && e.to !== name);
    for (let n in this.nodes) {
      this.nodes[n].edges = this.nodes[n].edges.filter(e => e !== name);
    }
    delete this.nodes[name];
    this.colorGraph();
    this.draw();
  }

  addLink(from, to) {
    if (!this.nodes[from] || !this.nodes[to]) return;
    if (!this.nodes[from].edges.includes(to)) {
      this.nodes[from].edges.push(to);
      this.nodes[to].edges.push(from);
      this.edges.push({from, to});
      this.colorGraph();
      this.draw();
    }
  }

  deleteLink(from, to) {
    this.edges = this.edges.filter(e => !(e.from===from && e.to===to) && !(e.from===to && e.to===from));
    if (this.nodes[from]) this.nodes[from].edges = this.nodes[from].edges.filter(e => e!==to);
    if (this.nodes[to]) this.nodes[to].edges = this.nodes[to].edges.filter(e => e!==from);
    this.colorGraph();
    this.draw();
  }

  colorGraph() {
    const sortedNodes = Object.keys(this.nodes).sort((a,b) => this.nodes[b].edges.length - this.nodes[a].edges.length);
    const nodeColors = {};
    sortedNodes.forEach(node => {
      const forbidden = new Set();
      this.nodes[node].edges.forEach(neigh => {
        if (nodeColors[neigh]!==undefined) forbidden.add(nodeColors[neigh]);
      });
      let c=0; while(forbidden.has(c)) c++;
      nodeColors[node] = c;
      this.nodes[node].color = c;
    });
  }

  toggleMatrix() {
    this.showMatrix = !this.showMatrix;
    this.draw();
  }

  draw() {
    const ctx = this.ctx;
    const canvas = this.canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    
    ctx.strokeStyle = "#555";
    ctx.lineWidth = 2;
    this.edges.forEach(e=>{
      const f = this.nodes[e.from], t = this.nodes[e.to];
      ctx.beginPath();
      ctx.moveTo(f.x, f.y);
      ctx.lineTo(t.x, t.y);
      ctx.stroke();
    });

    
    for (let name in this.nodes) {
      const node = this.nodes[name];
      const color = this.colors[node.color % this.colors.length];
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(node.x, node.y, this.nodeRadius, 0, 2*Math.PI);
      ctx.fill();
      ctx.strokeStyle = "#333";
      ctx.stroke();

      ctx.fillStyle = "#fff";
      ctx.font = "16px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(name, node.x, node.y);
    }

    
    if (this.showMatrix) {
      const nodes = Object.keys(this.nodes);
      if (nodes.length === 0) return;

      const cellSize = 30;
      const startX = 50;
      const startY = 50;

      ctx.font = "14px Arial";
      ctx.fillStyle = "#000";

      // Headers
      nodes.forEach((n, i) => {
        ctx.fillText(n, startX + (i+1)*cellSize + cellSize/2, startY + cellSize/2);
        ctx.fillText(n, startX + cellSize/2, startY + (i+1)*cellSize + cellSize/2);
      });

      // Cells
      for (let i=0; i<nodes.length; i++) {
        for (let j=0; j<nodes.length; j++) {
          const from = nodes[i], to = nodes[j];
          const val = this.nodes[from].edges.includes(to) ? 1 : 0;

          ctx.strokeStyle = "#333";
          ctx.strokeRect(startX + (j+1)*cellSize, startY + (i+1)*cellSize, cellSize, cellSize);

          ctx.fillStyle = "#000";
          ctx.fillText(val, startX + (j+1)*cellSize + cellSize/2, startY + (i+1)*cellSize + cellSize/2);
        }
      }

    
      ctx.strokeStyle = "#333";
      ctx.strokeRect(startX + cellSize, startY + cellSize, cellSize*nodes.length, cellSize*nodes.length);
      ctx.strokeRect(startX, startY, cellSize*(nodes.length+1), cellSize*(nodes.length+1));
    }
  }
}


document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("treeCanvas");
  const graph = new WelchPowelGraph(canvas);

  document.getElementById("addNodeBtn").addEventListener("click", () => {
    const name = prompt("Node name:");
    const x = Math.random()*(canvas.width-50)+25;
    const y = Math.random()*(canvas.height-50)+25;
    graph.addNode(name, x, y);
  });

  document.getElementById("deleteNodeBtn").addEventListener("click", () => {
    const name = prompt("Node to delete:");
    graph.deleteNode(name);
  });

  document.getElementById("addLinkBtn").addEventListener("click", () => {
    const from = prompt("From node:");
    const to = prompt("To node:");
    graph.addLink(from, to);
  });

  document.getElementById("deleteLinkBtn").addEventListener("click", () => {
    const from = prompt("From node:");
    const to = prompt("To node:");
    graph.deleteLink(from, to);
  });

  document.getElementById("showMatrixBtn").addEventListener("click", () => {
    graph.toggleMatrix();
  });
});
