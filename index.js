require('dotenv').config();
const express = require('express');
const qrcode = require('qrcode');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { startBot } = require('./connection');
const { loadCommands } = require('./commands');
const connectDB = require('./lib/database');
const logger = require('./lib/logger');

const app = express();
const port = process.env.PORT || 8000;

// Security Middleware
app.use(helmet());
app.use(cors());

// Rate Limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to Database
connectDB();

// Load Commands
const commandRegistry = loadCommands();

// Start Bot
if (!global.isBotStarted) { // Prevent multiple starts in some environments
  global.isBotStarted = true;
  startBot(commandRegistry).catch(err => {
    logger.error('Failed to start bot:', err);
    process.exit(1);
  });
}

// Express Routes
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>WhatsApp Bot Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; text-align: center; padding: 50px; background: #f0f2f5; color: #1c1e21; }
            h1 { color: #075e54; }
            .card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 400px; margin: 0 auto; }
            a { color: #25d366; text-decoration: none; font-weight: bold; }
            .status { color: #25d366; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="card">
            <h1>🤖 WhatsApp Bot</h1>
            <p>Status: <span class="status">Running</span></p>
            <p><a href="/qr">📱 Scan QR Code</a></p>
            <p><a href="/health">❤️ System Health</a></p>
        </div>
      </body>
    </html>
  `);
});

app.get('/qr', async (req, res) => {
  if (global.qrCodeData) {
    try {
      const qrImage = await qrcode.toDataURL(global.qrCodeData);
      res.send(`
        <html>
          <head><title>Scan QR Code</title></head>
          <body style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column; font-family: sans-serif; background: #f0f2f5;">
            <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center;">
                <h1 style="color: #075e54;">Scan to Login</h1>
                <img src="${qrImage}" alt="QR Code" style="width: 250px; height: 250px; border: 1px solid #ddd; border-radius: 8px;" />
                <p style="color: #666; margin-top: 15px;">Reload page if code expires.</p>
            </div>
          </body>
        </html>
      `);
    } catch (err) {
      logger.error('QR Generation Error:', err);
      res.status(500).send('Error generating QR code. Please check server logs.');
    }
  } else {
    res.send(`
      <html>
        <head><title>Scan QR Code</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 50px; background: #f0f2f5;">
          <div style="background: white; padding: 30px; border-radius: 10px; max-width: 400px; margin: 0 auto; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <h1 style="color: #25d366;">✅ Connected</h1>
            <p>The bot is already connected to WhatsApp.</p>
            <p>If you need to re-scan, delete the session and restart.</p>
          </div>
        </body>
      </html>
    `);
  }
});

app.get('/health', (req, res) => {
  try {
    const memUsage = process.memoryUsage();
    res.json({
      status: 'ok',
      uptime: Math.floor(process.uptime()),
      memory: {
        rss: Math.round(memUsage.rss / 1024 / 1024) + ' MB',
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

const server = app.listen(port, () => {
  logger.info(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${port}`);
});

// Graceful Shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} signal received: closing HTTP server`);
  server.close(async () => {
    logger.info('HTTP server closed');

    try {
      // Use conditional requirement to avoid errors if mongoose isn't initialized yet
      const mongoose = require('mongoose');
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close(false);
        logger.info('MongoDB connection closed');
      }
    } catch (err) {
      logger.error('Error closing MongoDB', err);
    }

    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
