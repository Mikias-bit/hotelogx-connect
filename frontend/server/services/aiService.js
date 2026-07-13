export const aiService = {
  async analyzeIntent(message, context) {
    const msg = message.toLowerCase();
    
    // Simple rule-based intent analyzer for demo
    // In production, this would use OpenAI/Anthropic with a system prompt and RAG
    
    if (msg.includes('checkout') || msg.includes('check out')) {
      return {
        intent: 'late_checkout',
        confidence: 0.95,
        response: 'I can help with late checkout. Let me check availability.',
        toolRequired: true,
        toolName: 'checkAvailability',
        toolArgs: { service: 'late_checkout' }
      };
    }

    if (msg.includes('wifi')) {
      return {
        intent: 'wifi_query',
        confidence: 0.98,
        response: 'The guest wifi password is "GrandHotel2026".',
        toolRequired: false
      };
    }

    if (msg.includes('human') || msg.includes('manager') || msg.includes('problem')) {
      return {
        intent: 'escalation',
        confidence: 1.0,
        needsHuman: true
      };
    }

    // Default RAG-like fallback
    return {
      intent: 'general_query',
      confidence: 0.8,
      response: 'I will check our policies and get back to you.'
    };
  }
};
