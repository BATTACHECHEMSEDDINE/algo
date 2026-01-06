class AVL extends BST {
  constructor() {
    super();
  }

  // ===== Utilities =====
  height(node) {
    return node ? node.height : 0;
  }

  updateHeight(node) {
    node.height = 1 + Math.max(this.height(node.left), this.height(node.right));
  }

  balanceFactor(node) {
    return this.height(node.left) - this.height(node.right);
  }

  // ===== Rotations =====
  rotateRight(y) {
    const x = y.left;
    const T2 = x.right;

    x.right = y;
    y.left = T2;

    this.updateHeight(y);
    this.updateHeight(x);

    return x;
  }

  rotateLeft(x) {
    const y = x.right;
    const T2 = y.left;

    y.left = x;
    x.right = T2;

    this.updateHeight(x);
    this.updateHeight(y);

    return y;
  }

  // ===== Insert =====
  insert(value) {
    this.root = this._insert(this.root, value);
  }

  _insert(node, value) {
    if (!node) {
      return { value, left: null, right: null, height: 1 };
    }

    if (value < node.value) node.left = this._insert(node.left, value);
    else if (value > node.value) node.right = this._insert(node.right, value);
    else return node; // no duplicates

    this.updateHeight(node);
    const balance = this.balanceFactor(node);

    // LL
    if (balance > 1 && value < node.left.value)
      return this.rotateRight(node);

    // RR
    if (balance < -1 && value > node.right.value)
      return this.rotateLeft(node);

    // LR
    if (balance > 1 && value > node.left.value) {
      node.left = this.rotateLeft(node.left);
      return this.rotateRight(node);
    }

    // RL
    if (balance < -1 && value < node.right.value) {
      node.right = this.rotateRight(node.right);
      return this.rotateLeft(node);
    }

    return node;
  }

  // ===== Delete =====
  delete(value) {
    this.root = this._delete(this.root, value);
  }

  _delete(node, value) {
    if (!node) return node;

    if (value < node.value) node.left = this._delete(node.left, value);
    else if (value > node.value) node.right = this._delete(node.right, value);
    else {
      if (!node.left || !node.right) {
        node = node.left || node.right;
      } else {
        let temp = this._minValueNode(node.right);
        node.value = temp.value;
        node.right = this._delete(node.right, temp.value);
      }
    }

    if (!node) return node;

    this.updateHeight(node);
    const balance = this.balanceFactor(node);

    // LL
    if (balance > 1 && this.balanceFactor(node.left) >= 0)
      return this.rotateRight(node);

    // LR
    if (balance > 1 && this.balanceFactor(node.left) < 0) {
      node.left = this.rotateLeft(node.left);
      return this.rotateRight(node);
    }

    // RR
    if (balance < -1 && this.balanceFactor(node.right) <= 0)
      return this.rotateLeft(node);

    // RL
    if (balance < -1 && this.balanceFactor(node.right) > 0) {
      node.right = this.rotateRight(node.right);
      return this.rotateLeft(node);
    }

    return node;
  }

  _minValueNode(node) {
    let current = node;
    while (current.left) current = current.left;
    return current;
  }

  // ===== Clear =====
  clear() {
    this.root = null;
  }
}
