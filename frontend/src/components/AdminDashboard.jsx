import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  ShieldCheck, 
  Users, 
  Store, 
  Pill, 
  Clock, 
  Layers, 
  Check, 
  X, 
  RefreshCw 
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pharmacies, setPharmacies] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pharmacies');

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsData, pharmData, usersData] = await Promise.all([
        api.getAdminStats(),
        api.getAllPharmacies(),
        api.getAllUsers(),
      ]);
      setStats(statsData);
      setPharmacies(pharmData || []);
      setUsers(usersData || []);
    } catch (err) {
      console.error('Failed to load admin panel data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleVerifyPharmacy = async (id, currentStatus) => {
    try {
      await api.verifyPharmacy(id, !currentStatus);
      loadAdminData();
    } catch (err) {
      alert('Verification update failed: ' + err.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>HealthSync medSearch Administration Console</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Monitor system-wide metrics, verify pharmacy partners, and audit user roles.
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={loadAdminData} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          Refresh Stats
        </button>
      </div>

      {/* KPI Stats */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Users</div>
            <div className="stat-value">{stats.totalUsers}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Pharmacies</div>
            <div className="stat-value" style={{ color: '#38bdf8' }}>{stats.totalPharmacies}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Verified Stores</div>
            <div className="stat-value" style={{ color: '#34d399' }}>{stats.verifiedPharmacies}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Catalog Medicines</div>
            <div className="stat-value">{stats.totalMedicines}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Active Holds</div>
            <div className="stat-value" style={{ color: '#f87171' }}>{stats.activeReservations}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Stocked Items</div>
            <div className="stat-value" style={{ color: '#a78bfa' }}>{stats.totalInventoryItems}</div>
          </div>
        </div>
      )}

      {/* Nav Toggle */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          className={`btn ${activeTab === 'pharmacies' ? 'btn-teal' : 'btn-secondary'}`}
          onClick={() => setActiveTab('pharmacies')}
        >
          <Store size={15} />
          Pharmacy Verification ({pharmacies.length})
        </button>
        <button
          className={`btn ${activeTab === 'users' ? 'btn-teal' : 'btn-secondary'}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={15} />
          User Registry ({users.length})
        </button>
      </div>

      {activeTab === 'pharmacies' ? (
        <div className="glass-card">
          <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Pharmacy Verification & Audits</h3>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Store Name</th>
                  <th>Address</th>
                  <th>Contact</th>
                  <th>Operating Hours</th>
                  <th>Status</th>
                  <th>Verification</th>
                </tr>
              </thead>
              <tbody>
                {pharmacies.map((p) => (
                  <tr key={p.id}>
                    <td>#{p.id}</td>
                    <td style={{ fontWeight: 600, color: '#fff' }}>{p.name}</td>
                    <td style={{ fontSize: '0.84rem' }}>{p.address}</td>
                    <td>{p.phone}</td>
                    <td style={{ fontSize: '0.84rem' }}>{p.openingTime} - {p.closingTime}</td>
                    <td>
                      <span className={`status-badge ${p.isOpen ? 'badge-open' : 'badge-closed'}`}>
                        {p.isOpen ? 'Open' : 'Closed'}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm ${p.verified ? 'btn-teal' : 'btn-secondary'}`}
                        onClick={() => handleVerifyPharmacy(p.id, p.verified)}
                      >
                        {p.verified ? '✔ Verified' : 'Mark Verified'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass-card">
          <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Platform User Directory</h3>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Assigned Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>#{u.id}</td>
                    <td style={{ fontWeight: 600, color: '#fff' }}>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.phone || '—'}</td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{
                          background: u.role === 'ADMIN' ? 'rgba(99, 102, 241, 0.15)' : (u.role === 'PHARMACY' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(16, 185, 129, 0.15)'),
                          color: u.role === 'ADMIN' ? '#a5b4fc' : (u.role === 'PHARMACY' ? '#38bdf8' : '#34d399')
                        }}
                      >
                        {u.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
