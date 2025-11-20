# Testing Quiz Answer Protection

This document shows how to test that quiz answers are properly protected.

## Setup

1. Make sure you have at least one quiz with questions in the system
2. Start the server: `cd server && npm run dev`
3. Note a quiz ID from your data (check `server/data/quizzes.json`)

## Test 1: Unauthenticated Request (Public Access)

### Using Browser Console
```javascript
// Open browser console (F12) and run:
fetch('/api/quizzes')
  .then(r => r.json())
  .then(quizzes => {
    console.log('Quiz data:', quizzes);
    console.log('First question correctAnswer:', quizzes[0]?.questions[0]?.correctAnswer);
  });
```

**Expected Result**: `correctAnswer` should be an empty string `""`

### Using curl
```bash
curl http://localhost:3000/api/quizzes
```

**Expected Result**: JSON response with quizzes where all `correctAnswer` fields are empty strings

## Test 2: Authenticated Request (Admin Access)

### Step 1: Login
```javascript
// In browser console:
fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password: 'YOUR_PASSWORD_HERE' })
})
  .then(r => r.json())
  .then(data => {
    console.log('Token:', data.token);
    // Copy this token for next step
  });
```

### Step 2: Fetch with Token
```javascript
// Replace TOKEN_HERE with the token from step 1
fetch('/api/quizzes', {
  headers: {
    'Authorization': 'Bearer TOKEN_HERE'
  }
})
  .then(r => r.json())
  .then(quizzes => {
    console.log('Quiz data:', quizzes);
    console.log('First question correctAnswer:', quizzes[0]?.questions[0]?.correctAnswer);
  });
```

**Expected Result**: `correctAnswer` should contain the actual answer (not empty)

### Using curl
```bash
# First login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"YOUR_PASSWORD_HERE"}'

# Copy the token from response, then:
curl http://localhost:3000/api/quizzes \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Result**: Full quiz data with correct answers

## Test 3: Single Quiz Endpoint

### Unauthenticated
```javascript
fetch('/api/quizzes/QUIZ_ID_HERE')
  .then(r => r.json())
  .then(quiz => console.log('Quiz:', quiz));
```

**Expected**: Empty `correctAnswer` fields

### Authenticated
```javascript
fetch('/api/quizzes/QUIZ_ID_HERE', {
  headers: { 'Authorization': 'Bearer TOKEN_HERE' }
})
  .then(r => r.json())
  .then(quiz => console.log('Quiz:', quiz));
```

**Expected**: Full `correctAnswer` fields

## What to Look For

### Unauthenticated Response Example
```json
{
  "id": "quiz-123",
  "title": "Sample Quiz",
  "questions": [
    {
      "id": "q1",
      "questionText": "What is 2+2?",
      "type": "text",
      "correctAnswer": "",  // ← EMPTY for public
      "maxPoints": 10
    }
  ]
}
```

### Authenticated Response Example
```json
{
  "id": "quiz-123",
  "title": "Sample Quiz",
  "questions": [
    {
      "id": "q1",
      "questionText": "What is 2+2?",
      "type": "text",
      "correctAnswer": "4",  // ← POPULATED for admin
      "maxPoints": 10
    }
  ]
}
```

## Security Verification

✅ **Pass**: Unauthenticated requests show empty `correctAnswer`  
✅ **Pass**: Authenticated requests show actual `correctAnswer`  
✅ **Pass**: Same endpoint serves both use cases  
✅ **Pass**: No error messages reveal answer information  

❌ **Fail**: If unauthenticated requests show actual answers  
❌ **Fail**: If authenticated requests show empty answers  
❌ **Fail**: If error messages leak answer data  

## Notes

- The sanitization happens on the server before sending the response
- No client-side code is needed to hide answers
- The original quiz data in the database is never modified
- Each request is checked independently for authentication
- Token verification uses bcrypt comparison (secure)

