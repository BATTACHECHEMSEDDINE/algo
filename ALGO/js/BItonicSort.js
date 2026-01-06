class BitonicSort {
  constructor() {
    this.array = [];
    this.steps = []; // major steps only
    this.level = 0;  // visual row
  }

  insert(num) {
    this.array.push(num);
  }

  prepareSort() {
    const n = this.nextPowerOf2(this.array.length);
    const arr = this.array.slice();
    while (arr.length < n) arr.push(Infinity);
    this.steps = [];
    this.level = 0;
    this.bitonicSortMajor(arr, 0, n, true);
    this.array = arr.filter(x => x !== Infinity);
  }

  // Only store major steps: after each full merge
  bitonicSortMajor(arr, low, cnt, ascending) {
    if (cnt > 1) {
      const k = Math.floor(cnt / 2);
      this.bitonicSortMajor(arr, low, k, true);
      this.bitonicSortMajor(arr, low + k, k, false);
      this.bitonicMergeMajor(arr, low, cnt, ascending);
    }
  }

  bitonicMergeMajor(arr, low, cnt, ascending) {
    if (cnt > 1) {
      const k = Math.floor(cnt / 2);

      // Perform swaps
      const swappedIndices = [];
      for (let i = low; i < low + k; i++) {
        if ((arr[i] > arr[i + k]) === ascending) {
          [arr[i], arr[i + k]] = [arr[i + k], arr[i]];
          swappedIndices.push(i, i + k);
        }
      }

      // Record snapshot for visualization
      this.level++;
      this.steps.push({ snapshot: arr.slice(), swapped: swappedIndices, row: this.level });

      // Recurse into halves
      this.bitonicMergeMajor(arr, low, k, ascending);
      this.bitonicMergeMajor(arr, low + k, k, ascending);
    }
  }

  async animate(ctx, delay = 500) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const width = 50;
    const spacing = 10;
    ctx.font = "20px Arial";
    ctx.textAlign = "center";

    const levelHeight = 60;

    for (let step of this.steps) {
      const arr = step.snapshot.filter(x => x !== Infinity);
      const startX = (ctx.canvas.width - (arr.length * (width + spacing))) / 2;
      const y = step.row * levelHeight;

      for (let i = 0; i < arr.length; i++) {
        if (step.swapped.includes(i)) {
          ctx.fillStyle = "#fff";
          ctx.strokeStyle = "#e74c3c";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(startX + i * (width + spacing) + width / 2, y - 10, 20, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = "#e74c3c";
        } else {
          ctx.fillStyle = "#333";
        }
        ctx.fillText(arr[i], startX + i * (width + spacing) + width / 2, y);
      }

      await new Promise(res => setTimeout(res, delay));
    }
  }

  nextPowerOf2(n) {
    let p = 1;
    while (p < n) p *= 2;
    return p;
  }

  draw(ctx, startY = 50) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const width = 50;
    const spacing = 10;
    const arr = this.array;
    const startX = (ctx.canvas.width - (arr.length * (width + spacing))) / 2;
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "#333";
    for (let i = 0; i < arr.length; i++) {
      ctx.fillText(arr[i], startX + i * (width + spacing) + width / 2, startY);
    }
  }
}
