class Graf {
  constructor() {
    this.array = [];
    this.steps = [];
    this.level = 0;
  }

  insert(num) {
    const n = Number(num);
    if (!isNaN(n)) this.array.push(n);
  }

  delete(num) {
    const n = Number(num);
    const idx = this.array.indexOf(n);
    if (idx !== -1) this.array.splice(idx, 1);
  }

  search(num) {
    return this.array.includes(Number(num));
  }

  prepareGraph() {
    if (!this.array.length) return;
    const n = this.nextPowerOf2(this.array.length);
    const arr = this.array.slice();
    while (arr.length < n) arr.push(Infinity);

    this.steps = [];
    this.level = 0;
    this.bitonicVisual(arr, 0, n, true, null);
    this.array = arr.filter(x => x !== Infinity);
  }

  bitonicVisual(arr, low, cnt, ascending, parentInfo) {
    if (cnt <= 1) return;
    const k = cnt / 2;

    // Record split (red)
    this.level++;
    const splitStep = {
      type: "Split",
      snapshot: arr.slice(),
      row: this.level,
      low,
      cnt,
      parent: parentInfo,
      groups: [
        { start: low, length: k },
        { start: low + k, length: k }
      ]
    };
    this.steps.push(splitStep);

    // Recurse left ascending, right descending
    this.bitonicVisual(arr, low, k, true, splitStep);
    this.bitonicVisual(arr, low + k, k, false, splitStep);

    // Merge
    this.bitonicMergeVisual(arr, low, cnt, ascending, splitStep);
  }

  bitonicMergeVisual(arr, low, cnt, ascending, parentInfo) {
    if (cnt <= 1) return;
    const k = cnt / 2;

    // Compare each pair first (green)
    for (let i = low; i < low + k; i++) {
      this.level++;
      this.steps.push({
        type: "Compare",
        snapshot: arr.slice(),
        row: this.level,
        compared: [i, i + k],
        low,
        cnt,
        parent: parentInfo
      });

      // Swap  (violet)
      if ((arr[i] > arr[i + k]) === ascending) {
        [arr[i], arr[i + k]] = [arr[i + k], arr[i]];
        this.level++;
        this.steps.push({
          type: "Swap",
          snapshot: arr.slice(),
          row: this.level,
          swapped: [i, i + k],
          low,
          cnt,
          parent: parentInfo
        });
      }
    }

    // Merge + step 
    this.level++;
    this.steps.push({
      type: "Merge",
      snapshot: arr.slice(),
      row: this.level,
      low,
      cnt,
      parent: parentInfo
    });

    // Recurse halves
    this.bitonicMergeVisual(arr, low, k, ascending, parentInfo);
    this.bitonicMergeVisual(arr, low + k, k, ascending, parentInfo);
  }

  drawGraph(ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const width = 50, spacing = 15, splitOffset = 50, levelHeight = 80;

    for (let step of this.steps) {
      const y = step.row * levelHeight;
      const arr = step.snapshot.filter(x => x !== Infinity);
      let startX = (ctx.canvas.width - arr.length * (width + spacing)) / 2;

      ctx.font = "20px Arial";
      ctx.textAlign = "center";

      // Step title
      ctx.fillStyle = "#222";
      ctx.fillText(`Step ${step.row}: ${step.type}`, ctx.canvas.width / 2, y - 40);

      for (let i = 0; i < arr.length; i++) {
        let x = startX + i * (width + spacing);

        // Split visual spacing
        if (step.type === "Split") {
          if (i >= step.groups[1].start) x += splitOffset;
          else x -= splitOffset;
        }

        ctx.fillStyle = "#fff";
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 2;
        ctx.fillRect(x, y - 20, width, 40);
        ctx.strokeRect(x, y - 20, width, 40);

        // Color logic
        if (step.type === "Compare" && step.compared.includes(i)) ctx.fillStyle = "#27ae60"; // green
        else if (step.type === "Swap" && step.swapped.includes(i)) ctx.fillStyle = "#8e44ad"; // violet
        else if (step.type === "Merge") ctx.fillStyle = "#3498db"; // blue
        else if (step.type === "Split") ctx.fillStyle = "#e74c3c"; // red
        else ctx.fillStyle = "#333";

        ctx.fillText(arr[i], x + width / 2, y + 7);
      }
    }
  }

  nextPowerOf2(n) {
    let p = 1;
    while (p < n) p *= 2;
    return p;
  }
}
