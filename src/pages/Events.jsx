import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { eventBST, eventArray } from '../context/AppContext';
import EventCard from '../components/EventCard';
import { CATEGORIES } from '../utils/sampleData';
import { Search, Filter, SortAsc, SortDesc, Calendar as CalendarIcon, Tag } from 'lucide-react';

export default function Events() {
  const { events } = useApp();
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date'); // date, price, name, popularity
  const [sortOrder, setSortOrder] = useState('asc'); // asc, desc
  
  // Derived state (Filtered & Sorted Events)
  const [displayEvents, setDisplayEvents] = useState([]);

  useEffect(() => {
    // 1. SEARCH: If query exists, use BST for prefix/inclusion search (simulated)
    // For a true BST search on name, we use eventBST.searchByName()
    let result = [];
    if (searchQuery.trim().length > 0) {
      result = eventBST.searchByName(searchQuery);
    } else {
      // Get all events from Array
      result = eventArray.getAll();
    }

    // 2. FILTER: By Category (O(n))
    if (activeCategory !== 'all') {
      result = result.filter(e => e.category === activeCategory);
    }

    // 3. SORT: Using Array.sort (O(n log n))
    result = [...result].sort((a, b) => {
      let valA, valB;
      
      switch (sortBy) {
        case 'date':
          valA = new Date(a.date).getTime();
          valB = new Date(b.date).getTime();
          break;
        case 'price':
          valA = a.price;
          valB = b.price;
          break;
        case 'popularity':
          valA = a.bookingsCount || 0;
          valB = b.bookingsCount || 0;
          break;
        case 'name':
        default:
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
          break;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setDisplayEvents(result);
  }, [events, searchQuery, activeCategory, sortBy, sortOrder]);


  return (
    <div className="page fade-in">
      <div className="container">
        
        <div className="page-header">
          <h1>Explore Events</h1>
          <p>Discover and book tickets for upcoming events. Powered by Binary Search Tree for rapid searching.</p>
        </div>

        <div className="events-layout">
          {/* Sidebar / Filters */}
          <aside className="filters-panel">
            
            {/* Search */}
            <div className="filter-section">
              <div className="filter-title">Search</div>
              <div className="search-bar">
                <Search className="search-icon" size={16} />
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Event name, venue..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {searchQuery && (
                <div style={{ fontSize: '0.65rem', color: 'var(--color-primary)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Zap size={12} /> BST Search Active: O(log n) expected
                </div>
              )}
            </div>

            {/* Categories */}
            <div className="filter-section">
              <div className="filter-title">Categories</div>
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {CATEGORIES.map(cat => (
                  <button 
                    key={cat.id}
                    className={`filter-chip ${activeCategory === cat.id ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat.id)}
                  >
                    <span>{cat.icon}</span> {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Sorting */}
            <div className="filter-section">
              <div className="filter-title">Sort By</div>
              
              <select 
                className="form-input" 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                style={{ marginBottom: 'var(--space-3)' }}
              >
                <option value="date">Date</option>
                <option value="price">Price</option>
                <option value="name">Name</option>
                <option value="popularity">Popularity</option>
              </select>

              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button 
                  className={`btn btn-sm ${sortOrder === 'asc' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setSortOrder('asc')}
                >
                  <SortAsc size={14} /> Asc
                </button>
                <button 
                  className={`btn btn-sm ${sortOrder === 'desc' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setSortOrder('desc')}
                >
                  <SortDesc size={14} /> Desc
                </button>
              </div>
            </div>

          </aside>

          {/* Main Content */}
          <main>
            <div className="flex-between" style={{ marginBottom: 'var(--space-6)' }}>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-2)' }}>
                Showing <strong style={{ color: 'var(--color-text)' }}>{displayEvents.length}</strong> events
              </div>
            </div>

            {displayEvents.length > 0 ? (
              <div className="events-grid">
                {displayEvents.map((event, index) => (
                  <div key={event.id} className={`fade-in fade-in-${(index % 3) + 1}`}>
                    <EventCard event={event} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state card">
                <div className="empty-state-icon">🔍</div>
                <h3>No events found</h3>
                <p>Try adjusting your search query or filters.</p>
                <button className="btn btn-outline" onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}>
                  Clear Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
// Needed for icon
import { Zap } from 'lucide-react';
