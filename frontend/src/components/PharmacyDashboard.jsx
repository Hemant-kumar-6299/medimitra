import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Store, 
  Package, 
  Clock, 
  Plus, 
  Check, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  RefreshCw,
  Edit2,
  Power
} from 'lucide-react';

export default function PharmacyDashboard() {
  const { user } = useAuth();
  const [pharmacy, setPharmacy] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [catalogMedicines, setCatalogMedicines] = useState([]);
  const [activeTab, setActiveTab] = useState('reservations');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add medicine state
  const [selectedMedId, setSelectedMedId] = useState('');
  const [stockQuantity, setStockQuantity] = useState(20);
  const [unitPrice, setUnitPrice] = useState(100);
  const [submittingItem, setSubmittingItem] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const myPharm = await api.getMyPharmacy();
      setPharmacy(myPharm);

      const [invData, resData, meds] = await Promise.all([
        api.getPharmacyInventory(myPharm.id),
        api.getPharmacyReservations(),
        api.getAllMedicines(),
      ]);

      setInventory(invData || []);
      setReservations(resData || []);
      setCatalogMedicines(meds || []);
      if (meds && meds.length > 0) {
        setSelectedMedId(meds[0].id.toString());
      }
    } catch (err) {
      console.error('Failed to load pharmacy dashboard:', err);
      setError(err.message || 'Failed to load pharmacy details. Ensure your account is registered as a pharmacy.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async () => {
    if (!pharmacy) return;
    try {
      const updated = await api.togglePharmacyStatus(pharmacy.id);
      setPharmacy(updated);
    } catch (err) {
      alert('Failed to toggle status: ' + err.message);
    }
  };

  const handleConfirmReservation = async (id) => {
    try {
      await api.confirmReservation(id);
      loadData();
    } catch (err) {
      alert('Confirmation failed: ' + err.message);
    }
  };

  const handleCancelReservation = async (id) => {
    if (!window.confirm('Cancel this customer reservation?')) return;
    try {
      await api.cancelReservation(id);
      loadData();
    } catch (err) {
      alert('Cancellation failed: ' + err.message);
    }
  };

  const handleCompleteReservation = async (id) => {
    try {
      await api.completeReservation(id);
      loadData();
    } catch (err) {
      alert('Failed to complete reservation: ' + err.message);
    }
  };

  const handleAddOrUpdateStock = async (e) => {
    e.preventDefault();
    if (!pharmacy || !selectedMedId) return;

    setSubmittingItem(true);
    try {
      await api.addOrUpdateInventory(pharmacy.id, {
        medicineId: Number(selectedMedId),
        quantity: Number(stockQuantity),
        price: Number(unitPrice),
        available: Number(stockQuantity) > 0,
      });
      alert('Medicine inventory updated successfully!');
      loadData();
    } catch (err) {
      alert('Failed to update inventory: ' + err.message);
    } finally {
      setSubmittingItem(false);
    }
  };

  const handleDeleteItem = async (medicineId) => {
    if (!window.confirm('Remove this medicine from your pharmacy stock?')) return;
    try {
      await api.deleteInventoryItem(pharmacy.id, medicineId);
      loadData();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  if (loading && !pharmacy) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
        Loading pharmacy portal...
      </div>
    );
  }

  if (error && !pharmacy) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
        <AlertCircle size={40} style={{ color: '#f87171', margin: '0 auto 12px' }} />
        <h3 style={{ marginBottom: '8px' }}>Pharmacy Portal Access</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>{error}</p>
        <button className="btn btn-secondary" onClick={loadData}>
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Pharmacy Header Profile */}
      <div 
        className="glass-card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px',
          borderColor: pharmacy.isOpen ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <h2 style={{ fontSize: '1.8rem', color: '#ffffff' }}>{pharmacy.name}</h2>
            {pharmacy.verified && (
              <span className="status-badge badge-verified">
                ✔ Verified Pharmacy
              </span>
            )}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            📍 {pharmacy.address} • 📞 {pharmacy.phone} • 🕒 {pharmacy.openingTime} - {pharmacy.closingTime}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button 
            className={`btn ${pharmacy.isOpen ? 'btn-teal' : 'btn-secondary'}`}
            onClick={handleToggleStatus}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Power size={16} />
            Store Status: <strong>{pharmacy.isOpen ? 'OPEN (Receiving)' : 'CLOSED'}</strong>
          </button>
          <button className="btn btn-secondary btn-sm" onClick={loadData} title="Refresh Data">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          className={`btn ${activeTab === 'reservations' ? 'btn-emergency' : 'btn-secondary'}`}
          onClick={() => setActiveTab('reservations')}
        >
          <Clock size={16} />
          Incoming Emergency Holds ({reservations.filter(r => r.status === 'PENDING').length} Pending)
        </button>
        <button
          className={`btn ${activeTab === 'inventory' ? 'btn-teal' : 'btn-secondary'}`}
          onClick={() => setActiveTab('inventory')}
        >
          <Package size={16} />
          Inventory Stock ({inventory.length} Items)
        </button>
      </div>

      {/* TAB 1: Incoming Reservations */}
      {activeTab === 'reservations' && (
        <div className="glass-card">
          <h3 style={{ fontSize: '1.3rem', marginBottom: '16px' }}>Emergency Medicine Reservations</h3>
          {reservations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              No incoming reservations yet. When nearby patients request emergency medicine holds, they will appear here.
            </div>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Patient Name & Contact</th>
                    <th>Medicine</th>
                    <th>Quantity</th>
                    <th>Total Due</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((r) => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 700 }}>#{r.id}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{r.userName}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          📞 {r.userPhone || 'No phone'}
                        </div>
                      </td>
                      <td style={{ fontWeight: 600, color: '#ffffff' }}>{r.medicineName}</td>
                      <td>{r.quantity}</td>
                      <td style={{ fontWeight: 700, color: 'var(--teal-accent)' }}>₹{r.totalPrice?.toFixed(2)}</td>
                      <td>
                        <span 
                          className="status-badge"
                          style={{
                            background: r.status === 'CONFIRMED' ? 'rgba(16, 185, 129, 0.15)' : (r.status === 'PENDING' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(100, 116, 139, 0.2)'),
                            color: r.status === 'CONFIRMED' ? '#34d399' : (r.status === 'PENDING' ? '#fbbf24' : '#94a3b8')
                          }}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {r.status === 'PENDING' && (
                            <>
                              <button
                                className="btn btn-teal btn-sm"
                                onClick={() => handleConfirmReservation(r.id)}
                                title="Confirm and deduct stock"
                              >
                                <Check size={13} /> Confirm
                              </button>
                              <button
                                className="btn btn-danger-outline btn-sm"
                                onClick={() => handleCancelReservation(r.id)}
                                title="Reject / Cancel"
                              >
                                <X size={13} />
                              </button>
                            </>
                          )}
                          {r.status === 'CONFIRMED' && (
                            <>
                              <button
                                className="btn btn-teal btn-sm"
                                onClick={() => handleCompleteReservation(r.id)}
                                title="Mark as picked up / fulfilled"
                              >
                                <CheckCircle2 size={13} /> Fulfill
                              </button>
                              <button
                                className="btn btn-danger-outline btn-sm"
                                onClick={() => handleCancelReservation(r.id)}
                                title="Cancel and restore stock"
                              >
                                <X size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Inventory Management */}
      {activeTab === 'inventory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Add Stock Form */}
          <div className="glass-card" style={{ background: 'var(--bg-surface-elevated)' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} style={{ color: 'var(--teal-accent)' }} />
              Add or Restock Medicine in Inventory
            </h3>
            <form onSubmit={handleAddOrUpdateStock} style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: 2, minWidth: '220px' }}>
                <label className="form-label">Select Catalog Medicine:</label>
                <select
                  className="form-input"
                  value={selectedMedId}
                  onChange={(e) => setSelectedMedId(e.target.value)}
                  required
                >
                  {catalogMedicines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.category || 'General'})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ flex: 1, minWidth: '120px' }}>
                <label className="form-label">Quantity in Stock:</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  required
                />
              </div>

              <div style={{ flex: 1, minWidth: '120px' }}>
                <label className="form-label">Price per Unit (₹):</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  className="form-input"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-teal"
                disabled={submittingItem}
                style={{ height: '42px' }}
              >
                {submittingItem ? 'Saving...' : 'Update Stock'}
              </button>
            </form>
          </div>

          {/* Current Inventory Table */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Current Stock Availability</h3>
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Medicine Name</th>
                    <th>Category</th>
                    <th>Stock Units</th>
                    <th>Unit Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600, color: '#ffffff' }}>{item.medicineName}</td>
                      <td>{item.medicineCategory || 'General'}</td>
                      <td style={{ fontWeight: 700, color: item.quantity > 5 ? '#34d399' : '#f87171' }}>
                        {item.quantity} units
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--teal-accent)' }}>₹{item.price?.toFixed(2)}</td>
                      <td>
                        <span 
                          className={`status-badge ${item.available && item.quantity > 0 ? 'badge-open' : 'badge-closed'}`}
                        >
                          {item.available && item.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-danger-outline btn-sm"
                          onClick={() => handleDeleteItem(item.medicineId)}
                          title="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
