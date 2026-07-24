# Failure Mode Analysis

## 1. Network/Timeout Failures

**Scenario:** Target website takes too long to respond

**Error Code:** ECONNABORTED, ETIMEDOUT

**Mitigation:**
- 10 second timeout in Axios
- Return 408 Request Timeout

**Response:**
{
  "error": {
    "code": "AUDIT_FAILED",
    "message": "Request timeout - URL took too long to respond"
  }
}

## 2. Invalid URL Format

**Scenario:** User provides malformed URL

**Error Code:** INVALID_URL

**Mitigation:**
- Validate with new URL()
- Check for http:// or https://
- Return 400 Bad Request

**Response:**
{
  "error": {
    "code": "INVALID_URL",
    "message": "Invalid URL format. Must start with http:// or https://"
  }
}

## 3. Domain Not Found

**Scenario:** Target domain doesn't exist

**Error Code:** ENOTFOUND

**Mitigation:**
- Catch DNS resolution error
- Return 404 Not Found

**Response:**
{
  "error": {
    "code": "AUDIT_FAILED",
    "message": "URL not found - domain does not exist"
  }
}

## 4. Rate Limit Exceeded

**Scenario:** Too many requests from same IP

**Error Code:** RATE_LIMIT_EXCEEDED

**Mitigation:**
- 100 requests per minute limit
- Return 429 Too Many Requests

**Response:**
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests, please try again later"
  }
}

## 5. Cache Overflow

**Scenario:** Cache exceeds memory limits

**Mitigation:**
- Max keys: 1000
- TTL: 5 minutes
- Automatic eviction

## 6. Server Crash

**Scenario:** Unhandled exception

**Mitigation:**
- Process managers (nodemon)
- Error handling middleware
- Logging for debugging
- Automatic restart