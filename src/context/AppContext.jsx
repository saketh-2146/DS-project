import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { EventArray } from '../dataStructures/EventArray';
import { EventBST } from '../dataStructures/EventBST';
import { PriorityBookingQueue } from '../dataStructures/PriorityQueue';
import { UserHashTable } from '../dataStructures/UserHashTable';
import { BookingLinkedList } from '../dataStructures/BookingLinkedList';
import { WaitingQueueMap } from '../dataStructures/WaitingQueue';
import { SeatCircularQueueMap } from '../dataStructures/SeatCircularQueue';
import { storage } from '../utils/localStorage';
import { isFirebaseConfigured } from '../utils/firebase';
import { SAMPLE_EVENTS, ADMIN_CREDENTIALS } from '../utils/sampleData';
import { generateId, hashPassword } from '../utils/helpers';

// ─── Instantiate Data Structures (module-level singletons) ──────────────────
export const eventArray        = new EventArray();
export const eventBST          = new EventBST();
export const priorityQueue     = new PriorityBookingQueue();
export const userHashTable     = new UserHashTable();
export const bookingLinkedList = new BookingLinkedList();
export const waitingQueueMap   = new WaitingQueueMap();
export const seatQueueMap      = new SeatCircularQueueMap();

// ─── Context ─────────────────────────────────────────────────────────────────
const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

// ─── Initial State ────────────────────────────────────────────────────────────
const initialState = {
  events:      [],
  bookings:    [],
  currentUser: null,
  toasts:      [],
  isLoading:   true,   // start as true — wait for async init
  firebaseConnected: false,
};

// ─── Reducer ──────────────────────────────────────────────────────────────────
function appReducer(state, action) {
  switch (action.type) {
    case 'SET_EVENTS':      return { ...state, events:      action.payload };
    case 'SET_BOOKINGS':    return { ...state, bookings:    action.payload };
    case 'SET_USER':        return { ...state, currentUser: action.payload };
    case 'ADD_TOAST':       return { ...state, toasts: [...state.toasts, action.payload] };
    case 'REMOVE_TOAST':    return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };
    case 'SET_LOADING':     return { ...state, isLoading:   action.payload };
    case 'SET_FB_STATUS':   return { ...state, firebaseConnected: action.payload };
    default:                return state;
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // ── Initialization (async — waits for Firebase if configured) ─────────────
  useEffect(() => {
    (async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_FB_STATUS', payload: isFirebaseConfigured });

      const alreadyInit = await storage.isInitialized();

      if (!alreadyInit) {
        // ── First run: seed sample data ────────────────────────────────────
        eventArray.loadFromArray(SAMPLE_EVENTS);

        // Register admin in Hash Table
        const adminUser = {
          ...ADMIN_CREDENTIALS,
          password: hashPassword(ADMIN_CREDENTIALS.password),
          createdAt: new Date().toISOString(),
        };
        userHashTable.set(ADMIN_CREDENTIALS.email, adminUser);

        // Persist to Firebase + localStorage
        await storage.saveEvents(SAMPLE_EVENTS);
        await storage.saveUser(adminUser);
        await storage.markInitialized();

      } else {
        // ── Subsequent runs: load persisted data ───────────────────────────
        let storedEvents   = await storage.loadEvents()   || SAMPLE_EVENTS;
        
        // Forcefully cap any existing events in storage to 15 maximum seats
        let eventsModified = false;
        storedEvents = storedEvents.map(ev => {
          if (ev.totalSeats > 15) {
            eventsModified = true;
            const difference = ev.totalSeats - 15;
            return {
              ...ev,
              totalSeats: 15,
              availableSeats: Math.max(0, ev.availableSeats - difference)
            };
          }
          return ev;
        });
        
        if (eventsModified) {
          await storage.saveEvents(storedEvents);
        }

        const storedUsers    = await storage.loadUsers()    || [];
        
        // Force register new admin if not present
        if (!storedUsers.find(u => u.email === ADMIN_CREDENTIALS.email)) {
          const newAdmin = {
            ...ADMIN_CREDENTIALS,
            password: hashPassword(ADMIN_CREDENTIALS.password),
            createdAt: new Date().toISOString(),
          };
          storedUsers.push(newAdmin);
          await storage.saveUser(newAdmin);
        }

        const storedBookings = await storage.loadBookings() || [];
        const storedWaiting  = await storage.loadWaitingQueues() || {};
        const storedSeats    = await storage.loadSeatQueues()    || {};

        // ── Load into Data Structures ──────────────────────────────────────
        eventArray.loadFromArray(storedEvents);
        userHashTable.loadFromArray(storedUsers);
        bookingLinkedList.loadFromArray(storedBookings);
        waitingQueueMap.loadFromObject(storedWaiting);
        seatQueueMap.loadFromObject(storedSeats, storedEvents);
      }

      // ── Initialize seat queues for any event that doesn't have one ────────
      eventArray.getAll().forEach(ev => {
        if (!seatQueueMap.getQueue(ev.id)) {
          seatQueueMap.init(ev.id, ev.totalSeats);
        }
      });

      // ── Build BST and Priority Queue from events ──────────────────────────
      eventBST.buildFromArray(eventArray.getAll());
      priorityQueue.buildFromEvents(eventArray.getAll());

      // ── Push initial state to React ───────────────────────────────────────
      dispatch({ type: 'SET_EVENTS',   payload: eventArray.getAll() });
      dispatch({ type: 'SET_BOOKINGS', payload: bookingLinkedList.toArray() });

      // ── Restore session ───────────────────────────────────────────────────
      const savedUser = storage.loadCurrentUser();
      if (savedUser) dispatch({ type: 'SET_USER', payload: savedUser });

      dispatch({ type: 'SET_LOADING', payload: false });
    })();
  }, []);

  // ── Toast system ───────────────────────────────────────────────────────────
  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = generateId('toast');
    dispatch({ type: 'ADD_TOAST', payload: { id, message, type } });
    setTimeout(() => dispatch({ type: 'REMOVE_TOAST', payload: id }), duration);
  }, []);

  // ── Auth ───────────────────────────────────────────────────────────────────
  const register = useCallback(async (name, email, password, phone) => {
    if (userHashTable.has(email)) {
      return { success: false, error: 'Email already registered.' };
    }
    const user = {
      id:        generateId('usr'),
      name, email,
      password:  hashPassword(password),
      phone:     phone || '',
      role:      'user',
      createdAt: new Date().toISOString(),
    };
    userHashTable.set(email, user);
    // Persist single user to Firestore + localStorage
    await storage.saveUser(user);
    showToast('Registration successful! Please log in.', 'success');
    return { success: true };
  }, [showToast]);

  const login = useCallback((email, password) => {
    const user = userHashTable.get(email);
    if (!user) return { success: false, error: 'No account found with this email.' };
    if (user.password !== hashPassword(password)) {
      return { success: false, error: 'Incorrect password.' };
    }
    const safeUser = { ...user };
    delete safeUser.password;
    storage.saveCurrentUser(safeUser);           // session: localStorage only
    dispatch({ type: 'SET_USER', payload: safeUser });
    showToast(`Welcome back, ${safeUser.name}!`, 'success');
    return { success: true, user: safeUser };
  }, [showToast]);

  const logout = useCallback(() => {
    storage.clearCurrentUser();
    dispatch({ type: 'SET_USER', payload: null });
    showToast('Logged out successfully.', 'info');
  }, [showToast]);

  // ── Events ─────────────────────────────────────────────────────────────────
  const syncEvents = useCallback(async () => {
    const all = eventArray.getAll();
    eventBST.buildFromArray(all);
    priorityQueue.buildFromEvents(all);
    // Save full array (both LS and Firebase batch)
    await storage.saveEvents(all);
    dispatch({ type: 'SET_EVENTS', payload: all });
  }, []);

  const addEvent = useCallback(async (eventData) => {
    const cappedSeats = Math.min(15, Number(eventData.totalSeats));
    const ev = {
      ...eventData,
      id:             generateId('evt'),
      totalSeats:     cappedSeats,
      availableSeats: cappedSeats,
      bookingsCount:  0,
      createdAt:      new Date().toISOString(),
    };
    eventArray.push(ev);
    seatQueueMap.init(ev.id, ev.totalSeats);

    // Persist single new event doc instead of full batch
    await storage.saveEvent(ev);
    await storage.saveSeatQueues(seatQueueMap.serialize());

    eventBST.buildFromArray(eventArray.getAll());
    priorityQueue.buildFromEvents(eventArray.getAll());
    dispatch({ type: 'SET_EVENTS', payload: eventArray.getAll() });

    showToast(`Event "${ev.name}" added!`, 'success');
    return ev;
  }, [showToast]);

  const updateEvent = useCallback(async (id, data) => {
    const updated = eventArray.updateById(id, data);
    if (updated) {
      await storage.saveEvent(updated);          // single-doc update
      eventBST.buildFromArray(eventArray.getAll());
      priorityQueue.buildFromEvents(eventArray.getAll());
      dispatch({ type: 'SET_EVENTS', payload: eventArray.getAll() });
      showToast('Event updated!', 'success');
    }
    return updated;
  }, [showToast]);

  const deleteEvent = useCallback(async (id) => {
    const ev = eventArray.findById(id);
    eventArray.removeById(id);
    await storage.deleteEvent(id);              // single-doc delete
    eventBST.buildFromArray(eventArray.getAll());
    priorityQueue.buildFromEvents(eventArray.getAll());
    dispatch({ type: 'SET_EVENTS', payload: eventArray.getAll() });
    showToast(`Event "${ev?.name}" deleted.`, 'info');
  }, [showToast]);

  // ── Bookings ────────────────────────────────────────────────────────────────
  const syncBookings = useCallback(async () => {
    const all = bookingLinkedList.toArray();
    await storage.saveBookings(all);
    dispatch({ type: 'SET_BOOKINGS', payload: all });
  }, []);

  const bookEvent = useCallback(async (eventId, seats, attendees) => {
    if (!state.currentUser) return { success: false, error: 'Please log in to book.' };

    const event = eventArray.findById(eventId);
    if (!event) return { success: false, error: 'Event not found.' };

    // Duplicate booking check
    const existing = bookingLinkedList.toArray().find(
      b => b.eventId === eventId && b.userEmail === state.currentUser.email && b.status === 'confirmed'
    );
    if (existing) return { success: false, error: 'You have already booked this event.' };

    // ── No seats available → Waiting Queue ────────────────────────────────
    if (event.availableSeats < seats) {
      if (waitingQueueMap.isWaiting(eventId, state.currentUser.email)) {
        return { success: false, error: 'You are already on the waiting list.' };
      }

      // Check if adding these seats exceeds the 50 seat waitlist capacity
      if (waitingQueueMap.getTotalSeats(eventId) + seats > 50) {
        return { success: false, error: 'The waiting list is full (maximum 50 waitlisted seats allowed).' };
      }

      waitingQueueMap.enqueue(eventId, {
        userId:    state.currentUser.id,
        userEmail: state.currentUser.email,
        userName:  attendees[0]?.name || state.currentUser.name,
        userPhone: attendees[0]?.phone || state.currentUser.phone,
        attendees,
        seats,
        timestamp: new Date().toISOString(),
      });
      await storage.saveWaitingQueues(waitingQueueMap.serialize());
      showToast(`Added to waiting list for "${event.name}"!`, 'warning');
      return { success: true, waitlisted: true };
    }

    // ── Allocate seats via Circular Queue ─────────────────────────────────
    const bookingId = generateId('bkg');
    const allocatedSlots = seatQueueMap.allocate(eventId, seats, bookingId, state.currentUser.email);
    
    // Map allocated seats to attendees
    const enhancedAttendees = attendees.map((attendee, idx) => ({
      ...attendee,
      seatNumber: allocatedSlots ? allocatedSlots[idx] + 1 : null
    }));

    // Update EventArray in-memory
    const newAvailable    = event.availableSeats - seats;
    const newBookingsCount = (event.bookingsCount || 0) + 1;
    const updatedEvent = eventArray.updateById(eventId, {
      availableSeats: newAvailable,
      bookingsCount:  newBookingsCount,
    });

    // Build booking record + prepend to Linked List
    const booking = {
      id:           bookingId,
      eventId,
      eventName:    event.name,
      eventDate:    event.date,
      eventTime:    event.time,
      eventVenue:   event.venue,
      eventImage:   event.image,
      userEmail:    state.currentUser.email,
      userName:     enhancedAttendees[0]?.name || state.currentUser.name,
      userPhone:    enhancedAttendees[0]?.phone || state.currentUser.phone,
      attendees:    enhancedAttendees,
      seats,
      pricePerSeat: event.price,
      totalAmount:  event.price * seats,
      status:       'confirmed',
      bookedAt:     new Date().toISOString(),
    };
    bookingLinkedList.prepend(booking);

    // Persist concurrently
    await Promise.all([
      storage.saveEvent(updatedEvent),
      storage.saveBooking(booking),
      storage.saveSeatQueues(seatQueueMap.serialize()),
    ]);

    // Update BST + PQ
    eventBST.buildFromArray(eventArray.getAll());
    priorityQueue.updatePriority(eventId, newBookingsCount);

    dispatch({ type: 'SET_EVENTS',   payload: eventArray.getAll() });
    dispatch({ type: 'SET_BOOKINGS', payload: bookingLinkedList.toArray() });

    showToast(`🎉 Booking confirmed for "${event.name}"!`, 'success');
    return { success: true, booking };
  }, [state.currentUser, showToast]);

  const cancelBooking = useCallback(async (bookingId) => {
    const booking = bookingLinkedList.findById(bookingId);
    if (!booking)                    return { success: false, error: 'Booking not found.' };
    if (booking.status === 'cancelled') return { success: false, error: 'Already cancelled.' };

    // Mark cancelled in Linked List
    bookingLinkedList.updateStatus(bookingId, 'cancelled');
    seatQueueMap.release(booking.eventId, bookingId);

    const event = eventArray.findById(booking.eventId);
    const freed = booking.seats;
    let updatedEvent = null;

    if (event) {
      updatedEvent = eventArray.updateById(booking.eventId, {
        availableSeats: event.availableSeats + freed,
        bookingsCount:  Math.max(0, (event.bookingsCount || 1) - 1),
      });
    }

    // ── Auto-promote next person(s) from Waiting Queue ────────────────────
    const promotedBookings = [];
    let currentEvent = eventArray.findById(booking.eventId);

    while (currentEvent && currentEvent.availableSeats > 0) {
      const next = waitingQueueMap.getQueue(booking.eventId).peek();
      if (!next) break; // No one waiting

      // Only promote if enough seats are available for this person's request
      if (currentEvent.availableSeats < next.seats) break;

      // Dequeue and allocate
      waitingQueueMap.dequeue(booking.eventId);
      const promotedId = generateId('bkg');
      const allocatedSlots = seatQueueMap.allocate(booking.eventId, next.seats, promotedId, next.userEmail);

      const enhancedAttendees = (next.attendees || []).map((attendee, idx) => ({
        ...attendee,
        seatNumber: allocatedSlots ? allocatedSlots[idx] + 1 : null
      }));

      updatedEvent = eventArray.updateById(booking.eventId, {
        availableSeats: currentEvent.availableSeats - next.seats,
        bookingsCount: (currentEvent.bookingsCount || 0) + 1,
      });
      currentEvent = eventArray.findById(booking.eventId);

      const promotedBooking = {
        id:           promotedId,
        eventId:      booking.eventId,
        eventName:    booking.eventName,
        eventDate:    booking.eventDate,
        eventTime:    booking.eventTime,
        eventVenue:   booking.eventVenue,
        eventImage:   booking.eventImage,
        userEmail:    next.userEmail,
        userName:     next.userName,
        userPhone:    next.userPhone,
        attendees:    enhancedAttendees,
        seats:        next.seats,
        pricePerSeat: event?.price || 0,
        totalAmount:  (event?.price || 0) * next.seats,
        status:       'confirmed',
        bookedAt:     new Date().toISOString(),
        promotedFromWaitlist: true,
      };
      bookingLinkedList.prepend(promotedBooking);
      promotedBookings.push(promotedBooking);
      showToast(`✅ Seat automatically assigned to ${next.userName} from waiting list!`, 'success', 5000);
    }

    // Persist all changes concurrently
    await Promise.all([
      updatedEvent ? storage.saveEvent(updatedEvent) : Promise.resolve(),
      storage.saveBooking({ ...booking, status: 'cancelled' }),
      ...promotedBookings.map(pb => storage.saveBooking(pb)),
      storage.saveWaitingQueues(waitingQueueMap.serialize()),
      storage.saveSeatQueues(seatQueueMap.serialize()),
    ]);

    eventBST.buildFromArray(eventArray.getAll());
    priorityQueue.buildFromEvents(eventArray.getAll());
    dispatch({ type: 'SET_EVENTS',   payload: eventArray.getAll() });
    dispatch({ type: 'SET_BOOKINGS', payload: bookingLinkedList.toArray() });

    showToast('Booking cancelled successfully.', 'warning');
    return { success: true };
  }, [showToast]);

  // ── Partial Seat Cancellation ───────────────────────────────────────────────
  const cancelSeats = useCallback(async (bookingId, seatNumbersToCancel) => {
    const booking = bookingLinkedList.findById(bookingId);
    if (!booking) return { success: false, error: 'Booking not found.' };
    if (booking.status === 'cancelled') return { success: false, error: 'Already cancelled.' };

    const cancelCount = seatNumbersToCancel.length;
    // seatNumber is 1-based; slot index is 0-based
    const slotIndicesToFree = seatNumbersToCancel.map(sn => sn - 1);

    // Free the specific slots
    seatQueueMap.releaseBySlots(booking.eventId, slotIndicesToFree);

    // Remove those attendees from the booking
    const remainingAttendees = (booking.attendees || []).filter(
      a => !seatNumbersToCancel.includes(a.seatNumber)
    );
    const remainingSeats = booking.seats - cancelCount;

    // Update booking in linked list
    let updatedBooking;
    if (remainingSeats <= 0) {
      // All seats cancelled — mark whole booking cancelled
      bookingLinkedList.updateStatus(bookingId, 'cancelled');
      updatedBooking = { ...booking, status: 'cancelled', attendees: [], seats: 0 };
    } else {
      bookingLinkedList.updateById(bookingId, { attendees: remainingAttendees, seats: remainingSeats });
      updatedBooking = { ...booking, attendees: remainingAttendees, seats: remainingSeats };
    }

    // Update event available seats
    const event = eventArray.findById(booking.eventId);
    let updatedEvent = null;
    if (event) {
      updatedEvent = eventArray.updateById(booking.eventId, {
        availableSeats: event.availableSeats + cancelCount,
        bookingsCount: remainingSeats <= 0 ? Math.max(0, (event.bookingsCount || 1) - 1) : event.bookingsCount,
      });
    }

    // Auto-promote from waiting list
    const promotedBookings = [];
    let currentEvent = eventArray.findById(booking.eventId);
    while (currentEvent && currentEvent.availableSeats > 0) {
      const next = waitingQueueMap.getQueue(booking.eventId).peek();
      if (!next || currentEvent.availableSeats < next.seats) break;
      waitingQueueMap.dequeue(booking.eventId);
      const promotedId = generateId('bkg');
      const allocatedSlots = seatQueueMap.allocate(booking.eventId, next.seats, promotedId, next.userEmail);
      const enhancedAttendees = (next.attendees || []).map((att, idx) => ({
        ...att, seatNumber: allocatedSlots ? allocatedSlots[idx] + 1 : null
      }));
      updatedEvent = eventArray.updateById(booking.eventId, {
        availableSeats: currentEvent.availableSeats - next.seats,
        bookingsCount: (currentEvent.bookingsCount || 0) + 1,
      });
      currentEvent = eventArray.findById(booking.eventId);
      const pb = {
        id: promotedId, eventId: booking.eventId, eventName: booking.eventName,
        eventDate: booking.eventDate, eventTime: booking.eventTime,
        eventVenue: booking.eventVenue, eventImage: booking.eventImage,
        userEmail: next.userEmail, userName: next.userName, userPhone: next.userPhone,
        attendees: enhancedAttendees, seats: next.seats,
        pricePerSeat: event?.price || 0, totalAmount: (event?.price || 0) * next.seats,
        status: 'confirmed', bookedAt: new Date().toISOString(), promotedFromWaitlist: true,
      };
      bookingLinkedList.prepend(pb);
      promotedBookings.push(pb);
      showToast(`✅ Seat assigned to ${next.userName} from waiting list!`, 'success', 5000);
    }

    await Promise.all([
      storage.saveBooking(updatedBooking),
      updatedEvent ? storage.saveEvent(updatedEvent) : Promise.resolve(),
      ...promotedBookings.map(pb => storage.saveBooking(pb)),
      storage.saveWaitingQueues(waitingQueueMap.serialize()),
      storage.saveSeatQueues(seatQueueMap.serialize()),
    ]);

    eventBST.buildFromArray(eventArray.getAll());
    priorityQueue.buildFromEvents(eventArray.getAll());
    dispatch({ type: 'SET_EVENTS',   payload: eventArray.getAll() });
    dispatch({ type: 'SET_BOOKINGS', payload: bookingLinkedList.toArray() });

    showToast(`Seat${cancelCount > 1 ? 's' : ''} cancelled successfully.`, 'warning');
    return { success: true };
  }, [showToast]);

  // ── Context Value ──────────────────────────────────────────────────────────
  const value = {
    events:       state.events,
    bookings:     state.bookings,
    currentUser:  state.currentUser,
    toasts:       state.toasts,
    isLoading:    state.isLoading,
    firebaseConnected: state.firebaseConnected,
    // Auth
    register, login, logout,
    // Events
    addEvent, updateEvent, deleteEvent,
    // Bookings
    bookEvent, cancelBooking, cancelSeats,
    // Toast
    showToast,
    // DS references (for visualization / admin panel)
    ds: {
      eventArray, eventBST, priorityQueue,
      userHashTable, bookingLinkedList,
      waitingQueueMap, seatQueueMap,
    },
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
