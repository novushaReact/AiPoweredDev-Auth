# Multi-Factor Authentication (MFA) Server

A comprehensive authentication server built with Node.js, Express, MongoDB, and Passport.js featuring:

- 📧 **Email/Password Authentication** - Traditional login with secure password hashing
- 🔗 **Google OAuth 2.0** - Social login with Google accounts
- 🔒 **Two-Factor Authentication (2FA)** - TOTP-based 2FA with backup codes
- 🛡️ **Security Features** - Rate limiting, session management, and security headers
- 📱 **Mobile-Friendly** - QR codes for easy 2FA setup

## 🚀 Features

### Authentication Methods

- **Local Authentication**: Email and password with bcrypt hashing
- **Google OAuth 2.0**: Seamless integration with Google accounts
- **Account Linking**: Link Google accounts to existing email accounts

### Two-Factor Authentication

- **TOTP (Time-based One-Time Password)**: Compatible with Google Authenticator, Authy, etc.
- **QR Code Generation**: Easy setup with authenticator apps
- **Backup Codes**: 10 one-time backup codes for account recovery
- **Backup Code Management**: Regenerate codes when needed

### Security Features

- **Rate Limiting**: Prevents brute force attacks
- **Session Management**: Secure session handling with MongoDB store
- **Account Locking**: Temporary locks after failed login attempts
- **Security Headers**: Helmet.js for security headers
- **Input Validation**: Joi validation for all inputs
- **Password Requirements**: Strong password enforcement

### User Management

- **Profile Management**: Update user information
- **Account Statistics**: Track login history and account details
- **Soft Delete**: Account deactivation instead of hard deletion
- **Account Recovery**: Password reset functionality (ready for email integration)

## 📦 Installation

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Clone Repository

```bash
git clone <your-repository-url>
cd Auth/server
```

### Install Dependencies

```bash
npm install
```

### Environment Setup

Create a `.env` file in the server directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/mfa_auth_db

# Session Secret (Generate a strong random secret in production)
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# Google OAuth 2.0 Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Frontend URL
CLIENT_URL=http://localhost:3000

# JWT Secret (for additional token-based auth if needed)
JWT_SECRET=your-jwt-secret-key-change-this-in-production
```

### Google OAuth Setup

Follow the detailed guide in [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md) to configure Google OAuth 2.0.

## 🏃‍♂️ Running the Application

### Development Mode

```bash
npm run dev
```

Server will start on `http://localhost:5000` with nodemon for auto-restart.

### Production Mode

```bash
npm start
```

### Database Setup

Make sure MongoDB is running on your system. The application will automatically connect and create the database.

## 📚 API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "StrongPass123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login User

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "StrongPass123"
}
```

#### Google OAuth Login

```http
GET /auth/google
```

Redirects to Google OAuth consent screen.

#### Google OAuth Callback

```http
GET /auth/google/callback
```

Handles Google OAuth response (automatic redirect).

#### Logout

```http
POST /auth/logout
```

Requires authentication.

#### Check Auth Status

```http
GET /auth/status
```

Returns current authentication status.

### User Management Endpoints

#### Get User Profile

```http
GET /user/profile
```

Requires authentication.

#### Update User Profile

```http
PUT /user/profile
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "profilePicture": "https://example.com/avatar.jpg"
}
```

Requires authentication.

#### Get User Statistics

```http
GET /user/stats
```

Requires authentication.

### Two-Factor Authentication Endpoints

#### Setup 2FA

```http
POST /2fa/setup
```

Returns QR code and manual entry key. Requires authentication.

#### Verify 2FA Setup

```http
POST /2fa/verify-setup
Content-Type: application/json

{
  "token": "123456"
}
```

Enables 2FA and returns backup codes. Requires authentication.

#### Verify 2FA Token

```http
POST /2fa/verify
Content-Type: application/json

{
  "token": "123456",
  "isBackupCode": false
}
```

Verifies 2FA during login or for protected resources.

#### Disable 2FA

```http
DELETE /2fa/disable
Content-Type: application/json

{
  "password": "StrongPass123",
  "token": "123456"
}
```

Requires current password and valid 2FA token.

#### Regenerate Backup Codes

```http
POST /2fa/regenerate-backup-codes
Content-Type: application/json

{
  "token": "123456"
}
```

Generates new backup codes (invalidates old ones).

#### Get 2FA Status

```http
GET /2fa/status
```

Returns 2FA configuration status.

## 🔒 Security Features

### Rate Limiting

- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 attempts per 15 minutes
- **2FA Verification**: 10 attempts per 5 minutes
- **Password Reset**: 3 attempts per hour

### Account Security

- **Password Requirements**: Minimum 6 characters, uppercase, lowercase, and number
- **Account Locking**: 5 failed attempts locks account for 2 hours
- **Session Security**: Secure session management with MongoDB store
- **2FA Protection**: TOTP-based with backup codes

### Security Headers

- XSS Protection
- Content Type Options
- Frame Options (clickjacking prevention)
- HSTS (in production)

## 🏗️ Project Structure

```
server/
├── config/
│   └── passport.js          # Passport configuration
├── middleware/
│   └── security.js          # Security middleware
├── models/
│   └── User.js              # User model
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── user.js              # User management routes
│   └── twoFactor.js         # 2FA routes
├── utils/
│   └── validation.js        # Validation utilities
├── .env                     # Environment variables
├── server.js                # Main server file
├── package.json             # Dependencies
├── GOOGLE_OAUTH_SETUP.md    # Google OAuth setup guide
└── README.md                # This file
```

## 🧪 Testing

### Manual Testing

1. **Register a new user**:

   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"Test123","firstName":"Test","lastName":"User"}'
   ```

2. **Login with email/password**:

   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"Test123"}'
   ```

3. **Test Google OAuth**:
   Open `http://localhost:5000/api/auth/google` in your browser.

4. **Setup 2FA**:
   ```bash
   curl -X POST http://localhost:5000/api/2fa/setup \
     -H "Content-Type: application/json" \
     -b "cookies.txt"
   ```

### Health Check

```bash
curl http://localhost:5000/health
```

## 🚨 Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error type",
  "message": "Human-readable error message",
  "field": "fieldName (for validation errors)"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## 🔧 Configuration

### Environment Variables

| Variable               | Description                | Default                                 |
| ---------------------- | -------------------------- | --------------------------------------- |
| `PORT`                 | Server port                | `5000`                                  |
| `NODE_ENV`             | Environment                | `development`                           |
| `MONGODB_URI`          | MongoDB connection string  | `mongodb://localhost:27017/mfa_auth_db` |
| `SESSION_SECRET`       | Session secret key         | Required                                |
| `GOOGLE_CLIENT_ID`     | Google OAuth client ID     | Required for OAuth                      |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Required for OAuth                      |
| `CLIENT_URL`           | Frontend URL               | `http://localhost:3000`                 |

### Security Configuration

- **Session Timeout**: 24 hours
- **Rate Limiting**: Configurable per endpoint
- **Password Policy**: Minimum 6 chars, mixed case, numbers
- **2FA Window**: 1 step tolerance for clock skew

## 🚀 Production Deployment

### Prerequisites for Production

1. **MongoDB Atlas** or dedicated MongoDB server
2. **SSL Certificate** for HTTPS
3. **Domain name** configured
4. **Google OAuth** production credentials

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/mfa_auth_db
SESSION_SECRET=your-production-session-secret
GOOGLE_CLIENT_ID=your-production-google-client-id
GOOGLE_CLIENT_SECRET=your-production-google-client-secret
CLIENT_URL=https://yourdomain.com
```

### Production Checklist

- [ ] Configure HTTPS
- [ ] Update Google OAuth redirect URIs
- [ ] Set strong session secrets
- [ ] Configure MongoDB Atlas
- [ ] Set up monitoring and logging
- [ ] Configure reverse proxy (nginx)
- [ ] Set up SSL certificates
- [ ] Configure firewall rules

## 📝 Logging

The application includes comprehensive logging:

- **Authentication Events**: Login attempts, failures, successes
- **2FA Events**: Setup, verification, failures
- **Security Events**: Rate limiting, account locks
- **Error Events**: Application errors with stack traces

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:

1. Check the documentation
2. Review error logs
3. Check [Google OAuth Setup Guide](./GOOGLE_OAUTH_SETUP.md)
4. Create an issue in the repository

## 🔄 Changelog

### Version 1.0.0

- Initial release
- Email/password authentication
- Google OAuth 2.0 integration
- Two-factor authentication
- Rate limiting and security features
- User management endpoints
- Comprehensive documentation

---

**Built with ❤️ using Node.js, Express, MongoDB, and Passport.js**
