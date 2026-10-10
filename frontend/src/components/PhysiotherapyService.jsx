import React, { useState, useMemo } from 'react';
import {
  HeartPulse,
  Calendar,
  Clock,
  MapPin,
  Star,
  ShieldCheck,
  Search,
  X,
  CheckCircle2,
  Home,
  Bone
} from 'lucide-react';

const SPECIALIZATIONS = [
  { id: 'ALL', label: 'All Specializations' },
  { id: 'ORTHO', label: 'Orthopedic & Spine Rehab' },
  { id: 'SPORTS', label: 'Sports Injury & Athletes' },
  { id: 'NEURO', label: 'Neuro-Physiotherapy' },
  { id: 'GERIATRIC', label: 'Geriatric & Mobility' },
  { id: 'CHIRO', label: 'Chiropractic & Alignment' },
  { id: 'ACUPUNCTURE', label: 'Acupuncture & Pain Relief' },
];

const THERAPISTS_DATA = [
  {
    id: 1,
    name: 'Dr. Sneha Verma, MPT (Ortho)',
    designation: 'Senior Orthopedic Physiotherapist',
    experienceYears: 11,
    rating: 4.9,
    reviewCount: 142,
    specializationCategory: 'ORTHO',
    specialties: ['Post-Op Knee Replacement', 'Cervical Spondylosis', 'Lower Back Sciatica', 'Kinesiology Taping'],
    clinicName: 'Spine & Joint Rehabilitation Center',
    location: 'Sector 62, Institutional Area, Noida',
    distanceKm: 1.8,
    sessionFee: 700,
    modes: ['HOME_VISIT', 'CLINIC'],
    availableToday: true,
    availableSlots: ['Today 4:30 PM', 'Today 6:00 PM', 'Tomorrow 10:30 AM', 'Tomorrow 2:00 PM']
  },
  {
    id: 2,
    name: 'Dr. Rajesh Nair, BPT, MIAP',
    designation: 'Sports Rehabilitation Specialist',
    experienceYears: 9,
    rating: 4.8,
    reviewCount: 98,
    specializationCategory: 'SPORTS',
    specialties: ['ACL & Meniscus Tear Rehab', 'Rotator Cuff Shoulder Care', 'Dry Needling', 'Cupping Therapy'],
    clinicName: 'ActiveLife Sports & Performance Rehab',
    location: 'Alpha 1 Commercial Belt, Greater Noida',
    distanceKm: 2.3,
    sessionFee: 850,
    modes: ['HOME_VISIT', 'CLINIC'],
    availableToday: true,
    availableSlots: ['Today 5:00 PM', 'Tomorrow 11:00 AM', 'Tomorrow 4:00 PM']
  },
  {
    id: 3,
    name: 'Dr. Meenakshi Sundaram, MPT (Neuro)',
    designation: 'Consultant Neuro Physiotherapist',
    experienceYears: 14,
    rating: 5.0,
    reviewCount: 180,
    specializationCategory: 'NEURO',
    specialties: ['Stroke Recovery & Hemiplegia', 'Parkinsons Movement Therapy', 'Gait Training', 'Balance Conditioning'],
    clinicName: 'NeuroCare Recovery Clinic',
    location: 'Pari Chowk, Greater Noida',
    distanceKm: 2.9,
    sessionFee: 950,
    modes: ['HOME_VISIT', 'CLINIC'],
    availableToday: false,
    availableSlots: ['Tomorrow 9:30 AM', 'Tomorrow 1:00 PM', 'Day After 10:00 AM']
  },
  {
    id: 4,
    name: 'Dr. Kabir Anand, DC (Chiropractic)',
    designation: 'Spine Alignment & Chiropractic Consultant',
    experienceYears: 8,
    rating: 4.9,
    reviewCount: 115,
    specializationCategory: 'CHIRO',
    specialties: ['Spinal Manipulation', 'Posture Correction', 'Disc Bulge Decompression', 'Migraine & Neck Release'],
    clinicName: 'Align Spine Wellness Studio',
    location: 'Sector 18 Market, Noida',
    distanceKm: 4.2,
    sessionFee: 1200,
    modes: ['CLINIC'],
    availableToday: true,
    availableSlots: ['Today 3:30 PM', 'Today 7:00 PM', 'Tomorrow 12:00 PM']
  },
  {
    id: 5,
    name: 'Dr. Priya Ghosh, MPT (Geriatric)',
    designation: 'Elderly Mobility & Fall Prevention Specialist',
    experienceYears: 12,
    rating: 4.9,
    reviewCount: 165,
    specializationCategory: 'GERIATRIC',
    specialties: ['Elderly Joint Mobilization', 'Fall Prevention Training', 'Osteoarthritis Management', 'Home Ergonomics'],
    clinicName: 'Golden Years Geriatric Care',
    location: 'Knowledge Park II, Greater Noida',
    distanceKm: 1.1,
    sessionFee: 650,
    modes: ['HOME_VISIT'],
    availableToday: true,
    availableSlots: ['Today 5:30 PM', 'Tomorrow 10:00 AM', 'Tomorrow 3:30 PM']
  },
  {
    id: 6,
    name: 'Dr. Arvind Swaminathan, MD (Acupuncture)',
    designation: 'Alternative Medicine & Pain Management Lead',
    experienceYears: 16,
    rating: 4.8,
    reviewCount: 210,
    specializationCategory: 'ACUPUNCTURE',
    specialties: ['Clinical Acupuncture', 'Electro-Acupuncture', 'Chronic Fibromyalgia', 'Myofascial Trigger Release'],
    clinicName: 'Zenith Integrative Healing Center',
    location: 'Connaught Place, Central Delhi',
    distanceKm: 6.5,
    sessionFee: 1100,
    modes: ['HOME_VISIT', 'CLINIC'],
    availableToday: true,
    availableSlots: ['Today 4:00 PM', 'Tomorrow 11:30 AM']
  }
];

export default function PhysiotherapyService() {
  const [selectedSpecialization, setSelectedSpecialization] = useState('ALL');
  const [search, setSearch] = useState('');
  const [filterHomeVisitOnly, setFilterHomeVisitOnly] = useState(false);
  const [filterAvailableToday, setFilterAvailableToday] = useState(false);

  // Booking Modal
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingMode, setBookingMode] = useState('HOME_VISIT');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAddress, setPatientAddress] = useState('');
  const [patientCondition, setPatientCondition] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(null);

  const filteredTherapists = useMemo(() => {
    return THERAPISTS_DATA.filter((item) => {
      const q = search.toLowerCase();
      const matchesSearch =
        item.name.toLowerCase().includes(q) ||
        item.designation.toLowerCase().includes(q) ||
        item.clinicName.toLowerCase().includes(q) ||
        item.specialties.some(s => s.toLowerCase().includes(q));

      const matchesCat = selectedSpecialization === 'ALL' || item.specializationCategory === selectedSpecialization;
      const matchesHome = !filterHomeVisitOnly || item.modes.includes('HOME_VISIT');
      const matchesToday = !filterAvailableToday || item.availableToday;

      return matchesSearch && matchesCat && matchesHome && matchesToday;
    });
  }, [search, selectedSpecialization, filterHomeVisitOnly, filterAvailableToday]);

  const handleOpenBooking = (doc) => {
    setSelectedDoctor(doc);
    setBookingMode(doc.modes.includes('HOME_VISIT') ? 'HOME_VISIT' : 'CLINIC');
    setSelectedSlot(doc.availableSlots[0] || '');
    setBookingSuccess(null);
  };

  const handleConfirmAppointment = (e) => {
    e.preventDefault();
    const apptId = 'PHYSIO-' + Math.floor(100000 + Math.random() * 900000);
    setBookingSuccess({
      id: apptId,
      doctor: selectedDoctor,
      mode: bookingMode,
      slot: selectedSlot,
      patientName,
      patientPhone,
      fee: selectedDoctor.sessionFee
    });
  };

  return (
    <div className="page-container">
      {/* ── Page Header Banner ── */}
      <div className="page-header-banner">
        <div className="header-eyebrow">
          <HeartPulse size={14} />
          Allied Healthcare & Rehabilitation • Certified Practitioners
        </div>
        <h1 className="header-title">Physiotherapy & Alternative Care</h1>
        <p className="header-subtitle">
          Book verified licensed physiotherapists for home visits or clinical sessions, sports injury recovery, post-surgical orthopedic rehabilitation, and chiropractic spine alignment.
        </p>

        {/* Live Metrics */}
        <div className="header-stats-row">
          <div className="header-stat-item">
            <span className="header-stat-value">48 Therapists</span>
            <span className="header-stat-label">Verified Specialists</span>
          </div>
          <div className="header-stat-item">
            <span className="header-stat-value" style={{ color: '#059669' }}>18 Specialists</span>
            <span className="header-stat-label">Home Visits Available Today</span>
          </div>
          <div className="header-stat-item">
            <span className="header-stat-value">⭐ 4.9 / 5.0</span>
            <span className="header-stat-label">Patient Satisfaction</span>
          </div>
          <div className="header-stat-item">
            <span className="header-stat-value">₹650 – ₹1200</span>
            <span className="header-stat-label">Transparent Session Fees</span>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="controls-card">
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px' }}>
          <div className="search-input-wrapper" style={{ flex: 1, minWidth: '260px' }}>
            <Search className="search-input-icon" size={18} />
            <input
              type="text"
              className="search-input"
              placeholder="Search by condition (e.g. Back pain, ACL, Stroke, Cervical), doctor name or clinic..."
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
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginRight: '4px' }}>
            Specialty:
          </span>
          <div className="category-chips-scroll">
            {SPECIALIZATIONS.map((spec) => (
              <button
                key={spec.id}
                className={`category-chip-btn ${selectedSpecialization === spec.id ? 'active' : ''}`}
                onClick={() => setSelectedSpecialization(spec.id)}
              >
                {spec.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', paddingTop: '12px', borderTop: '1px solid rgba(0, 78, 224, 0.08)' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginRight: '4px' }}>
            Consultation Type:
          </span>

          <button
            className={`category-chip-btn ${filterHomeVisitOnly ? 'active' : ''}`}
            onClick={() => setFilterHomeVisitOnly(!filterHomeVisitOnly)}
          >
            <Home size={14} />
            Home Visit Available
          </button>

          <button
            className={`category-chip-btn ${filterAvailableToday ? 'active' : ''}`}
            onClick={() => setFilterAvailableToday(!filterAvailableToday)}
          >
            <Clock size={14} />
            Slots Available Today
          </button>

          {(filterHomeVisitOnly || filterAvailableToday || search || selectedSpecialization !== 'ALL') && (
            <button
              onClick={() => {
                setFilterHomeVisitOnly(false);
                setFilterAvailableToday(false);
                setSelectedSpecialization('ALL');
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', padding: '0 4px' }}>
        <div style={{ fontSize: '0.94rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          Showing <strong style={{ color: 'var(--blue-deep)' }}>{filteredTherapists.length}</strong> certified rehabilitation specialists
        </div>
      </div>

      {/* ── Therapists Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '22px' }}>
        {filteredTherapists.map((doc) => {
          return (
            <div
              key={doc.id}
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '24px'
              }}
            >
              <div>
                {/* Header Profile Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '14px',
                        background: 'linear-gradient(135deg, rgba(0, 78, 224, 0.1), rgba(24, 131, 255, 0.18))',
                        border: '1px solid rgba(0, 78, 224, 0.22)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--blue-deep)',
                        fontWeight: 800,
                        fontSize: '1.1rem',
                        flexShrink: 0
                      }}
                    >
                      <Bone size={24} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.25 }}>
                        {doc.name}
                      </h3>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {doc.designation}
                      </div>
                    </div>
                  </div>

                  <span className="distance-badge">
                    ⚡ {doc.distanceKm} km
                  </span>
                </div>

                {/* Rating & Experience Badges */}
                <div className="badges-row" style={{ marginBottom: '14px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      padding: '3px 9px',
                      borderRadius: '6px',
                      background: 'rgba(245, 158, 11, 0.12)',
                      color: '#d97706',
                      border: '1px solid rgba(245, 158, 11, 0.25)'
                    }}
                  >
                    <Star size={13} fill="#d97706" /> {doc.rating} ({doc.reviewCount})
                  </span>

                  <span className="status-badge badge-verified">
                    <ShieldCheck size={12} /> {doc.experienceYears}+ Yrs Exp
                  </span>

                  {doc.availableToday && (
                    <span className="status-badge badge-open">
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669' }}></span>
                      Available Today
                    </span>
                  )}
                </div>

                {/* Modes Available */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                  {doc.modes.includes('HOME_VISIT') && (
                    <span style={{ fontSize: '0.78rem', background: 'rgba(16, 185, 129, 0.1)', color: '#059669', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.2)', fontWeight: 600 }}>
                      🏠 Home Visit
                    </span>
                  )}
                  {doc.modes.includes('CLINIC') && (
                    <span style={{ fontSize: '0.78rem', background: 'rgba(0, 78, 224, 0.08)', color: 'var(--blue-deep)', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(0, 78, 224, 0.2)', fontWeight: 600 }}>
                      🏥 Clinic Session
                    </span>
                  )}
                </div>

                {/* Clinic location */}
                <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
                  <MapPin size={14} style={{ color: 'var(--blue-bright)', flexShrink: 0 }} />
                  <span>{doc.clinicName} • {doc.location}</span>
                </div>

                {/* Specialties tags */}
                <div style={{ background: '#f8fbff', border: '1px solid rgba(0, 78, 224, 0.08)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.04em', marginBottom: '6px' }}>
                    Specialized Treatments:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {doc.specialties.map((spec, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '0.75rem',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: '#ffffff',
                          border: '1px solid rgba(0, 78, 224, 0.12)',
                          color: 'var(--text-secondary)',
                          fontWeight: 500
                        }}
                      >
                        ✔ {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pricing & Booking action */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid rgba(0, 78, 224, 0.08)' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Consultation Fee</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--blue-deep)' }}>
                    ₹{doc.sessionFee} <span style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-secondary)' }}>/ session</span>
                  </span>
                </div>

                <button
                  className="btn btn-teal"
                  style={{ padding: '10px 18px', fontSize: '0.88rem' }}
                  onClick={() => handleOpenBooking(doc)}
                >
                  <Calendar size={15} /> Book Appointment
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Appointment Booking Modal ── */}
      {selectedDoctor && (
        <div className="modal-overlay" onClick={() => !bookingSuccess && setSelectedDoctor(null)}>
          <div className="modal-content" style={{ maxWidth: '620px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(0, 78, 224, 0.1)', color: 'var(--blue-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bone size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.3rem', color: 'var(--text-primary)' }}>
                    {bookingSuccess ? 'Session Confirmed!' : `Book Session with ${selectedDoctor.name.split(',')[0]}`}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {selectedDoctor.designation} • ₹{selectedDoctor.sessionFee} per session
                  </p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedDoctor(null)}>✕</button>
            </div>

            {bookingSuccess ? (
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
                  <CheckCircle2 size={36} style={{ color: '#059669', margin: '0 auto 8px' }} />
                  <h4 style={{ fontSize: '1.25rem', color: '#059669', marginBottom: '4px' }}>
                    Appointment Scheduled Successfully!
                  </h4>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    Booking Pass ID: <strong style={{ color: 'var(--blue-deep)' }}>{bookingSuccess.id}</strong>
                  </div>
                </div>

                <div style={{ background: '#f8fbff', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0, 78, 224, 0.12)', padding: '16px', marginBottom: '20px', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Specialist:</span>
                    <strong>{selectedDoctor.name}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Consultation Mode:</span>
                    <strong style={{ color: 'var(--blue-deep)' }}>
                      {bookingSuccess.mode === 'HOME_VISIT' ? '🏠 Home Visit Therapy' : '🏥 In-Clinic Consultation'}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Scheduled Slot:</span>
                    <strong style={{ color: '#059669' }}>🕒 {bookingSuccess.slot}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Patient Contact:</span>
                    <strong>{bookingSuccess.patientName} ({bookingSuccess.patientPhone})</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Session Fee:</span>
                    <strong style={{ color: 'var(--blue-deep)', fontSize: '1.05rem' }}>₹{bookingSuccess.fee}</strong>
                  </div>
                </div>

                <button
                  className="btn btn-teal"
                  style={{ width: '100%', padding: '12px' }}
                  onClick={() => setSelectedDoctor(null)}
                >
                  Done & Back to Directory
                </button>
              </div>
            ) : (
              <form onSubmit={handleConfirmAppointment}>
                {/* Consultation Mode Selector */}
                <div className="form-group">
                  <label className="form-label">Select Mode of Consultation:</label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {selectedDoctor.modes.includes('HOME_VISIT') && (
                      <button
                        type="button"
                        className={`quick-chip ${bookingMode === 'HOME_VISIT' ? 'active' : ''}`}
                        style={{ flex: 1, padding: '10px 14px', textAlign: 'center', fontSize: '0.9rem' }}
                        onClick={() => setBookingMode('HOME_VISIT')}
                      >
                        🏠 Home Visit Therapy
                      </button>
                    )}
                    {selectedDoctor.modes.includes('CLINIC') && (
                      <button
                        type="button"
                        className={`quick-chip ${bookingMode === 'CLINIC' ? 'active' : ''}`}
                        style={{ flex: 1, padding: '10px 14px', textAlign: 'center', fontSize: '0.9rem' }}
                        onClick={() => setBookingMode('CLINIC')}
                      >
                        🏥 In-Clinic Visit
                      </button>
                    )}
                  </div>
                </div>

                {/* Available Slots */}
                <div className="form-group">
                  <label className="form-label">Select Date & Time Slot:</label>
                  <select
                    className="form-input"
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                    required
                  >
                    {selectedDoctor.availableSlots.map((slot, i) => (
                      <option key={i} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Patient Full Name:</label>
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
                  <label className="form-label">Mobile Phone Number:</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="e.g. +91 98765 43210"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    required
                  />
                </div>

                {bookingMode === 'HOME_VISIT' && (
                  <div className="form-group">
                    <label className="form-label">Home Address for Therapist Visit:</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Flat 304, Tower B, Pari Chowk, Greater Noida"
                      value={patientAddress}
                      onChange={(e) => setPatientAddress(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Primary Symptoms / Recovery Need:</label>
                  <textarea
                    className="form-input"
                    rows="2"
                    placeholder="e.g. Post-operative knee pain, acute lower back stiffness, neck pain..."
                    value={patientCondition}
                    onChange={(e) => setPatientCondition(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-teal"
                  style={{ width: '100%', padding: '12px', fontSize: '0.96rem', marginTop: '10px' }}
                >
                  <CheckCircle2 size={16} /> Confirm Appointment Booking (₹{selectedDoctor.sessionFee})
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
