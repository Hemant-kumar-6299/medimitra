import React, { useState, useMemo } from 'react';
import {
  Ambulance,
  Phone,
  Clock,
  MapPin,
  ShieldCheck,
  Navigation,
  Activity,
  CheckCircle2,
  HeartPulse,
  Siren,
  Search,
  X,
  PhoneCall,
  User,
  Radio
} from 'lucide-react';

const PRESET_LOCATIONS = [
  { label: 'Knowledge Park II (Greater Noida)', lat: 28.4744, lng: 77.5040 },
  { label: 'Alpha Commercial Belt (Greater Noida)', lat: 28.4780, lng: 77.5020 },
  { label: 'Pari Chowk (Greater Noida)', lat: 28.4650, lng: 77.5120 },
  { label: 'Sector 62 (Noida)', lat: 28.6280, lng: 77.3649 },
  { label: 'Connaught Place (Central Delhi)', lat: 28.6304, lng: 77.2177 },
];

const HOSPITALS = [
  'Fortis Hospital (Trauma Center, Sector 62)',
  'Apollo Hospital Emergency & Critical Care',
  'Yatharth Super Speciality Hospital (Greater Noida)',
  'Sharda University Medical Hospital (Knowledge Park III)',
  'Jaypee Hospital Emergency Wing (Sector 128)',
  'AIIMS Delhi Trauma Center'
];

const AMBULANCES_DATA = [
  {
    id: 'AMB-101',
    name: 'Apollo Rapid Response Unit 1',
    type: 'ICU Ventilator on Wheels',
    typeCategory: 'ICU',
    driverName: 'Rajesh Sharma (Paramedic Certified)',
    phone: '+91-98765-43210',
    baseLocation: 'Plot 12, Knowledge Park II',
    hospitalAffiliation: 'Apollo Hospitals & Trauma Center',
    etaMinutes: 6,
    distanceKm: 1.4,
    status: 'AVAILABLE',
    equipment: ['Invasive Ventilator', 'Multipara Cardiac Monitor', 'Defibrillator', 'Suction Machine', 'Emergency Oxygen Cylinders', 'Spine Board'],
    rateBase: 2500
  },
  {
    id: 'AMB-102',
    name: 'Fortis Advanced Life Support 4',
    type: 'ALS (Advanced Life Support)',
    typeCategory: 'ALS',
    driverName: 'Vikram Singh (EMT Specialist)',
    phone: '+91-98765-43211',
    baseLocation: 'Alpha 1 Commercial Complex',
    hospitalAffiliation: 'Fortis Healthcare Emergency Fleet',
    etaMinutes: 8,
    distanceKm: 2.1,
    status: 'AVAILABLE',
    equipment: ['Automated Defibrillator (AED)', 'Oxygen Delivery System', 'IV Infusion Setup', 'Trauma Splints', 'ECG Monitor'],
    rateBase: 1800
  },
  {
    id: 'AMB-103',
    name: 'Ziqitza 108 Emergency Cruiser',
    type: 'ALS (Advanced Life Support)',
    typeCategory: 'ALS',
    driverName: 'Amit Verma (Senior EMT)',
    phone: '+91-98765-43212',
    baseLocation: 'Pari Chowk Flyover Base',
    hospitalAffiliation: 'National 108 Emergency Network',
    etaMinutes: 10,
    distanceKm: 2.8,
    status: 'AVAILABLE',
    equipment: ['Oxygen Support', 'Pulse Oximeter', 'First Responder Kit', 'Collapsible Stretcher', 'Cervical Collar'],
    rateBase: 1200
  },
  {
    id: 'AMB-104',
    name: 'Yatharth Neonatal & Pediatric Care',
    type: 'NICU / Pediatric Specialist',
    typeCategory: 'NICU',
    driverName: 'Sanjay Kumar (Pediatric EMT)',
    phone: '+91-98765-43213',
    baseLocation: 'Sector 110, Noida',
    hospitalAffiliation: 'Yatharth Super Speciality Hospital',
    etaMinutes: 12,
    distanceKm: 4.5,
    status: 'AVAILABLE',
    equipment: ['Neonatal Transport Incubator', 'Infant Resuscitation Kit', 'Pediatric Ventilator', 'Warmers', 'Syringe Pumps'],
    rateBase: 3200
  },
  {
    id: 'AMB-105',
    name: 'RedCross Basic Patient Transport',
    type: 'BLS (Basic Life Support)',
    typeCategory: 'BLS',
    driverName: 'Manoj Tiwari (Certified Driver)',
    phone: '+91-98765-43214',
    baseLocation: 'Sector 62 Institutional Base',
    hospitalAffiliation: 'Red Cross Medical Mobility',
    etaMinutes: 14,
    distanceKm: 5.2,
    status: 'AVAILABLE',
    equipment: ['Oxygen Inhalation', 'Standard Stretcher', 'Wheelchair Lift', 'Emergency First Aid Kit'],
    rateBase: 800
  },
  {
    id: 'AMB-106',
    name: 'Max Critical Trauma Mobile Unit',
    type: 'ICU Ventilator on Wheels',
    typeCategory: 'ICU',
    driverName: 'Dharmendra Yadav (Critical Care Paramedic)',
    phone: '+91-98765-43215',
    baseLocation: 'Expressway Interchange Base',
    hospitalAffiliation: 'Max Super Speciality Hospital',
    etaMinutes: 9,
    distanceKm: 2.9,
    status: 'AVAILABLE',
    equipment: ['Hamilton Medical Transport Ventilator', 'Arterial Line Setup', 'Defibrillator Biphasic', 'Doctor on Call'],
    rateBase: 2800
  }
];

export default function AmbulanceService() {
  const [selectedLocation, setSelectedLocation] = useState(PRESET_LOCATIONS[0]);
  const [isGpsActive, setIsGpsActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  
  // Dispatch Modal state
  const [dispatchModalItem, setDispatchModalItem] = useState(null);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [destinationHospital, setDestinationHospital] = useState(HOSPITALS[0]);
  const [emergencySeverity, setEmergencySeverity] = useState('HIGH');
  const [bookingConfirmed, setBookingConfirmed] = useState(null);

  const handleGetBrowserLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
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
      }
    );
  };

  const filteredAmbulances = useMemo(() => {
    return AMBULANCES_DATA.filter((amb) => {
      const q = search.toLowerCase();
      const matchesSearch =
        amb.name.toLowerCase().includes(q) ||
        amb.type.toLowerCase().includes(q) ||
        amb.hospitalAffiliation.toLowerCase().includes(q) ||
        amb.baseLocation.toLowerCase().includes(q);

      const matchesCat = selectedCategory === 'ALL' || amb.typeCategory === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [search, selectedCategory]);

  const handleOpenDispatch = (amb) => {
    setDispatchModalItem(amb);
    setBookingConfirmed(null);
  };

  const handleConfirmDispatch = (e) => {
    e.preventDefault();
    const bookingRef = 'SOS-' + Math.floor(100000 + Math.random() * 900000);
    setBookingConfirmed({
      reference: bookingRef,
      ambulance: dispatchModalItem,
      patientName,
      patientPhone,
      destinationHospital,
      severity: emergencySeverity,
      eta: dispatchModalItem.etaMinutes,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  };

  return (
    <div className="page-container">
      {/* ── Emergency SOS Top Banner ── */}
      <div 
        style={{
          background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.08), rgba(239, 68, 68, 0.04))',
          border: '1.5px solid rgba(220, 38, 38, 0.25)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px 28px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div 
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 16px rgba(220, 38, 38, 0.4)'
            }}
          >
            <Siren size={24} className="pulse-icon" />
          </div>
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              National Emergency Medical Hotlines (Toll-Free 24/7)
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              In critical trauma or cardiac arrest emergencies, dial official response centers immediately.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <a
            href="tel:108"
            className="btn btn-emergency"
            style={{ padding: '10px 18px', fontSize: '0.92rem' }}
          >
            <PhoneCall size={16} /> Call 108 (Disaster SOS)
          </a>
          <a
            href="tel:102"
            className="btn btn-secondary"
            style={{ padding: '10px 18px', fontSize: '0.92rem', background: '#fff', borderColor: 'rgba(220, 38, 38, 0.3)', color: '#dc2626' }}
          >
            <Phone size={16} /> Call 102 (Ambulance)
          </a>
        </div>
      </div>

      {/* ── Page Header Banner ── */}
      <div className="page-header-banner">
        <div className="header-eyebrow" style={{ color: 'var(--red-emergency)', borderColor: 'rgba(220, 38, 38, 0.3)', background: 'rgba(220, 38, 38, 0.08)' }}>
          <Radio size={14} />
          24/7 Rapid Response Radar • Real-time GPS Fleet Dispatch
        </div>
        <h1 className="header-title">Emergency Ambulance Service</h1>
        <p className="header-subtitle">
          Pinpoint nearest ICU ventilator units, Advanced Life Support (ALS), and pediatric ambulances with real-time GPS telemetry, driver dispatch, and pre-alerted hospital emergency admissions.
        </p>

        {/* Live Metrics */}
        <div className="header-stats-row">
          <div className="header-stat-item">
            <span className="header-stat-value" style={{ color: 'var(--red-emergency)' }}>6-10 min</span>
            <span className="header-stat-label">Average Response ETA</span>
          </div>
          <div className="header-stat-item">
            <span className="header-stat-value">14 Units</span>
            <span className="header-stat-label">Active On Radar</span>
          </div>
          <div className="header-stat-item">
            <span className="header-stat-value" style={{ color: 'var(--blue-deep)' }}>6 Mobile ICUs</span>
            <span className="header-stat-label">Ventilator Equipped</span>
          </div>
          <div className="header-stat-item">
            <span className="header-stat-value">100%</span>
            <span className="header-stat-label">Certified Paramedics</span>
          </div>
        </div>
      </div>

      {/* ── Control Bar: Search, Category & Location ── */}
      <div className="controls-card">
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px' }}>
          <div className="search-input-wrapper" style={{ flex: 2, minWidth: '260px' }}>
            <Search className="search-input-icon" size={18} />
            <input
              type="text"
              className="search-input"
              placeholder="Search by ambulance type, hospital fleet, or locality..."
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
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Location selector */}
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
                <option key={loc.label} value={loc.label}>📍 {loc.label}</option>
              ))}
              {isGpsActive && <option value={selectedLocation.label}>🎯 {selectedLocation.label}</option>}
            </select>

            <button
              className="btn btn-secondary btn-sm"
              style={{ padding: '10px 14px' }}
              onClick={handleGetBrowserLocation}
              title="Use current GPS location"
            >
              <Navigation size={14} />
              GPS Detect
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '12px', borderTop: '1px solid rgba(0, 78, 224, 0.08)' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginRight: '4px' }}>
            Vehicle Class:
          </span>
          {[
            { id: 'ALL', label: 'All Ambulances' },
            { id: 'ICU', label: 'ICU on Wheels (Ventilator)' },
            { id: 'ALS', label: 'ALS (Advanced Life Support)' },
            { id: 'BLS', label: 'BLS (Basic Life Support)' },
            { id: 'NICU', label: 'Neonatal & Pediatric' },
          ].map((cat) => (
            <button
              key={cat.id}
              className={`category-chip-btn ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header Counter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', padding: '0 4px' }}>
        <div style={{ fontSize: '0.94rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          Showing <strong style={{ color: 'var(--blue-deep)' }}>{filteredAmbulances.length}</strong> active emergency units near <strong>{selectedLocation.label.split('(')[0]}</strong>
        </div>
      </div>

      {/* ── Ambulance Cards Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '22px' }}>
        {filteredAmbulances.map((amb) => {
          const isICU = amb.typeCategory === 'ICU';
          return (
            <div
              key={amb.id}
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderColor: isICU ? 'rgba(220, 38, 38, 0.25)' : 'rgba(0, 78, 224, 0.14)',
                background: isICU ? 'linear-gradient(180deg, #ffffff, #fffafa)' : '#ffffff'
              }}
            >
              <div>
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '12px',
                        background: isICU
                          ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.12), rgba(239, 68, 68, 0.2))'
                          : 'linear-gradient(135deg, rgba(0, 78, 224, 0.1), rgba(24, 131, 255, 0.15))',
                        border: `1px solid ${isICU ? 'rgba(220, 38, 38, 0.3)' : 'rgba(0, 78, 224, 0.2)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isICU ? 'var(--red-emergency)' : 'var(--blue-deep)',
                        flexShrink: 0
                      }}
                    >
                      <Ambulance size={24} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.25 }}>
                        {amb.name}
                      </h3>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                        {amb.hospitalAffiliation}
                      </div>
                    </div>
                  </div>

                  {/* ETA Badge */}
                  <span
                    className="distance-badge"
                    style={{
                      background: isICU ? 'rgba(220, 38, 38, 0.12)' : 'rgba(24, 131, 255, 0.14)',
                      borderColor: isICU ? 'rgba(220, 38, 38, 0.35)' : 'rgba(24, 131, 255, 0.35)',
                      color: isICU ? '#dc2626' : 'var(--blue-bright)'
                    }}
                  >
                    ⚡ {amb.etaMinutes} min ({amb.distanceKm} km)
                  </span>
                </div>

                {/* Status & Type Row */}
                <div className="badges-row" style={{ margin: '12px 0' }}>
                  <span
                    className="status-badge"
                    style={{
                      background: isICU ? 'rgba(220, 38, 38, 0.12)' : 'rgba(0, 78, 224, 0.08)',
                      color: isICU ? '#dc2626' : 'var(--blue-deep)',
                      border: `1px solid ${isICU ? 'rgba(220, 38, 38, 0.28)' : 'rgba(0, 78, 224, 0.2)'}`
                    }}
                  >
                    <Activity size={12} /> {amb.type}
                  </span>

                  <span className="status-badge badge-open">
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669' }}></span>
                    Ready for Dispatch
                  </span>
                </div>

                {/* Base location & Paramedic info */}
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px', margin: '14px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={14} style={{ color: 'var(--blue-bright)', flexShrink: 0 }} />
                    <span>Station: {amb.baseLocation}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={14} style={{ color: 'var(--blue-deep)', flexShrink: 0 }} />
                    <span>Lead: <strong>{amb.driverName}</strong></span>
                  </div>
                </div>

                {/* Equipment Pills */}
                <div style={{ background: '#f8fbff', border: '1px solid rgba(0, 78, 224, 0.08)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', margin: '12px 0' }}>
                  <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.04em', marginBottom: '6px' }}>
                    Emergency Medical Kit Onboard:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {amb.equipment.slice(0, 4).map((eq, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '0.74rem',
                          padding: '2px 7px',
                          borderRadius: '4px',
                          background: '#ffffff',
                          border: '1px solid rgba(0, 78, 224, 0.12)',
                          color: 'var(--text-secondary)',
                          fontWeight: 500
                        }}
                      >
                        ✔ {eq}
                      </span>
                    ))}
                    {amb.equipment.length > 4 && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--blue-bright)', padding: '2px 4px', fontWeight: 600 }}>
                        +{amb.equipment.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', paddingTop: '16px', borderTop: '1px solid rgba(0, 78, 224, 0.08)' }}>
                <a
                  href={`tel:${amb.phone}`}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '10px 12px', fontSize: '0.85rem' }}
                >
                  <Phone size={14} /> Call Crew
                </a>

                <button
                  className="btn btn-emergency"
                  style={{ flex: 2, padding: '10px 14px', fontSize: '0.88rem' }}
                  onClick={() => handleOpenDispatch(amb)}
                >
                  <Siren size={15} /> Instant Dispatch
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Dispatch Booking & Live Telemetry Modal ── */}
      {dispatchModalItem && (
        <div className="modal-overlay" onClick={() => !bookingConfirmed && setDispatchModalItem(null)}>
          <div className="modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(220, 38, 38, 0.1)', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Ambulance size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.3rem', color: 'var(--text-primary)' }}>
                    {bookingConfirmed ? 'Ambulance Dispatched & En Route' : 'Dispatch Emergency Ambulance'}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {dispatchModalItem.name} • {dispatchModalItem.type}
                  </p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setDispatchModalItem(null)}>✕</button>
            </div>

            {bookingConfirmed ? (
              <div>
                <div
                  style={{
                    background: 'rgba(5, 150, 105, 0.08)',
                    border: '1px solid rgba(5, 150, 105, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    padding: '20px',
                    textAlign: 'center',
                    marginBottom: '20px'
                  }}
                >
                  <div className="beacon-pulse beacon-pulse-green" style={{ marginBottom: '12px' }}>
                    <span className="beacon-pulse-ring"></span>
                    <span className="beacon-pulse-dot"></span>
                  </div>
                  <h4 style={{ fontSize: '1.25rem', color: '#059669', marginBottom: '6px' }}>
                    Emergency Unit Dispatched!
                  </h4>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    Reference Tracking Code: <strong style={{ color: 'var(--blue-deep)' }}>{bookingConfirmed.reference}</strong>
                  </div>
                </div>

                <div style={{ background: '#f8fbff', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0, 78, 224, 0.12)', padding: '16px', marginBottom: '20px', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Estimated Arrival:</span>
                    <strong style={{ color: '#dc2626' }}>⚡ {bookingConfirmed.eta} Minutes (GPS Live)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Lead Paramedic:</span>
                    <strong>{dispatchModalItem.driverName}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Direct Phone:</span>
                    <a href={`tel:${dispatchModalItem.phone}`} style={{ fontWeight: 700, color: 'var(--blue-deep)' }}>
                      📞 {dispatchModalItem.phone}
                    </a>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Destination Hospital:</span>
                    <strong style={{ textAlign: 'right', maxWidth: '280px' }}>{bookingConfirmed.destinationHospital}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <a
                    href={`tel:${dispatchModalItem.phone}`}
                    className="btn btn-emergency"
                    style={{ flex: 1 }}
                  >
                    <PhoneCall size={16} /> Call Driver Now
                  </a>
                  <button
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                    onClick={() => setDispatchModalItem(null)}
                  >
                    Done & Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmDispatch}>
                <div style={{ background: 'rgba(24, 131, 255, 0.06)', border: '1px solid rgba(24, 131, 255, 0.2)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Pickup Location</span>
                    <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)' }}>{selectedLocation.label}</div>
                  </div>
                  <span className="distance-badge">ETA {dispatchModalItem.etaMinutes} mins</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Patient Name or Emergency Contact:</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Ramesh Verma"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Phone Number (Active for Driver):</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="e.g. +91 98765 43210"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Preferred Destination Hospital for Admission:</label>
                  <select
                    className="form-input"
                    value={destinationHospital}
                    onChange={(e) => setDestinationHospital(e.target.value)}
                  >
                    {HOSPITALS.map((h, i) => (
                      <option key={i} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Condition Severity:</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {[
                      { id: 'CRITICAL', label: 'Critical / Unconscious', color: '#dc2626' },
                      { id: 'HIGH', label: 'Severe Pain / Trauma', color: '#ea580c' },
                      { id: 'MODERATE', label: 'Stable Transfer', color: '#0284c7' }
                    ].map(sev => (
                      <button
                        type="button"
                        key={sev.id}
                        className={`quick-chip ${emergencySeverity === sev.id ? 'active' : ''}`}
                        style={{
                          flex: 1,
                          padding: '8px 10px',
                          textAlign: 'center',
                          borderColor: emergencySeverity === sev.id ? sev.color : undefined,
                          background: emergencySeverity === sev.id ? sev.color : undefined
                        }}
                        onClick={() => setEmergencySeverity(sev.id)}
                      >
                        {sev.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-emergency"
                  style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: '10px' }}
                >
                  <Siren size={18} /> Confirm Emergency Dispatch Now
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
