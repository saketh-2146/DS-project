import { CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function BookingBadge({ status }) {
  if (status === 'confirmed') {
    return (
      <span className="badge badge-success">
        <CheckCircle2 size={12} /> Confirmed
      </span>
    );
  }
  
  if (status === 'cancelled') {
    return (
      <span className="badge badge-danger">
        <XCircle size={12} /> Cancelled
      </span>
    );
  }
  
  if (status === 'waiting') {
    return (
      <span className="badge badge-warning">
        <Clock size={12} /> Waiting List
      </span>
    );
  }
  
  return (
    <span className="badge badge-info">
      {status}
    </span>
  );
}
