class MHeap {
  constructor(m = 2) {
    this.m = m;
    this.data = [];
  }

  insert(value) {
    this.data.push(value);
    this.bubbleUp(this.data.length - 1);
  }

  bubbleUp(index) {
    const parent = i => Math.floor((i - 1) / this.m);
    let i = index;
    while (i > 0 && this.data[i] < this.data[parent(i)]) {
      [this.data[i], this.data[parent(i)]] = [this.data[parent(i)], this.data[i]];
      i = parent(i);
    }
  }

  delete(value) {
    const i = this.data.indexOf(value);
    if (i === -1) return;
    const last = this.data.pop();
    if (i < this.data.length) {
      this.data[i] = last;
      this.bubbleUp(i);
      this.bubbleDown(i);
    }
  }

  bubbleDown(index) {
    const child = i => [...Array(this.m).keys()].map(k => this.m * i + k + 1);
    let i = index;
    while (true) {
      const children = child(i).filter(c => c < this.data.length);
      if (!children.length) break;
      let minChild = children[0];
      for (const c of children) if (this.data[c] < this.data[minChild]) minChild = c;
      if (this.data[i] <= this.data[minChild]) break;
      [this.data[i], this.data[minChild]] = [this.data[minChild], this.data[i]];
      i = minChild;
    }
  }

  get root() {
    return this.data.length ? this.data[0] : null;
  }

  draw(ctx, x, y, spacing) {
    if (!this.data.length) return;

    const drawNode = (index, cx, cy, offset) => {
      ctx.beginPath();
      ctx.arc(cx, cy, 20, 0, Math.PI * 2);
      ctx.fillStyle = "#87CEEB";
      ctx.fill();
      ctx.strokeStyle = "#333";
      ctx.stroke();
      ctx.fillStyle = "black";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this.data[index], cx, cy);

      for (let k = 1; k <= this.m; k++) {
        const childIdx = this.m * index + k;
        if (childIdx >= this.data.length) continue;
        const childX = cx + (k - (this.m + 1) / 2) * offset;
        const childY = cy + 80;
        ctx.beginPath();
        ctx.moveTo(cx, cy + 20);
        ctx.lineTo(childX, childY - 20);
        ctx.stroke();
        drawNode(childIdx, childX, childY, offset / this.m);
      }
    };

    drawNode(0, x, y, spacing);
  }

  search(value) {
    return this.data.includes(value);
  }
}
