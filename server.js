const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const NodeCache = require('node-cache');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting (100 requests per minute)
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later'
    }
  }
});

// Cache (5 minutes TTL)
const cache = new NodeCache({ 
  stdTTL: 300,
  checkperiod: 60,
  maxKeys: 1000
});

// --- ROUTES ---

// Home route with credit line
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>URL Audit Service</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 50px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            margin: 0;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .container {
            background: rgba(255,255,255,0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            max-width: 600px;
          }
          h1 {
            font-size: 48px;
            margin-bottom: 10px;
          }
          .emoji {
            font-size: 64px;
          }
          .subtitle {
            font-size: 20px;
            margin-bottom: 30px;
            opacity: 0.9;
          }
          .credit {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid rgba(255,255,255,0.3);
          }
          .credit a {
            color: #ffd700;
            text-decoration: none;
            font-weight: bold;
          }
          .credit a:hover {
            text-decoration: underline;
          }
          .endpoints {
            text-align: left;
            background: rgba(0,0,0,0.2);
            padding: 20px;
            border-radius: 10px;
            margin-top: 20px;
          }
          .endpoints code {
            background: rgba(0,0,0,0.3);
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 14px;
            color: #ffd700;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="emoji">🔍</div>
          <h1>URL Audit Service</h1>
          <p class="subtitle">Analyze any website in seconds</p>
          
          <div class="endpoints">
            <h3>📌 Available Endpoints</h3>
            <p><code>GET /health</code> - Check service status</p>
            <p><code>GET /api/audit?url=https://example.com</code> - Audit a website</p>
          </div>
          
          <div class="credit">
            <p>Built for <a href="https://digitalheroesco.com" target="_blank">Digital Heroes</a> Training Task</p>
          </div>
        </div>
      </body>
    </html>
  `);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    cacheSize: cache.getStats().keys,
    version: '1.0.0'
  });
});

// Main audit endpoint
app.get('/api/audit', limiter, async (req, res) => {
  const { url } = req.query;

  console.log(`📥 Audit request received for: ${url}`);

  // Validate URL exists
  if (!url || typeof url !== 'string') {
    return res.status(400).json({
      error: {
        code: 'MISSING_URL',
        message: 'URL parameter is required. Example: ?url=https://example.com'
      }
    });
  }

  // Validate URL format
  try {
    new URL(url);
  } catch {
    return res.status(400).json({
      error: {
        code: 'INVALID_URL',
        message: 'Invalid URL format. Must start with http:// or https://'
      }
    });
  }

  // Check cache
  const cachedResult = cache.get(url);
  if (cachedResult) {
    console.log(`✅ Cache hit for: ${url}`);
    return res.json({ 
      ...cachedResult, 
      cached: true 
    });
  }

  console.log(`🔄 Cache miss for: ${url}, fetching...`);

  try {
    // Fetch the website
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    // Parse HTML with cheerio
    const $ = cheerio.load(response.data);
    
    // Extract data
    const result = {
      url,
      status: response.status,
      statusText: response.statusText,
      responseTimeMs: response.headers['x-response-time'] || 'N/A',
      contentLength: response.data.length,
      contentType: response.headers['content-type'],
      title: $('title').text().trim() || undefined,
      metaDescription: $('meta[name="description"]').attr('content') || undefined,
      headings: {
        h1: $('h1').map((_, el) => $(el).text().trim()).get().slice(0, 10),
        h2: $('h2').map((_, el) => $(el).text().trim()).get().slice(0, 10),
        h3: $('h3').map((_, el) => $(el).text().trim()).get().slice(0, 10)
      },
      links: {
        internal: $('a[href^="/"]').map((_, el) => $(el).attr('href')).get().slice(0, 20),
        external: $('a[href^="http"]').map((_, el) => $(el).attr('href')).get().slice(0, 20)
      },
      cached: false,
      timestamp: new Date().toISOString()
    };

    // Save to cache
    cache.set(url, result);
    console.log(`💾 Cached: ${url}`);

    res.json(result);
  } catch (error) {
    console.error(`❌ Error auditing ${url}:`, error.message);
    
    // Handle specific errors
    let statusCode = 500;
    let message = error.message || 'Failed to audit URL';
    
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      statusCode = 408;
      message = 'Request timeout - URL took too long to respond';
    } else if (error.response) {
      statusCode = error.response.status;
      message = `HTTP ${error.response.status} error`;
    } else if (error.code === 'ENOTFOUND') {
      statusCode = 404;
      message = 'URL not found - domain does not exist';
    }
    
    res.status(statusCode).json({
      error: {
        code: 'AUDIT_FAILED',
        message: message
      }
    });
  }
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found. Available: GET /, /health, /api/audit'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 URL Audit Service running on port ${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/health`);
  console.log(`🔍 Test: http://localhost:${PORT}/api/audit?url=https://example.com`);
});

module.exports = app;