import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Pill, 
  Search, 
  Plus, 
  Filter, 
  Building2, 
  Activity, 
  ArrowRight,
  CheckCircle2,
  X,
  Info,
  ShieldCheck,
  Stethoscope,
  Sparkles,
  Layers,
  HeartPulse,
  Syringe,
  AlertCircle
} from 'lucide-react';

export default function MedicineCatalog({ onSearchMedicine }) {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState('name-asc');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDetailMed, setSelectedDetailMed] = useState(null);

  // New medicine form
  const [newName, setNewName] = useState('');
  const [newManufacturer, setNewManufacturer] = useState('');
  const [newCategory, setNewCategory] = useState('Antibiotic');
  const [newDesc, setNewDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const data = await api.getAllMedicines();
      setMedicines(data || []);
    } catch (err) {
      console.error('Failed to load medicines:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleCreateMedicine = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createMedicine({
        name: newName,
        manufacturer: newManufacturer,
        category: newCategory,
        description: newDesc,
      });
      alert('New medicine successfully registered in master catalog!');
      setShowAddModal(false);
      setNewName('');
      setNewManufacturer('');
      setNewDesc('');
      fetchMedicines();
    } catch (err) {
      alert('Failed to add medicine: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Distinct categories with counts
  const categoryCounts = useMemo(() => {
    const counts = { ALL: medicines.length };
    medicines.forEach((m) => {
      const cat = m.category || 'General';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [medicines]);

  const categories = useMemo(() => {
    const list = Object.keys(categoryCounts).filter(k => k !== 'ALL');
    return ['ALL', ...list.sort()];
  }, [categoryCounts]);

  // Filter & sort
  const filteredMedicines = useMemo(() => {
    let list = medicines.filter((m) => {
      const q = search.toLowerCase();
      const matchesSearch = 
        m.name.toLowerCase().includes(q) ||
        (m.manufacturer && m.manufacturer.toLowerCase().includes(q)) ||
        (m.description && m.description.toLowerCase().includes(q));
      const matchesCat = selectedCategory === 'ALL' || (m.category || 'General') === selectedCategory;
      return matchesSearch && matchesCat;
    });

    if (sortBy === 'name-asc') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name-desc') {
      list.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === 'category') {
      list.sort((a, b) => (a.category || '').localeCompare(b.category || ''));
    }

    return list;
  }, [medicines, search, selectedCategory, sortBy]);

  const getCategoryColor = (cat) => {
    const c = (cat || '').toLowerCase();
    if (c.includes('antibiotic')) return { bg: 'rgba(24, 131, 255, 0.12)', border: 'rgba(24, 131, 255, 0.3)', text: '#004ee0' };
    if (c.includes('cardio') || c.includes('heart')) return { bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.3)', text: '#dc2626' };
    if (c.includes('resp') || c.includes('inhaler')) return { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)', text: '#059669' };
    if (c.includes('emerg') || c.includes('crit')) return { bg: 'rgba(220, 38, 38, 0.14)', border: 'rgba(220, 38, 38, 0.35)', text: '#dc2626' };
    if (c.includes('diabet') || c.includes('insulin')) return { bg: 'rgba(217, 119, 6, 0.12)', border: 'rgba(217, 119, 6, 0.3)', text: '#d97706' };
    return { bg: 'rgba(0, 78, 224, 0.08)', border: 'rgba(0, 78, 224, 0.22)', text: '#004ee0' };
  };

  return (
    <div className="page-container">
      {/* Header Banner */}
      <div className="page-header-banner">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '18px' }}>
          <div>
            <div className="header-eyebrow">
              <ShieldCheck size={14} />
              Standardized Pharmacopeia • Verified Formulary
            </div>
            <h1 className="header-title">Medicine Master Catalog</h1>
            <p className="header-subtitle">
              Browse approved medical formulations, clinical indications, active therapeutic categories, and verify real-time 24/7 emergency pharmacy stock levels with direct GPS routing.
            </p>
          </div>

          {(user?.role === 'ADMIN' || user?.role === 'PHARMACY') && (
            <button className="btn btn-teal" onClick={() => setShowAddModal(true)}>
              <Plus size={16} />
              Register New Drug
            </button>
          )}
        </div>

        {/* Header Stats */}
        <div className="header-stats-row">
          <div className="header-stat-item">
            <span className="header-stat-value">{medicines.length}</span>
            <span className="header-stat-label">Registered Formulations</span>
          </div>
          <div className="header-stat-item">
            <span className="header-stat-value">{categories.length - 1}</span>
            <span className="header-stat-label">Therapeutic Classes</span>
          </div>
          <div className="header-stat-item">
            <span className="header-stat-value">100%</span>
            <span className="header-stat-label">Accredited Pharmacopeia</span>
          </div>
          <div className="header-stat-item">
            <span className="header-stat-value">Instant</span>
            <span className="header-stat-label">Live Radar Match</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="controls-card">
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px' }}>
          <div className="search-input-wrapper" style={{ flex: 1, minWidth: '260px' }}>
            <Search className="search-input-icon" size={18} />
            <input
              type="text"
              className="search-input"
              placeholder="Search by drug name, active ingredient, brand or indication..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: '12px 38px 12px 44px' }}
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
                title="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Sort:</span>
            <select
              className="location-dropdown"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ padding: '10px 14px' }}
            >
              <option value="name-asc">Drug Name (A–Z)</option>
              <option value="name-desc">Drug Name (Z–A)</option>
              <option value="category">Therapeutic Class</option>
            </select>
          </div>
        </div>

        {/* Category Pills with Counts */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '12px', borderTop: '1px solid rgba(0, 78, 224, 0.08)' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginRight: '4px' }}>
            Classes:
          </span>
          <div className="category-chips-scroll">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  className={`category-chip-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  <span>{cat}</span>
                  <span className="category-chip-count">{categoryCounts[cat] || 0}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Result Counter & Active Filter Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', padding: '0 4px' }}>
        <div style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          Showing <strong style={{ color: 'var(--blue-deep)' }}>{filteredMedicines.length}</strong> of {medicines.length} standard medical formulations
          {selectedCategory !== 'ALL' && <span> in <strong style={{ color: 'var(--blue-deep)' }}>{selectedCategory}</strong></span>}
        </div>

        {(search || selectedCategory !== 'ALL') && (
          <button 
            onClick={() => { setSearch(''); setSelectedCategory('ALL'); }}
            style={{ fontSize: '0.82rem', color: 'var(--blue-bright)', fontWeight: 600, cursor: 'pointer' }}
          >
            Reset Filters ↺
          </button>
        )}
      </div>

      {/* Medicine Grid */}
      {loading ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
          <div className="beacon-pulse" style={{ marginBottom: '16px' }}>
            <span className="beacon-pulse-ring"></span>
            <span className="beacon-pulse-dot"></span>
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>Loading master drug catalog...</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Synchronizing with pharmaceutical repository</div>
        </div>
      ) : filteredMedicines.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Pill size={42} style={{ color: 'var(--text-muted)', margin: '0 auto 16px', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '6px' }}>No matching medicines found</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 18px', fontSize: '0.9rem' }}>
            No drug formulations matched your search "{search}". Try searching by another brand name or generic chemical compound.
          </p>
          <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setSelectedCategory('ALL'); }}>
            Clear Search & Filters
          </button>
        </div>
      ) : (
        <div className="med-catalog-grid">
          {filteredMedicines.map((med) => {
            const catStyle = getCategoryColor(med.category);
            return (
              <div key={med.id} className="med-catalog-card">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
                    <div className="med-icon-box">
                      <Pill size={22} />
                    </div>

                    <span 
                      className="med-tag-category"
                      style={{ background: catStyle.bg, borderColor: catStyle.border, color: catStyle.text }}
                    >
                      {med.category || 'General'}
                    </span>
                  </div>

                  <h3 className="med-card-title">{med.name}</h3>

                  <div className="med-card-manufacturer">
                    <Building2 size={14} style={{ color: 'var(--blue-bright)', flexShrink: 0 }} />
                    <span>{med.manufacturer || 'Certified Pharmaceutical Lab'}</span>
                  </div>

                  <p className="med-card-desc">
                    {med.description || 'Clinical therapeutic formulation verified under standardized healthcare protocols.'}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '16px', borderTop: '1px solid rgba(0, 78, 224, 0.08)' }}>
                  <button
                    className="btn btn-teal"
                    style={{ width: '100%', fontSize: '0.88rem', padding: '10px 14px' }}
                    onClick={() => onSearchMedicine(med.name)}
                    title={`Find pharmacies that currently have ${med.name} in stock`}
                  >
                    <Activity size={15} />
                    Find Pharmacies with Stock
                  </button>

                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%', fontSize: '0.82rem' }}
                    onClick={() => setSelectedDetailMed(med)}
                  >
                    <Info size={14} />
                    View Drug Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Drug Clinical Detail Modal */}
      {selectedDetailMed && (
        <div className="modal-overlay" onClick={() => setSelectedDetailMed(null)}>
          <div className="modal-content" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span 
                  className="med-tag-category"
                  style={{ marginBottom: '6px' }}
                >
                  {selectedDetailMed.category || 'Standard Pharmaceutical'}
                </span>
                <h3 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {selectedDetailMed.name}
                </h3>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedDetailMed(null)}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: '#f4f8ff', padding: '14px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0, 78, 224, 0.12)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em', marginBottom: '4px' }}>
                  Manufacturer & Quality Standard
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 size={16} style={{ color: 'var(--blue-deep)' }} />
                  {selectedDetailMed.manufacturer || 'Approved Multi-source Generic'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em', marginBottom: '6px' }}>
                  Clinical Indications & Usage
                </div>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, background: '#ffffff', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0, 78, 224, 0.1)' }}>
                  {selectedDetailMed.description || 'Standard indications apply. Consult healthcare professional or prescribing physician before administration.'}
                </p>
              </div>

              <div style={{ background: 'rgba(24, 131, 255, 0.06)', border: '1px solid rgba(24, 131, 255, 0.2)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={20} style={{ color: 'var(--blue-deep)', flexShrink: 0 }} />
                <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  <strong>Verified Formulary Drug:</strong> Subject to emergency stock tracking and reserved pickup at all connected network pharmacies.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setSelectedDetailMed(null)}
              >
                Close
              </button>

              <button
                className="btn btn-emergency"
                style={{ flex: 2 }}
                onClick={() => {
                  const drugName = selectedDetailMed.name;
                  setSelectedDetailMed(null);
                  onSearchMedicine(drugName);
                }}
              >
                <Activity size={16} />
                Check Live Stock in Nearby Pharmacies
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Medicine Modal (Admin/Pharmacy) */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>Register New Master Drug</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Add standardized pharmaceutical formulation</p>
              </div>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateMedicine}>
              <div className="form-group">
                <label className="form-label">Medicine Name & Formulation Dosage:</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Ciprofloxacin 500mg, Amoxicillin 250mg"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Manufacturer / Brand:</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Cipla, Sun Pharma, Abbott, Pfizer"
                  value={newManufacturer}
                  onChange={(e) => setNewManufacturer(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Therapeutic Category:</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Antibiotic, Cardiovascular, Emergency, Analgesic"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Clinical Description & Indications:</label>
                <textarea
                  className="form-input"
                  rows="3"
                  placeholder="Describe indications, administration route, and storage recommendations..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-teal" 
                style={{ width: '100%', marginTop: '10px' }} 
                disabled={submitting}
              >
                {submitting ? 'Registering...' : 'Confirm Registration to Catalog'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
