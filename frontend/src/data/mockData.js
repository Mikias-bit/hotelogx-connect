export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  HOTEL_ADMIN: 'hotel_admin',
  FRONT_DESK: 'front_desk',
  HOUSEKEEPING: 'housekeeping',
};

export const INITIAL_HOTELS = [
  { id: 'H1', name: 'Grand AutoPilot Resort', location: 'New York, USA', admin: 'manager@grandresort.com', rooms: 120, status: 'Active', plan: 'Enterprise' },
  { id: 'H2', name: 'Azure Bay Hotel', location: 'Miami, USA', admin: 'admin@azurebay.com', rooms: 85, status: 'Active', plan: 'Standard' },
  { id: 'H3', name: 'Urban Peak Suites', location: 'London, UK', admin: 'london@urbanpeak.com', rooms: 45, status: 'Pending', plan: 'Trial' },
];

export const INITIAL_ROOMS = [
  { id: '101', type: 'Deluxe', status: 'occupied', cleaning: 'clean', guest: 'John Doe', price: 150, lastCleaned: '10:30 AM', assignedStaff: null },
  { id: '102', type: 'Deluxe', status: 'vacant', cleaning: 'dirty', guest: null, price: 150, lastCleaned: '09:15 AM', assignedStaff: null },
  { id: '103', type: 'Suite', status: 'occupied', cleaning: 'clean', guest: 'Jane Smith', price: 300, lastCleaned: '11:00 AM', assignedStaff: null },
  { id: '104', type: 'Standard', status: 'vacant', cleaning: 'clean', guest: null, price: 100, lastCleaned: 'Yesterday', assignedStaff: null },
  { id: '201', type: 'Standard', status: 'vacant', cleaning: 'clean', guest: null, price: 100, lastCleaned: '08:45 AM', assignedStaff: null },
  { id: '202', type: 'Standard', status: 'maintenance', cleaning: 'maintenance', guest: null, price: 100, lastCleaned: 'Yesterday', assignedStaff: 'Mike Ross' },
  { id: '203', type: 'Deluxe', status: 'vacant', cleaning: 'clean', guest: null, price: 150, lastCleaned: '10:00 AM', assignedStaff: null },
  { id: '204', type: 'Deluxe', status: 'occupied', cleaning: 'clean', guest: 'William Taylor', price: 150, lastCleaned: '07:45 AM', assignedStaff: null },
  { id: '205', type: 'Standard', status: 'vacant', cleaning: 'dirty', guest: null, price: 100, lastCleaned: 'Yesterday', assignedStaff: 'Maria Garcia' },
  { id: '301', type: 'Presidential', status: 'vacant', cleaning: 'clean', guest: null, price: 800, lastCleaned: '07:30 AM', assignedStaff: null },
  { id: '302', type: 'Suite', status: 'occupied', cleaning: 'dirty', guest: 'Alice Wilson', price: 300, lastCleaned: '09:00 AM', assignedStaff: 'Sarah Jenkins' },
  { id: '303', type: 'Suite', status: 'occupied', cleaning: 'clean', guest: 'Emily Clark', price: 300, lastCleaned: '11:15 AM', assignedStaff: null },
];

export const INITIAL_GUESTS = [
  { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+1 234 567 890', location: 'New York, USA', status: 'VIP', spent: 4200, bookings: 12 },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '+1 345 678 901', location: 'London, UK', status: 'Regular', spent: 1500, bookings: 4 },
  { id: 3, name: 'Michael Johnson', email: 'mike@example.com', phone: '+1 456 789 012', location: 'Berlin, DE', status: 'New', spent: 300, bookings: 1 },
  { id: 4, name: 'Robert Brown', email: 'robert@example.com', phone: '+1 567 890 123', location: 'Paris, FR', status: 'VIP', spent: 2800, bookings: 8 },
  { id: 5, name: 'Alice Wilson', email: 'alice@example.com', phone: '+1 678 901 234', location: 'Tokyo, JP', status: 'Regular', spent: 900, bookings: 3 },
  { id: 6, name: 'Emily Clark', email: 'emily@example.com', phone: '+1 789 012 345', location: 'Sydney, AU', status: 'VIP', spent: 5400, bookings: 15 },
  { id: 7, name: 'William Taylor', email: 'will@example.com', phone: '+1 890 123 456', location: 'Toronto, CA', status: 'New', spent: 450, bookings: 1 },
];

export const INITIAL_BOOKINGS = [
  { id: 'BK-1001', guestName: 'John Doe', room: '101', roomType: 'Deluxe Suite', checkIn: '2026-05-01', checkOut: '2026-05-05', status: 'checked-in', amount: 800, paymentStatus: 'paid', source: 'Direct' },
  { id: 'BK-1002', guestName: 'Jane Smith', room: '103', roomType: 'Executive Room', checkIn: '2026-05-02', checkOut: '2026-05-04', status: 'confirmed', amount: 450, paymentStatus: 'paid', source: 'Booking.com' },
  { id: 'BK-1003', guestName: 'Michael Johnson', room: '205', roomType: 'Standard Room', checkIn: '2026-05-01', checkOut: '2026-05-02', status: 'checked-out', amount: 150, paymentStatus: 'paid', source: 'Expedia' },
  { id: 'BK-1004', guestName: 'Robert Brown', room: '203', roomType: 'Deluxe Suite', checkIn: '2026-05-05', checkOut: '2026-05-10', status: 'confirmed', amount: 1200, paymentStatus: 'pending', source: 'Direct' },
  { id: 'BK-1005', guestName: 'Alice Wilson', room: '302', roomType: 'Suite', checkIn: '2026-05-03', checkOut: '2026-05-06', status: 'checked-in', amount: 900, paymentStatus: 'paid', source: 'Airbnb' },
  { id: 'BK-1006', guestName: 'Emily Clark', room: '303', roomType: 'Suite', checkIn: '2026-05-04', checkOut: '2026-05-07', status: 'checked-in', amount: 950, paymentStatus: 'paid', source: 'Direct' },
  { id: 'BK-1007', guestName: 'William Taylor', room: '204', roomType: 'Deluxe', checkIn: '2026-05-06', checkOut: '2026-05-09', status: 'confirmed', amount: 450, paymentStatus: 'paid', source: 'Booking.com' },
  { id: 'BK-1008', guestName: 'Emma Watson', room: '102', roomType: 'Deluxe', checkIn: '2026-05-01', checkOut: '2026-05-03', status: 'checked-out', amount: 300, paymentStatus: 'paid', source: 'Expedia' },
];

export const INITIAL_STAFF = [
  { id: 'S1', name: 'Maria Garcia', role: 'Housekeeping', status: 'Busy' },
  { id: 'S2', name: 'David Chen', role: 'Housekeeping', status: 'Busy' },
  { id: 'S3', name: 'Sarah Miller', role: 'Housekeeping', status: 'Available' },
  { id: 'S4', name: 'James Wilson', role: 'Maintenance', status: 'Available' },
  { id: 'S5', name: 'Mike Ross', role: 'Maintenance', status: 'Busy' },
  { id: 'S6', name: 'Anna Lee', role: 'Housekeeping', status: 'Available' },
];

export const INITIAL_INVOICES = [
  { id: 'INV-2026-001', guestName: 'John Doe', amount: 800, status: 'Paid', date: '2026-05-01', method: 'Credit Card', breakdown: { roomCharges: 650, services: 80, taxes: 70 } },
  { id: 'INV-2026-002', guestName: 'Jane Smith', amount: 450, status: 'Paid', date: '2026-05-02', method: 'Digital Wallet', breakdown: { roomCharges: 350, services: 50, taxes: 50 } },
  { id: 'INV-2026-003', guestName: 'Michael Johnson', amount: 150, status: 'Paid', date: '2026-05-02', method: 'Cash', breakdown: { roomCharges: 100, services: 30, taxes: 20 } },
  { id: 'INV-2026-004', guestName: 'Robert Brown', amount: 1200, status: 'Unpaid', date: '2026-05-03', method: 'Pending', breakdown: { roomCharges: 1000, services: 100, taxes: 100 } },
  { id: 'INV-2026-005', guestName: 'Emma Watson', amount: 350, status: 'Paid', date: '2026-05-03', method: 'Credit Card', breakdown: { roomCharges: 300, services: 20, taxes: 30 } },
  { id: 'INV-2026-006', guestName: 'Alice Wilson', amount: 950, status: 'Unpaid', date: '2026-05-04', method: 'Pending', breakdown: { roomCharges: 900, services: 0, taxes: 50 } },
  { id: 'INV-2026-007', guestName: 'Emily Clark', amount: 1100, status: 'Overdue', date: '2026-04-28', method: 'Pending', breakdown: { roomCharges: 950, services: 50, taxes: 100 } },
];

export const INITIAL_AUTOMATION_LOGS = [
  { id: 1, action: 'Auto-Assignment', details: 'Guest John Doe assigned to Room 101 (Optimal Choice)', time: '2h ago' },
  { id: 2, action: 'Night Audit', details: 'System generated 14 daily revenue reports', time: '6h ago' },
  { id: 3, action: 'Housekeeping Sync', details: '4 rooms marked Dirty after check-out', time: '1h ago' },
];

export const INITIAL_OTAS = [
  { id: 'OTA-1', name: 'Booking.com', commission: '15%', activeListings: 45 },
  { id: 'OTA-2', name: 'Expedia', commission: '18%', activeListings: 30 },
  { id: 'OTA-3', name: 'Airbnb', commission: '3%', activeListings: 12 },
  { id: 'OTA-4', name: 'Agoda', commission: '12%', activeListings: 20 }
];
