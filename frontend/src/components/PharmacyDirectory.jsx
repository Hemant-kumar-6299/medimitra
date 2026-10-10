import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { 
  Store, 
  MapPin, 
  Phone, 
  Clock, 
  ShieldCheck, 
  Search, 
  Package, 
  CheckCircle2, 
  XCircle,
  Pill,
  Navigation,
  Compass,
  X,
  ExternalLink,
  SlidersHorizontal,
  Flame,
  Activity,
  AlertCircle
} from 'lucide-react';

const PRESET_LOCATIONS = [
  { label: 'Knowledge Park II (Greater Noida)', lat: 28.4744, lng: 77.5040 },
  { label: 'Alpha Commercial Belt (Greater Noida)', lat: 28.4780, lng: 77.5020 },
  { label: 'Pari Chowk (Greater Noida)', lat: 28.4650, lng: 77.5120 },
  { label: 'Sector 62 (Noida)', lat: 28.6280, lng: 77.3649 },
  { label: 'Connaught Place (Central Delhi)', lat: 28.6304, lng: 77.2177 },
];

export default function PharmacyDirectory({ onSelectReserveMedicine }) {
  const [pharmacies, setPharmacies] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(PRESET_LOCATIONS[0]);
  const [isGpsActive, setIsGpsActive] = useState(false);
  const [filterOpenOnly, setFilterOpenOnly] = useState(false);
  const [filter24HoursOnly, setFilter24HoursOnly] = useState(false);
  const [filterVerifiedOnly, setFilterVerifiedOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  // Inventory modal states
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [pharmacyInventory, setPharmacyInventory] = useState([]);
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryCategory, setInventoryCategory] = useState('ALL');
  const [loadingInventory, setLoadingInventory] = useState(false);

  const fetchPharmacies = async (lat, lng) => {
    setLoading(true);
    try {
      const data = await api.getAllPharmacies(lat, lng);
      setPharmacies(data || []);
    } catch (err) {
      console.error('Failed to load pharmacies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPharmacies(selectedLocation.lat, selectedLocation.lng);
  }, [selectedLocation]);

  const handleGetBrowserLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSelectedLocation({
          label: 'Current Live GPS Location',
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setIsGpsActive(true);
      },
      (err) => {
        alert('Could not acquire GPS position: ' + err.message);
        setLoading(false);
      }
    );
  };

  const handleViewInventory = async (pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setInventorySearch('');
    setInventoryCategory('ALL');
    setLoadingInventory(true);
    try {
      const inv = await api.getPharmacyInventory(pharmacy.id);
      setPharmacyInventory(inv || []);
    } catch (err) {
      console.error('Failed to load pharmacy inventory:', err);
    } finally {
      setLoadingInventory(false);
    }
  };

  // Filtered pharmacies
  const filteredPharmacies = useMemo(() => {
    return pharmacies.filter((p) => {
      const q = search.toLowerCase();
      const matchesSearch = 
        p.name.toLowerCase().includes(q) ||
        (p.address && p.address.toLowerCase().includes(q));

      const matchesOpen = !filterOpenOnly || p.isOpen;
      const matches24H = !filter24HoursOnly || (p.openingTime && p.openingTime.toLowerCase().includes('24'));
      const matchesVerified = !filterVerifiedOnly || p.verified;

      return matchesSearch && matchesOpen && matches24H && matchesVerified;
    });
  }, [pharmacies, search, filterOpenOnly, filter24HoursOnly, filterVerifiedOnly]);

  // Inventory filtering
  const filteredInventory = useMemo(() => {
    return pharmacyInventory.filter((item) => {
      const q = inventorySearch.toLowerCase();
      const matchesSearch = 
        item.medicineName.toLowerCase().includes(q) ||
        (item.medicineManufacturer && item.medicineManufacturer.toLowerCase().includes(q));
      const matchesCat = inventoryCategory === 'ALL' || item.medicineCategory === inventoryCategory;
      return matchesSearch && matchesCat;
    });
  }, [pharmacyInventory, inventorySearch, inventoryCategory]);

  const inventoryCategories = useMemo(() => {
    const set = new Set(pharmacyInventory.map(i => i.medicineCategory).filter(Boolean));
    return ['ALL', ...Array.from(set).sort()];
  }, [pharmacyInventory]);

  // Overall Stats
  const totalOpenCount = pharmacies.filter(p => p.isOpen).length;
  const total24HCount = pharmacies.filter(p => p.openingTime && p.openingTime.includes('24')).length;
  const verifiedCount = pharmacies.filter(p => p.verified).length;

  return (
    <div className="page-container">
      {/* Page Header Banner */}
      <div className="page-header-banner">
        <div>
          <div className="header-eyebrow">
            <Compass size={14} />
            Live GPS Network • 24/7 Verified Dispensaries
          </div>
          <h1 className="header-title">Connected Pharmacy Network</h1>
          <p className="header-subtitle">
            Search authorized pharmacies, verify emergency night counters, track live inventory stocks, and hold medications instantly before traveling.
          </p>
        </div>

        {/* Stats Row */}
        <div className="header-stats-row">
          <div className="header-stat-item">
            <span className="header-stat-value">{pharmacies.length}</span>
            <span className="header-stat-label">Connected Pharmacies</span>
          </div>
          <div className="header-stat-item">
            <span className="header-stat-value" style={{ color: '#059669' }}>{totalOpenCount}</span>
            <span className="header-stat-label">Open Right Now</span>
          </div>
          <div className="header-stat-item">
            <span className="header-stat-value">{total24HCount}</span>
            <span className="header-stat-label">24/7 Emergency Stores</span>
          </div>
          <div className="header-stat-item">
            <span className="header-stat-value">{verifiedCount}</span>
            <span className="header-stat-label">Verified Partners</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Location */}
      <div className="controls-card">
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px' }}>
          <div className="search-input-wrapper" style={{ flex: 2, minWidth: '260px' }}>
            <Search className="search-input-icon" size={18} />
            <input
              type="text"
              className="search-input"
              placeholder="Search pharmacies by name, sector, street, or landmark..."
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

          {/* Location Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <MapPin size={16} style={{ color: 'var(--blue-deep)' }} />
            <select
              className="location-dropdown"
              value={selectedLocation.label}
              onChange={(e) => {
                const found = PRESET_LOCATIONS.find((loc) => loc.label === e.target.value);
                if (found) {
                  setSelectedLocation(found);
                  setIsGpsActive(false);
                }
              }}
              style={{ padding: '11px 14px' }}
            >
              {PRESET_LOCATIONS.map((loc) => (
                <option key={loc.label} value={loc.label}>
                  📍 {loc.label}
                </option>
              ))}
              {isGpsActive && (
                <option value={selectedLocation.label}>
                  🎯 {selectedLocation.label}
                </option>
              )}
            </select>

            <button
              className="btn btn-secondary btn-sm"
              style={{ padding: '10px 14px' }}
              onClick={handleGetBrowserLocation}
              title="Use current GPS location"
            >
              <Navigation size={14} />
              GPS
            </button>
          </div>
        </div>

        {/* Quick Filter Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', paddingTop: '12px', borderTop: '1px solid rgba(0, 78, 224, 0.08)' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginRight: '4px' }}>
            Filters:
          </span>

          <button
            className={`category-chip-btn ${filterOpenOnly ? 'active' : ''}`}
            onClick={() => setFilterOpenOnly(!filterOpenOnly)}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: filterOpenOnly ? '#fff' : '#059669' }}></span>
            Open Now Only
          </button>

          <button
            className={`category-chip-btn ${filter24HoursOnly ? 'active' : ''}`}
            onClick={() => setFilter24HoursOnly(!filter24HoursOnly)}
          >
            <Clock size={14} />
            24/7 Round-the-Clock
          </button>

          <button
            className={`category-chip-btn ${filterVerifiedOnly ? 'active' : ''}`}
            onClick={() => setFilterVerifiedOnly(!filterVerifiedOnly)}
          >
            <ShieldCheck size={14} />
            Verified Accreditation
          </button>

          {(filterOpenOnly || filter24HoursOnly || filterVerifiedOnly || search) && (
            <button
              onClick={() => {
                setFilterOpenOnly(false);
                setFilter24HoursOnly(false);
                setFilterVerifiedOnly(false);
                setSearch('');
              }}
              style={{ fontSize: '0.82rem', color: 'var(--blue-bright)', fontWeight: 600, marginLeft: 'auto', cursor: 'pointer' }}
            >
              Reset Filters ↺
            </button>
          )}
        </div>
      </div>

      {/* Results Header Counter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '0 4px' }}>
        <div style={{ fontSize: '0.94rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          Showing <strong style={{ color: 'var(--blue-deep)' }}>{filteredPharmacies.length}</strong> pharmacies near <strong>{selectedLocation.label.split('(')[0]}</strong>
        </div>
      </div>

      {/* Pharmacy Directory Grid */}
      {loading ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
          <div className="beacon-pulse" style={{ marginBottom: '16px' }}>
            <span className="beacon-pulse-ring"></span>
            <span className="beacon-pulse-dot"></span>
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>Loading pharmacy network...</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Computing real-time GPS distances</div>
        </div>
      ) : filteredPharmacies.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Store size={44} style={{ color: 'var(--text-muted)', margin: '0 auto 16px', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '6px' }}>No matching pharmacies found</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 18px', fontSize: '0.9rem' }}>
            No pharmacies matched your current filters. Try turning off "Open Now" or clearing the search query.
          </p>
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={() => {
              setFilterOpenOnly(false);
              setFilter24HoursOnly(false);
              setFilterVerifiedOnly(false);
              setSearch('');
            }}
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="pharmacy-dir-grid">
          {filteredPharmacies.map((pharmacy) => (
            <div key={pharmacy.id} className="pharmacy-dir-card">
              <div>
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div className="store-icon-wrap">
                      <Store size={22} />
                    </div>
                    <div>
                      <h3 className="pharmacy-name-title">{pharmacy.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                        {pharmacy.verified && (
                          <span className="status-badge badge-verified" style={{ fontSize: '0.72rem' }}>
                            <ShieldCheck size={12} /> Verified Pharmacy
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {pharmacy.distanceKm != null && (
                    <span className="distance-badge">
                      ⚡ {pharmacy.distanceKm} km
                    </span>
                  )}
                </div>

                {/* Operating status & hours */}
                <div className="badges-row" style={{ margin: '14px 0' }}>
                  <span className={`status-badge ${pharmacy.isOpen ? 'badge-open' : 'badge-closed'}`}>
                    <span 
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        background: pharmacy.isOpen ? '#059669' : '#dc2626'
                      }}
                    />
                    {pharmacy.isOpen ? 'Open Now' : 'Closed'}
                  </span>

                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <Clock size={13} style={{ color: 'var(--blue-deep)' }} />
                    {pharmacy.openingTime || '24 Hours SOS'}
                  </span>
                </div>

                {/* Address */}
                <div className="pharmacy-address-text">
                  <MapPin size={16} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--blue-bright)' }} />
                  <span>{pharmacy.address}</span>
                </div>

                {/* Emergency capability tag */}
                <div style={{ background: '#f8fbff', border: '1px solid rgba(0, 78, 224, 0.1)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={14} style={{ color: 'var(--blue-deep)', flexShrink: 0 }} />
                  <span>Verified stock sync • Direct emergency hold available</span>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '10px', paddingTop: '18px', marginTop: '16px', borderTop: '1px solid rgba(0, 78, 224, 0.1)' }}>
                <a 
                  href={`tel:${pharmacy.phone}`}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '10px 14px', fontSize: '0.86rem' }}
                >
                  <Phone size={14} /> Call Store
                </a>

                <button
                  className="btn btn-teal"
                  style={{ flex: 2, padding: '10px 14px', fontSize: '0.86rem' }}
                  onClick={() => handleViewInventory(pharmacy)}
                >
                  <Package size={15} /> View Live Stock
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Enhanced Inventory Drawer / Modal */}
      {selectedPharmacy && (
        <div className="modal-overlay" onClick={() => setSelectedPharmacy(null)}>
          <div className="modal-content" style={{ maxWidth: '720px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="store-icon-wrap" style={{ width: '40px', height: '40px' }}>
                  <Store size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.35rem', color: 'var(--text-primary)' }}>{selectedPharmacy.name}</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {selectedPharmacy.address} • 📞 {selectedPharmacy.phone}
                  </p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedPharmacy(null)}>✕</button>
            </div>

            {/* Inventory Search & Category within store */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '18px' }}>
              <div className="search-input-wrapper" style={{ flex: 1, minWidth: '200px' }}>
                <Search className="search-input-icon" size={16} />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Filter stock in this pharmacy..."
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  style={{ padding: '8px 12px 8px 36px', fontSize: '0.88rem' }}
                />
              </div>

              {inventoryCategories.length > 1 && (
                <select
                  className="location-dropdown"
                  value={inventoryCategory}
                  onChange={(e) => setInventoryCategory(e.target.value)}
                  style={{ fontSize: '0.86rem', padding: '8px 12px' }}
                >
                  {inventoryCategories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'ALL' ? 'All Classes' : cat}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {loadingInventory ? (
              <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
                <div className="beacon-pulse" style={{ marginBottom: '12px' }}>
                  <span className="beacon-pulse-ring"></span>
                  <span className="beacon-pulse-dot"></span>
                </div>
                <div>Fetching live inventory ledger...</div>
              </div>
            ) : filteredInventory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <Package size={36} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>No matching inventory items</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {inventorySearch ? 'Try a different medicine name.' : 'This pharmacy has no active medicine listings recorded.'}
                </div>
              </div>
            ) : (
              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Medicine Drug</th>
                      <th>Category</th>
                      <th>Live Units</th>
                      <th>Unit Price</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.map((item) => {
                      const inStock = item.available && item.quantity > 0;
                      const isLowStock = inStock && item.quantity < 10;
                      return (
                        <tr key={item.id}>
                          <td>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.medicineName}</div>
                            {item.medicineManufacturer && (
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.medicineManufacturer}</div>
                            )}
                          </td>
                          <td>
                            <span className="med-tag-category" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                              {item.medicineCategory || 'General'}
                            </span>
                          </td>
                          <td>
                            <span className={`stock-pill ${!inStock ? 'stock-out' : (isLowStock ? 'stock-low' : 'stock-in')}`}>
                              {inStock ? `${item.quantity} in stock` : 'Out of stock'}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontWeight: 800, color: 'var(--blue-deep)', fontSize: '0.98rem' }}>
                              ₹{item.price?.toFixed(2)}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              className="btn btn-emergency btn-sm"
                              disabled={!inStock}
                              style={{ opacity: inStock ? 1 : 0.45 }}
                              onClick={() => {
                                setSelectedPharmacy(null);
                                onSelectReserveMedicine({
                                  pharmacyId: selectedPharmacy.id,
                                  pharmacyName: selectedPharmacy.name,
                                  pharmacyAddress: selectedPharmacy.address,
                                  pharmacyPhone: selectedPharmacy.phone,
                                  medicineId: item.medicineId,
                                  medicineName: item.medicineName,
                                  medicineManufacturer: item.medicineManufacturer,
                                  medicineCategory: item.medicineCategory,
                                  quantity: item.quantity,
                                  price: item.price,
                                });
                              }}
                            >
                              Hold & Reserve
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
