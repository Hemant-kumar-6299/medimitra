import React, { useState, useEffect } from 'react';
import heroPill from '../assets/hero-pill.jpg';
import hospitalImg from '../assets/hospital-card.jpg';
import { api } from '../services/api';
import {
  Search,
  MapPin,
  Phone,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Navigation,
  Pill,
  Compass,
  ArrowRight,
  Ambulance,
  HeartPulse,
  Siren,
  Building2,
  Bed,
  CheckCircle2
} from 'lucide-react';

const PRESET_LOCATIONS = [
  { label: 'Knowledge Park II (Greater Noida)', lat: 28.4744, lng: 77.5040 },
  { label: 'Alpha Commercial Belt (Greater Noida)', lat: 28.4780, lng: 77.5020 },
  { label: 'Pari Chowk (Greater Noida)', lat: 28.4650, lng: 77.5120 },
  { label: 'Sector 62 (Noida)', lat: 28.6280, lng: 77.3649 },
  { label: 'Connaught Place (Central Delhi)', lat: 28.6304, lng: 77.2177 },
];

const HOSPITALS_NETWORK = [
  {
    id: 'HOSP-1',
    name: 'Apollo Hospital & Trauma Center',
    badge: 'Level-1 Trauma 24/7',
    address: 'Plot 12, Knowledge Park II, Greater Noida',
    distanceKm: 0.8,
    phone: '+91-120-2345678',
    isOpen: true,
    icuBeds: 24,
    doctorsOnDuty: 45,
    ambulanceUnits: 6,
    emergencyRating: 4.9,
    facilities: ['Trauma Center', 'Cardiac ICU', 'Blood Bank 24/7']
  },
  {
    id: 'HOSP-2',
    name: 'Fortis Emergency & Critical Care',
    badge: 'Critical Care ICU',
    address: 'B-22 Sector 62, Institutional Area, Noida',
    distanceKm: 2.1,
    phone: '+91-120-5678901',
    isOpen: true,
    icuBeds: 32,
    doctorsOnDuty: 60,
    ambulanceUnits: 8,
    emergencyRating: 4.8,
    facilities: ['Cath Lab 24/7', 'Neuro ICU', 'Advanced Ventilators']
  },
  {
    id: 'HOSP-3',
    name: 'Yatharth Super Speciality Hospital',
    badge: 'Multi-Speciality SOS',
    address: 'Omega 1 Commercial Belt, Greater Noida',
    distanceKm: 1.4,
    phone: '+91-120-4567890',
    isOpen: true,
    icuBeds: 18,
    doctorsOnDuty: 35,
    ambulanceUnits: 5,
    emergencyRating: 4.8,
    facilities: ['Emergency OT', 'Pediatric ICU', 'Dialysis 24/7']
  },
  {
    id: 'HOSP-4',
    name: 'Sharda University Medical Center',
    badge: 'Teaching Hospital & Trauma',
    address: 'Plot 32, Knowledge Park III, Greater Noida',
    distanceKm: 1.9,
    phone: '+91-120-6789012',
    isOpen: true,
    icuBeds: 40,
    doctorsOnDuty: 70,
    ambulanceUnits: 10,
    emergencyRating: 4.7,
    facilities: ['Trauma ICU', 'Surgical ICU', 'Pharmacy 24/7']
  },
  {
    id: 'HOSP-5',
    name: 'Max Healthcare Emergency Wing',
    badge: 'Trauma & Emergency Care',
    address: 'Max Complex, W-3 Greater Noida',
    distanceKm: 3.2,
    phone: '+91-120-8901234',
    isOpen: true,
    icuBeds: 28,
    doctorsOnDuty: 50,
    ambulanceUnits: 6,
    emergencyRating: 4.9,
    facilities: ['Cardiology SOS', 'Ventilators', 'Trauma OT']
  },
  {
    id: 'HOSP-6',
    name: 'Jaypee Hospital Critical Center',
    badge: 'Level-1 Emergency Facility',
    address: 'Sector 128, Expressway, Noida',
    distanceKm: 4.5,
    phone: '+91-120-7890123',
    isOpen: true,
    icuBeds: 50,
    doctorsOnDuty: 85,
    ambulanceUnits: 12,
    emergencyRating: 5.0,
    facilities: ['Heart Attack Center', 'Neuro-trauma', 'ICU 24/7']
  }
];

const QUICK_SEARCH_CHIPS = [
  'Insulin', 'Salbutamol Inhaler', 'Nitroglycerin', 'Paracetamol 650mg',
  'Epinephrine', 'Azithromycin', 'Amoxicillin', 'ORS',
];

export default function EmergencySearch({ onSelectReserve, initialQuery, onNavigate }) {
  const [query, setQuery] = useState(initialQuery || 'Insulin');
  const [selectedLocation, setSelectedLocation] = useState(PRESET_LOCATIONS[0]);
  const [radius, setRadius] = useState(25);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isGpsActive, setIsGpsActive] = useState(false);
  const [activeViewTab, setActiveViewTab] = useState('hospitals'); // 'hospitals' | 'medicines'

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  const fetchResults = async (searchName, lat, lng, searchRadius) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.emergencySearch({ name: searchName, lat, lng, radius: searchRadius });
      setResults(data || []);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Unable to fetch emergency medicine data. Verify backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults(query, selectedLocation.lat, selectedLocation.lng, radius);
  }, [query, selectedLocation, radius]);

  const handleChipClick = (medicineName) => setQuery(medicineName);

  const handleGetBrowserLocation = () => {
    if (!navigator.geolocation) { alert('Geolocation is not supported by your browser'); return; }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSelectedLocation({ label: 'Current GPS Location', lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsGpsActive(true);
      },
      (err) => { alert('Could not acquire GPS position: ' + err.message); setLoading(false); }
    );
  };

  const scrollToSearch = () => document.querySelector('.search-container')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div>
      {/* ── Full-screen hero (Haven style) ── */}
      <div className="hero-section">
        <img src={heroPill} alt="" className="hero-bg-img" aria-hidden="true" />
        <div className="hero-overlay" />

        <div className="hero-content">
          {/* Badge pill */}
          <div className="hero-badge">
            <div className="beacon-pulse">
              <span className="beacon-pulse-ring"></span>
              <span className="beacon-pulse-dot"></span>
            </div>
            24/7 SOS Radar Active — Live inventory across verified pharmacies
          </div>

          {/* Main headline */}
          <h1 className="hero-headline">
            Find <span>Emergency</span><br />Medicines Near You.
          </h1>

          {/* Subtext */}
          <p className="hero-subtext">
            Pinpoint the closest pharmacies with live stock, exact distance,<br />
            and reserve medication in under 30 seconds.
          </p>

          {/* CTA Buttons */}
          <div className="hero-ctas">
            <button className="btn-hero-primary" onClick={scrollToSearch}>
              Emergency Search <ArrowRight size={16} />
            </button>
            <button
              className="btn-hero-ghost"
              onClick={() => document.querySelector('.pharmacy-results-grid')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <MapPin size={16} />
              View Pharmacies
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="hero-scroll-indicator" onClick={scrollToSearch}>
          <span>Scroll ↓</span>
        </div>
      </div>

      {/* ── Below-hero: Quick Services + Search + Results ── */}
      <div className="below-hero">

        {/* ── Quick Allied & Emergency Services Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {/* Ambulance Card */}
          <div 
            className="glass-card"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              padding: '18px 22px',
              background: 'linear-gradient(135deg, #ffffff, #fffafa)',
              border: '1.5px solid rgba(220, 38, 38, 0.22)',
              cursor: 'pointer',
              transition: 'all 0.25s ease'
            }}
            onClick={() => onNavigate && onNavigate('ambulance', '/ambulance')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.12), rgba(239, 68, 68, 0.25))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--red-emergency)',
                  flexShrink: 0
                }}
              >
                <Ambulance size={24} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>Emergency Ambulance 24/7</h3>
                  <span className="distance-badge" style={{ fontSize: '0.68rem', padding: '1px 6px', background: 'rgba(220, 38, 38, 0.1)', color: '#dc2626', borderColor: 'rgba(220, 38, 38, 0.25)' }}>
                    ETA ~8m
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  ICU Ventilators &amp; ALS fleet on GPS live radar
                </p>
              </div>
            </div>
            <button className="btn btn-emergency btn-sm" style={{ padding: '8px 14px' }}>
              Dispatch <ArrowRight size={14} />
            </button>
          </div>

          {/* Physiotherapy Card */}
          <div 
            className="glass-card"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              padding: '18px 22px',
              background: 'linear-gradient(135deg, #ffffff, #f4f8ff)',
              border: '1.5px solid rgba(0, 78, 224, 0.18)',
              cursor: 'pointer',
              transition: 'all 0.25s ease'
            }}
            onClick={() => onNavigate && onNavigate('physiotherapy', '/physiotherapy')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(0, 78, 224, 0.1), rgba(24, 131, 255, 0.2))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--blue-deep)',
                  flexShrink: 0
                }}
              >
                <HeartPulse size={24} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>Physiotherapy &amp; Rehab</h3>
                  <span className="distance-badge" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                    Home Visit
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Orthopedic, sports rehab &amp; chiropractic specialists
                </p>
              </div>
            </div>
            <button className="btn btn-teal btn-sm" style={{ padding: '8px 14px' }}>
              Book Care <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Search Console */}
        <div className="search-container">
          <div className="search-input-group">
            <div className="search-input-wrapper">
              <Search className="search-input-icon" size={20} />
              <input
                type="text"
                className="search-input"
                placeholder="Search emergency medicine (e.g. Insulin, Inhaler, Nitroglycerin, Paracetamol)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button
              className="btn btn-emergency"
              onClick={() => fetchResults(query, selectedLocation.lat, selectedLocation.lng, radius)}
            >
              <Flame size={18} />
              Emergency Search
            </button>
          </div>

          {/* Quick Chips */}
          <div className="chips-row">
            <span className="chip-label">Urgent / Critical:</span>
            {QUICK_SEARCH_CHIPS.map((chip) => (
              <button
                key={chip}
                className={`quick-chip ${query.toLowerCase() === chip.toLowerCase() ? 'active' : ''}`}
                onClick={() => handleChipClick(chip)}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Location & Radius Bar */}
          <div className="location-filter-bar">
            <div className="location-selector">
              <MapPin size={16} style={{ color: 'var(--blue-bright)' }} />
              <span>Search Near:</span>
              <select
                className="location-dropdown"
                value={isGpsActive ? 'gps' : selectedLocation.label}
                onChange={(e) => {
                  const found = PRESET_LOCATIONS.find((loc) => loc.label === e.target.value);
                  if (found) { setSelectedLocation(found); setIsGpsActive(false); }
                }}
              >
                {isGpsActive && <option value="gps">My GPS Location (Active)</option>}
                {PRESET_LOCATIONS.map((loc) => (
                  <option key={loc.label} value={loc.label}>{loc.label}</option>
                ))}
              </select>
              <button className="btn btn-secondary btn-sm" onClick={handleGetBrowserLocation} title="Detect my current location">
                <Navigation size={13} />
                GPS Detect
              </button>
            </div>

            <div className="radius-slider-wrap">
              <Compass size={16} />
              <span>Radius:</span>
              <span style={{ fontWeight: 700, color: 'var(--blue-deep)' }}>{radius} km</span>
              <input
                type="range" min="1" max="50" value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                style={{ accentColor: 'var(--blue-deep)', cursor: 'pointer', width: '110px' }}
              />
            </div>
          </div>
        </div>

        {/* Results Header with View Switcher */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '22px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              className={`category-chip-btn ${activeViewTab === 'hospitals' ? 'active' : ''}`}
              style={{ fontSize: '0.9rem', padding: '8px 16px' }}
              onClick={() => setActiveViewTab('hospitals')}
            >
              <Building2 size={15} />
              Emergency Hospitals &amp; Trauma Centers ({HOSPITALS_NETWORK.length})
            </button>
            <button
              className={`category-chip-btn ${activeViewTab === 'medicines' ? 'active' : ''}`}
              style={{ fontSize: '0.9rem', padding: '8px 16px' }}
              onClick={() => setActiveViewTab('medicines')}
            >
              <Pill size={15} />
              Medicine Stock &amp; Dispensaries ({results.length})
            </button>
          </div>

          <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
            Showing verified 24/7 facilities near <strong>{selectedLocation.label.split('(')[0]}</strong>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(220,38,38,0.07)', border: '1px solid rgba(220,38,38,0.22)',
            borderRadius: 'var(--radius-sm)', padding: '14px 18px', color: '#dc2626',
            marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px'
          }}>
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* ── View 1: Emergency Hospitals & Trauma Centers (Image 1 Layout + Image 2 Photo) ── */}
        {activeViewTab === 'hospitals' && (
          <div className="pharmacy-results-grid">
            {HOSPITALS_NETWORK.map((hosp) => (
              <div key={hosp.id} className="hospital-haven-card">
                {/* Full-bleed background image from Image 2 */}
                <img src={hospitalImg} alt={hosp.name} className="card-bg-img" />
                <div className="card-gradient-overlay" />

                {/* Top bar with pill badge from Image 1 */}
                <div className="card-top-bar">
                  <div className="card-badge-pill">
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                    {hosp.badge}
                  </div>
                  <span 
                    style={{
                      background: 'rgba(0, 0, 0, 0.45)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      borderRadius: '999px',
                      padding: '4px 10px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    ⭐ {hosp.emergencyRating}
                  </span>
                </div>

                {/* Bottom content overlay matching Image 1 layout */}
                <div className="card-bottom-content">
                  {/* 4 dots indicator from Image 1 */}
                  <div className="card-dots-row">
                    <span className="card-dot active"></span>
                    <span className="card-dot"></span>
                    <span className="card-dot"></span>
                    <span className="card-dot"></span>
                  </div>

                  {/* Title & Distance/Highlight row */}
                  <div className="card-title-row">
                    <h3 className="card-title">{hosp.name}</h3>
                    <div className="card-highlight-stat">⚡ {hosp.distanceKm} km</div>
                  </div>

                  {/* Address */}
                  <div className="card-address">
                    <MapPin size={13} style={{ flexShrink: 0, color: 'var(--blue-bright)' }} />
                    <span>{hosp.address}</span>
                  </div>

                  {/* Specs bar (Bed: 2 | Baths: 1 | Sqft: 1150 style from Image 1!) */}
                  <div className="card-specs-bar">
                    <div className="spec-item">
                      <span style={{ fontSize: '0.9rem' }}>🛏️</span>
                      <span>ICU: {hosp.icuBeds} Beds</span>
                    </div>
                    <div className="spec-divider"></div>
                    <div className="spec-item">
                      <span style={{ fontSize: '0.9rem' }}>👨‍⚕️</span>
                      <span>{hosp.doctorsOnDuty} Doctors</span>
                    </div>
                    <div className="spec-divider"></div>
                    <div className="spec-item">
                      <span style={{ fontSize: '0.9rem' }}>🕒</span>
                      <span>24/7 SOS</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="card-actions-row">
                    <a 
                      href={`tel:${hosp.phone}`} 
                      className="btn btn-secondary btn-sm" 
                      style={{ flex: 1, background: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(10px)' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Phone size={14} /> Call ER
                    </a>
                    <button 
                      className="btn btn-emergency btn-sm" 
                      style={{ flex: 2 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate && onNavigate('ambulance', '/ambulance');
                      }}
                    >
                      <Ambulance size={14} /> Dispatch Ambulance Here
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── View 2: Medicine Stocks & Dispensaries (Also using Image 1 Layout + Image 2 Photo) ── */}
        {activeViewTab === 'medicines' && (
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                <div className="beacon-pulse" style={{ marginBottom: '16px' }}>
                  <span className="beacon-pulse-ring"></span>
                  <span className="beacon-pulse-dot"></span>
                </div>
                <div>Scanning connected pharmacy inventory systems...</div>
              </div>
            ) : results.length === 0 ? (
              <div className="glass-card" style={{ textAlign: 'center', padding: '50px 20px', borderStyle: 'dashed' }}>
                <Pill size={42} style={{ color: 'var(--text-muted)', marginBottom: '12px', opacity: 0.5 }} />
                <h3 style={{ marginBottom: '8px' }}>No stock found for "{query}"</h3>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 16px' }}>
                  Try increasing your search radius or search by generic category (e.g. "Insulin", "Inhaler", "Antibiotic", "Paracetamol").
                </p>
                <button className="btn btn-secondary btn-sm" onClick={() => { setRadius(50); setQuery(''); }}>
                  Show All Available Medicines
                </button>
              </div>
            ) : (
              <div className="pharmacy-results-grid">
                {results.map((item) => {
                  const isAvailable = item.available && item.quantity > 0;
                  return (
                    <div
                      key={`${item.pharmacyId}-${item.medicineId}`}
                      className="hospital-haven-card"
                    >
                      {/* Image 2 Background */}
                      <img src={hospitalImg} alt={item.pharmacyName} className="card-bg-img" />
                      <div className="card-gradient-overlay" />

                      {/* Top Bar with Badge */}
                      <div className="card-top-bar">
                        <span className="card-badge-pill">
                          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: item.isOpen ? '#10b981' : '#ef4444', display: 'inline-block' }}></span>
                          {item.isOpen ? 'Open Now 24/7' : 'Closed'}
                        </span>
                        {item.verified && (
                          <span className="card-badge-pill" style={{ background: 'rgba(0, 78, 224, 0.55)', borderColor: 'rgba(24, 131, 255, 0.5)' }}>
                            <ShieldCheck size={12} /> Verified Facility
                          </span>
                        )}
                      </div>

                      {/* Bottom Overlay matching Image 1 layout */}
                      <div className="card-bottom-content">
                        {/* 4 dots from Image 1 */}
                        <div className="card-dots-row">
                          <span className="card-dot active"></span>
                          <span className="card-dot"></span>
                          <span className="card-dot"></span>
                          <span className="card-dot"></span>
                        </div>

                        {/* Title & Distance */}
                        <div className="card-title-row">
                          <h3 className="card-title">{item.pharmacyName}</h3>
                          <div className="card-highlight-stat">
                            {item.distanceKm != null ? `⚡ ${item.distanceKm} km` : 'Near You'}
                          </div>
                        </div>

                        {/* Address */}
                        <div className="card-address">
                          <MapPin size={13} style={{ flexShrink: 0, color: 'var(--blue-bright)' }} />
                          <span>{item.pharmacyAddress}</span>
                        </div>

                        {/* Specs Bar */}
                        <div className="card-specs-bar">
                          <div className="spec-item">
                            <span style={{ fontSize: '0.85rem' }}>💊</span>
                            <span>{item.medicineName ? item.medicineName.split(' ')[0] : 'Drug'}</span>
                          </div>
                          <div className="spec-divider"></div>
                          <div className="spec-item">
                            <span style={{ fontSize: '0.85rem' }}>📦</span>
                            <span style={{ color: isAvailable ? '#34d399' : '#f87171' }}>
                              {isAvailable ? `${item.quantity} in Stock` : 'Out of Stock'}
                            </span>
                          </div>
                          <div className="spec-divider"></div>
                          <div className="spec-item">
                            <span style={{ fontSize: '0.85rem' }}>🏷️</span>
                            <span>₹{item.price ? item.price.toFixed(0) : '240'}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="card-actions-row">
                          <a 
                            href={`tel:${item.pharmacyPhone}`} 
                            className="btn btn-secondary btn-sm" 
                            style={{ flex: 1, background: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(10px)' }}
                          >
                            <Phone size={14} /> Call
                          </a>
                          <button
                            className="btn btn-emergency btn-sm"
                            style={{ flex: 2 }}
                            disabled={!isAvailable}
                            onClick={() => onSelectReserve(item)}
                          >
                            <Clock size={14} /> Reserve (30-Min Hold)
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
