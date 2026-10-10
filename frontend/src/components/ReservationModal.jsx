import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Clock, 
  Pill, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export default function ReservationModal({ item, onClose, onSuccess, onOpenAuth }) {
  const { isAuthenticated, user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);

  if (!item) return null;

  const maxQuantity = Math.min(item.quantity, 10); // Limit reserve to 10 for emergency safety
  const totalPrice = (item.price || 0) * quantity;

  const handleConfirmReservation = async () => {
    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.createReservation({
        pharmacyId: item.pharmacyId,
        medicineId: item.medicineId,
        quantity: quantity,
      });
      setSuccessData(res);
      if (onSuccess) onSuccess(res);
    } catch (err) {
      console.error('Reservation failed:', err);
      setError(err.message || 'Failed to create reservation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div 
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444'
              }}
            >
              <Clock size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Emergency Medicine Hold</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>30-Minute Priority Window</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {successData ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div 
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
                margin: '0 auto 16px'
              }}
            >
              <CheckCircle2 size={32} />
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '8px', color: '#ffffff' }}>Medicine Reserved!</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '20px' }}>
              Your reservation has been logged at <strong>{item.pharmacyName}</strong>. You have <strong>30 minutes</strong> to arrive and collect your medicine.
            </p>

            <div 
              style={{
                background: 'rgba(0,0,0,0.3)',
                padding: '16px',
                borderRadius: 'var(--radius-sm)',
                textAlign: 'left',
                marginBottom: '20px',
                fontSize: '0.88rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Reservation ID:</span>
                <span style={{ fontWeight: 700 }}>#{successData.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Medicine:</span>
                <span style={{ fontWeight: 600 }}>{item.medicineName} ({quantity} units)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Amount to Pay:</span>
                <span style={{ fontWeight: 800, color: 'var(--teal-accent)' }}>₹{totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <button className="btn btn-emergency" style={{ width: '100%' }} onClick={onClose}>
              Done & Track Reservation
            </button>
          </div>
        ) : (
          <div>
            {/* Medicine details preview */}
            <div 
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '16px',
                marginBottom: '20px'
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#fff', marginBottom: '4px' }}>
                {item.medicineName}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                {item.medicineManufacturer} • {item.medicineCategory}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <MapPin size={15} style={{ color: 'var(--teal-accent)' }} />
                <span>{item.pharmacyName} — {item.pharmacyAddress}</span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="form-group">
              <label className="form-label">Quantity Needed:</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ width: '38px', height: '38px', fontSize: '1.2rem', padding: 0 }}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span style={{ fontSize: '1.3rem', fontWeight: 800, minWidth: '32px', textAlign: 'center' }}>
                  {quantity}
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ width: '38px', height: '38px', fontSize: '1.2rem', padding: 0 }}
                  onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                  disabled={quantity >= maxQuantity}
                >
                  +
                </button>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  (Max {maxQuantity} units for emergency hold)
                </span>
              </div>
            </div>

            {/* Total price box */}
            <div 
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px',
                background: 'rgba(6, 182, 212, 0.08)',
                border: '1px solid rgba(6, 182, 212, 0.25)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '20px'
              }}
            >
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>
                  Total Estimated Cost (Pay at Counter)
                </span>
                <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#22d3ee' }}>
                  ₹{totalPrice.toFixed(2)}
                </span>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                ₹{item.price?.toFixed(2)} / unit
              </div>
            </div>

            {/* 30-Minute validity alert */}
            <div 
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                marginBottom: '20px',
                fontSize: '0.82rem',
                color: '#fca5a5'
              }}
            >
              <Clock size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>30-Minute Reservation Guarantee:</strong> The pharmacy will keep this medicine set aside for you for exactly 30 minutes from booking. Please arrive promptly with prescription if required.
              </div>
            </div>

            {error && (
              <div 
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid var(--border-emergency)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  color: '#fca5a5',
                  marginBottom: '16px',
                  fontSize: '0.85rem'
                }}
              >
                {error}
              </div>
            )}

            {!isAuthenticated ? (
              <button 
                className="btn btn-emergency" 
                style={{ width: '100%' }}
                onClick={onOpenAuth}
              >
                Sign In to Reserve Medicine
              </button>
            ) : (
              <button 
                className="btn btn-emergency" 
                style={{ width: '100%' }}
                onClick={handleConfirmReservation}
                disabled={loading}
              >
                {loading ? 'Reserving...' : 'Confirm 30-Min Emergency Hold'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
