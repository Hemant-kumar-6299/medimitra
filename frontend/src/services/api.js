// API Client configured for MediNear Spring Boot backend
// VITE_API_BASE_URL is set via Vercel environment variables (e.g. https://your-backend.up.railway.app/api)
// Falls back to localhost:8080 for local development

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const getHeaders = (hasBody = true) => {
  const headers = {};
  if (hasBody) {
    headers['Content-Type'] = 'application/json';
  }
  const token = localStorage.getItem('medinear_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  let data;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg = (data && data.message) ? data.message : (typeof data === 'string' ? data : 'API Request Failed');
    throw new ApiError(errorMsg, response.status, data);
  }

  // MediNear backend returns ApiResponse<T> = { success, message, data, timestamp }
  return data && data.data !== undefined ? data.data : data;
};

const FALLBACK_MEDICINES = [
  { id: 1, name: 'Insulin Glargine 100 IU/ml', category: 'Diabetes / Endocrine', manufacturer: 'Sanofi Healthcare', description: 'Long-acting basal insulin analog for 24-hour glycemic control in emergency diabetic care and stabilization.' },
  { id: 2, name: 'Salbutamol Inhaler 100mcg', category: 'Respiratory / Asthma', manufacturer: 'Cipla Respiratory', description: 'Fast-acting bronchodilator for rapid relief of severe acute bronchospasm and emergency asthma attacks.' },
  { id: 3, name: 'Nitroglycerin Sublingual 0.5mg', category: 'Cardiovascular / Emergency', manufacturer: 'Sun Pharma', description: 'Immediate coronary vasodilator indicated for acute angina pectoris and emergency cardiac episodes.' },
  { id: 4, name: 'Epinephrine Auto-Injector 0.3mg', category: 'Emergency / Critical', manufacturer: 'Mylan Specialty', description: 'Emergency intramuscular injection for life-threatening anaphylactic reactions and severe shock.' },
  { id: 5, name: 'Azithromycin 500mg Tablets', category: 'Antibiotic', manufacturer: 'Pfizer India', description: 'Macrolide broad-spectrum antibiotic indicated for severe lower respiratory tract and acute bacterial infections.' },
  { id: 6, name: 'Amoxicillin + Clavulanate 625mg', category: 'Antibiotic', manufacturer: 'GlaxoSmithKline', description: 'Potent beta-lactamase inhibitor combined antibiotic for systemic bacterial infections and sepsis prevention.' },
  { id: 7, name: 'Paracetamol 650mg Fast-Action', category: 'Analgesic / Antipyretic', manufacturer: 'Micro Labs (Dolo)', description: 'First-line clinical antipyretic and analgesic for rapid management of high acute fever and pain.' },
  { id: 8, name: 'Atorvastatin 20mg Tablets', category: 'Cardiovascular', manufacturer: 'Zydus Cadila', description: 'HMG-CoA reductase inhibitor for dyslipidemia and acute cardiovascular event prevention.' },
  { id: 9, name: 'Metformin Hydrochloride 500mg SR', category: 'Diabetes / Endocrine', manufacturer: 'USV Pharma', description: 'Biguanide antihyperglycemic formulation for sustained glycemic control in type 2 diabetes.' },
  { id: 10, name: 'Ciprofloxacin 500mg Tablets', category: 'Antibiotic', manufacturer: 'Bayer Healthcare', description: 'Fluoroquinolone antimicrobial agent for complicated urinary tract and severe systemic infections.' },
  { id: 11, name: 'ORS WHO Electrolyte Formula Sachet', category: 'Gastrointestinal / Emergency', manufacturer: 'FDC Limited', description: 'Standardized oral rehydration salts for acute dehydration resulting from diarrheal or heat shock.' },
  { id: 12, name: 'Ondansetron 4mg Fast Dissolve', category: 'Gastrointestinal', manufacturer: 'Dr. Reddy’s Labs', description: 'Selective 5-HT3 receptor antagonist antiemetic for rapid control of acute nausea and vomiting.' }
];

const FALLBACK_PHARMACIES = [
  { id: 1, name: 'Apollo Pharmacy 24/7', address: 'Plot 12, Knowledge Park II, Greater Noida, UP', phone: '+91-120-2345678', isOpen: true, verified: true, openingTime: '24 Hours SOS', distanceKm: 0.8 },
  { id: 2, name: 'MedPlus 24x7 Superstore', address: 'Commercial Complex, Alpha 1, Greater Noida, UP', phone: '+91-120-4567890', isOpen: true, verified: true, openingTime: '24 Hours SOS', distanceKm: 1.4 },
  { id: 3, name: 'Fortis Emergency Dispensary', address: 'B-22 Sector 62, Institutional Area, Noida, UP', phone: '+91-120-5678901', isOpen: true, verified: true, openingTime: '24 Hours SOS', distanceKm: 3.2 },
  { id: 4, name: 'Guardian Health & Pharmacy', address: 'Shop 4, Pari Chowk Metro Station, Greater Noida', phone: '+91-120-6789012', isOpen: false, verified: true, openingTime: '8:00 AM - 11:00 PM', distanceKm: 2.1 },
  { id: 5, name: 'Sanjivani Chemist & Surgicals', address: 'Block C, Sector 18 Market, Noida, UP', phone: '+91-120-7890123', isOpen: true, verified: false, openingTime: '9:00 AM - 10:30 PM', distanceKm: 5.6 },
  { id: 6, name: 'Max Healthcare In-House Pharmacy', address: 'Max Hospital Complex, W-3 Greater Noida', phone: '+91-120-8901234', isOpen: true, verified: true, openingTime: '24 Hours SOS', distanceKm: 4.0 }
];

const FALLBACK_INVENTORY = [
  { id: 101, medicineId: 1, medicineName: 'Insulin Glargine 100 IU/ml', medicineManufacturer: 'Sanofi Healthcare', medicineCategory: 'Diabetes / Endocrine', quantity: 18, price: 680.00, available: true },
  { id: 102, medicineId: 2, medicineName: 'Salbutamol Inhaler 100mcg', medicineManufacturer: 'Cipla Respiratory', medicineCategory: 'Respiratory / Asthma', quantity: 24, price: 145.50, available: true },
  { id: 103, medicineId: 3, medicineName: 'Nitroglycerin Sublingual 0.5mg', medicineManufacturer: 'Sun Pharma', medicineCategory: 'Cardiovascular / Emergency', quantity: 8, price: 92.00, available: true },
  { id: 104, medicineId: 4, medicineName: 'Epinephrine Auto-Injector 0.3mg', medicineManufacturer: 'Mylan Specialty', medicineCategory: 'Emergency / Critical', quantity: 5, price: 1850.00, available: true },
  { id: 105, medicineId: 5, medicineName: 'Azithromycin 500mg Tablets', medicineManufacturer: 'Pfizer India', medicineCategory: 'Antibiotic', quantity: 45, price: 120.00, available: true },
  { id: 106, medicineId: 7, medicineName: 'Paracetamol 650mg Fast-Action', medicineManufacturer: 'Micro Labs (Dolo)', medicineCategory: 'Analgesic / Antipyretic', quantity: 120, price: 32.00, available: true }
];

export const api = {
  // --- Auth APIs ---
  login: async (credentials) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(credentials),
    });
    return handleResponse(res);
  },

  register: async (userData) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(userData),
    });
    return handleResponse(res);
  },

  getCurrentUser: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getHeaders(false),
    });
    return handleResponse(res);
  },

  // --- Medicine & Emergency Search APIs ---
  getAllMedicines: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/medicines`, {
        headers: getHeaders(false),
      });
      return await handleResponse(res);
    } catch (err) {
      console.warn('Backend unavailable, using catalog fallback data:', err.message);
      return FALLBACK_MEDICINES;
    }
  },

  searchMedicines: async (name) => {
    try {
      const query = name ? `?name=${encodeURIComponent(name)}` : '';
      const res = await fetch(`${API_BASE_URL}/medicines/search${query}`, {
        headers: getHeaders(false),
      });
      return await handleResponse(res);
    } catch (err) {
      const q = (name || '').toLowerCase();
      return FALLBACK_MEDICINES.filter(m => m.name.toLowerCase().includes(q));
    }
  },

  emergencySearch: async (params) => {
    try {
      const searchParams = new URLSearchParams();
      if (params.name) searchParams.append('name', params.name);
      if (params.lat != null) searchParams.append('lat', params.lat);
      if (params.lng != null) searchParams.append('lng', params.lng);
      if (params.radius != null) searchParams.append('radius', params.radius);

      const res = await fetch(`${API_BASE_URL}/medicines/emergency-search?${searchParams.toString()}`, {
        headers: getHeaders(false),
      });
      return await handleResponse(res);
    } catch (err) {
      console.warn('Backend unavailable, using emergency search fallback:', err.message);
      return FALLBACK_PHARMACIES.map((p, idx) => ({
        pharmacyId: p.id,
        pharmacyName: p.name,
        pharmacyAddress: p.address,
        pharmacyPhone: p.phone,
        latitude: 28.4744 + (idx * 0.005),
        longitude: 77.5040 + (idx * 0.005),
        isOpen: p.isOpen,
        verified: p.verified,
        distanceKm: p.distanceKm,
        medicineId: 1,
        medicineName: params.name ? params.name : 'Insulin Glargine',
        medicineCategory: 'Emergency Prescription',
        medicineManufacturer: 'Certified Pharma',
        quantity: 12 + idx * 4,
        price: 240 + idx * 30,
        available: true,
      }));
    }
  },

  createMedicine: async (medicineData) => {
    const res = await fetch(`${API_BASE_URL}/medicines`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(medicineData),
    });
    return handleResponse(res);
  },

  // --- Pharmacy APIs ---
  getAllPharmacies: async (lat, lng) => {
    try {
      const query = (lat != null && lng != null) ? `?lat=${lat}&lng=${lng}` : '';
      const res = await fetch(`${API_BASE_URL}/pharmacies${query}`, {
        headers: getHeaders(false),
      });
      return await handleResponse(res);
    } catch (err) {
      console.warn('Backend unavailable, using fallback pharmacies:', err.message);
      return FALLBACK_PHARMACIES;
    }
  },

  getMyPharmacy: async () => {
    const res = await fetch(`${API_BASE_URL}/pharmacies/my`, {
      headers: getHeaders(false),
    });
    return handleResponse(res);
  },

  registerPharmacy: async (pharmacyData) => {
    const res = await fetch(`${API_BASE_URL}/pharmacies`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(pharmacyData),
    });
    return handleResponse(res);
  },

  updatePharmacy: async (id, pharmacyData) => {
    const res = await fetch(`${API_BASE_URL}/pharmacies/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(pharmacyData),
    });
    return handleResponse(res);
  },

  togglePharmacyStatus: async (id) => {
    const res = await fetch(`${API_BASE_URL}/pharmacies/${id}/toggle-status`, {
      method: 'PATCH',
      headers: getHeaders(false),
    });
    return handleResponse(res);
  },

  // --- Pharmacy Inventory APIs ---
  getPharmacyInventory: async (pharmacyId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/pharmacies/${pharmacyId}/medicines`, {
        headers: getHeaders(false),
      });
      return await handleResponse(res);
    } catch (err) {
      console.warn('Backend unavailable, using fallback inventory:', err.message);
      return FALLBACK_INVENTORY;
    }
  },

  addOrUpdateInventory: async (pharmacyId, itemData) => {
    const res = await fetch(`${API_BASE_URL}/pharmacies/${pharmacyId}/medicines`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(itemData),
    });
    return handleResponse(res);
  },

  deleteInventoryItem: async (pharmacyId, medicineId) => {
    const res = await fetch(`${API_BASE_URL}/pharmacies/${pharmacyId}/medicines/${medicineId}`, {
      method: 'DELETE',
      headers: getHeaders(false),
    });
    return handleResponse(res);
  },

  // --- Reservation APIs ---
  createReservation: async (reservationData) => {
    const res = await fetch(`${API_BASE_URL}/reservations`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(reservationData),
    });
    return handleResponse(res);
  },

  getMyReservations: async () => {
    const res = await fetch(`${API_BASE_URL}/reservations/my`, {
      headers: getHeaders(false),
    });
    return handleResponse(res);
  },

  getPharmacyReservations: async () => {
    const res = await fetch(`${API_BASE_URL}/reservations/pharmacy`, {
      headers: getHeaders(false),
    });
    return handleResponse(res);
  },

  confirmReservation: async (reservationId) => {
    const res = await fetch(`${API_BASE_URL}/reservations/${reservationId}/confirm`, {
      method: 'PUT',
      headers: getHeaders(false),
    });
    return handleResponse(res);
  },

  cancelReservation: async (reservationId) => {
    const res = await fetch(`${API_BASE_URL}/reservations/${reservationId}/cancel`, {
      method: 'PUT',
      headers: getHeaders(false),
    });
    return handleResponse(res);
  },

  completeReservation: async (reservationId) => {
    const res = await fetch(`${API_BASE_URL}/reservations/${reservationId}/complete`, {
      method: 'PUT',
      headers: getHeaders(false),
    });
    return handleResponse(res);
  },

  // --- Admin APIs ---
  getAdminStats: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: getHeaders(false),
    });
    return handleResponse(res);
  },

  getAllUsers: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: getHeaders(false),
    });
    return handleResponse(res);
  },

  verifyPharmacy: async (pharmacyId, verified) => {
    const res = await fetch(`${API_BASE_URL}/admin/pharmacies/${pharmacyId}/verify?verified=${verified}`, {
      method: 'PUT',
      headers: getHeaders(false),
    });
    return handleResponse(res);
  },
};
