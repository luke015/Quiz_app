# Authentication Setup Guide

This document explains how to set up and use the authentication system in the Quiz Application.

## Overview

The application now includes a simple password-based authentication system to protect admin features:

- **Public Access**: Leaderboard and Individual Results pages
- **Admin Access** (requires login): Quiz Management, Player Management, Results Entry

## Initial Setup

### 1. Server Configuration

Create a `.env` file in the `server` directory:

```bash
cd server
```

Create a file named `.env` with the following content:

```env
PORT=3000
ADMIN_PASSWORD=your_secure_password_here
```

**Important**: 
- Replace `your_secure_password_here` with your desired admin password
- Keep this file secure and never commit it to version control (it's already in `.gitignore`)
- Use a strong password for production environments

### 2. Client Configuration (Optional)

If you need to configure the API URL, create a `.env` file in the `client` directory:

```bash
cd client
```

Create a file named `.env` with:

```env
VITE_API_URL=http://localhost:3000
```

This is optional as the client uses relative URLs by default.

## How Authentication Works

### Backend

1. **Password Storage**: The admin password is stored in the server's `.env` file
2. **Session Tokens**: When a user logs in with the correct password:
   - A random 32-byte session token is generated
   - The token is hashed using bcrypt with salt (10 rounds)
   - The hashed token is stored in server memory
   - The unhashed token is sent to the client
   - Sessions expire after 24 hours
3. **Token Verification**: On each protected request:
   - The bearer token is compared against stored hashed tokens using bcrypt
   - Expired sessions are automatically cleaned up
   - Invalid tokens are rejected with 403 error
4. **Protected Endpoints**:
   - `POST /api/quizzes` - Create quiz
   - `PUT /api/quizzes/:id` - Update quiz
   - `DELETE /api/quizzes/:id` - Delete quiz
   - `POST /api/quizzes/:id/questions` - Add question
   - `PUT /api/quizzes/:quizId/questions/:questionId` - Update question
   - `DELETE /api/quizzes/:quizId/questions/:questionId` - Delete question
   - `POST /api/players` - Create player
   - `PUT /api/players/:id` - Update player
   - `DELETE /api/players/:id` - Delete player
   - `POST /api/results` - Create result
   - `DELETE /api/results/:id` - Delete result
   - `GET /api/results` - Get all results
   - `GET /api/results/quiz/:quizId` - Get quiz results
   - `POST /api/upload` - Upload files

4. **Public Endpoints** (with restrictions):
   - `POST /api/auth/login` - Login endpoint
   - `GET /api/quizzes` - Get all quizzes (answers stripped for non-authenticated users)
   - `GET /api/quizzes/:id` - Get single quiz (answers stripped for non-authenticated users)
   - `GET /api/players` - Get all players
   - `GET /api/players/:id` - Get single player
   - `GET /api/results` - Get all results
   - `GET /api/results/leaderboard` - Get leaderboard
   - `GET /api/results/leaderboard/ranking` - Get ranking leaderboard
   - `GET /api/results/player/:playerId` - Get player results

**Note**: Quiz endpoints are publicly accessible but return different data based on authentication:
- **Unauthenticated**: Quizzes returned with `correctAnswer` field set to empty string
- **Authenticated**: Full quiz data including correct answers

### Frontend

1. **Login Page**: `/login` - Enter admin password
2. **Protected Routes**: Automatically redirect to login if not authenticated
3. **Token Storage**: Authentication token is stored in browser's localStorage
4. **Auto-Login**: If a valid token exists, the user stays logged in across browser sessions
5. **Logout**: Clear token and return to guest mode

## Usage

### For Administrators

1. Navigate to the application homepage
2. Click "Login" or try to access an admin feature
3. Enter the admin password (from your `.env` file)
4. You now have full access to all features
5. Click "Logout" when done

### For Guests

- Access the homepage
- View the Leaderboard
- View Individual Results
- Cannot access admin features without logging in

## Security Features

1. **Bcrypt Hashing**: Session tokens are hashed using bcrypt with salt (10 rounds)
2. **Random Session Tokens**: 32-byte random tokens generated using Node.js crypto module
3. **Session Expiration**: Tokens automatically expire after 24 hours
4. **Server-Side Sessions**: Sessions stored in memory, invalidated on logout
5. **Password Protection**: Admin password never sent over the network after initial login

## Security Notes

1. **Suitable for Small Teams**: This system is appropriate for single-admin or small team use
2. **Production Considerations**: For larger production deployments, consider:
   - JWT tokens with refresh tokens
   - Database-backed session storage (Redis)
   - Multiple user accounts with roles
   - OAuth/SSO integration
   - Rate limiting on login endpoint
3. **HTTPS Required**: Always use HTTPS in production to protect credentials in transit
4. **Environment Variables**: Never commit `.env` files to version control
5. **Memory-Based Sessions**: Current implementation stores sessions in memory
   - Sessions are lost on server restart (users need to re-login)
   - For persistence, consider Redis or database storage

## Changing the Password

1. Stop the server
2. Edit `server/.env`
3. Change the `ADMIN_PASSWORD` value
4. Restart the server
5. All existing sessions will be invalidated (users must re-login)

## Session Management

- **Session Duration**: 24 hours by default
- **Automatic Cleanup**: Expired sessions are automatically removed
- **Server Restart**: All sessions are cleared when the server restarts
- **Logout**: Calling logout endpoint removes the session immediately

## Troubleshooting

### "Invalid password" error
- Check that the password in your `.env` file matches what you're entering
- Ensure there are no extra spaces in the `.env` file
- Restart the server after changing the `.env` file

### "Authentication required" errors
- Check that you're logged in
- Try logging out and logging back in
- Clear your browser's localStorage if issues persist

### Can't access admin features after login
- Check browser console for errors
- Verify the token is stored: Open DevTools → Application → Local Storage → authToken
- Try refreshing the page

## Important: No Default Password

**The system requires a password in the `.env` file to work.**
- Without an `ADMIN_PASSWORD` in `.env`, login will fail
- There is no default password for security reasons
- You MUST create a `.env` file with your chosen password

## Technical Details

### Token Generation Flow
1. User submits password via POST /api/auth/login
2. Server verifies password matches ADMIN_PASSWORD in .env
3. Server generates 32-byte random token using crypto.randomBytes()
4. Token is hashed with bcrypt (10 salt rounds)
5. Hashed token stored in memory with 24-hour expiration
6. Unhashed token returned to client
7. Client stores token in localStorage

### Token Verification Flow
1. Client sends token as Bearer token in Authorization header
2. Server iterates through stored hashed tokens
3. Uses bcrypt.compare() to check if token matches any hash
4. Verifies session hasn't expired
5. Allows or denies request based on validation

### Security Benefits
- **Password never stored in token**: Only sent once during login
- **Token hashing**: Even if token is intercepted, stored hash can't be used
- **Salted hashing**: Each token has unique hash even if identical
- **Time-limited sessions**: Reduces risk of token theft
- **Server-side invalidation**: Logout immediately revokes access
- **Answer protection**: Quiz answers only visible to authenticated users

