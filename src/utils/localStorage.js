/**
 * Unified Storage Layer
 * ─────────────────────────────────────────────────────────────────────────────
 * This module transparently wraps Firebase Firestore (when configured) or
 * falls back to localStorage (when Firebase config is not yet set).
 *
 * All Data Structure classes remain unchanged — they operate purely in memory.
 * This layer handles persisting their serialized state to/from Firestore.
 *
 * FIRESTORE DOCUMENT STRUCTURE:
 *   /events/{eventId}           → individual event docs
 *   /bookings/{bookingId}       → individual booking docs
 *   /users/{email}              → individual user docs
 *   /waitingQueues/{eventId}    → { eventId, items: [...] }
 *   /seatQueues/{eventId}       → { capacity, slots, bookedCount }
 *   /appMeta/init               → { initialized: true }
 */

import {
  collection, doc, getDocs, getDoc,
  setDoc, updateDoc, deleteDoc, writeBatch,
} from 'firebase/firestore';

import { db, isFirebaseConfigured, COLLECTIONS } from './firebase';

// ── localStorage keys (fallback) ─────────────────────────────────────────────
const LS = {
  EVENTS:         'sebs_events',
  BOOKINGS:       'sebs_bookings',
  USERS:          'sebs_users',
  CURRENT_USER:   'sebs_current_user',
  WAITING_QUEUES: 'sebs_waiting_queues',
  SEAT_QUEUES:    'sebs_seat_queues',
  INITIALIZED:    'sebs_initialized',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const lsGet  = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const lsSet  = (key, val)      => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };
const lsRm   = (key)           => { try { localStorage.removeItem(key); } catch {} };

// Fetch all documents from a Firestore collection as an array
async function fetchCollection(colName) {
  if (!db) return null;
  try {
    const snap = await getDocs(collection(db, colName));
    return snap.docs.map(d => ({ _docId: d.id, ...d.data() }));
  } catch (err) {
    console.error(`Firestore fetchCollection(${colName}) error:`, err);
    return null;
  }
}

// Write a single doc to Firestore (merge-safe)
async function writeDoc(colName, docId, data) {
  if (!db) return;
  try {
    await setDoc(doc(db, colName, docId), data, { merge: true });
  } catch (err) {
    console.error(`Firestore writeDoc(${colName}/${docId}) error:`, err);
  }
}

// Delete a single Firestore doc
async function removeDoc(colName, docId) {
  if (!db) return;
  try {
    await deleteDoc(doc(db, colName, docId));
  } catch (err) {
    console.error(`Firestore removeDoc(${colName}/${docId}) error:`, err);
  }
}

// Batch-write an array of objects to Firestore, each using obj.id as doc ID
async function batchWrite(colName, items, idKey = 'id') {
  if (!db || !items?.length) return;
  try {
    const batch = writeBatch(db);
    items.forEach(item => {
      const ref = doc(db, colName, String(item[idKey]));
      batch.set(ref, item, { merge: true });
    });
    await batch.commit();
  } catch (err) {
    console.error(`Firestore batchWrite(${colName}) error:`, err);
  }
}

// ── PUBLIC API ────────────────────────────────────────────────────────────────

export const storage = {

  // ── INIT FLAG ────────────────────────────────────────────────────────────
  isInitialized: async () => {
    if (!isFirebaseConfigured) return !!localStorage.getItem(LS.INITIALIZED);
    try {
      const snap = await getDoc(doc(db, COLLECTIONS.APP_META, 'init'));
      return snap.exists() && snap.data().initialized === true;
    } catch {
      return !!localStorage.getItem(LS.INITIALIZED);
    }
  },

  markInitialized: async () => {
    lsSet(LS.INITIALIZED, '1');
    if (isFirebaseConfigured) {
      await writeDoc(COLLECTIONS.APP_META, 'init', { initialized: true, timestamp: Date.now() });
    }
  },

  // ── EVENTS ───────────────────────────────────────────────────────────────
  loadEvents: async () => {
    if (isFirebaseConfigured) {
      const docs = await fetchCollection(COLLECTIONS.EVENTS);
      if (docs !== null) return docs;
    }
    return lsGet(LS.EVENTS, null);
  },

  saveEvents: async (eventsArray) => {
    lsSet(LS.EVENTS, eventsArray);
    if (isFirebaseConfigured) {
      await batchWrite(COLLECTIONS.EVENTS, eventsArray);
    }
  },

  saveEvent: async (event) => {
    // Save/update a single event (more efficient than full batch)
    const all = lsGet(LS.EVENTS, []);
    const idx = all.findIndex(e => e.id === event.id);
    if (idx !== -1) all[idx] = event; else all.push(event);
    lsSet(LS.EVENTS, all);
    if (isFirebaseConfigured) {
      await writeDoc(COLLECTIONS.EVENTS, event.id, event);
    }
  },

  deleteEvent: async (eventId) => {
    const all = lsGet(LS.EVENTS, []);
    lsSet(LS.EVENTS, all.filter(e => e.id !== eventId));
    if (isFirebaseConfigured) {
      await removeDoc(COLLECTIONS.EVENTS, eventId);
    }
  },

  // ── BOOKINGS ─────────────────────────────────────────────────────────────
  loadBookings: async () => {
    if (isFirebaseConfigured) {
      const docs = await fetchCollection(COLLECTIONS.BOOKINGS);
      if (docs !== null) return docs;
    }
    return lsGet(LS.BOOKINGS, []);
  },

  saveBookings: async (bookingsArray) => {
    lsSet(LS.BOOKINGS, bookingsArray);
    if (isFirebaseConfigured) {
      await batchWrite(COLLECTIONS.BOOKINGS, bookingsArray);
    }
  },

  saveBooking: async (booking) => {
    // Upsert single booking
    const all = lsGet(LS.BOOKINGS, []);
    const idx = all.findIndex(b => b.id === booking.id);
    if (idx !== -1) all[idx] = booking; else all.unshift(booking);
    lsSet(LS.BOOKINGS, all);
    if (isFirebaseConfigured) {
      await writeDoc(COLLECTIONS.BOOKINGS, booking.id, booking);
    }
  },

  // ── USERS ────────────────────────────────────────────────────────────────
  loadUsers: async () => {
    if (isFirebaseConfigured) {
      const docs = await fetchCollection(COLLECTIONS.USERS);
      if (docs !== null) return docs;
    }
    return lsGet(LS.USERS, []);
  },

  saveUser: async (user) => {
    // User doc ID = email with special chars replaced for Firestore compatibility
    const docId = user.email.replace(/\./g, '_').replace(/@/g, '-at-').replace(/[^a-zA-Z0-9_-]/g, '_');
    // Save to localStorage
    const all = lsGet(LS.USERS, []);
    const idx = all.findIndex(u => u.email === user.email);
    if (idx !== -1) all[idx] = user; else all.push(user);
    lsSet(LS.USERS, all);
    // Save to Firestore
    if (isFirebaseConfigured && db) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        await setDoc(doc(db, COLLECTIONS.USERS, docId), user, { merge: true });
        console.log('✅ User saved to Firestore:', docId);
      } catch (err) {
        console.error('❌ Failed to save user to Firestore:', err);
      }
    }
  },

  saveUsers: async (usersArray) => {
    lsSet(LS.USERS, usersArray);
    if (isFirebaseConfigured && db) {
      // Save each user individually with safe doc ID
      await Promise.all(usersArray.map(async (user) => {
        const docId = user.email.replace(/\./g, '_').replace(/@/g, '-at-').replace(/[^a-zA-Z0-9_-]/g, '_');
        try {
          const { doc, setDoc } = await import('firebase/firestore');
          await setDoc(doc(db, COLLECTIONS.USERS, docId), user, { merge: true });
        } catch (err) {
          console.error('❌ Failed to save user to Firestore:', user.email, err);
        }
      }));
    }
  },

  // ── CURRENT USER SESSION ─────────────────────────────────────────────────
  // Session is always stored in localStorage only (no need for cloud sync)
  saveCurrentUser: (user)  => lsSet(LS.CURRENT_USER, user),
  loadCurrentUser: ()      => lsGet(LS.CURRENT_USER, null),
  clearCurrentUser: ()     => lsRm(LS.CURRENT_USER),

  // ── WAITING QUEUES ───────────────────────────────────────────────────────
  loadWaitingQueues: async () => {
    if (isFirebaseConfigured) {
      const docs = await fetchCollection(COLLECTIONS.WAITING_QUEUES);
      if (docs !== null) {
        // Convert [{_docId: eventId, eventId, items}, ...] → { [eventId]: {eventId, items} }
        const obj = {};
        docs.forEach(d => { obj[d.eventId || d._docId] = d; });
        return obj;
      }
    }
    return lsGet(LS.WAITING_QUEUES, {});
  },

  saveWaitingQueues: async (obj) => {
    lsSet(LS.WAITING_QUEUES, obj);
    if (isFirebaseConfigured) {
      const updates = Object.entries(obj).map(([eventId, data]) =>
        writeDoc(COLLECTIONS.WAITING_QUEUES, eventId, data)
      );
      await Promise.all(updates);
    }
  },

  // ── SEAT QUEUES ──────────────────────────────────────────────────────────
  loadSeatQueues: async () => {
    if (isFirebaseConfigured) {
      const docs = await fetchCollection(COLLECTIONS.SEAT_QUEUES);
      if (docs !== null) {
        const obj = {};
        docs.forEach(d => { obj[d._docId] = d; });
        return obj;
      }
    }
    return lsGet(LS.SEAT_QUEUES, {});
  },

  saveSeatQueues: async (obj) => {
    lsSet(LS.SEAT_QUEUES, obj);
    if (isFirebaseConfigured) {
      const updates = Object.entries(obj).map(([eventId, data]) =>
        writeDoc(COLLECTIONS.SEAT_QUEUES, eventId, data)
      );
      await Promise.all(updates);
    }
  },

  // ── CLEAR ALL ────────────────────────────────────────────────────────────
  clearAll: () => Object.values(LS).forEach(k => lsRm(k)),
};
