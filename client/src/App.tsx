import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import QuizManagement from "./pages/QuizManagement";
import QuizEditor from "./pages/QuizEditor";
import PlayerManagement from "./pages/PlayerManagement";
import QuizPlayer from "./pages/QuizPlayer";
import ResultsEntry from "./pages/ResultsEntry";
import Leaderboard from "./pages/Leaderboard";
import IndividualResults from "./pages/IndividualResults";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/quizzes" element={<QuizManagement />} />
        <Route path="/quizzes/new" element={<QuizEditor />} />
        <Route path="/quizzes/:id/edit" element={<QuizEditor />} />
        <Route path="/quizzes/:id/play" element={<QuizPlayer mode="guessing" />} />
        <Route path="/quizzes/:id/answers" element={<QuizPlayer mode="answers" />} />
        <Route path="/players" element={<PlayerManagement />} />
        <Route path="/results" element={<ResultsEntry />} />
        <Route path="/results/individual" element={<IndividualResults />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </div>
  );
}

export default App;
