document.addEventListener("DOMContentLoaded", () => {
  const $ = id => document.getElementById(id);

  // ==== Elements ====
  const insertBtn = $("insertBtn");
  const searchBtn = $("searchBtn");
  const deleteBtn = $("deleteBtn");
  const clearBtn = $("clearBtn");
  const sortBtn = $("sortBtn");
  const valueInput = $("valueInput");
  const mValueInput = $("mValueInput");
  const treeButtons = document.querySelectorAll(".tree-selector button");
  const orienteCheckbox = $("orienteCheckbox");

  const mainCanvas = $("treeCanvas");
  const welchCanvas = $("welchCanvas");
  const johnsonCanvas = $("johnsonCanvas");

  const welchControls = $("welchControls");
  const johnsonControls = $("johnsonControls");

  // ==== Graphs ====
  const welchGraph = new WelchPowelGraph(welchCanvas);
  const johnsonGraph = new JohnsonGraph(johnsonCanvas);

  // ==== Trees ====
  let currentType = "BST";
  const trees = {
    BST: typeof BST !== "undefined" ? new BST() : null,
    AVL: typeof AVL !== "undefined" ? new AVL() : null,
    Heap: typeof Heap !== "undefined" ? new Heap() : null,
    MHeap: typeof MHeap !== "undefined" ? new MHeap(2) : null,
    Graf: typeof Graf !== "undefined" ? new Graf() : null,
    Bitonic: typeof BitonicSort !== "undefined" ? new BitonicSort() : null
  };

  // ==== Canvas switching ====
  treeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const treeType = btn.dataset.tree;
      treeButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      // Hide all canvases & controls first
      mainCanvas.style.display = "none";
      welchCanvas.style.display = "none";
      johnsonCanvas.style.display = "none";
      welchControls.style.display = "none";
      johnsonControls.style.display = "none";
      document.querySelector(".controls").style.display = "block";
      $("graphOptions").style.display = "none";

      if (treeType === "JohnsonGraph") {
        johnsonCanvas.style.display = "block";
        johnsonControls.style.display = "block";
        johnsonGraph.active = true;
        welchGraph.active = false;
        johnsonGraph.draw();
      } else if (treeType === "WelchPowel") {
        welchCanvas.style.display = "block";
        welchControls.style.display = "block";
        welchGraph.active = true;
        johnsonGraph.active = false;
        welchGraph.draw();
      } else {
        johnsonGraph.active = false;
        welchGraph.active = false;
        mainCanvas.style.display = "block";
        if (treeType === "Graf") $("graphOptions").style.display = "block";
        currentType = treeType;
        mValueInput.style.display = currentType === "MHeap" ? "inline-block" : "none";
        drawMainTree();
      }
    });
  });

  // ==== Tree operations ====
  function getCurrentTree() {
    if (currentType === "MHeap") {
      const mVal = Number(mValueInput.value) || 2;
      if (!trees.MHeap || trees.MHeap.m !== mVal) trees.MHeap = new MHeap(mVal);
      return trees.MHeap;
    }
    return trees[currentType];
  }

  async function drawMainTree() {
    const ctx = mainCanvas.getContext("2d");
    ctxClear(mainCanvas);
    if (currentType === "Bitonic") trees.Bitonic.draw(ctx);
    else if (currentType === "Graf") { 
      trees.Graf.prepareGraph(); 
      trees.Graf.drawGraph(ctx); 
    } else {
      const tree = getCurrentTree();
      if (tree && tree.root) tree.draw(ctx, mainCanvas.width / 2, 60, mainCanvas.width / 4, orienteCheckbox.checked);
      else {
        ctx.font = "18px Arial"; ctx.fillStyle = "#666"; ctx.textAlign = "center";
        ctx.fillText("Aucune donnée", mainCanvas.width / 2, mainCanvas.height / 2);
      }
    }
  }

  function ctxClear(canvas) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "18px Arial"; ctx.fillStyle = "#666"; ctx.textAlign = "center";
    ctx.fillText("Aucune donnée", canvas.width / 2, canvas.height / 2);
  }

  insertBtn.addEventListener("click", () => {
    const tokens = valueInput.value.trim().split(/\s+/);
    tokens.forEach(tok => {
      const num = Number(tok);
      if (currentType === "Bitonic" && !isNaN(num)) trees.Bitonic.insert(num);
      else if (currentType === "Graf") trees.Graf.insert(tok);
      else if (!isNaN(num)) getCurrentTree().insert(num);
    });
    valueInput.value = "";
    drawMainTree();
  });

  searchBtn.addEventListener("click", () => {
    const val = valueInput.value.trim();
    if (!val) return;
    let found = false;
    if (currentType === "Bitonic") found = trees.Bitonic.array.includes(Number(val));
    else if (currentType === "Graf") found = trees.Graf.search(val);
    else found = getCurrentTree().search(Number(val));
    alert(found ? `${val} trouvé !` : `${val} non trouvé.`);
    valueInput.value = "";
  });

  deleteBtn.addEventListener("click", () => {
    const val = valueInput.value.trim();
    if (!val) return;
    if (currentType === "Bitonic") {
      const idx = trees.Bitonic.array.indexOf(Number(val));
      if (idx !== -1) trees.Bitonic.array.splice(idx, 1);
    } else if (currentType === "Graf") trees.Graf.delete(val);
    else getCurrentTree().delete(Number(val));
    valueInput.value = "";
    drawMainTree();
  });

  clearBtn.addEventListener("click", () => {
    for (let key in trees) if (trees[key] && typeof trees[key].clear === "function") trees[key].clear();
    ctxClear(mainCanvas);
    welchGraph.nodes = {}; welchGraph.edges = []; welchGraph.draw();
    johnsonGraph.nodes = {}; johnsonGraph.edges = []; johnsonGraph.draw();
  });

  sortBtn.addEventListener("click", async () => {
    if (currentType === "Bitonic" && trees.Bitonic) {
      trees.Bitonic.prepareSort();
      await trees.Bitonic.animate(mainCanvas.getContext("2d"), 300);
    }
  });

  // ==== Welch Graph Buttons ====
  $("addNodeBtn").onclick = () => {
    const name = prompt("Node name:");
    if (!name) return;
    const x = Math.random() * (welchCanvas.width - 50) + 25;
    const y = Math.random() * (welchCanvas.height - 50) + 25;
    welchGraph.addNode(name, x, y);
    welchGraph.draw();
  };
  $("deleteNodeBtn").onclick = () => {
    const name = prompt("Node to delete:");
    if (!name) return;
    welchGraph.deleteNode(name);
    welchGraph.draw();
  };
  $("addLinkBtn").onclick = () => {
    const from = prompt("From node:"), to = prompt("To node:");
    if (!from || !to) return;
    welchGraph.addLink(from, to);
    welchGraph.draw();
  };
  $("deleteLinkBtn").onclick = () => {
    const from = prompt("From node:"), to = prompt("To node:");
    if (!from || !to) return;
    welchGraph.deleteLink(from, to);
    welchGraph.draw();
  };
  $("showMatrixBtn").onclick = () => {
    welchGraph.showMatrix = !welchGraph.showMatrix;
    welchGraph.draw();
  };

  // ==== Johnson Graph Buttons ====
  $("johnsonAddNodeBtn").onclick = () => {
    const n = prompt("Node name:");
    if (!n) return;
    const x = Math.random() * (johnsonCanvas.width - 50) + 25;
    const y = Math.random() * (johnsonCanvas.height - 50) + 25;
    johnsonGraph.addNode(n, x, y);
    johnsonGraph.draw();
  };
  $("johnsonDeleteNodeBtn").onclick = () => {
    const n = prompt("Node to delete:");
    if (!n) return;
    johnsonGraph.deleteNode(n);
    johnsonGraph.draw();
  };
  $("johnsonAddLinkBtn").onclick = () => {
    const a = prompt("From:"), b = prompt("To:"), w = prompt("Weight:");
    if (!a || !b || isNaN(w)) return;
    johnsonGraph.addLink(a, b, parseFloat(w));
    johnsonGraph.draw();
  };
  $("johnsonDeleteLinkBtn").onclick = () => {
    const a = prompt("From:"), b = prompt("To:");
    if (!a || !b) return;
    johnsonGraph.deleteLink(a, b);
    johnsonGraph.draw();
  };
  $("johnsonShowMatrixBtn").onclick = () => {
    johnsonGraph.toggleMatrix();
    johnsonGraph.draw();
  };
  $("runJohnsonBtn").onclick = () => {
  const start = prompt("Start node:");
  const end = prompt("End node:");
  if (!start || !end) return;
  johnsonGraph.runShortestPath(start, end);
};

  $("runJohnsonAllBtn")?.addEventListener("click", () => {
    johnsonGraph.runAllPairsShortestPaths();
  });


  drawMainTree();
  welchGraph.draw();
  johnsonGraph.draw();

  window._trees = trees;
  window._drawTree = drawMainTree;
});
