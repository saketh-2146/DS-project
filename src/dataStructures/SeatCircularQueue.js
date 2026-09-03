/**
 * DATA STRUCTURE: Circular Queue
 * ---------------------------------------------------
 * SeatCircularQueue manages seat slots for an event
 * using a fixed-size circular buffer. This allows
 * efficient O(1) seat allocation and deallocation
 * without shifting elements (unlike a regular array).
 *
 * When a seat is booked: rear advances.
 * When a seat is freed: it goes back into the pool.
 *
 * Operations demonstrated:
 *  - allocate()    → book a seat slot (O(1))
 *  - release()     → free a seat slot (O(1))
 *  - isFull()      → check if all seats taken (O(1))
 *  - isEmpty()     → check if no seats booked (O(1))
 *  - getAvailable() → count of available seats (O(1))
 */

export class SeatCircularQueue {
  constructor(totalSeats) {
    this.capacity = totalSeats;
    // Each slot: null = available, { bookingId, userEmail } = booked
    this.slots = new Array(totalSeats).fill(null);
    this.bookedCount = 0;  // Number of currently booked seats
    this.front = 0;        // Points to next available seat
    this.rear = 0;         // Points to last booked seat
  }

  // Allocate N seats for a booking — O(k) where k = seats requested
  allocate(seats, bookingId, userEmail) {
    if (this.availableSeats < seats) return null;
    const allocatedSlots = [];
    let count = 0;
    for (let i = 0; i < this.capacity && count < seats; i++) {
      const idx = (this.front + i) % this.capacity;
      if (this.slots[idx] === null) {
        this.slots[idx] = { bookingId, userEmail };
        allocatedSlots.push(idx);
        count++;
        this.bookedCount++;
      }
    }
    return allocatedSlots;
  }

  // Release seats for a given booking ID — O(n)
  release(bookingId) {
    let freed = 0;
    for (let i = 0; i < this.capacity; i++) {
      if (this.slots[i] && this.slots[i].bookingId === bookingId) {
        this.slots[i] = null;
        freed++;
        this.bookedCount--;
      }
    }
    return freed;
  }

  // Get number of available seats — O(1)
  get availableSeats() {
    return this.capacity - this.bookedCount;
  }

  // Get number of booked seats — O(1)
  get bookedSeats() {
    return this.bookedCount;
  }

  // Check if fully booked — O(1)
  isFull() {
    return this.bookedCount >= this.capacity;
  }

  // Check if no seats are booked — O(1)
  isEmpty() {
    return this.bookedCount === 0;
  }

  // Get visual representation of seat slots (for UI)
  getSeatMap() {
    return this.slots.map((slot, idx) => ({
      seatNumber: idx + 1,
      status: slot ? 'booked' : 'available',
      bookingId: slot ? slot.bookingId : null,
    }));
  }

  // Serialize for localStorage
  serialize() {
    return {
      capacity: this.capacity,
      slots: this.slots,
      bookedCount: this.bookedCount,
    };
  }

  // Load from serialized data
  loadFromObject(obj) {
    this.capacity = obj.capacity;
    this.slots = obj.slots;
    this.bookedCount = obj.bookedCount;
  }
}

/**
 * SeatCircularQueueMap — manages seat queues for all events
 */
export class SeatCircularQueueMap {
  constructor() {
    this.map = new Map(); // eventId -> SeatCircularQueue
  }

  // Initialize seat queue for an event
  init(eventId, totalSeats) {
    if (!this.map.has(eventId)) {
      this.map.set(eventId, new SeatCircularQueue(totalSeats));
    }
  }

  // Get seat queue for an event
  getQueue(eventId) {
    return this.map.get(eventId) || null;
  }

  // Allocate seats for a booking
  allocate(eventId, seats, bookingId, userEmail) {
    const q = this.map.get(eventId);
    return q ? q.allocate(seats, bookingId, userEmail) : null;
  }

  // Release seats for a cancelled booking
  release(eventId, bookingId) {
    const q = this.map.get(eventId);
    return q ? q.release(bookingId) : 0;
  }

  // Get available seats for an event
  getAvailable(eventId) {
    const q = this.map.get(eventId);
    return q ? q.availableSeats : 0;
  }

  // Serialize all queues
  serialize() {
    const obj = {};
    this.map.forEach((queue, eventId) => {
      obj[eventId] = queue.serialize();
    });
    return obj;
  }

  // Load from serialized object
  loadFromObject(obj, events) {
    this.map = new Map();
    // Initialize all events first
    events.forEach(e => {
      const q = new SeatCircularQueue(e.totalSeats);
      if (obj && obj[e.id]) q.loadFromObject(obj[e.id]);
      this.map.set(e.id, q);
    });
  }
}
