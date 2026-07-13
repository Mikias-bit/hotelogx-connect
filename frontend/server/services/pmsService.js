export const pmsService = {
  async identifyGuest(senderId) {
    // Mock PMS lookup
    return {
      id: 'GUEST_123',
      name: 'John Doe',
      room: '404',
      status: 'In-House',
      checkOut: '2026-05-10',
      folio: 250.50
    };
  },

  async checkAvailability(serviceType, date) {
    // Mock availability check
    return true;
  },

  async updateFolio(guestId, amount, description) {
    // Mock folio update
    return { success: true, newBalance: 350.50 };
  }
};
