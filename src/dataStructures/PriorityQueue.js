/**
 * DATA STRUCTURE: Priority Queue (Max-Heap)
 * ---------------------------------------------------
 * PriorityBookingQueue ranks events by popularity score
 * (bookings count). The most popular event is always at
 * the top (index 0). Implemented as a binary max-heap.
 *
 * Operations demonstrated:
 *  - enqueue()  → insert with priority (O(log n))
 *  - dequeue()  → remove highest priority (O(log n))
 *  - peek()     → view highest priority (O(1))
 *  - heapifyUp / heapifyDown → maintain heap property
 */

export class PriorityBookingQueue {
  constructor() {
    // Heap array: each item = { event, priority }
    this.heap = [];
  }

  // Helper: get parent/child indices
  _parent(i) { return Math.floor((i - 1) / 2); }
  _left(i)   { return 2 * i + 1; }
  _right(i)  { return 2 * i + 2; }

  // Swap two elements in the heap
  _swap(i, j) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  // Enqueue with a priority value — O(log n)
  enqueue(event, priority) {
    this.heap.push({ event, priority });
    this._heapifyUp(this.heap.length - 1);
  }

  // Bubble up to restore max-heap property — O(log n)
  _heapifyUp(i) {
    while (i > 0) {
      const p = this._parent(i);
      if (this.heap[p].priority < this.heap[i].priority) {
        this._swap(p, i);
        i = p;
      } else break;
    }
  }

  // Remove and return the highest priority event — O(log n)
  dequeue() {
    if (this.heap.length === 0) return null;
    const top = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._heapifyDown(0);
    }
    return top;
  }

  // Bubble down to restore max-heap property — O(log n)
  _heapifyDown(i) {
    const n = this.heap.length;
    let largest = i;
    const l = this._left(i);
    const r = this._right(i);
    if (l < n && this.heap[l].priority > this.heap[largest].priority) largest = l;
    if (r < n && this.heap[r].priority > this.heap[largest].priority) largest = r;
    if (largest !== i) {
      this._swap(i, largest);
      this._heapifyDown(largest);
    }
  }

  // Peek at highest priority without removing — O(1)
  peek() {
    return this.heap.length > 0 ? this.heap[0] : null;
  }

  // Build heap from events array using their bookingsCount as priority
  buildFromEvents(events) {
    this.heap = [];
    events.forEach(e => this.enqueue(e, e.bookingsCount || 0));
  }

  // Get top N popular events (non-destructive)
  getTopN(n) {
    // Clone heap, extract top n
    const clone = new PriorityBookingQueue();
    clone.heap = [...this.heap];
    const result = [];
    for (let i = 0; i < n && clone.heap.length > 0; i++) {
      const item = clone.dequeue();
      if (item) result.push(item.event);
    }
    return result;
  }

  // Update priority of an event (e.g., after a booking)
  updatePriority(eventId, newPriority) {
    const idx = this.heap.findIndex(h => h.event.id === eventId);
    if (idx !== -1) {
      this.heap[idx].priority = newPriority;
      this._heapifyUp(idx);
      this._heapifyDown(idx);
    }
  }

  get size() {
    return this.heap.length;
  }

  toArray() {
    return this.heap.map(h => ({ ...h.event, _priority: h.priority }));
  }
}
