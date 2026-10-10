import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Clock, 
  MapPin, 
  Phone, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  Ban,
  PackageCheck
} from 'lucide-react';

export default function UserReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchReservations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMyReservations();
      setReservations(data || []);
    } catch (err) {
      console.error('Failed to load reservations:', err);
      setError(err.message || 'Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
    // Auto refresh every 30 seconds for countdowns
    const interval = setInterval(fetchReservations, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this emergency reservation?')) return;
    setActionLoading(id);
    try {
      await api.cancelReservation(id);
      fetchReservations();
    } catch (err) {
      alert('Cancellation failed: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="status-badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <Clock size={13} />
            Pending Store Confirmation
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="status-badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <CheckCircle2 size={13} />
            Confirmed & Held for Pickup
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="status-badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
            <PackageCheck size={13} />
            Completed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="status-badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <XCircle size={13} />
            Cancelled
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="status-badge" style={{ background: 'rgba(100, 116, 139, 0.2)', color: '#94a3b8', border: '1px solid rgba(100, 116, 139, 0.3)' }}>
            <Clock size={13} />
            Window Expired
          </span>
        );
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>My Medicine Reservations</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Active holds and collection status at nearby pharmacies.
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchReservations} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', padding: '14px', borderRadius: '8px', color: '#fca5a5', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {loading && reservations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Loading your reservations...
        </div>
      ) : reservations.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px', borderStyle: 'dashed' }}>
          <Clock size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px', opacity: 0.5 }} />
          <h3 style={{ marginBottom: '8px' }}>No Active Reservations</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto' }}>
            When you reserve an emergency medicine from the search results, your 30-minute hold ticket will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {reservations.map((res) => {
            const isHoldActive = (res.status === 'PENDING' || res.status === 'CONFIRMED') && res.remainingMinutes > 0;
            return (
              <div 
                key={res.id} 
                className="glass-card"
                style={{
                  borderColor: isHoldActive ? 'rgba(6, 182, 212, 0.35)' : 'var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                      #{res.id}
                    </span>
                    <h3 style={{ fontSize: '1.2rem', color: '#ffffff' }}>
                      {res.medicineName} ({res.quantity} {res.quantity === 1 ? 'unit' : 'units'})
                    </h3>
                    {getStatusBadge(res.status)}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    <MapPin size={14} style={{ color: 'var(--teal-accent)' }} />
                    <span><strong>{res.pharmacyName}</strong> — {res.pharmacyAddress}</span>
                  </div>

                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Created: {new Date(res.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • 
                    Hold Expiry: {new Date(res.expiryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                  {/* Countdown Timer */}
                  {isHoldActive ? (
                    <div 
                      style={{
                        textAlign: 'center',
                        background: 'rgba(239, 68, 68, 0.12)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#f87171', display: 'block', fontWeight: 700 }}>
                        Hold Remaining
                      </span>
                      <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fca5a5' }}>
                        {res.remainingMinutes} min{res.remainingMinutes === 1 ? '' : 's'}
                      </span>
                    </div>
                  ) : null}

                  {/* Price */}
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Total Due</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--teal-accent)' }}>
                      ₹{res.totalPrice?.toFixed(2)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {res.pharmacyPhone && (
                      <a href={`tel:${res.pharmacyPhone}`} className="btn btn-secondary btn-sm" title="Call Pharmacy">
                        <Phone size={14} />
                      </a>
                    )}
                    {(res.status === 'PENDING' || res.status === 'CONFIRMED') && (
                      <button
                        className="btn btn-danger-outline btn-sm"
                        onClick={() => handleCancel(res.id)}
                        disabled={actionLoading === res.id}
                      >
                        <Ban size={14} />
                        Cancel Hold
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
