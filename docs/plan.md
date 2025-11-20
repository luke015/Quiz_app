# Quiz Application - Implementation Plan

## Purpose
Team building application for creating and managing quizzes. The quizzes will be displayed on a main computer connected to a TV, where participants will view questions and write answers on paper.

## Technology Stack
- **Frontend**: React 18 with Vite, Tailwind CSS
- **Backend**: Node.js + Express
- **Data Storage**: JSON files for persistent storage (quizzes, players, results)
- **File Uploads**: Multer for media files (images, videos, audio)

## Core Features

### 1. Quiz Management
- Create, edit, and delete quizzes
- Add questions with various formats:
  - Text-based questions
  - Image-based questions
  - Video questions
  - Audio/music questions
  - Combinations of media with text
- Question types:
  - Free-text answers
  - Multiple choice (A, B, C, D options)
- Each question has a maximum point value

### 2. Player Management
- Add, edit, and delete players
- Store player information persistently

### 3. Quiz Display Modes
- **Guessing Mode**: Display questions without answers for participants to guess
- **Answer Mode**: Display questions with correct answers revealed
- Large fonts and high contrast for TV readability
- Keyboard navigation (arrow keys, fullscreen)

### 4. Results Management
- Manual entry of player scores per question
- Points awarded between 0 and max points for each question
- Persistent storage of all results

### 5. Leaderboard
- Display total points for all players across all quizzes
- Sorted ranking display
- Visual podium for top 3 players

## Data Structure

### Quizzes
```json
{
  "id": "uuid",
  "title": "Quiz Title",
  "description": "Description",
  "createdAt": "timestamp",
  "questions": [
    {
      "id": "uuid",
      "type": "text|multiple-choice",
      "questionText": "Question text",
      "mediaType": "none|image|video|audio",
      "mediaPath": "/uploads/file.jpg",
      "maxPoints": 10,
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "answer text"
    }
  ]
}
```

### Players
```json
{
  "id": "uuid",
  "name": "Player Name",
  "createdAt": "timestamp"
}
```

### Results
```json
{
  "id": "uuid",
  "quizId": "quiz-uuid",
  "playerId": "player-uuid",
  "questionResults": [
    {
      "questionId": "question-uuid",
      "pointsAwarded": 7
    }
  ],
  "totalScore": 35,
  "completedAt": "timestamp"
}
```

## Project Structure
```
Quiz_app/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── QuizManagement.jsx
│   │   │   ├── QuizEditor.jsx
│   │   │   ├── PlayerManagement.jsx
│   │   │   ├── QuizPlayer.jsx
│   │   │   ├── ResultsEntry.jsx
│   │   │   └── Leaderboard.jsx
│   │   ├── services/         # API calls
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── tailwind.config.js
├── server/                    # Node.js backend
│   ├── routes/               # API routes
│   │   ├── quizzes.js
│   │   ├── players.js
│   │   ├── results.js
│   │   └── upload.js
│   ├── utils/
│   │   └── fileManager.js
│   ├── data/                 # JSON storage
│   │   ├── quizzes.json
│   │   ├── players.json
│   │   └── results.json
│   ├── uploads/              # Media files
│   ├── server.js
│   └── package.json
└── PLAN.md
```

## API Endpoints

### Quizzes
- `GET /api/quizzes` - Get all quizzes
- `GET /api/quizzes/:id` - Get single quiz
- `POST /api/quizzes` - Create quiz
- `PUT /api/quizzes/:id` - Update quiz
- `DELETE /api/quizzes/:id` - Delete quiz
- `POST /api/quizzes/:id/questions` - Add question
- `PUT /api/quizzes/:quizId/questions/:questionId` - Update question
- `DELETE /api/quizzes/:quizId/questions/:questionId` - Delete question

### Players
- `GET /api/players` - Get all players
- `GET /api/players/:id` - Get single player
- `POST /api/players` - Create player
- `PUT /api/players/:id` - Update player
- `DELETE /api/players/:id` - Delete player

### Results
- `GET /api/results` - Get all results
- `GET /api/results/quiz/:quizId` - Get results for quiz
- `GET /api/results/player/:playerId` - Get results for player
- `POST /api/results` - Save result
- `GET /api/results/leaderboard` - Get leaderboard
- `DELETE /api/results/:id` - Delete result

### Upload
- `POST /api/upload` - Upload media file (returns path)

## UI Features

### TV Display Optimization
- Large, readable fonts (3xl-6xl text sizes)
- High contrast colors
- Fullscreen mode support
- Keyboard navigation for presentations
- Gradient backgrounds for visual appeal

### Responsive Design
- Desktop-first approach (optimized for TV display)
- Mobile-friendly fallbacks for management interfaces

### User Experience
- Clear navigation between modes
- Visual feedback for actions
- Error handling and user notifications
- Confirm dialogs for destructive actions

## Implementation Notes

### Modern React Practices
- Functional components with hooks
- `const` declarations
- `useState` and `useEffect` hooks
- React Router v6 for navigation

### File Management
- Media files uploaded to `server/uploads/`
- File paths stored in JSON
- Support for images (jpg, png, gif)
- Support for videos (mp4, webm)
- Support for audio (mp3, wav)

### Data Persistence
- JSON files used for all data storage
- Atomic read-modify-write operations
- Error handling for file operations
- UUID for unique identifiers

## Running the Application

### Backend
```bash
cd server
npm install
npm start
```
Server runs on http://localhost:3000

### Frontend
```bash
cd client
npm install
npm run dev
```
Client runs on http://localhost:5173

The frontend is configured to proxy API requests to the backend.
