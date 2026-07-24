# URL Audit Service - Architecture Diagram

## System Overview

A RESTful API service that audits websites by fetching and analyzing HTML content.

## Architecture Diagram
─────────────────────────────────────────────────────────┐
│ Client (Browser) │
└─────────────────────┬───────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────┐
│ API Gateway (Express) │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Middleware: CORS, JSON Parsing, Logging │ │
│ └─────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Rate Limiting (100 req/min) │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────┬───────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────┐
│ URL Audit Service (Business Logic) │
│ ┌─────────────────────────────────────────────────┐ │
│ │ 1. Validate URL Format │ │
│ └─────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────┐ │
│ │ 2. Check Cache (node-cache) │ │
│ └─────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────┐ │
│ │ 3. Fetch Website (Axios) │ │
│ └─────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────┐ │
│ │ 4. Parse HTML (Cheerio) │ │
│ └─────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────┐ │
│ │ 5. Extract: Title, Headings, Links │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────┬───────────────────────────────────┘
│
┌───────────┴───────────┐
▼ ▼
┌─────────────────┐ ┌─────────────────┐
│ Cache Layer │ │ External Web │
│ (node-cache) │ │ (Target URL) │
│ TTL: 5 minutes │ │ │
└─────────────────┘ └─────────────────┘


## Components

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Web Server | Express.js | Handle HTTP requests |
| HTTP Client | Axios | Fetch websites |
| HTML Parser | Cheerio | Parse and extract data |
| Cache | node-cache | Store results (5 min TTL) |
| Rate Limiter | express-rate-limit | Prevent abuse |
| Deployment | Render.com | Host the service |

## Data Flow

1. Client sends GET request with URL parameter
2. Server validates URL format
3. Check cache for existing result
4. If cached → return cached response
5. If not cached → fetch website
6. Parse HTML and extract data
7. Save to cache
8. Return JSON response