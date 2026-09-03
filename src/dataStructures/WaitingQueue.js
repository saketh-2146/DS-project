/**
 * DATA STRUCTURE: Queue (FIFO)
 * ---------------------------------------------------
 * WaitingQueue manages the waiting list for a single
 * event using a First-In First-Out queue structure.
 * When seats become available (due to cancellation),
 * the first person in the queue is served.
 *
 * Operations demonstrated:
 *  - enqueue()  → add user to end of queue (O(1))
 *  - dequeue()  → remove first user (O(1))
 *  - peek()     → see who's next (O(1))
 *  - position() → find user's queue position (O(n))
 *  - contains() → check if user is in queue (O(n))
 */

export class WaitingQueue {
  constructor(eventId) {
    this.eventId = eventId;  // Which event this queue is for
    this.items = [];         // Array-backed queue
    this.front = 0;          // Front pointer index
  }

  // Add user to end of waiting queue — O(1)
  enqueue(waitEntry) {
    // waitEntry: { userId, userEmail, userName, seats, timestamp }
    this.items.push(waitEntry);
  }

  // Remove first user from queue — O(1) amortized
  dequeue() {
    if (this.isEmpty()) return null;
    const item = this.items.shift(); // Alternatively, use front pointer
    return item;
  }

  // Peek at first user without removing — O(1)
  peek() {
    return this.isEmpty() ? null : this.items[0];
  }

  // Check if queue is empty — O(1)
  isEmpty() {
    return this.items.length === 0;
  }

  // Get position of user in queue (1-based) — O(n)
  position(userEmail) {
    const idx = this.items.findIndex(e => e.userEmail === userEmail);
    return idx === -1 ? -1 : idx + 1;
  }

  // Check if user is already in queue — O(n)
  contains(userEmail) {
    return this.items.some(e => e.userEmail === userEmail);
  }

  // Remove a specific user from the queue — O(n)
  removeUser(userEmail) {
    const idx = this.items.findIndex(e => e.userEmail === userEmail);
    if (idx !== -1) {
      this.items.splice(idx, 1);
      return true;
    }
    return false;
  }

  // Get total number of people waiting — O(1)
  get length() {
    return this.items.length;
  }

  // Get all entries (for display purposes)
  getAll() {
    return [...this.items];
  }

  // Serialize for localStorage
  serialize() {
    return { eventId: this.eventId, items: this.items };
  }

  // Load from serialized data
  loadFromObject(obj) {
    this.eventId = obj.eventId;
    this.items = obj.items || [];
  }
}

/**
 * WaitingQueueMap — manages WaitingQueues for all events
 * Uses a JS Map (hash map) keyed by eventId for O(1) access.
 */
export class WaitingQueueMap {
  constructor() {
    // JS Map acts as a hash map: eventId -> WaitingQueue
    this.map = new Map();
  }

  // Get or create queue for an event
  getQueue(eventId) {
    if (!this.map.has(eventId)) {
      this.map.set(eventId, new WaitingQueue(eventId));
    }
    return this.map.get(eventId);
  }

  // Enqueue user to a specific event's waiting list
  enqueue(eventId, waitEntry) {
    this.getQueue(eventId).enqueue(waitEntry);
  }

  // Dequeue next user from a specific event's waiting list
  dequeue(eventId) {
    return this.getQueue(eventId).dequeue();
  }

  // Get position of user in a specific event's queue
  getPosition(eventId, userEmail) {
    return this.getQueue(eventId).position(userEmail);
  }

  // Check if user is waiting for a specific event
  isWaiting(eventId, userEmail) {
    return this.getQueue(eventId).contains(userEmail);
  }

  // Serialize all queues for localStorage
  serialize() {
    const obj = {};
    this.map.forEach((queue, eventId) => {
      obj[eventId] = queue.serialize();
    });
    return obj;
  }

  // Load from serialized object
  loadFromObject(obj) {
    this.map = new Map();
    Object.keys(obj || {}).forEach(eventId => {
      const q = new WaitingQueue(eventId);
      q.loadFromObject(obj[eventId]);
      this.map.set(eventId, q);
    });
  }
}
