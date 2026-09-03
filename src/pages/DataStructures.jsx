import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { DSVisualizer } from '../components/DSVisualizer';

export default function DataStructures() {
  const { ds } = useApp();
  
  // States to trigger re-renders for animations if needed
  const [arrayVis, setArrayVis] = useState([]);
  const [queueVis, setQueueVis] = useState([]);
  const [llVis, setLlVis] = useState([]);
  const [bstVis, setBstVis] = useState([]);
  const [heapVis, setHeapVis] = useState([]);
  const [hashVis, setHashVis] = useState([]);
  const [circularVis, setCircularVis] = useState([]);

  useEffect(() => {
    // 1. Array
    setArrayVis(ds.eventArray.toArray().slice(0, 5));
    
    // 2. Queue (WaitingList for first event with waitlist)
    let qEvents = [];
    for (let e of ds.eventArray.toArray()) {
      const q = ds.waitingQueueMap.getQueue(e.id);
      if (q && !q.isEmpty()) {
        qEvents = q.getAll();
        break;
      }
    }
    setQueueVis(qEvents.length > 0 ? qEvents : [{userEmail: 'demo1@user.com'}, {userEmail: 'demo2@user.com'}]);

    // 3. Linked List
    setLlVis(ds.bookingLinkedList.toArray().slice(0, 4));

    // 4. BST
    setBstVis(ds.eventBST.getLevels().slice(0, 3)); // first 3 levels

    // 5. Priority Queue / Heap
    setHeapVis(ds.priorityQueue.toArray().slice(0, 7)); // max 7 nodes for simple binary tree viz

    // 6. Hash Table
    const table = ds.userHashTable.table;
    const filledBuckets = table.map((bucket, idx) => ({ idx, count: bucket.length })).filter(b => b.count > 0).slice(0, 10);
    setHashVis(filledBuckets);

    // 7. Circular Queue
    let cQ = null;
    for (let e of ds.eventArray.toArray()) {
       cQ = ds.seatQueueMap.getQueue(e.id);
       if (cQ && cQ.bookedSeats > 0) break;
    }
    if (cQ) {
       // Just take a small segment for visualization (e.g. 10 seats)
       const map = cQ.getSeatMap().slice(0, 16);
       setCircularVis(map);
    } else {
       // Demo data
       setCircularVis(Array(16).fill(0).map((_, i) => ({ status: i % 3 === 0 ? 'booked' : 'available' })));
    }

  }, [ds]);

  return (
    <div className="page fade-in">
      <div className="container">
        <div className="page-header text-center" style={{ maxWidth: '800px', margin: '0 auto var(--space-12)' }}>
          <div className="eyebrow">Interactive Panel</div>
          <h1>Data Structures in Action</h1>
          <p>This project extensively uses 7 fundamental data structures to achieve optimal performance and mimic real-world system architecture.</p>
        </div>

        <div className="ds-grid">
          
          {/* 1. Array */}
          <DSVisualizer 
            title="Event Array" 
            description="Stores all event objects in contiguous memory. Provides fast O(1) random access and O(n) filtering." 
            dsType="array"
            complexity={{ Access: 'O(1)', Search: 'O(n)', Filter: 'O(n)' }}
          >
            <div className="ds-visual array-viz">
              {arrayVis.map((ev, i) => (
                <div key={i} className="array-cell">
                  <div className="array-cell-val">ev[{i}]</div>
                  <div className="array-cell-idx" style={{ fontSize: '0.55rem', marginTop: '2px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '90%', textAlign: 'center' }}>
                    {ev.name.split(' ')[0]}
                  </div>
                </div>
              ))}
              <div className="array-cell" style={{ borderStyle: 'dashed', borderColor: 'var(--color-border)' }}>...</div>
            </div>
          </DSVisualizer>

          {/* 2. Hash Table */}
          <DSVisualizer 
            title="User Hash Table" 
            description="Maps user emails to user objects using djb2 hash function with separate chaining for collision resolution." 
            dsType="hash"
            complexity={{ Insert: 'O(1)', Lookup: 'O(1)', Delete: 'O(1)' }}
          >
            <div className="ds-visual hash-viz" style={{ maxHeight: '120px' }}>
              {hashVis.length > 0 ? hashVis.map(b => (
                <React.Fragment key={b.idx}>
                  <div className="hash-idx">[{b.idx}]</div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {Array(b.count).fill(0).map((_, i) => (
                      <div key={i} className="hash-bucket filled">UserObj</div>
                    ))}
                  </div>
                </React.Fragment>
              )) : (
                <div className="text-muted">No users registered yet</div>
              )}
            </div>
          </DSVisualizer>

          {/* 3. Linked List */}
          <DSVisualizer 
            title="Booking Linked List" 
            description="Stores booking history. New bookings are prepended at the Head, making recent bookings O(1) to access." 
            dsType="linkedlist"
            complexity={{ Prepend: 'O(1)', Search: 'O(n)' }}
          >
            <div className="ds-visual ll-viz">
              <div className="ll-box" style={{ background: 'transparent', borderColor: 'transparent', padding: 0 }}>HEAD →</div>
              {llVis.length > 0 ? llVis.map((b, i) => (
                <React.Fragment key={i}>
                  <div className="ll-node">
                    <div className="ll-box">{b.id ? b.id.slice(-4) : 'BKG'}</div>
                    <div className="ll-ptr">→</div>
                  </div>
                </React.Fragment>
              )) : (
                <div className="ll-node"><div className="ll-box">Empty</div><div className="ll-ptr">→</div></div>
              )}
              <div className="ll-box" style={{ background: 'transparent', borderColor: 'transparent', padding: 0 }}>NULL</div>
            </div>
          </DSVisualizer>

          {/* 4. Binary Search Tree */}
          <DSVisualizer 
            title="Event BST" 
            description="Organizes events by date timestamp. Used for rapid searching and chronological sorting (In-order traversal)." 
            dsType="bst"
            complexity={{ Search: 'O(log n)', Insert: 'O(log n)' }}
          >
            <div className="ds-visual bst-viz">
               {bstVis.map((level, i) => (
                 <div key={i} className="bst-level">
                   {level.map((node, j) => (
                     <div key={j} className={`bst-node ${i === 0 ? 'bst-root' : ''}`} title={new Date(node.key).toLocaleDateString()}>
                       {new Date(node.key).getDate()}/{new Date(node.key).getMonth()+1}
                     </div>
                   ))}
                 </div>
               ))}
               {bstVis.length === 0 && <div className="text-center text-muted">Tree Empty</div>}
            </div>
          </DSVisualizer>

          {/* 5. Priority Queue */}
          <DSVisualizer 
            title="Priority Booking Queue" 
            description="A Max-Heap that ranks events by popularity (bookings count). The root always contains the trending event." 
            dsType="heap"
            complexity={{ Peek: 'O(1)', Enqueue: 'O(log n)', Dequeue: 'O(log n)' }}
          >
             <div className="ds-visual">
                <div className="heap-viz">
                  {/* Simplistic visual mapping for max 7 elements (3 levels) */}
                  <div style={{ gridColumn: '4' }} className={`heap-cell ${heapVis[0] ? 'root' : ''}`}>{heapVis[0] ? heapVis[0]._priority : '-'}</div>
                  
                  <div style={{ gridColumn: '2', gridRow: '2' }} className="heap-cell">{heapVis[1] ? heapVis[1]._priority : '-'}</div>
                  <div style={{ gridColumn: '6', gridRow: '2' }} className="heap-cell">{heapVis[2] ? heapVis[2]._priority : '-'}</div>
                  
                  <div style={{ gridColumn: '1', gridRow: '3' }} className="heap-cell">{heapVis[3] ? heapVis[3]._priority : '-'}</div>
                  <div style={{ gridColumn: '3', gridRow: '3' }} className="heap-cell">{heapVis[4] ? heapVis[4]._priority : '-'}</div>
                  <div style={{ gridColumn: '5', gridRow: '3' }} className="heap-cell">{heapVis[5] ? heapVis[5]._priority : '-'}</div>
                  <div style={{ gridColumn: '7', gridRow: '3' }} className="heap-cell">{heapVis[6] ? heapVis[6]._priority : '-'}</div>
                </div>
                <div style={{ textAlign: 'center', marginTop: '0.5rem', color: 'var(--color-text-3)' }}>Node values = Bookings Count</div>
             </div>
          </DSVisualizer>

          {/* 6. Queue */}
          <DSVisualizer 
            title="Waiting Queue (FIFO)" 
            description="Manages the waiting list for sold-out events. First person to join gets the first cancelled seat." 
            dsType="queue"
            complexity={{ Enqueue: 'O(1)', Dequeue: 'O(1)' }}
          >
            <div className="ds-visual queue-viz">
               <div style={{ color: 'var(--color-text-3)', marginRight: '4px' }}>OUT ←</div>
               {queueVis.map((q, i) => (
                 <React.Fragment key={i}>
                   <div className="queue-item">{q.userEmail.split('@')[0]}</div>
                   {i < queueVis.length - 1 && <div className="queue-arrow">←</div>}
                 </React.Fragment>
               ))}
               <div style={{ color: 'var(--color-text-3)', marginLeft: '4px' }}>← IN</div>
            </div>
          </DSVisualizer>

          {/* 7. Circular Queue */}
          <DSVisualizer 
            title="Seat Circular Queue" 
            description="Manages fixed seat slots. Allocates and releases seats in O(1) without shifting array elements." 
            dsType="circular"
            complexity={{ Allocate: 'O(k)', Release: 'O(n)' }}
          >
             <div className="ds-visual">
               <div className="circular-viz">
                 <div className="circular-center">Seat<br/>Buffer</div>
                 {circularVis.map((seat, i) => {
                    const total = circularVis.length;
                    const angle = (i / total) * 2 * Math.PI - Math.PI / 2;
                    const radius = 45;
                    const x = 60 + radius * Math.cos(angle);
                    const y = 60 + radius * Math.sin(angle);
                    return (
                      <div 
                        key={i} 
                        className={`circular-segment ${seat.status === 'booked' ? 'seg-booked' : 'seg-available'}`}
                        style={{ left: `${x}px`, top: `${y}px` }}
                      >
                        {i+1}
                      </div>
                    );
                 })}
               </div>
             </div>
          </DSVisualizer>

        </div>
      </div>
    </div>
  );
}
