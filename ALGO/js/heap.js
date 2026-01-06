class Heap extends BST {
  constructor(isMinHeap = true) {
    super();
    this.isMinHeap = isMinHeap;
    this.array = [];
  }

  // ===== Comparison =====
  compare(a, b) {
    return this.isMinHeap ? a < b : a > b;
  }

  // ===== Insert =====
  insert(value) {
    this.array.push(value);
    this.heapifyUp(this.array.length - 1);
    this.buildTree();
  }

  heapifyUp(index) {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.compare(this.array[index], this.array[parent])) {
        [this.array[index], this.array[parent]] =
          [this.array[parent], this.array[index]];
        index = parent;
      } else break;
    }
  }

  // ===== Delete =====
  delete(value) {
    const index = this.array.indexOf(value);
    if (index === -1) return;

    const last = this.array.pop();
    if (index < this.array.length) {
      this.array[index] = last;
      this.heapifyDown(index);
      this.heapifyUp(index);
    }
    this.buildTree();
  }

  heapifyDown(index) {
    const n = this.array.length;
    while (true) {
      let smallest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;

      if (left < n && this.compare(this.array[left], this.array[smallest]))
        smallest = left;
      if (right < n && this.compare(this.array[right], this.array[smallest]))
        smallest = right;

      if (smallest !== index) {
        [this.array[index], this.array[smallest]] =
          [this.array[smallest], this.array[index]];
        index = smallest;
      } else break;
    }
  }

  // ===== Search =====
  search(value) {
    return this.array.includes(value);
  }

  // ===== Build tree for drawing =====
  buildTree() {
    this.root = this._buildNode(0);
  }

  _buildNode(index) {
    if (index >= this.array.length) return null;

    return {
      value: this.array[index],
      left: this._buildNode(2 * index + 1),
      right: this._buildNode(2 * index + 2)
    };
  }

  // ===== Clear =====
  clear() {
    this.array = [];
    this.root = null;
  }
}
