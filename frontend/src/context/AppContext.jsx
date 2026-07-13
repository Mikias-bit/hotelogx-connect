import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const AppContext = createContext();

export const ROLES = {
  SUPER_ADMIN: 'System Admin',
  PLATFORM_OPERATOR: 'Admin',
  MANAGER: 'Manager',
  GUEST_ASSISTANT: 'AI Assistant',
  HOTEL_ADMIN: 'Hotel Admin'
};

export const AppProvider = ({ children }) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [role, setRoleState] = useState(ROLES.HOTEL_ADMIN);
  const [isAuthenticated, setIsAuthenticatedState] = useState(false);
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAutoPilot, setIsAutoPilot] = useState(true);
  const [activeWorkspace, setActiveWorkspace] = useState(null); // When Super Admin enters a hotel workspace
  const [aiSettings, setAiSettings] = useState({
    tone: 'Upscale Assistant',
    detail: 70,
    autoBooking: true,
    proactiveEmpathy: true,
    sentimentGuard: true,
    polyglot: false
  });

  const updateAiSettings = (updates) => {
    setAiSettings(prev => ({ ...prev, ...updates }));
  };

  // Persistence Logic
  useEffect(() => {
    const savedUser = localStorage.getItem('stayflow_user');
    const savedRole = localStorage.getItem('stayflow_role');
    const savedAuth = localStorage.getItem('stayflow_auth');
    const token = localStorage.getItem('autopilot_token');

    if (savedAuth === 'true' && savedUser) {
      let parsedUser = JSON.parse(savedUser);
      let roleVal = savedRole;

      if (parsedUser && parsedUser.role === 'Operator') {
        parsedUser.role = ROLES.PLATFORM_OPERATOR;
        localStorage.setItem('stayflow_user', JSON.stringify(parsedUser));
      }
      if (roleVal === 'Operator') {
        roleVal = ROLES.PLATFORM_OPERATOR;
        localStorage.setItem('stayflow_role', roleVal);
      }

      setUser(parsedUser);
      setRoleState(roleVal);
      setIsAuthenticatedState(true);
    }

    if (token) {
      fetch(`${API_BASE_URL}/api/auth/me`, {
          credentials: 'include',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data && data.data.user) {
            const backendUser = data.data.user;
            const roleMapped = backendUser.role === 'super_admin' || backendUser.role === 'Super Admin' ? ROLES.SUPER_ADMIN : ROLES.PLATFORM_OPERATOR;
            const updatedUser = { ...backendUser, role: roleMapped };
            localStorage.setItem('stayflow_user', JSON.stringify(updatedUser));
            localStorage.setItem('stayflow_role', roleMapped);
            setUser(updatedUser);
            setRoleState(roleMapped);
            setIsAuthenticatedState(true);
          }
        })
        .catch(err => console.warn('Backend reachability issue on init auth me sync:', err))
        .finally(() => setIsInitializing(false));
    } else {
      setIsInitializing(false);
    }
  }, []);

  const setIsAuthenticated = (value, userData = null) => {
    if (value && userData) {
      localStorage.setItem('stayflow_auth', 'true');
      localStorage.setItem('stayflow_user', JSON.stringify(userData));
      localStorage.setItem('stayflow_role', userData.role);
      setUser(userData);
      setRoleState(userData.role);
      setIsAuthenticatedState(true);
    } else {
      fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('autopilot_token')}`
        }
      }).catch(err => console.warn('Backend logout sync:', err));

      localStorage.removeItem('autopilot_token');
      localStorage.removeItem('stayflow_auth');
      localStorage.removeItem('stayflow_user');
      localStorage.removeItem('stayflow_role');
      setUser(null);
      setIsAuthenticatedState(false);
    }
  };

  const setRole = (newRole) => {
    setRoleState(newRole);
    localStorage.setItem('stayflow_role', newRole);
  };

  // Super Admin workspace impersonation
  const enterWorkspace = (workspace) => {
    setActiveWorkspace(workspace);
    setRoleState(ROLES.PLATFORM_OPERATOR);
  };

  const exitWorkspace = () => {
    setActiveWorkspace(null);
    setRoleState(ROLES.SUPER_ADMIN);
  };
  
  const [toasts, setToasts] = useState([]);
  const [automationLogs, setAutomationLogs] = useState([]);

  const [featureToggles, setFeatureToggles] = useState({
    assignment: true,
    housekeeping: true,
    billing: true,
    alerts: true,
  });

  const [rooms, setRooms] = useState([]);

  const [bookings, setBookings] = useState([]);

  const [staff, setStaff] = useState([]);

  const [invoices, setInvoices] = useState([]);

  const [hotels, setHotels] = useState([]);

  // Fetch actual Hotels from backend
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/hotels`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data && data.data.length >= 0) {
          const formattedHotels = data.data.map(h => ({
            id: h.id,
            name: h.hotelName,
            location: 'Global',
            rooms: h.totalRooms || 100,
            plan: h.subscriptionPlan,
            status: h.aiStatus,
            isPaused: h.isPaused
          }));
          setHotels(formattedHotels);
        }
      })
      .catch(err => console.error('Failed to fetch hotels for AppContext:', err));
  }, []);

  const addHotel = async (hotelData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/hotels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotelName: hotelData.name,
          pmsProvider: 'Mews',
          plan: hotelData.plan,
          roomCount: parseInt(hotelData.rooms) || 0
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        const h = data.data;
        const formatted = {
          id: h.id,
          name: h.hotelName,
          location: hotelData.location || 'Global',
          rooms: h.totalRooms || 100,
          plan: h.subscriptionPlan,
          status: h.aiStatus,
          isPaused: h.isPaused
        };
        setHotels(prev => [formatted, ...prev]);
        addToast('Hotel created successfully!', 'success');
      } else {
        addToast(data.message || 'Failed to create hotel', 'error');
      }
    } catch (err) {
      console.error('Error creating hotel:', err);
      addToast('Error creating hotel', 'error');
    }
  };

  const updateHotel = async (id, hotelData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/hotels/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotelName: hotelData.name,
          subscriptionPlan: hotelData.plan,
          totalRooms: parseInt(hotelData.rooms) || 0,
          aiStatus: hotelData.status
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        const h = data.data;
        const formatted = {
          id: h.id,
          name: h.hotelName,
          location: hotelData.location || 'Global',
          rooms: h.totalRooms || 100,
          plan: h.subscriptionPlan,
          status: h.aiStatus,
          isPaused: h.isPaused
        };
        setHotels(prev => prev.map(item => item.id === id ? formatted : item));
        addToast('Hotel updated successfully!', 'success');
      } else {
        addToast(data.message || 'Failed to update hotel', 'error');
      }
    } catch (err) {
      console.error('Error updating hotel:', err);
      addToast('Error updating hotel', 'error');
    }
  };

  const deleteHotel = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/hotels/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setHotels(prev => prev.filter(h => h.id !== id));
        addToast('Hotel deleted successfully!', 'success');
      } else {
        addToast(data.message || 'Failed to delete hotel', 'error');
      }
    } catch (err) {
      console.error('Error deleting hotel:', err);
      addToast('Error deleting hotel', 'error');
    }
  };

  const [systemEvents, setSystemEvents] = useState([]);

  const [rolePermissions, setRolePermissions] = useState({
    [ROLES.SUPER_ADMIN]: {
      'Dashboard': { view: true, create: true, edit: true, delete: true },
      'Conversations': { view: true, create: true, edit: true, delete: true },
      'Automation Engine': { view: true, create: true, edit: true, delete: true },
      'AI Communication Rules': { view: true, create: true, edit: true, delete: true },
      'Integrations': { view: true, create: true, edit: true, delete: true },
      'Transactions': { view: true, create: true, edit: true, delete: true },
      'Analytics': { view: true, create: true, edit: true, delete: true },
      'Settings': { view: true, create: true, edit: true, delete: true },
    },
    [ROLES.HOTEL_ADMIN]: {
      'Dashboard': { view: true, create: true, edit: true, delete: true },
      'Conversations': { view: true, create: true, edit: true, delete: true },
      'Automation Engine': { view: true, create: true, edit: true, delete: true },
      'AI Communication Rules': { view: true, create: true, edit: true, delete: true },
      'Integrations': { view: true, create: true, edit: true, delete: true },
      'Transactions': { view: true, create: true, edit: true, delete: true },
      'Analytics': { view: true, create: true, edit: true, delete: true },
      'Settings': { view: true, create: true, edit: true, delete: true },
    },
    'Manager': {
      'Dashboard': { view: true, create: true, edit: true, delete: false },
      'Reservations': { view: true, create: true, edit: true, delete: false },
      'Front Office': { view: true, create: true, edit: true, delete: false },
      'Housekeeping': { view: true, create: true, edit: true, delete: false },
      'Billing & Invoices': { view: true, create: true, edit: true, delete: false },
      'Guest Experience': { view: true, create: true, edit: true, delete: false },
      'Automation Center': { view: false, create: false, edit: false, delete: false },
      'Analytics & Reports': { view: true, create: false, edit: false, delete: false },
      'Settings': { view: false, create: false, edit: false, delete: false },
    },
    'Staff': {
      'Dashboard': { view: true, create: false, edit: false, delete: false },
      'Reservations': { view: true, create: true, edit: true, delete: false },
      'Front Office': { view: true, create: true, edit: true, delete: false },
      'Housekeeping': { view: true, create: true, edit: true, delete: false },
      'Billing & Invoices': { view: false, create: false, edit: false, delete: false },
      'Guest Experience': { view: true, create: false, edit: false, delete: false },
      'Automation Center': { view: false, create: false, edit: false, delete: false },
      'Analytics & Reports': { view: false, create: false, edit: false, delete: false },
      'Settings': { view: false, create: false, edit: false, delete: false },
    },
  });

  const updateRolePermissions = (roleName, updates) => {
    setRolePermissions(prev => ({
      ...prev,
      [roleName]: updates
    }));
    addToast(`Permissions for ${roleName} updated successfully!`);
  };

  const [platformUsers, setPlatformUsers] = useState([]);

  // Fetch platform users from backend when authenticated
  useEffect(() => {
    const token = localStorage.getItem('autopilot_token');
    if (isAuthenticated && token) {
      fetch(`${API_BASE_URL}/api/auth/users`, {
          credentials: 'include',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('autopilot_token')}` }
        })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            const formatted = data.data.map(u => ({
              id: u.id,
              name: u.name,
              email: u.email,
              role: u.role === 'super_admin' || u.role === 'Super Admin' ? ROLES.SUPER_ADMIN : (u.role === 'operator' || u.role === 'Operator' ? ROLES.PLATFORM_OPERATOR : u.role),
              property: u.role === 'Super Admin' ? 'All Properties' : 'Grand AutoPilot Resort',
              status: 'Active',
              joined: u.createdAt ? u.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]
            }));
            setPlatformUsers(formatted);
          }
        })
        .catch(err => console.warn('Failed to fetch platform users for AppContext:', err));
    } else {
      setPlatformUsers([]);
    }
  }, [isAuthenticated]);

  const [pendingRequests, setPendingRequests] = useState([]);

  // Connect frontend Onboarding Requests to backend APIs dynamically
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/requests`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data && data.data.requests) {
          setPendingRequests(data.data.requests);
        }
      })
      .catch(err => console.warn('Request module sync fallback:', err));
  }, []);

  const updateRequestStatus = async (id, newStatus, updates = {}) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, ...updates })
      });
      const data = await res.json();
      if (data.success && data.data && data.data.request) {
        const r = data.data.request;
        const formatted = {
          id: r.requestId,
          hotelName: r.hotelName,
          managerName: r.contactName,
          contactName: r.contactName,
          email: r.email,
          workEmail: r.email,
          phone: r.whatsapp || '',
          whatsapp: r.whatsapp || '',
          country: 'International',
          pmsType: r.pmsProvider,
          pmsProvider: r.pmsProvider,
          roomCount: parseInt(r.roomCount) || 100,
          rooms: r.roomCount,
          plan: r.plan,
          status: r.status,
          specialist: r.specialist,
          integrationHealth: r.integrationHealth,
          notes: r.notes || '',
          date: r.createdAt.split('T')[0],
          onboardingToken: r.onboardingToken,
          operator: { name: r.specialist, role: 'Hospitality Onboarding Specialist' },
          website: r.website || '',
          hotelType: r.hotelType || 'Boutique',
          uniqueHotelId: r.uniqueHotelId || '',
          messages: r.messages ? JSON.parse(r.messages) : [],
          checklist: r.checklist ? JSON.parse(r.checklist) : [],
          timeline: r.timeline ? JSON.parse(r.timeline) : [],
          customizationReqs: r.customizationReqs || '',
          sopDocuments: r.sopDocuments ? JSON.parse(r.sopDocuments) : [],
          tempPassword: r.tempPassword
        };
        setPendingRequests(prev => prev.map(item => item.id === id ? formatted : item));
        return formatted;
      }
    } catch (err) {
      console.warn('Backend reachability issue, updating request status locally:', err);
    }
    setPendingRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus, ...updates } : r));
  };

  const addPendingRequest = async (request) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/hotel-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });
      const data = await res.json();
      if (data.success && data.data && data.data.request) {
        setPendingRequests(prev => [data.data.request, ...prev]);
        return data.data.request;
      }
    } catch (err) {
      console.warn('Backend reachability issue, adding request locally:', err);
    }
    const reqObj = {
      id: `REQ-${Math.floor(100 + Math.random() * 900)}`,
      hotelName: request.hotelName,
      email: request.workEmail || request.email,
      plan: request.plan || 'Trial',
      status: 'Request Received',
      date: new Date().toISOString().split('T')[0],
      specialist: 'Unassigned',
      integrationHealth: 'Pending',
      rooms: request.roomCount || '100',
      pms: request.pmsProvider || 'Mews',
      whatsapp: request.whatsapp || '',
      contactName: request.fullName || '',
      notes: request.notes || ''
    };
    setPendingRequests(prev => [reqObj, ...prev]);
  };

  const [subscriptions, setSubscriptions] = useState([]);

  // Fetch actual Subscription Plans from backend
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/plans`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          const formattedPlans = data.data.map(p => ({
            ...p,
            features: typeof p.features === 'string' ? p.features.split(',').map(f => f.trim()) : p.features
          }));
          setSubscriptions(formattedPlans);
        }
      })
      .catch(err => console.error('Failed to fetch plans for AppContext:', err));
  }, []);

  const [platformSettings, setPlatformSettings] = useState({
    name: 'AutoPilot SaaS',
    currency: 'USD',
    timezone: 'UTC+0',
    notificationsEnabled: true
  });

  const [notifications, setNotifications] = useState([]);

  const [guests, setGuests] = useState([]);

  // Connect frontend Guest module to backend APIs dynamically
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/guests`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data && data.data.guests) {
          setGuests(data.data.guests);
        }
      })
      .catch(err => console.warn('Guest module sync fallback:', err));
  }, []);

  const addGuest = async (newGuest) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/guests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGuest)
      });
      const data = await res.json();
      if (data.success && data.data && data.data.guest) {
        setGuests(prev => [data.data.guest, ...prev]);
        addToast('Guest registered successfully!');
        return;
      }
    } catch (err) {
      console.warn('Backend reachability issue, adding guest locally:', err);
    }
    const id = Date.now();
    setGuests(prev => [{ id, ...newGuest }, ...prev]);
    addToast('Guest registered locally!');
  };

  const updateGuest = async (id, updates) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/guests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (data.success && data.data && data.data.guest) {
        setGuests(prev => prev.map(g => g.id === id ? { ...g, ...data.data.guest } : g));
        addToast('Guest profile updated successfully!');
        return;
      }
    } catch (err) {
      console.warn('Backend reachability issue, updating guest locally:', err);
    }
    setGuests(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
    addToast('Guest profile updated locally!');
  };

  const deleteGuest = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/api/guests/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Backend reachability issue, deleting guest locally:', err);
    }
    setGuests(prev => prev.filter(g => g.id !== id));
    addToast('Guest profile removed successfully!');
  };

  const [knowledgeDocs, setKnowledgeDocs] = useState([]);

  const addKnowledgeDoc = (doc) => {
    setKnowledgeDocs(prev => [doc, ...prev]);
    addToast(`${doc.name} synchronized to vector database.`);
  };

  const deleteKnowledgeDoc = (id) => {
    setKnowledgeDocs(prev => prev.filter(d => d.id !== id));
    addToast('Document deleted from RAG pipeline successfully.', 'success');
  };

  const updateKnowledgeDoc = (id, updates) => {
    setKnowledgeDocs(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const addSystemEvent = (message, type = 'info') => {
    const newEvent = {
      id: Date.now() + Math.random(),
      type,
      message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setSystemEvents(prev => [newEvent, ...prev]);
  };

  const addAutomationLog = (action, details) => {
    const newLog = {
      id: Date.now() + Math.random(),
      action,
      details,
      time: 'Just now'
    };
    setAutomationLogs(prev => [newLog, ...prev]);
  };

  const updateRoomStatus = (roomId, updates) => {
    setRooms(prev => prev.map(room => room.id === roomId ? { ...room, ...updates } : room));
    if (updates.status) addSystemEvent(`Room ${roomId} status changed to ${updates.status}`);
  };

  const addBooking = (newBooking) => {
    const id = `BK-${Math.floor(Math.random() * 9000) + 1000}`;
    let assignedRoom = newBooking.room;

    const booking = { id, status: 'confirmed', paymentStatus: 'pending', ...newBooking, room: assignedRoom };
    setBookings(prev => [...prev, booking]);
    
    if (assignedRoom) {
      updateRoomStatus(assignedRoom, { status: 'occupied', guest: newBooking.guestName });
    }
    
    addToast('New booking added successfully!');
    addSystemEvent(`New booking ${id} for ${newBooking.guestName}`);
    return true;
  };

  const updateBooking = (id, updates) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    addToast('Booking updated successfully!');
    return true;
  };

  const deleteBooking = (id) => {
    const booking = bookings.find(b => b.id === id);
    if (booking && booking.room) {
      updateRoomStatus(booking.room, { status: 'vacant', guest: null });
    }
    setBookings(prev => prev.filter(b => b.id !== id));
    addToast('Booking deleted');
  };

  const checkInGuest = (bookingId, roomId) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      updateBooking(bookingId, { status: 'IN_HOUSE', room: roomId || booking.room });
      updateRoomStatus(roomId || booking.room, { status: 'occupied', guest: booking.guestName });
      addToast('Guest checked in successfully!', 'success');
      addSystemEvent(`${booking.guestName} checked in to Room ${roomId || booking.room}`);
    }
  };

  const [loyaltyRules, setLoyaltyRules] = useState({
    minSpend: 1000,
    minVisits: 5
  });

  const checkOutGuest = (bookingId, services = [], paymentInfo = { status: 'paid', method: 'Credit Card' }) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      updateBooking(bookingId, { status: 'completed', paymentStatus: paymentInfo.status });
      updateRoomStatus(booking.room, { status: 'vacant', cleaning: 'dirty', guest: null });
      
      // Auto-generate invoice
      const roomCharges = booking.amount || 0;
      const servicesTotal = services.reduce((acc, s) => acc + (parseFloat(s.price) * s.qty), 0);
      const taxRate = 0.12; // 12% mock tax
      const subtotal = roomCharges + servicesTotal;
      const taxAmount = subtotal * taxRate;
      const total = subtotal + taxAmount;

      const newInvoice = {
        id: `INV-${Date.now().toString().slice(-4)}`,
        bookingId: booking.id,
        guestName: booking.guestName,
        room: booking.room,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        amount: total,
        status: paymentInfo.status === 'paid' ? 'Paid' : 'Unpaid',
        method: paymentInfo.method,
        date: new Date().toISOString().split('T')[0],
        details: {
          roomCharges,
          services,
          subtotal,
          taxRate: 12,
          taxAmount,
          total
        }
      };

      // Update guest stats
      setGuests(prev => prev.map(g => {
        if (g.name === booking.guestName) {
          return {
            ...g,
            spent: g.spent + total,
            visits: g.visits + 1
          };
        }
        return g;
      }));

      setInvoices(prev => [newInvoice, ...prev]);
      addToast('Checkout completed! Invoice generated.', 'success');
      addSystemEvent(`${booking.guestName} checked out. Invoice ${newInvoice.id} created.`);
    }
  };

  const addInvoice = (invoice) => {
    setInvoices(prev => [invoice, ...prev]);
    addToast('Invoice created successfully!');
  };

  const updateInvoiceStatus = (id, status, method) => {
    setInvoices(prev => prev.map(inv => 
      inv.id === id ? { ...inv, status, method: method || inv.method } : inv
    ));
    addToast(`Invoice ${id} marked as ${status}`);
  };

  const assignHousekeeping = (roomId, staffId) => {
    const staffMember = staff.find(s => s.id === staffId);
    if (staffMember) {
      updateRoomStatus(roomId, { assignedStaff: staffMember.name });
      addToast(`Room ${roomId} assigned to ${staffMember.name}`, 'success');
      addSystemEvent(`Room ${roomId} assigned to ${staffMember.name}`);
    }
  };

  const markRoomMaintenance = (roomId) => {
    updateRoomStatus(roomId, { status: 'maintenance', cleaning: 'out_of_order' });
    addToast(`Room ${roomId} marked as Out of Order`, 'warning');
    addSystemEvent(`Room ${roomId} moved to Maintenance`);
  };

  const approveRequest = (req) => {
    updateRequestStatus(req.id, 'Approved');
    addToast(`Request for ${req.hotelName} approved!`, 'success');
  };

  const rejectRequest = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/api/requests/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Backend reachability issue, deleting request locally:', err);
    }
    setPendingRequests(prev => prev.filter(r => r.id !== id));
    addToast('Request rejected', 'warning');
  };

  // SaaS Billing & Subscription Context States & APIs
  const [hotelSubscription, setHotelSubscription] = useState(null);
  const [adminRevenueMetrics, setAdminRevenueMetrics] = useState(null);
  const [adminSubscriptions, setAdminSubscriptions] = useState([]);
  const [adminFailedPayments, setAdminFailedPayments] = useState([]);
  const [adminInvoices, setAdminInvoices] = useState([]);
  const [plans, setPlans] = useState([]);

  const fetchPlans = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/plans`);
      const data = await res.json();
      if (data.success) {
        setPlans(data.data);
        return data.data;
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
    }
    return [];
  };

  const addPlan = async (planData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planData)
      });
      const data = await res.json();
      if (data.success) {
        setPlans(prev => [...prev, data.data]);
        addToast('New subscription tier created!', 'success');
        return data.data;
      }
    } catch (err) {
      console.error('Error adding plan:', err);
    }
    return null;
  };

  const deletePlan = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/plans/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setPlans(prev => prev.filter(p => p.id !== id));
        addToast('Subscription tier removed.', 'warning');
        return true;
      }
    } catch (err) {
      console.error('Error deleting plan:', err);
    }
    return false;
  };

  const fetchHotelSubscription = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/billing/hotel/${id}/subscription`);
      const data = await res.json();
      if (data.success) {
        setHotelSubscription(data.data);
        return data.data;
      }
    } catch (err) {
      console.error('Error fetching hotel subscription:', err);
    }
    return null;
  };

  const updateHotelSubscription = async (id, billingData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/billing/hotel/${id}/subscription`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(billingData)
      });
      const data = await res.json();
      if (data.success) {
        setHotelSubscription(data.data);
        addToast('Payment method authorized and updated!', 'success');
        return data.data;
      } else {
        addToast(data.message || 'Failed to update billing details', 'error');
      }
    } catch (err) {
      console.error('Error updating hotel subscription:', err);
      addToast('Error saving billing details', 'error');
    }
    return null;
  };

  const changePlan = async (id, newPlan, customPrice) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/billing/hotel/${id}/subscription/plan`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPlan, customPrice })
      });
      const data = await res.json();
      if (data.success) {
        setHotelSubscription(data.data);
        addToast(`Plan updated to ${newPlan}!`, 'success');
        return data.data;
      }
    } catch (err) {
      console.error('Error changing plan:', err);
    }
    return null;
  };

  const pauseSubscription = async (id, pause) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/billing/hotel/${id}/subscription/pause`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pause })
      });
      const data = await res.json();
      if (data.success) {
        setHotelSubscription(data.data);
        addToast(pause ? 'Subscription paused.' : 'Subscription resumed!', 'success');
        return data.data;
      }
    } catch (err) {
      console.error('Error pausing subscription:', err);
    }
    return null;
  };

  const fetchHotelInvoices = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/billing/hotel/${id}/invoices`);
      const data = await res.json();
      if (data.success) {
        return data.data;
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
    }
    return [];
  };

  const fetchAdminRevenue = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/billing/admin/revenue`);
      const data = await res.json();
      if (data.success) {
        setAdminRevenueMetrics(data.data);
        return data.data;
      }
    } catch (err) {
      console.error('Error fetching admin revenue metrics:', err);
    }
    return null;
  };

  const fetchAdminSubscriptions = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/billing/admin/subscriptions`);
      const data = await res.json();
      if (data.success) {
        setAdminSubscriptions(data.data);
        return data.data;
      }
    } catch (err) {
      console.error('Error fetching admin subscriptions:', err);
    }
    return [];
  };

  const fetchAdminFailedPayments = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/billing/admin/failed-payments`);
      const data = await res.json();
      if (data.success) {
        setAdminFailedPayments(data.data);
        return data.data;
      }
    } catch (err) {
      console.error('Error fetching admin failed payments:', err);
    }
    return [];
  };

  const fetchAdminInvoices = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/billing/admin/invoices`);
      const data = await res.json();
      if (data.success) {
        setAdminInvoices(data.data);
        return data.data;
      }
    } catch (err) {
      console.error('Error fetching admin invoices:', err);
    }
    return [];
  };

  const addPlatformUser = async (userData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          password: userData.password,
          role: userData.role || 'Operator'
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        const u = data.data.user || data.data;
        const newUser = {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role === 'super_admin' || u.role === 'Super Admin' ? ROLES.SUPER_ADMIN : (u.role === 'operator' || u.role === 'Operator' ? ROLES.PLATFORM_OPERATOR : u.role),
          property: userData.property || 'Grand AutoPilot Resort',
          status: 'Active',
          joined: new Date().toISOString().split('T')[0]
        };
        setPlatformUsers(prev => [newUser, ...prev]);
        addToast('Platform user added successfully!', 'success');
      } else {
        addToast(data.message || 'Failed to add user', 'error');
      }
    } catch (err) {
      console.error('Error adding platform user:', err);
      addToast('Error adding platform user', 'error');
    }
  };

  const deletePlatformUser = async (id) => {
    const token = localStorage.getItem('autopilot_token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setPlatformUsers(prev => prev.filter(u => u.id !== id));
        addToast('User deleted successfully!', 'success');
      } else {
        addToast(data.message || 'Failed to delete user', 'error');
      }
    } catch (err) {
      console.error('Error deleting platform user:', err);
      addToast('Error deleting platform user', 'error');
    }
  };

  const updatePlatformUser = async (id, updates) => {
    const token = localStorage.getItem('autopilot_token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/users/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          name: updates.name,
          email: updates.email,
          role: updates.role === ROLES.SUPER_ADMIN ? 'Super Admin' : 'Operator',
          password: updates.password
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        const u = data.data;
        const updated = {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role === 'super_admin' || u.role === 'Super Admin' ? ROLES.SUPER_ADMIN : (u.role === 'operator' || u.role === 'Operator' ? ROLES.PLATFORM_OPERATOR : u.role),
          property: updates.property || 'Grand AutoPilot Resort',
          status: 'Active',
          joined: updates.joined || new Date().toISOString().split('T')[0]
        };
        setPlatformUsers(prev => prev.map(item => item.id === id ? updated : item));
        addToast('User details updated successfully!', 'success');
      } else {
        addToast(data.message || 'Failed to update user', 'error');
      }
    } catch (err) {
      console.error('Error updating platform user:', err);
      addToast('Error updating platform user', 'error');
    }
  };

  const addSubscription = (plan) => {
    setSubscriptions(prev => [...prev, { ...plan, id: Date.now() }]);
    addToast('Subscription plan added');
  };

  const deleteSubscription = (id) => {
    setSubscriptions(prev => prev.filter(s => s.id !== id));
    addToast('Subscription plan removed');
  };

  const updateSubscription = (id, updates) => {
    setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    addToast('Subscription plan updated');
  };

  const updatePlatformSettings = (updates) => {
    setPlatformSettings(prev => ({ ...prev, ...updates }));
    addToast('Platform settings updated');
  };

  const toggleFeatureToggle = (key) => {
    setFeatureToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAutoPilot = () => {
    setIsAutoPilot(!isAutoPilot);
    addToast(`Auto-Pilot ${!isAutoPilot ? 'Enabled' : 'Disabled'}`, 'success');
  };

  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const addNotification = (title, message, type = 'info') => {
    const newNotif = {
      id: Date.now() + Math.random(),
      title,
      message,
      time: 'Just now',
      read: false,
      type
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  // Auto-fetch active hotel subscription when user, activeWorkspace, role, or hotels change
  useEffect(() => {
    if (isAuthenticated) {
      const currentHotelId = activeWorkspace?.id || user?.hotelId || hotels[0]?.id;
      if (currentHotelId) {
        fetchHotelSubscription(currentHotelId);
      }
    } else {
      setHotelSubscription(null);
    }
  }, [isAuthenticated, role, activeWorkspace, user, hotels]);

  return (
    <AppContext.Provider value={{
      role, setRole,
      isAuthenticated, setIsAuthenticated,
      isInitializing, user, setUser,
      isSidebarOpen, setIsSidebarOpen, toggleSidebar,
      isAutoPilot, setIsAutoPilot,
      featureToggles, toggleFeatureToggle, toggleAutoPilot,
      toasts, addToast,
      automationLogs, addAutomationLog,
      rooms, updateRoomStatus, assignHousekeeping, markRoomMaintenance,
      bookings, addBooking, updateBooking, deleteBooking, checkInGuest, checkOutGuest,
      staff,
      guests, setGuests, addGuest, updateGuest, deleteGuest,
      loyaltyRules, setLoyaltyRules,
      invoices,
      hotels, addHotel, updateHotel, deleteHotel,
      systemEvents, addSystemEvent,
      platformUsers, addPlatformUser, deletePlatformUser, updatePlatformUser,
      knowledgeDocs, addKnowledgeDoc, deleteKnowledgeDoc, updateKnowledgeDoc,
      pendingRequests, approveRequest, rejectRequest, updateRequestStatus, addPendingRequest,
      subscriptions, addSubscription, deleteSubscription, updateSubscription,
      platformSettings, updatePlatformSettings,
      notifications, markNotificationRead, addNotification,
      rolePermissions, updateRolePermissions,
      aiSettings, updateAiSettings,
      activeWorkspace, enterWorkspace, exitWorkspace,
      
      // SaaS Billing Exports
      hotelSubscription, fetchHotelSubscription, updateHotelSubscription,
      changePlan, pauseSubscription, fetchHotelInvoices,
      adminRevenueMetrics, fetchAdminRevenue,
      adminSubscriptions, fetchAdminSubscriptions,
      adminFailedPayments, fetchAdminFailedPayments,
      adminInvoices, fetchAdminInvoices,
      
      // Dynamic SaaS Plan Management Exports
      plans, fetchPlans, addPlan, deletePlan
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
