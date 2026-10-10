import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import EmergencySearch from './components/EmergencySearch';
import MedicineCatalog from './components/MedicineCatalog';
import PharmacyDirectory from './components/PharmacyDirectory';
import AmbulanceService from './components/AmbulanceService';
import PhysiotherapyService from './components/PhysiotherapyService';
import UserReservations from './components/UserReservations';
import PharmacyDashboard from './components/PharmacyDashboard';
import AdminDashboard from './components/AdminDashboard';
import ReservationModal from './components/ReservationModal';
import AuthModal from './components/AuthModal';
import { Activity, ShieldAlert, Heart, PhoneCall } from 'lucide-react';
import './index.css';

function MediNearMain() {
  const { user, isAuthenticated } = useAuth();

  const getTabFromPath = (pathname) => {
    const clean = (pathname || '').toLowerCase().replace(/\/$/, '') || '/';
    if (clean === '/medicines' || clean === '/medicine-catalog') return 'medicines';
    if (clean === '/pharmacies') return 'pharmacies';
    if (clean === '/ambulance' || clean === '/ambulance-service') return 'ambulance';
    if (clean === '/physiotherapy' || clean === '/physio') return 'physiotherapy';
    if (clean === '/reservations') return 'reservations';
    if (clean === '/pharmacy-portal') return 'pharmacy-portal';
    if (clean === '/admin') return 'admin';
    return 'search';
  };

  const getPathFromTab = (tab) => {
    switch (tab) {
      case 'medicines': return '/medicine-catalog';
      case 'pharmacies': return '/pharmacies';
      case 'ambulance': return '/ambulance';
      case 'physiotherapy': return '/physiotherapy';
      case 'reservations': return '/reservations';
      case 'pharmacy-portal': return '/pharmacy-portal';
      case 'admin': return '/admin';
      case 'search':
      default: return '/';
    }
  };

  const [activeTab, setActiveTabState] = useState(() => getTabFromPath(window.location.pathname));
  const [initialSearchQuery, setInitialSearchQuery] = useState(null);
  const [reservationItem, setReservationItem] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Sync with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setActiveTabState(getTabFromPath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (tab, customPath) => {
    const targetPath = customPath || getPathFromTab(tab);
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
    setActiveTabState(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectReserve = (item) => {
    setReservationItem(item);
  };

  const handleReservationSuccess = () => {
    navigateTo('reservations');
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={navigateTo}
        onOpenAuth={() => setShowAuthModal(false) || setShowAuthModal(true)}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {activeTab === 'search' && (
          <EmergencySearch 
            initialQuery={initialSearchQuery}
            onSelectReserve={handleSelectReserve} 
            onNavigate={navigateTo}
          />
        )}

        {activeTab === 'medicines' && (
          <MedicineCatalog 
            onSearchMedicine={(medName) => {
              setInitialSearchQuery(medName);
              navigateTo('search', '/');
            }} 
          />
        )}

        {activeTab === 'pharmacies' && (
          <PharmacyDirectory onSelectReserveMedicine={handleSelectReserve} />
        )}

        {activeTab === 'ambulance' && (
          <AmbulanceService />
        )}

        {activeTab === 'physiotherapy' && (
          <PhysiotherapyService />
        )}

        {activeTab === 'reservations' && (
          <div className="page-container">
            <UserReservations />
          </div>
        )}

        {activeTab === 'pharmacy-portal' && (
          <div className="page-container">
            <PharmacyDashboard />
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="page-container">
            <AdminDashboard />
          </div>
        )}
      </main>

      {/* Emergency Disclaimer & Footer */}
      <footer 
        style={{
          background: 'rgba(8, 12, 22, 0.95)',
          borderTop: '1px solid var(--border-subtle)',
          padding: '30px 20px',
          marginTop: 'auto',
          fontSize: '0.84rem',
          color: 'var(--text-muted)'
        }}
      >
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div 
            style={{
              background: 'rgba(239, 68, 68, 0.06)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 18px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#fca5a5'
            }}
          >
            <ShieldAlert size={20} style={{ flexShrink: 0 }} />
            <div>
              <strong>Emergency Medical Disclaimer:</strong> HealthSync medSearch is an availability information platform. In severe or life-threatening emergencies, call national emergency services (<strong>112</strong> / <strong>102</strong> / <strong>108</strong>) immediately without delay.
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontWeight: 600 }}>
              <Activity size={18} style={{ color: 'var(--red-emergency)' }} />
              HealthSync medSearch – Emergency Medicine Availability & Pharmacy Finder
            </div>
            <div>
              Powered by Spring Boot 3.3 / 4.x • PostgreSQL (Supabase) • React
            </div>
          </div>
        </div>
      </footer>

      {/* Reservation Modal */}
      {reservationItem && (
        <ReservationModal
          item={reservationItem}
          onClose={() => setReservationItem(null)}
          onSuccess={handleReservationSuccess}
          onOpenAuth={() => {
            setReservationItem(null);
            setShowAuthModal(true);
          }}
        />
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MediNearMain />
    </AuthProvider>
  );
}
