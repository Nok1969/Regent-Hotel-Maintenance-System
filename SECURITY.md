# Security Configuration

## Overview

This document outlines the comprehensive security measures implemented in the Hotel Maintenance System to protect against common web application vulnerabilities. All security issues identified in the code review have been addressed.

## ✅ Security Issues Resolved

### 1. **Global State Security Issue** ❌ → ✅
- **Problem**: `currentUser` global variable created shared state between requests
- **Solution**: Removed global state, now using only `req.session` for authentication
- **Impact**: Prevents user session conflicts and data leakage between requests

### 2. **Rate Limiting** 🔒 → ✅
- **Problem**: No request rate limiting
- **Solution**: Implemented express-rate-limit with tiered limits
  - General API: 100 requests/15 minutes
  - Auth endpoints: 5 requests/15 minutes
- **Impact**: Prevents brute force attacks and DDoS

### 3. **File Upload Error Handling** ✅ → ✅
- **Problem**: Hardcoded error throwing in fileFilter
- **Solution**: Standardized error handling with proper HTTP status codes
- **Impact**: Better error messages and security through information hiding

### 4. **Session Storage** 🔥 → ✅
- **Problem**: In-memory Map storage that doesn't persist
- **Solution**: Session-based authentication with proper cleanup
- **Impact**: Reliable authentication that survives server restarts

## Security Middleware

### 1. Helmet.js Security Headers
- **Content Security Policy (CSP)**: Prevents XSS attacks by controlling resource loading
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **Referrer Policy**: Controls referrer information sent to external sites
- **HSTS**: Forces HTTPS connections in production

### 2. CORS (Cross-Origin Resource Sharing)
- Configured to allow requests only from approved domains
- Development: localhost variations allowed
- Production: Specific domain whitelist required
- Credentials support enabled for authentication

### 3. Rate Limiting
- **General API**: 100 requests per 15 minutes per IP
- **Authentication endpoints**: 5 requests per 15 minutes per IP
- Headers indicate remaining requests and reset time
- Prevents brute force and DDoS attacks

## Input Validation & Sanitization

### 1. Schema Validation
- Zod schemas validate all incoming data
- Type checking and format validation
- Required field enforcement
- Data length and range limits

### 2. XSS Protection
- Automatic script tag removal from user inputs
- HTML encoding of user-generated content
- Safe rendering in React components

### 3. SQL Injection Prevention
- Drizzle ORM with parameterized queries
- No raw SQL string concatenation
- Input validation before database operations

## Authentication & Authorization

### 1. Session Management
- HTTP-only cookies prevent XSS access
- Secure cookie settings in production
- Session timeout and cleanup
- CSRF protection through SameSite cookies

### 2. Role-Based Access Control (RBAC)
- Four permission levels: Admin, Manager, Staff, Technician
- API endpoint protection with permission checks
- Frontend route guards based on user roles
- Principle of least privilege

### 3. Password Security
- No plaintext password storage
- Secure session token generation
- Account lockout after failed attempts (rate limiting)

## Error Handling

### 1. Global Error Handler
- Centralized error processing
- Development vs production error details
- Security-safe error messages
- Error logging with request context

### 2. 404 Handling
- Custom 404 responses for API routes
- No information disclosure about system structure
- User-friendly error messages

### 3. Validation Errors
- Detailed validation feedback in development
- Sanitized error messages in production
- No internal system information exposure

## File Upload Security

### 1. File Type Validation
- Whitelist of allowed image formats
- MIME type and extension checking
- File size limits (5MB maximum)

### 2. Upload Directory Protection
- Uploads stored outside web root when possible
- Static file serving with proper headers
- No executable file uploads

## Database Security

### 1. Connection Security
- Environment variable configuration
- Connection pooling with limits
- Database user with minimal privileges

### 2. Data Protection
- Parameterized queries only
- Input sanitization before database operations
- No sensitive data in logs

## Production Recommendations

### 1. Environment Configuration
```env
NODE_ENV=production
SESSION_SECRET=<strong-random-secret>
DATABASE_URL=<secure-connection-string>
```

### 2. HTTPS Requirements
- All production traffic over HTTPS
- Secure cookie settings enabled
- HSTS headers configured

### 3. Monitoring & Logging
- Request logging for security analysis
- Error tracking and alerting
- Rate limit monitoring

### 4. Database Security
- Regular backup procedures
- Access control and user permissions
- Connection encryption

## Security Headers Applied

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

## Rate Limiting Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640995200
```

## Vulnerability Prevention

- **XSS**: CSP headers, input sanitization, safe rendering
- **CSRF**: SameSite cookies, origin validation
- **SQL Injection**: Parameterized queries, input validation
- **Clickjacking**: X-Frame-Options header
- **MIME Sniffing**: X-Content-Type-Options header
- **DDoS**: Rate limiting, request size limits
- **Brute Force**: Authentication rate limiting
- **File Upload**: Type validation, size limits

## Security Testing

### Regular Checks
- Dependency vulnerability scanning
- Rate limit testing
- Input validation testing
- Error handling verification

### Recommended Tools
- `npm audit` for dependency vulnerabilities
- OWASP ZAP for security scanning
- Postman for API security testing