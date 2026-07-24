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
    <html>
      <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <h1>🔍 URL Audit Service</h1>
        <p>Built for Digital Heroes Training Task</p>
        <a href="https://digitalheroesco.com" target="_blank">Digital Heroes</a>
      </body>
    </html>
  `);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
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
      responseTimeMs: response.headers['x-response-time'] || 'N/A',
      contentLength: response.data.length,
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 URL Audit Service running on port ${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/health`);
  console.log(`🔍 Test: http://localhost:${PORT}/api/audit?url=https://example.com`);
});