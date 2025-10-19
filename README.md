# Quiz Application

A full-stack web application for creating and managing quizzes for team building events. Features quiz management, player tracking, multiple display modes, and leaderboard functionality.

## Features

- **Quiz Management**: Create quizzes with various question types (text, multiple choice) and media (images, videos, audio)
- **Player Management**: Add and manage quiz participants
- **Quiz Display Modes**:
  - Guessing Mode: Show questions without answers
  - Answer Mode: Reveal correct answers
- **Results Entry**: Manually enter player scores for each question
- **Leaderboard**: View overall player rankings and total scores
- **TV-Optimized Display**: Large fonts and high contrast for TV presentations

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router
- **Backend**: Node.js, Express
- **Storage**: JSON files (persistent data)
- **File Uploads**: Multer

## Project Structure

```
Quiz_app/
├── client/          # React frontend application
├── server/          # Express backend API
└── PLAN.md          # Detailed implementation plan
```

## Installation

### Prerequisites

- Node.js (version 18 or higher recommended)
- npm

### Setup

1. **Clone or navigate to the project directory**

2. **Install Backend Dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../client
   npm install
   ```

## Running the Application

You'll need to run both the backend and frontend servers.

### Start the Backend Server

```bash
cd server
npm start
```

The backend API will run on http://localhost:3000

### Start the Frontend Development Server

Open a new terminal window:

```bash
cd client
npm run dev
```

The frontend will run on http://localhost:5173

## Usage

1. **Open your browser** and navigate to http://localhost:5173

2. **Add Players**: Go to "Manage Players" and add your team members

3. **Create Quizzes**: 
   - Go to "Manage Quizzes"
   - Click "Create New Quiz"
   - Add quiz details and questions
   - Upload media files for questions if needed

4. **Play Quiz**:
   - From Quiz Management, click "Play (Guess)" for guessing mode
   - Or click "Show Answers" to display answers
   - Use arrow keys to navigate between questions
   - Press 'F' for fullscreen mode (great for TV display)

5. **Enter Results**:
   - Go to "Enter Results"
   - Select a quiz and player
   - Enter points awarded for each question
   - Submit to save

6. **View Leaderboard**:
   - Go to "Leaderboard" to see overall rankings
   - Top 3 players are displayed on a podium
   - Full rankings shown below

## Keyboard Shortcuts (Quiz Player)

- **Left Arrow**: Previous question
- **Right Arrow**: Next question
- **F**: Toggle fullscreen mode

## Data Storage

All data is stored in JSON files in the `server/data/` directory:
- `quizzes.json`: Quiz and question data
- `players.json`: Player information
- `results.json`: Quiz results and scores

Media files are stored in `server/uploads/`

## API Documentation

See `PLAN.md` for detailed API endpoint documentation.

## Development

### Backend Development

The backend uses Node.js ES modules. To enable auto-restart on changes:

```bash
cd server
npm run dev
```

### Frontend Development

The frontend uses Vite with Hot Module Replacement (HMR):

```bash
cd client
npm run dev
```

### Building for Production

Frontend:
```bash
cd client
npm run build
```

## Troubleshooting

**Port conflicts**: If port 3000 or 5173 is already in use, you can modify:
- Backend port: Edit `server/server.js` (PORT variable)
- Frontend port: Edit `client/vite.config.js` (server.port)

**CORS issues**: The frontend is configured to proxy API requests to the backend. If you encounter CORS errors, ensure both servers are running.

**File upload issues**: Ensure the `server/uploads/` directory exists and has write permissions.

## License

This project is for personal/team use.

