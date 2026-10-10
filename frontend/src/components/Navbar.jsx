import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  AlertCircle,
  Search,
  Pill,
  MapPin,
  Clock,
  Store,
  ShieldCheck,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Activity,
  Ambulance,
  HeartPulse
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenAuth }) {
  const { user, isAuthenticated, logout, loginAsDemo } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isHeroPage = activeTab === 'search';
  const isSolid = !isHeroPage || scrolled;
  const textColor = isSolid ? 'var(--text-secondary)' : 'rgba(255,255,255,0.85)';
  const activeColor = isSolid ? 'var(--blue-deep)' : '#ffffff';

  const handleNavClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <header className={`header-nav${isSolid ? ' scrolled' : ''}`}>
      <div className="nav-inner">
        {/* Brand Logo */}
        <div className="brand-logo" onClick={() => handleNavClick('search')}>
          <div className="brand-icon-wrap">
            <Activity size={22} strokeWidth={2.6} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="brand-title" style={{ color: isSolid ? 'var(--blue-deep)' : '#ffffff' }}>HealthSync</span>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, color: isSolid ? 'var(--blue-bright)' : 'rgba(227,242,255,0.95)', letterSpacing: '-0.03em' }}>medSearch</span>
              <span className="brand-badge" style={{ background: isSolid ? 'rgba(24,131,255,0.1)' : 'rgba(255,255,255,0.15)', color: isSolid ? 'var(--blue-deep)' : '#ffffff', border: isSolid ? '1px solid rgba(24,131,255,0.3)' : '1px solid rgba(255,255,255,0.3)' }}>24/7 SOS</span>
            </div>
            <p style={{ fontSize: '0.72rem', color: isSolid ? 'var(--text-muted)' : 'rgba(220,235,255,0.7)', lineHeight: 1 }}>
              Emergency Medicine Finder
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-links">
          <button
            className={`nav-item ${activeTab === 'search' ? 'active' : ''}`}
            style={{ color: activeTab === 'search' ? activeColor : textColor }}
            onClick={() => handleNavClick('search')}
          >
            <Search size={16} />
            Emergency Search
          </button>

          <button
            className={`nav-item ${activeTab === 'medicines' ? 'active' : ''}`}
            style={{ color: activeTab === 'medicines' ? activeColor : textColor }}
            onClick={() => handleNavClick('medicines')}
          >
            <Pill size={16} />
            Medicine Catalog
          </button>

          <button
            className={`nav-item ${activeTab === 'pharmacies' ? 'active' : ''}`}
            style={{ color: activeTab === 'pharmacies' ? activeColor : textColor }}
            onClick={() => handleNavClick('pharmacies')}
          >
            <MapPin size={16} />
            Pharmacies
          </button>

          <button
            className={`nav-item ${activeTab === 'ambulance' ? 'active' : ''}`}
            style={{ color: activeTab === 'ambulance' ? activeColor : textColor }}
            onClick={() => handleNavClick('ambulance')}
          >
            <Ambulance size={16} />
            Ambulance 24/7
          </button>

          <button
            className={`nav-item ${activeTab === 'physiotherapy' ? 'active' : ''}`}
            style={{ color: activeTab === 'physiotherapy' ? activeColor : textColor }}
            onClick={() => handleNavClick('physiotherapy')}
          >
            <HeartPulse size={16} />
            Physiotherapy
          </button>

          {isAuthenticated && (
            <button
              className={`nav-item ${activeTab === 'reservations' ? 'active' : ''}`}
              style={{ color: activeTab === 'reservations' ? activeColor : textColor }}
              onClick={() => handleNavClick('reservations')}
            >
              <Clock size={16} />
              My Reservations
            </button>
          )}

          {isAuthenticated && (user?.role === 'PHARMACY' || user?.role === 'ADMIN') && (
            <button
              className={`nav-item ${activeTab === 'pharmacy-portal' ? 'active' : ''}`}
              style={{ color: activeTab === 'pharmacy-portal' ? activeColor : textColor }}
              onClick={() => handleNavClick('pharmacy-portal')}
            >
              <Store size={16} />
              Pharmacy Portal
            </button>
          )}

          {isAuthenticated && user?.role === 'ADMIN' && (
            <button
              className={`nav-item ${activeTab === 'admin' ? 'active' : ''}`}
              style={{ color: activeTab === 'admin' ? activeColor : textColor }}
              onClick={() => handleNavClick('admin')}
            >
              <ShieldCheck size={16} />
              Admin
            </button>
          )}
        </nav>

        {/* Right Action / Auth */}
        <div className="nav-actions">
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div 
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: user.role === 'ADMIN' ? '#818cf8' : (user.role === 'PHARMACY' ? '#06b6d4' : '#10b981'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    color: '#000'
                  }}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div style={{ lineHeight: 1.1 }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#fff' }}>{user.name}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{user.role}</div>
                </div>
              </div>

              <button
                className="btn btn-secondary btn-sm"
                onClick={logout}
                title="Log Out"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ position: 'relative' }}>
                <select 
                  className="location-dropdown" 
                  onChange={(e) => {
                    if (e.target.value) {
                      loginAsDemo(e.target.value);
                    }
                  }}
                  defaultValue=""
                  style={{ fontSize: '0.82rem', padding: '7px 10px' }}
                >
                  <option value="" disabled>Quick Demo Login ⚡</option>
                  <option value="USER">Patient / User</option>
                  <option value="PHARMACY">Pharmacy Owner</option>
                  <option value="ADMIN">System Admin</option>
                </select>
              </div>

              <button 
                className="btn btn-emergency btn-sm"
                onClick={onOpenAuth}
              >
                <UserIcon size={15} />
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
