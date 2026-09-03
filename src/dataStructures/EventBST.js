/**
 * DATA STRUCTURE: Binary Search Tree (BST)
 * ---------------------------------------------------
 * EventBST organizes events by their date/price/name for
 * efficient O(log n) average-case search and sorted traversal.
 *
 * BST Property: left.value < node.value < right.value
 *
 * Operations demonstrated:
 *  - insert()         → add event node (O(log n) avg)
 *  - search()         → find event by key (O(log n) avg)
 *  - inorderTraversal() → sorted output (O(n))
 *  - searchByName()   → prefix search (O(n))
 */

class BSTNode {
  constructor(event, key) {
    this.event = event;   // The actual event data
    this.key = key;       // Sorting key (e.g. date timestamp, price, name)
    this.left = null;
    this.right = null;
  }
}

export class EventBST {
  constructor(keyExtractor = (e) => new Date(e.date).getTime()) {
    this.root = null;
    // keyExtractor converts an event to a comparable number/string
    this.keyExtractor = keyExtractor;
  }

  // Insert event into BST — O(log n) average
  insert(event) {
    const key = this.keyExtractor(event);
    this.root = this._insertNode(this.root, event, key);
  }

  _insertNode(node, event, key) {
    if (node === null) return new BSTNode(event, key);
    if (key < node.key) {
      node.left = this._insertNode(node.left, event, key);
    } else {
      node.right = this._insertNode(node.right, event, key);
    }
    return node;
  }

  // Build BST from an array of events
  buildFromArray(events) {
    this.root = null;
    events.forEach(e => this.insert(e));
  }

  // In-order traversal → returns events sorted by key — O(n)
  inorderTraversal() {
    const result = [];
    this._inorder(this.root, result);
    return result;
  }

  _inorder(node, result) {
    if (node === null) return;
    this._inorder(node.left, result);
    result.push(node.event);
    this._inorder(node.right, result);
  }

  // Search events whose name includes a query string — O(n)
  searchByName(query) {
    const allEvents = this.inorderTraversal();
    const q = query.toLowerCase();
    return allEvents.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.venue.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q)
    );
  }

  // Get BST structure for visualization (BFS level-order)
  getLevels() {
    if (!this.root) return [];
    const levels = [];
    const queue = [{ node: this.root, level: 0 }];
    while (queue.length > 0) {
      const { node, level } = queue.shift();
      if (!levels[level]) levels[level] = [];
      levels[level].push({ key: node.key, event: node.event });
      if (node.left) queue.push({ node: node.left, level: level + 1 });
      if (node.right) queue.push({ node: node.right, level: level + 1 });
    }
    return levels;
  }
}
