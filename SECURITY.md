# Security Implementation Guide

## Overview

This document outlines the comprehensive security measures implemented in the Hotel Maintenance System to protect against common web vulnerabilities and ensure data integrity.

## Security Middleware Stack

### 1. Rate Limiting

**Purpose**: Prevent abuse and DDoS attacks

- **API Rate Limit**: 100 requests per 15 minutes per IP
- **Auth Rate Limit**: 5 authentication attempts per 15 minutes per IP  
- **Upload Rate Limit**: 10 file uploads per minute per IP

```typescript
// Usage
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/repairs', uploadLimiter);
```

### 2. Helmet Security Headers

**Purpose**: Set security headers to prevent common attacks

- **Content Security Policy (CSP)**: Prevents XSS attacks
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing
- **Referrer-Policy**: Controls referrer information
- **HSTS**: Forces HTTPS in production

```typescript
// Configuration
helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: process.env.NODE_ENV === "development" 
        ? ["'self'", "'unsafe-eval'", "'unsafe-inline'"] 
        : ["'self'"],
      // ... other directives
    },
  },
})
```

### 3. Input Validation & Sanitization

**Purpose**: Prevent injection attacks and data corruption

#### Express-Validator Rules

- **Repair Creation**: Validates room, category, urgency, description
- **Repair Updates**: Validates status, room, description with proper escaping
- **Query Parameters**: Validates limit, offset, search terms
- **User Management**: Validates user IDs, roles, languages

#### XSS Protection

```typescript
// Automatic script tag removal
req.params[key] = req.params[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
```

### 4. CORS Configuration

**Purpose**: Control cross-origin requests

```typescript
{
  origin: process.env.NODE_ENV === "production" 
    ? process.env.ALLOWED_ORIGINS?.split(",") || []
    : ["http://localhost:3000", "http://localhost:5000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "Origin"],
}
```

## Validation Schemas

### Repair Validation

```typescript
export const repairValidation = [
  body("room")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Room number is required and must be less than 100 characters")
    .escape(),

  body("category")
    .isIn(["electrical", "plumbing", "hvac", "furniture", "other"])
    .withMessage("Invalid category"),

  body("urgency")
    .isIn(["low", "medium", "high"])
    .withMessage("Invalid urgency level"),

  body("description")
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters")
    .escape(),
];
```

### Parameter Validation

```typescript
export const queryValidation = [
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100")
    .toInt(),

  query("offset")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Offset must be a non-negative integer")
    .toInt(),
];
```

## Error Handling

### Global Error Handler

The system includes comprehensive error handling for:

- **Validation Errors**: Field-level validation failures
- **Database Errors**: Connection and query failures  
- **Authentication Errors**: JWT and session failures
- **File Upload Errors**: Size and type restrictions
- **Generic Errors**: Fallback handling with environment-specific responses

### Error Response Format

```typescript
{
  error: "Error type",
  message: "Human-readable message",
  details?: ValidationDetail[], // Only for validation errors
  stack?: string // Only in development
}
```

## File Upload Security

### Restrictions

- **File Size**: Maximum 5MB per file
- **File Count**: Maximum 5 files per request
- **File Types**: Only JPEG, PNG, GIF, WebP images
- **File Names**: Randomized to prevent conflicts

### Upload Rate Limiting

- **Limit**: 10 uploads per minute per IP
- **Storage**: Local filesystem with validation
- **Processing**: Automatic file renaming and path validation

## Session Management

### Configuration

- **Store**: PostgreSQL-backed sessions for scalability
- **Duration**: 7 days with automatic cleanup
- **Security**: HTTP-only cookies with secure settings
- **CSRF**: Protected through SameSite cookie attributes

### Authentication Flow

1. **Session Creation**: Secure session establishment
2. **Token Validation**: Automatic token refresh when needed
3. **Session Cleanup**: Automatic session destruction on logout
4. **Multi-Auth Support**: Both Replit Auth and session-based auth

## Database Security

### Query Protection

- **Parameterized Queries**: All database operations use parameterized queries
- **Field Selection**: Explicit field selection (no SELECT *)
- **Input Validation**: All inputs validated before database operations
- **Connection Pooling**: Secure connection management

### Role-Based Access Control

- **Admin**: Full system access including user management
- **Manager**: Full access except user creation
- **Staff**: View and create only (no status changes)
- **Technician**: Can accept jobs and change status

## Environment-Specific Security

### Development Mode

- **CSP**: Relaxed for development tools
- **Error Details**: Full error information and stack traces
- **Logging**: Verbose request/response logging
- **CORS**: Permissive localhost origins

### Production Mode

- **CSP**: Strict content security policy
- **Error Hiding**: Generic error messages
- **HTTPS**: Forced secure connections
- **Domain Restriction**: Limited to allowed origins

## Security Best Practices

### Input Handling

1. **Validate Early**: Validate all inputs at the API boundary
2. **Sanitize Always**: Escape user inputs to prevent XSS
3. **Type Safety**: Use TypeScript and Zod for type validation
4. **Size Limits**: Enforce reasonable limits on all inputs

### Authentication

1. **Session Security**: Secure session configuration
2. **Rate Limiting**: Prevent brute force attacks
3. **Token Management**: Proper token lifecycle management
4. **Logout Cleanup**: Complete session destruction

### Error Management

1. **Information Disclosure**: Never expose sensitive data in errors
2. **Logging**: Log security events for monitoring
3. **Graceful Degradation**: Handle errors without breaking functionality
4. **User Feedback**: Provide helpful but safe error messages

## Monitoring and Alerts

### Request Monitoring

- **Rate Limit Tracking**: Monitor for rate limit violations
- **Error Frequency**: Track error patterns and frequencies
- **Authentication Attempts**: Monitor failed login attempts
- **File Upload Activity**: Track upload patterns and failures

### Security Events

- **Failed Authentication**: Log and monitor authentication failures
- **Validation Failures**: Track input validation rejections
- **Rate Limit Hits**: Monitor for potential abuse attempts
- **Error Patterns**: Identify potential attack patterns

## Compliance and Standards

### Standards Followed

- **OWASP Top 10**: Protection against common vulnerabilities
- **Input Validation**: Comprehensive input sanitization
- **Output Encoding**: Proper output encoding for XSS prevention
- **Session Management**: Secure session handling practices

### Regular Security Tasks

1. **Dependency Updates**: Regular security patches
2. **Log Review**: Periodic security log analysis
3. **Configuration Audit**: Regular security configuration review
4. **Penetration Testing**: Periodic security testing

This security implementation provides enterprise-grade protection while maintaining usability and performance for the Hotel Maintenance System.