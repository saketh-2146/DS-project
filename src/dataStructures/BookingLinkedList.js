/**
 * DATA STRUCTURE: Singly Linked List
 * ---------------------------------------------------
 * BookingLinkedList stores the booking history as a
 * chain of nodes. New bookings are added at the HEAD
 * (most recent first). Traversal visits every node.
 *
 * Operations demonstrated:
 *  - prepend()    → add booking at head (O(1))
 *  - append()     → add booking at tail (O(n))
 *  - remove()     → remove booking by id (O(n))
 *  - toArray()    → convert to array (O(n))
 *  - findById()   → search by booking id (O(n))
 */

class ListNode {
  constructor(booking) {
    this.booking = booking; // Booking data object
    this.next = null;       // Pointer to next node
  }
}

export class BookingLinkedList {
  constructor() {
    this.head = null; // Head pointer (most recent booking)
    this.size = 0;
  }

  // Add new booking at head (most recent first) — O(1)
  prepend(booking) {
    const node = new ListNode(booking);
    node.next = this.head;
    this.head = node;
    this.size++;
  }

  // Add new booking at tail — O(n)
  append(booking) {
    const node = new ListNode(booking);
    if (!this.head) {
      this.head = node;
    } else {
      let current = this.head;
      while (current.next) current = current.next;
      current.next = node;
    }
    this.size++;
  }

  // Find booking by id — O(n)
  findById(bookingId) {
    let current = this.head;
    while (current) {
      if (current.booking.id === bookingId) return current.booking;
      current = current.next;
    }
    return null;
  }

  // Update booking status by id — O(n)
  updateStatus(bookingId, status) {
    let current = this.head;
    while (current) {
      if (current.booking.id === bookingId) {
        current.booking.status = status;
        return true;
      }
      current = current.next;
    }
    return false;
  }

  // Remove booking by id — O(n)
  remove(bookingId) {
    if (!this.head) return false;
    if (this.head.booking.id === bookingId) {
      this.head = this.head.next;
      this.size--;
      return true;
    }
    let current = this.head;
    while (current.next) {
      if (current.next.booking.id === bookingId) {
        current.next = current.next.next;
        this.size--;
        return true;
      }
      current = current.next;
    }
    return false;
  }

  // Filter bookings by user email — O(n)
  filterByUser(email) {
    const result = [];
    let current = this.head;
    while (current) {
      if (current.booking.userEmail === email) {
        result.push(current.booking);
      }
      current = current.next;
    }
    return result;
  }

  // Convert linked list to array — O(n)
  toArray() {
    const result = [];
    let current = this.head;
    while (current) {
      result.push(current.booking);
      current = current.next;
    }
    return result;
  }

  // Load from plain array (e.g., from localStorage)
  loadFromArray(arr) {
    this.head = null;
    this.size = 0;
    // Append in order to preserve original order
    (arr || []).forEach(booking => this.append(booking));
  }

  // Serialize for storage
  serialize() {
    return this.toArray();
  }
}
