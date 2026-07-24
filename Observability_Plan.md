# Observability and Monitoring Plan

## Logging

### What We Log
- Request ID (unique per request)
- HTTP Method
- URL
- Status Code
- Response Time
- Timestamp

## Metrics to Monitor

| Metric | Target | Alert Threshold | Action |
|--------|--------|-----------------|--------|
| Request Rate | <80 req/min | >80 req/min | Scale up |
| Error Rate | <5% | >5% | Investigate |
| Cache Hit Rate | >50% | <50% | Adjust TTL |
| Response Time | <2s | >2s | Optimize |
| Uptime | 99.9% | <99% | Restart |

## Health Check

**Endpoint:** GET /health

**Response:**
{
  "status": "OK",
  "timestamp": "2026-07-24T16:18:13.424Z",
  "uptime": 3600,
  "cacheSize": 5,
  "version": "1.0.0"
}

## Rollback Strategy

### Trigger for Rollback
- Error rate >10%
- Response time >5s

### Rollback Steps
1. Identify issue from logs
2. Revert to previous deployment
3. Investigate root cause
4. Fix in development
5. Redeploy with fix

## Monitoring Tools

| Tool | Purpose |
|------|---------|
| Render.com Dashboard | Uptime monitoring |
| Render.com Logs | Error logging |
| Health Check | Service status |