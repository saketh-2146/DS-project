/**
 * DATA STRUCTURE: Hash Table
 * ---------------------------------------------------
 * UserHashTable provides O(1) average-case insert,
 * lookup, and delete operations for user records,
 * keyed by email address.
 *
 * Collision resolution: Separate chaining with arrays.
 *
 * Operations demonstrated:
 *  - set(email, user)  → insert/update user (O(1) avg)
 *  - get(email)        → retrieve user (O(1) avg)
 *  - delete(email)     → remove user (O(1) avg)
 *  - has(email)        → check existence (O(1) avg)
 *  - getAll()          → list all users (O(n))
 */

export class UserHashTable {
  constructor(size = 64) {
    this.tableSize = size;
    // Buckets: array of arrays for chaining
    this.table = new Array(size).fill(null).map(() => []);
    this.count = 0;
  }

  // djb2 hash function — maps email string to bucket index
  _hash(key) {
    let hash = 5381;
    for (let i = 0; i < key.length; i++) {
      hash = (hash * 33) ^ key.charCodeAt(i);
    }
    return Math.abs(hash) % this.tableSize;
  }

  // Insert or update user — O(1) average
  set(email, user) {
    const idx = this._hash(email);
    const bucket = this.table[idx];
    const existing = bucket.findIndex(([k]) => k === email);
    if (existing !== -1) {
      bucket[existing] = [email, user]; // Update
    } else {
      bucket.push([email, user]);       // Insert
      this.count++;
    }
    // Auto-resize if load factor > 0.75
    if (this.count / this.tableSize > 0.75) this._resize();
  }

  // Retrieve user by email — O(1) average
  get(email) {
    const idx = this._hash(email);
    const bucket = this.table[idx];
    const entry = bucket.find(([k]) => k === email);
    return entry ? entry[1] : null;
  }

  // Check if user exists — O(1) average
  has(email) {
    return this.get(email) !== null;
  }

  // Delete user by email — O(1) average
  delete(email) {
    const idx = this._hash(email);
    const bucket = this.table[idx];
    const i = bucket.findIndex(([k]) => k === email);
    if (i !== -1) {
      bucket.splice(i, 1);
      this.count--;
      return true;
    }
    return false;
  }

  // Get all stored users — O(n)
  getAll() {
    const users = [];
    this.table.forEach(bucket => {
      bucket.forEach(([, user]) => users.push(user));
    });
    return users;
  }

  // Resize and rehash when load factor is too high
  _resize() {
    const oldTable = this.table;
    this.tableSize *= 2;
    this.table = new Array(this.tableSize).fill(null).map(() => []);
    this.count = 0;
    oldTable.forEach(bucket => {
      bucket.forEach(([key, value]) => this.set(key, value));
    });
  }

  // Serialize to plain object for localStorage
  serialize() {
    return this.getAll();
  }

  // Load from plain array (e.g., from localStorage)
  loadFromArray(usersArray) {
    this.table = new Array(this.tableSize).fill(null).map(() => []);
    this.count = 0;
    (usersArray || []).forEach(user => {
      if (user && user.email) this.set(user.email, user);
    });
  }

  get size() {
    return this.count;
  }

  // Get load factor (for visualization)
  get loadFactor() {
    return (this.count / this.tableSize).toFixed(2);
  }
}
