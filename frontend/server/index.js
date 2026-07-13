import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { orchestrator } from './orchestrator.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Webhook routes
app.post('/api/webhooks/whatsapp', async (req, res) => {
  console.log('Incoming WhatsApp message:', req.body);
  const result = await orchestrator.handleIncomingMessage({
    channel: 'whatsapp',
    payload: req.body
  });
  res.status(200).json(result);
});

app.post('/api/webhooks/email', async (req, res) => {
  console.log('Incoming Email:', req.body);
  const result = await orchestrator.handleIncomingMessage({
    channel: 'email',
    payload: req.body
  });
  res.status(200).json(result);
});

// Analytics & Dashboard routes
app.get('/api/analytics/overview', (req, res) => {
  res.json({
    totalConversations: 1250,
    aiSuccessRate: 85,
    escalationRate: 12,
    avgResponseTime: '1.2m'
  });
});

app.listen(PORT, () => {
  console.log(`AI Decision System running on port ${PORT}`);
});
