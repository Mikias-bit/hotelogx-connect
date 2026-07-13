const conversations = new Map();

export const conversationService = {
  async getConversation(senderId) {
    if (!conversations.has(senderId)) {
      conversations.set(senderId, {
        history: [],
        lastIntent: null,
        pendingActions: [],
        guestContext: null
      });
    }
    return conversations.get(senderId);
  },

  async updateConversation(senderId, updates) {
    const current = await this.getConversation(senderId);
    conversations.set(senderId, { ...current, ...updates });
  }
};
