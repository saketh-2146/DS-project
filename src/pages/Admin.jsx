import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../utils/sampleData';
import { 
  Plus, Edit2, Trash2, Calendar, Users, Activity, 
  Database, Clock, ChevronDown, CheckCircle
} from 'lucide-react';
import { formatDate, formatCurrency, getSeatPercentage } from '../utils/helpers';
import BookingBadge from '../components/BookingBadge';

export default function Admin() {
  const { 
    events, bookings, currentUser, addEvent, updateEvent, deleteEvent, ds 
  } = useApp();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', category: 'Technology', date: '', time: '', venue: '',
    description: '', price: 0, totalSeats: 100, image: '', isFeatured: false
  });

  const resetForm = () => {
    setFormData({
      name: '', category: 'Technology', date: '', time: '', venue: '',
      description: '', price: 0, totalSeats: 100, image: '', isFeatured: false
    });
    setEditingEvent(null);
  };

  const openAddModal = () => { resetForm(); setShowEventModal(true); };
  
  const openEditModal = (event) => {
    setFormData({ ...event });
    setEditingEvent(event);
    setShowEventModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingEvent) {
      updateEvent(editingEvent.id, formData);
    } else {
      addEvent(formData);
    }
    setShowEventModal(false);
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return <div className="page flex-center">Access Denied</div>;
  }

  // Calculate Admin Stats
  const totalRevenue = bookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + b.totalAmount, 0);
  const totalTicketsSold = bookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + b.seats, 0);
  const activeWaitlists = ds.eventArray.getAll().filter(e => {
     const q = ds.waitingQueueMap.getQueue(e.id);
     return q && !q.isEmpty();
  }).length;

  return (
    <div className="page fade-in">
      <div className="container" style={{ maxWidth: '1200px' }}>
        
        <div className="page-header" style={{ marginBottom: 'var(--space-6)' }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
             Admin Dashboard <span className="badge badge-purple">System Level</span>
          </h1>
        </div>

        <div className="admin-layout">
          
          <aside className="admin-sidebar">
            <button className={`admin-sidebar-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
              <Activity size={16} /> Overview
            </button>
            <button className={`admin-sidebar-btn ${activeTab === 'events' ? 'active' : ''}`} onClick={() => setActiveTab('events')}>
              <Calendar size={16} /> Manage Events
            </button>
            <button className={`admin-sidebar-btn ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
              <Ticket size={16} /> All Bookings
            </button>
            <button className={`admin-sidebar-btn ${activeTab === 'ds' ? 'active' : ''}`} onClick={() => setActiveTab('ds')}>
              <Database size={16} /> Data Structure Status
            </button>
          </aside>

          <main>
            
            {/* ── Dashboard ── */}
            {activeTab === 'dashboard' && (
              <div className="fade-in">
                <div className="admin-stat-grid">
                  <div className="admin-stat-card">
                    <div className="admin-stat-icon text-gradient">🎟️</div>
                    <div className="admin-stat-value">{events.length}</div>
                    <div className="admin-stat-label">Total Events</div>
                  </div>
                  <div className="admin-stat-card">
                    <div className="admin-stat-icon" style={{ color: 'var(--color-success)' }}>💰</div>
                    <div className="admin-stat-value">{formatCurrency(totalRevenue)}</div>
                    <div className="admin-stat-label">Total Revenue</div>
                  </div>
                  <div className="admin-stat-card">
                    <div className="admin-stat-icon" style={{ color: 'var(--color-primary-l)' }}>🎫</div>
                    <div className="admin-stat-value">{totalTicketsSold}</div>
                    <div className="admin-stat-label">Tickets Sold</div>
                  </div>
                  <div className="admin-stat-card">
                    <div className="admin-stat-icon" style={{ color: 'var(--color-warning)' }}>⏳</div>
                    <div className="admin-stat-value">{activeWaitlists}</div>
                    <div className="admin-stat-label">Active Waitlists</div>
                  </div>
                </div>

                <div className="admin-card">
                  <h3 style={{ marginBottom: 'var(--space-4)' }}>Recent Bookings (Linked List Head)</h3>
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>User</th>
                          <th>Event</th>
                          <th>Seats</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.slice(0, 5).map(b => (
                          <tr key={b.id}>
                            <td className="font-mono" style={{ fontSize: '0.75rem' }}>{b.id.split('-').pop()}</td>
                            <td>{b.userEmail}</td>
                            <td>{b.eventName}</td>
                            <td>{b.seats}</td>
                            <td>{formatCurrency(b.totalAmount)}</td>
                            <td><BookingBadge status={b.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── Manage Events ── */}
            {activeTab === 'events' && (
              <div className="fade-in">
                <div className="flex-between" style={{ marginBottom: 'var(--space-4)' }}>
                  <h3>Events Inventory (Array/BST)</h3>
                  <button className="btn btn-primary" onClick={openAddModal}>
                    <Plus size={16} /> Add Event
                  </button>
                </div>
                
                <div className="admin-card table-wrap" style={{ padding: 0 }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Event Name</th>
                        <th>Date</th>
                        <th>Capacity</th>
                        <th>Price</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map(ev => (
                        <tr key={ev.id}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{ev.name}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-3)' }}>{ev.category}</div>
                          </td>
                          <td>{formatDate(ev.date)}</td>
                          <td>
                            <div className="progress-bar-wrap" style={{ width: '100px' }}>
                              <div className="progress-bar-track" style={{ height: '4px' }}>
                                <div className="progress-bar-fill" style={{ width: `${getSeatPercentage(ev.availableSeats, ev.totalSeats)}%`, background: 'var(--color-primary)' }} />
                              </div>
                            </div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--color-text-2)', marginTop: '2px' }}>
                              {ev.totalSeats - ev.availableSeats}/{ev.totalSeats} Booked
                            </div>
                          </td>
                          <td>{formatCurrency(ev.price)}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => openEditModal(ev)} style={{ padding: '0.25rem' }}>
                              <Edit2 size={14} />
                            </button>
                            <button className="btn btn-ghost btn-sm" onClick={() => {
                              if(window.confirm(`Delete ${ev.name}?`)) deleteEvent(ev.id);
                            }} style={{ padding: '0.25rem', color: 'var(--color-danger)' }}>
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Bookings ── */}
            {activeTab === 'bookings' && (
              <div className="fade-in">
                <h3 style={{ marginBottom: 'var(--space-4)' }}>Booking Database (Linked List Traversal)</h3>
                <div className="admin-card table-wrap" style={{ padding: 0 }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Date / Time</th>
                        <th>User Email</th>
                        <th>Event</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map(b => (
                        <tr key={b.id}>
                          <td className="font-mono" style={{ fontSize: '0.7rem' }}>{b.id}</td>
                          <td style={{ fontSize: '0.8rem' }}>{new Date(b.bookedAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</td>
                          <td style={{ fontSize: '0.8rem' }}>{b.userEmail}</td>
                          <td style={{ fontSize: '0.8rem' }}>{b.eventName}</td>
                          <td><BookingBadge status={b.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── DS Status ── */}
            {activeTab === 'ds' && (
              <div className="fade-in">
                <h3 style={{ marginBottom: 'var(--space-4)' }}>System Data Structures State</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div className="admin-card">
                    <h4 style={{ marginBottom: '0.5rem', color: 'var(--color-primary-l)' }}>Event Array</h4>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-2)' }}>Size: {ds.eventArray.size} elements</p>
                  </div>
                  
                  <div className="admin-card">
                    <h4 style={{ marginBottom: '0.5rem', color: '#fbbf24' }}>Event BST</h4>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-2)' }}>Nodes: {ds.eventBST.inorderTraversal().length}</p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)' }}>Key: timestamp (date)</p>
                  </div>
                  
                  <div className="admin-card">
                    <h4 style={{ marginBottom: '0.5rem', color: '#4ade80' }}>Priority Queue (Heap)</h4>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-2)' }}>Size: {ds.priorityQueue.size} nodes</p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)' }}>Priority: bookingsCount (Max-Heap)</p>
                  </div>
                  
                  <div className="admin-card">
                    <h4 style={{ marginBottom: '0.5rem', color: '#f87171' }}>User Hash Table</h4>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-2)' }}>Entries: {ds.userHashTable.size}</p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)' }}>Load Factor: {ds.userHashTable.loadFactor}</p>
                  </div>
                  
                  <div className="admin-card" style={{ gridColumn: '1 / -1' }}>
                     <h4 style={{ marginBottom: '0.5rem', color: '#a78bfa' }}>Waiting Queues (FIFO)</h4>
                     <div className="table-wrap">
                        <table className="data-table">
                          <thead><tr><th>Event</th><th>Queue Length</th></tr></thead>
                          <tbody>
                            {events.map(ev => {
                               const q = ds.waitingQueueMap.getQueue(ev.id);
                               if (!q || q.isEmpty()) return null;
                               return (
                                 <tr key={ev.id}>
                                   <td>{ev.name}</td>
                                   <td><span className="badge badge-warning">{q.length} in queue</span></td>
                                 </tr>
                               );
                            })}
                          </tbody>
                        </table>
                     </div>
                  </div>
                </div>
              </div>
            )}
            
          </main>
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 style={{ marginBottom: 'var(--space-6)' }}>{editingEvent ? 'Edit Event' : 'Add New Event'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--space-4)' }}>
              
              <div className="form-group">
                <label className="form-label">Event Name</label>
                <input type="text" className="form-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Venue</label>
                  <input type="text" className="form-input" required value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input type="date" className="form-input" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Time</label>
                  <input type="time" className="form-input" required value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">Price (₹)</label>
                  <input type="number" min="0" className="form-input" required value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Total Seats</label>
                  <input type="number" min="1" className="form-input" required value={formData.totalSeats} onChange={e => setFormData({...formData, totalSeats: Number(e.target.value)})} disabled={!!editingEvent} />
                  {editingEvent && <span style={{ fontSize: '0.65rem', color: 'var(--color-warning)' }}>Cannot change capacity after creation.</span>}
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input type="url" className="form-input" required value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows="4" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 'var(--space-2)' }}>
                <input type="checkbox" id="isFeatured" checked={formData.isFeatured} onChange={e => setFormData({...formData, isFeatured: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                <label htmlFor="isFeatured" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>Mark as Featured</label>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: 'var(--space-4)' }}>
                <button type="button" className="btn btn-secondary w-full" onClick={() => setShowEventModal(false)} style={{ justifyContent: 'center' }}>Cancel</button>
                <button type="submit" className="btn btn-primary w-full" style={{ justifyContent: 'center' }}>Save Event</button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
// Required import fix
import { Ticket } from 'lucide-react';
