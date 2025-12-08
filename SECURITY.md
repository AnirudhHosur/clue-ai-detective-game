# Security Guidelines

This document outlines the security practices and guidelines for the Clue AI Detective Game application.

## 🔐 Firebase Security

### Configuration Management
- All Firebase configuration values are stored in environment variables
- Environment variables are never committed to version control
- The `.env.local` file is included in `.gitignore` to prevent accidental commits

### Server-Side Only Operations
- Firebase operations are performed exclusively on the server-side
- The `services/firebaseService.ts` module should only be imported in API routes
- Never import Firebase modules directly in client-side React components
- All image uploads and downloads happen through server API endpoints

### Credential Protection
The following Firebase credentials are protected:
- API Key
- Auth Domain
- Project ID
- Storage Bucket
- Messaging Sender ID
- App ID
- Measurement ID

## 🛡️ Environment Variables Security

### Storage
- Sensitive configuration is stored in `.env.local`
- This file is excluded from version control via `.gitignore`
- A `.env.local.example` template is provided for new developers

### Variable Prefixing
- Public variables accessible to the client are prefixed with `NEXT_PUBLIC_`
- Private variables used only on the server have no prefix
- Never prefix sensitive server variables with `NEXT_PUBLIC_`

## 🔒 API Security

### Authentication
- All API routes that modify data require user authentication
- Clerk authentication is verified in API handlers
- User ownership is checked before allowing modifications

### Data Validation
- All incoming data is validated and sanitized
- Server-side validation prevents injection attacks
- Credit consumption is tracked server-side to prevent manipulation

## 📁 File Upload Security

### Image Handling
- Images are uploaded to Firebase Storage server-side
- File names are generated server-side to prevent path traversal
- Content types are validated during upload
- Uploaded images are served through Firebase's secure CDN

### Access Control
- Firebase Storage rules should be configured for production security
- Images are publicly readable but only server-side writable
- No direct client-side uploads to Firebase Storage

## 🔄 Best Practices

### Code Review
- All Firebase-related code must be reviewed for security implications
- Verify that no Firebase credentials are exposed in client bundles
- Ensure all operations happen server-side

### Dependencies
- Regularly update Firebase SDK and related packages
- Monitor for security vulnerabilities in dependencies
- Use only official Firebase packages

### Monitoring
- Monitor Firebase Storage usage and costs
- Set up alerts for unusual activity
- Regularly audit access logs

## 🚨 Reporting Security Issues

If you discover a security vulnerability, please:
1. Do not publicly disclose the issue
2. Contact the development team directly
3. Provide detailed information about the vulnerability
4. Allow time for the issue to be addressed before any disclosure