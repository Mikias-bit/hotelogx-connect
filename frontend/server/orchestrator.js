import { aiService } from './services/aiService.js';
import { pmsService } from './services/pmsService.js';
import { conversationService } from './services/conversationService.js';
import { escalationService } from './services/escalationService.js';
import { logger } from './utils/logger.js';

export const orchestrator = {
  async handleIncomingMessage({ channel, payload }) {
    const { message, senderId } = this.parsePayload(channel, payload);
    
    logger.logEvent('incoming_message', { channel, senderId, message });

    // 1. Maintain Conversation State
    let context = await conversationService.getConversation(senderId);
    
    // 2. Identify Guest via PMS
    const guest = await pmsService.identifyGuest(senderId);
    context.guest = guest;

    // 3. Decide via AI Orchestration
    const aiDecision = await aiService.analyzeIntent(message, context);
    
    logger.logEvent('ai_decision', { intent: aiDecision.intent, confidence: aiDecision.confidence });

    // 4. Decision Logic Flow
    if (aiDecision.confidence < 0.7 || aiDecision.needsHuman) {
      return await escalationService.escalateToHuman(senderId, message, context);
    }

    // 5. Tool Triggering (e.g. Late Checkout)
    if (aiDecision.toolRequired) {
      const toolResult = await this.triggerTool(aiDecision.toolName, aiDecision.toolArgs, context);
      return await this.sendResponse(channel, senderId, toolResult.message);
    }

    // 6. Direct AI Response
    return await this.sendResponse(channel, senderId, aiDecision.response);
  },

  parsePayload(channel, payload) {
    // Basic parser for demonstration
    if (channel === 'whatsapp') {
      return { message: payload.text, senderId: payload.from };
    }
    return { message: payload.subject + ' ' + payload.body, senderId: payload.from };
  },

  async triggerTool(toolName, args, context) {
    logger.logEvent('tool_call', { toolName, args });
    // Dynamically call tools (mocked for now)
    return { message: `Processed ${toolName} successfully.` };
  },

  async sendResponse(channel, senderId, message) {
    logger.logEvent('outgoing_response', { channel, senderId, message });
    return { status: 'sent', message };
  }
};
