import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { quizApi, playerApi, resultsApi } from "../services/api";
import type { Quiz, Player } from "../types";

function ResultsEntry() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState("");
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [entryMode, setEntryMode] = useState<"individual" | "total">("individual");
  const [totalScore, setTotalScore] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedQuizId) {
      loadQuiz();
    } else {
      setSelectedQuiz(null);
      setScores({});
      setTotalScore(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedQuizId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [quizzesData, playersData] = await Promise.all([quizApi.getAll(), playerApi.getAll()]);
      setQuizzes(quizzesData);
      setPlayers(playersData);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadQuiz = async () => {
    try {
      const quiz = await quizApi.getById(selectedQuizId);
      setSelectedQuiz(quiz);

      // Initialize scores to 0
      const initialScores: Record<string, number> = {};
      quiz.questions.forEach((q) => {
        initialScores[q.id] = 0;
      });
      setScores(initialScores);
      setTotalScore(0);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleScoreChange = (questionId: string, value: string) => {
    const numValue = parseInt(value) || 0;
    const question = selectedQuiz?.questions.find((q) => q.id === questionId);

    if (!question) return;

    // Clamp value between 0 and maxPoints
    const clampedValue = Math.max(0, Math.min(numValue, question.maxPoints));

    setScores((prev) => ({
      ...prev,
      [questionId]: clampedValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedQuizId || !selectedPlayerId) {
      setError("Please select both a quiz and a player");
      return;
    }

    if (!selectedQuiz) {
      setError("Please select a quiz");
      return;
    }

    try {
      let questionResults;

      if (entryMode === "total") {
        // In total mode, distribute points evenly across questions
        const numQuestions = selectedQuiz.questions.length;
        const pointsPerQuestion = Math.floor(totalScore / numQuestions);
        const remainder = totalScore % numQuestions;

        questionResults = selectedQuiz.questions.map((q, index) => ({
          questionId: q.id,
          // Distribute remainder to first questions
          pointsAwarded: index < remainder ? pointsPerQuestion + 1 : pointsPerQuestion,
        }));
      } else {
        // Individual mode - use scores from individual inputs
        questionResults = Object.keys(scores).map((questionId) => ({
          questionId,
          pointsAwarded: scores[questionId],
        }));
      }

      await resultsApi.save({
        quizId: selectedQuizId,
        playerId: selectedPlayerId,
        questionResults,
      });

      setSuccess(true);
      setError(null);

      // Reset form after 2 seconds
      setTimeout(() => {
        setSelectedQuizId("");
        setSelectedPlayerId("");
        setSelectedQuiz(null);
        setScores({});
        setTotalScore(0);
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message);
      setSuccess(false);
    }
  };

  const calculateTotal = () => {
    return Object.values(scores).reduce((sum: number, score: number) => sum + score, 0);
  };

  const calculateMaxTotal = () => {
    if (!selectedQuiz) return 0;
    return selectedQuiz.questions.reduce((sum: number, q) => sum + q.maxPoints, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Enter Results</h1>
          <Link to="/" className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors">
            Back to Home
          </Link>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Results saved successfully!
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Quiz Selection */}
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">Select Quiz *</label>
              <select
                value={selectedQuizId}
                onChange={(e) => setSelectedQuizId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                required
              >
                <option value="">-- Select a quiz --</option>
                {quizzes.map((quiz) => (
                  <option key={quiz.id} value={quiz.id}>
                    {quiz.title} ({quiz.questions?.length || 0} questions)
                  </option>
                ))}
              </select>
            </div>

            {/* Player Selection */}
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">Select Player *</label>
              <select
                value={selectedPlayerId}
                onChange={(e) => setSelectedPlayerId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                required
              >
                <option value="">-- Select a player --</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Score Entry Mode Toggle */}
            {selectedQuiz && selectedQuiz.questions.length > 0 && (
              <div className="mb-6">
                <label className="block text-lg font-medium text-gray-700 mb-3">Entry Mode</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setEntryMode("individual")}
                    className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                      entryMode === "individual"
                        ? "bg-blue-500 text-white shadow-lg"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    📝 Individual Questions
                  </button>
                  <button
                    type="button"
                    onClick={() => setEntryMode("total")}
                    className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                      entryMode === "total"
                        ? "bg-blue-500 text-white shadow-lg"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    🎯 Total Points Only
                  </button>
                </div>
              </div>
            )}

            {/* Score Entry */}
            {selectedQuiz && selectedQuiz.questions.length > 0 && (
              <div>
                {entryMode === "individual" ? (
                  <>
                    <h2 className="text-2xl font-semibold mb-4">Enter Scores by Question</h2>
                    <div className="space-y-4">
                      {selectedQuiz.questions.map((question, index) => (
                        <div key={question.id} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="font-medium text-gray-700 mb-1">Question {index + 1}</div>
                              <div className="text-gray-800 mb-2">{question.questionText}</div>
                              <div className="text-sm text-gray-600">Max Points: {question.maxPoints}</div>
                            </div>
                            <div className="w-32">
                              <label className="block text-sm text-gray-600 mb-1">Points</label>
                              <input
                                type="number"
                                min="0"
                                max={question.maxPoints}
                                value={scores[question.id] || 0}
                                onChange={(e) => handleScoreChange(question.id, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg font-semibold"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Total Score Display */}
                    <div className="mt-6 bg-blue-50 border-2 border-blue-200 p-6 rounded-lg">
                      <div className="flex items-center justify-between text-2xl font-bold">
                        <span className="text-gray-800">Total Score:</span>
                        <span className="text-blue-600">
                          {calculateTotal()} / {calculateMaxTotal()}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-semibold mb-4">Enter Total Points</h2>
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg">
                      <div className="mb-4">
                        <p className="text-gray-600 mb-2">
                          Enter the total score for this quiz. Points will be distributed across all questions.
                        </p>
                        <p className="text-sm text-gray-500">
                          Maximum possible: {calculateMaxTotal()} points
                        </p>
                      </div>
                      <div className="flex items-center gap-6">
                        <label className="text-lg font-medium text-gray-800 whitespace-nowrap">
                          Total Score:
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={calculateMaxTotal()}
                          value={totalScore}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            const maxTotal = calculateMaxTotal();
                            setTotalScore(Math.max(0, Math.min(value, maxTotal)));
                          }}
                          className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-3xl font-bold"
                        />
                        <span className="text-2xl text-gray-600">/ {calculateMaxTotal()}</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-6">
                        <div className="w-full bg-gray-200 rounded-full h-4">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min((totalScore / calculateMaxTotal()) * 100, 100)}%`,
                            }}
                          ></div>
                        </div>
                        <div className="text-center mt-2 text-lg font-semibold text-gray-700">
                          {Math.round((totalScore / calculateMaxTotal()) * 100)}%
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Submit Button */}
            {selectedQuiz && selectedQuiz.questions.length > 0 && (
              <button
                type="submit"
                className="w-full bg-green-500 text-white px-6 py-4 rounded-lg hover:bg-green-600 transition-colors text-xl font-semibold"
              >
                Save Results
              </button>
            )}
          </form>

          {quizzes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-4">No quizzes available. Create a quiz first.</p>
              <Link to="/quizzes/new" className="text-blue-500 hover:underline">
                Create Quiz
              </Link>
            </div>
          )}

          {players.length === 0 && quizzes.length > 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-4">No players available. Add players first.</p>
              <Link to="/players" className="text-blue-500 hover:underline">
                Manage Players
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResultsEntry;
