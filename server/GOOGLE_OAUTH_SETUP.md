# Google OAuth 2.0 Setup Guide

This guide will help you set up Google OAuth 2.0 authentication for your Multi-Factor Authentication application.

## Prerequisites

- A Google account
- Access to Google Cloud Console

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click on "Select a project" and then "New Project"
3. Enter a project name (e.g., "MFA Authentication App")
4. Click "Create"

## Step 2: Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" (for testing) or "Internal" (if you have a Google Workspace)
3. Fill in the required information:
   - **App name**: Your app name (e.g., "MFA Authentication")
   - **User support email**: Your email address
   - **Developer contact information**: Your email address
4. Click "Save and Continue"
5. Skip "Scopes" for now by clicking "Save and Continue"
6. Add test users (your email and any other emails you want to test with)
7. Click "Save and Continue"

## Step 4: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Choose "Web application"
4. Enter a name (e.g., "MFA Web Client")
5. Add authorized redirect URIs:
   - For development: `http://localhost:5000/api/auth/google/callback`
   - For production: `https://yourdomain.com/api/auth/google/callback`
6. Click "Create"
7. Copy the "Client ID" and "Client Secret"

## Step 5: Update Environment Variables

Add your Google OAuth credentials to your `.env` file:

```env
# Google OAuth 2.0 Configuration
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

## Step 6: Test Google OAuth

1. Start your server: `npm run dev`
2. Navigate to: `http://localhost:5000/api/auth/google`
3. You should be redirected to Google's consent screen
4. After authorization, you should be redirected back to your app

## Important Security Notes

### For Production:

1. **Use HTTPS**: Google OAuth requires HTTPS in production
2. **Verify your domain**: Add your domain to Google Search Console
3. **Update redirect URIs**: Use your production domain
4. **Review scopes**: Only request the scopes you need
5. **Monitor usage**: Keep track of API usage in Google Cloud Console

### Environment Variables for Production:

```env
NODE_ENV=production
GOOGLE_CLIENT_ID=your-production-client-id
GOOGLE_CLIENT_SECRET=your-production-client-secret
```

## Troubleshooting

### Common Issues:

1. **"redirect_uri_mismatch" error**:

   - Check that your redirect URI exactly matches what's configured in Google Cloud Console
   - Make sure you're using the correct protocol (http vs https)

2. **"access_denied" error**:

   - User denied permission
   - Check OAuth consent screen configuration

3. **"invalid_client" error**:

   - Check your client ID and secret
   - Make sure they're correctly set in your `.env` file

4. **"unauthorized_client" error**:
   - Make sure your OAuth client is configured for web applications
   - Check authorized redirect URIs

### Testing with Multiple Accounts:

1. Use incognito/private browsing
2. Add test users in OAuth consent screen
3. Use different browsers

## OAuth Flow Overview

```
User clicks "Login with Google"
       ↓
Redirected to Google OAuth
       ↓
User grants permission
       ↓
Google redirects back with authorization code
       ↓
Server exchanges code for access token
       ↓
Server gets user profile from Google
       ↓
Server creates/updates user account
       ↓
User is logged in
```

## Scopes Used

- `profile`: Access to basic profile information
- `email`: Access to user's email address

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
- [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)

---

**Note**: Keep your client secret secure and never expose it in client-side code or public repositories.
