class Node {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.x = 0;
    this.y = 0;
  }
}

class BST {
  constructor() {
    this.root = null;
  }

  // ---- INSERT ----
  insert(value) {
    if (value === "" || value == null || isNaN(value)) return;
    const newNode = new Node(Number(value));

    if (!this.root) {
      this.root = newNode;
      return;
    }

    let current = this.root;
    while (true) {
      if (newNode.value < current.value) {
        if (!current.left) {
          current.left = newNode;
          return;
        }
        current = current.left;
      } else if (newNode.value > current.value) {
        if (!current.right) {
          current.right = newNode;
          return;
        }
        current = current.right;
      } else {
        // duplicate
        return;
      }
    }
  }

  // ---- SEARCH ----
  search(value) {
    const num = Number(value);
    let current = this.root;
    while (current) {
      if (num === current.value) return current;
      current = num < current.value ? current.left : current.right;
    }
    return null;
  }

  // ---- DELETE ----
  delete(value) {
    const num = Number(value);
    this.root = this._deleteRec(this.root, num);
  }

  _deleteRec(node, value) {
    if (!node) return null;

    if (value < node.value) node.left = this._deleteRec(node.left, value);
    else if (value > node.value) node.right = this._deleteRec(node.right, value);
    else {
      // Node found
      if (!node.left) return node.right;
      if (!node.right) return node.left;

      // Two children: inorder successor
      const minNode = this._findMin(node.right);
      node.value = minNode.value;
      node.right = this._deleteRec(node.right, minNode.value);
    }
    return node;
  }

  _findMin(node) {
    while (node.left) node = node.left;
    return node;
  }

  // ---- DRAW ----
  draw(ctx, x, y, offset, showArrows = false) {
    if (!this.root) return;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#333";
    this._drawNode(ctx, this.root, x, y, offset, showArrows);
  }

  _drawNode(ctx, node, x, y, offset, showArrows) {
    if (!node) return;
    const radius = 25;

    node.x = x;
    node.y = y;

    // Draw left branch
    if (node.left) {
      const childX = x - offset;
      const childY = y + 80;
      this._drawEdge(ctx, x, y, childX, childY, showArrows);
      this._drawNode(ctx, node.left, childX, childY, offset / 1.8, showArrows);
    }

    // Draw right branch
    if (node.right) {
      const childX = x + offset;
      const childY = y + 80;
      this._drawEdge(ctx, x, y, childX, childY, showArrows);
      this._drawNode(ctx, node.right, childX, childY, offset / 1.8, showArrows);
    }

    // Draw node circle
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = "#87CEEB";
    ctx.fill();
    ctx.stroke();

    // Draw value text
    ctx.fillStyle = "black";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(node.value, x, y);
  }

  _drawEdge(ctx, fromX, fromY, toX, toY, showArrows) {
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    if (showArrows) this._drawArrow(ctx, fromX, fromY, toX, toY);
  }

  _drawArrow(ctx, fromX, fromY, toX, toY) {
    const headlen = 12;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headlen * Math.cos(angle - Math.PI / 6),
      toY - headlen * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headlen * Math.cos(angle + Math.PI / 6),
      toY - headlen * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
  }
}
