import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import QuizManagement from "./pages/QuizManagement";
import QuizEditor from "./pages/QuizEditor";
import PlayerManagement from "./pages/PlayerManagement";
import QuizPlayer from "./pages/QuizPlayer";
import ResultsEntry from "./pages/ResultsEntry";
import Leaderboard from "./pages/Leaderboard";
import IndividualResults from "./pages/IndividualResults";

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          
          {/* Public routes */}
          <Route path="/results/individual" element={<IndividualResults />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          
          {/* Protected routes */}
          <Route
            path="/quizzes"
            element={
              <ProtectedRoute>
                <QuizManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quizzes/new"
            element={
              <ProtectedRoute>
                <QuizEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quizzes/:id/edit"
            element={
              <ProtectedRoute>
                <QuizEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quizzes/:id/play"
            element={
              <ProtectedRoute>
                <QuizPlayer mode="guessing" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quizzes/:id/answers"
            element={
              <ProtectedRoute>
                <QuizPlayer mode="answers" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/players"
            element={
              <ProtectedRoute>
                <PlayerManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/results"
            element={
              <ProtectedRoute>
                <ResultsEntry />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
