# Technology Choices

## 1. Programming Language: Node.js (JavaScript)

**Decision:** Node.js with JavaScript

**Alternatives Considered:** Python (Flask), Go (Golang)

**Why Node.js?**
- Excellent for I/O operations (fetching websites)
- Large ecosystem for web scraping
- Fast development cycle
- Easy deployment

## 2. Web Framework: Express.js

**Decision:** Express.js

**Alternatives Considered:** Koa.js, Fastify

**Why Express?**
- Industry standard for Node.js APIs
- Simple and minimal
- Excellent middleware support
- Battle-tested in production

## 3. HTTP Client: Axios

**Decision:** Axios

**Alternatives Considered:** Node-fetch

**Why Axios?**
- Built-in timeout handling
- Automatic JSON parsing
- Promise-based
- Good error handling

## 4. HTML Parser: Cheerio

**Decision:** Cheerio

**Alternatives Considered:** Puppeteer, JSDOM

**Why Cheerio?**
- Lightweight (no browser overhead)
- Fast parsing
- jQuery-like syntax
- Perfect for static HTML scraping

## 5. Caching: node-cache

**Decision:** node-cache (in-memory)

**Alternatives Considered:** Redis, Memcached

**Why node-cache?**
- No external dependencies
- Simple setup
- Configurable TTL
- Good for current scale

## 6. Rate Limiting: express-rate-limit

**Decision:** express-rate-limit

**Alternatives Considered:** Custom middleware

**Why express-rate-limit?**
- Easy to configure
- Works with Express
- Built-in IP tracking

## 7. Deployment: Render.com

**Decision:** Render.com

**Alternatives Considered:** AWS EC2, Heroku

**Why Render?**
- Free tier available
- GitHub integration
- Automatic deployments
- Built-in SSL