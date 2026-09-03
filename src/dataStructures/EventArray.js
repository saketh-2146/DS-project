/**
 * DATA STRUCTURE: Array
 * ---------------------------------------------------
 * EventArray stores all events in a JavaScript array.
 * Provides O(n) linear search, O(1) index access, and
 * O(n) insertion. Arrays are the simplest and most
 * fundamental data structure used in this project.
 *
 * Operations demonstrated:
 *  - push()    → insert event (O(1) amortized)
 *  - splice()  → delete event by index (O(n))
 *  - find()    → search event by id (O(n))
 *  - filter()  → filter events by criteria (O(n))
 *  - sort()    → sort events (O(n log n))
 */

export class EventArray {
  constructor() {
    // Internal array to store all event objects
    this.items = [];
  }

  // Insert a new event at the end — O(1) amortized
  push(event) {
    this.items.push(event);
    return this;
  }

  // Remove event by ID — O(n)
  removeById(id) {
    const index = this.items.findIndex(e => e.id === id);
    if (index !== -1) {
      this.items.splice(index, 1);
      return true;
    }
    return false;
  }

  // Find event by ID — O(n)
  findById(id) {
    return this.items.find(e => e.id === id) || null;
  }

  // Update event by ID — O(n)
  updateById(id, updatedData) {
    const index = this.items.findIndex(e => e.id === id);
    if (index !== -1) {
      this.items[index] = { ...this.items[index], ...updatedData };
      return this.items[index];
    }
    return null;
  }

  // Filter events by a predicate — O(n)
  filter(predicate) {
    return this.items.filter(predicate);
  }

  // Sort a copy of events — O(n log n)
  sortBy(comparator) {
    return [...this.items].sort(comparator);
  }

  // Get all events
  getAll() {
    return this.items;
  }

  // Get event count
  get size() {
    return this.items.length;
  }

  // Load from plain array (e.g., from localStorage)
  loadFromArray(arr) {
    this.items = Array.isArray(arr) ? arr : [];
    return this;
  }

  // Serialize to plain array for storage
  toArray() {
    return this.items;
  }
}
