import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { quizApi, playerApi, resultsApi } from "../services/api";
import type { Quiz, Player, Result } from "../types";

function IndividualResults() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState("");
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [filteredResult, setFilteredResult] = useState<Result | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedQuizId && selectedPlayerId) {
      filterResults();
    } else {
      setFilteredResult(null);
      setSelectedQuiz(null);
    }
  }, [selectedQuizId, selectedPlayerId, results]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [quizzesData, playersData, resultsData] = await Promise.all([
        quizApi.getAll(),
        playerApi.getAll(),
        resultsApi.getAll(),
      ]);
      setQuizzes(quizzesData);
      setPlayers(playersData);
      setResults(resultsData);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterResults = async () => {
    // Find the result for this specific quiz and player
    const result = results.find(
      (r) => r.quizId === selectedQuizId && r.playerId === selectedPlayerId
    );

    if (result) {
      setFilteredResult(result);
      // Load the full quiz details to show question texts
      try {
        const quiz = await quizApi.getById(selectedQuizId);
        setSelectedQuiz(quiz);
      } catch (err: any) {
        setError(err.message);
      }
    } else {
      setFilteredResult(null);
      setSelectedQuiz(null);
    }
  };

  const getPlayerName = (playerId: string) => {
    const player = players.find((p) => p.id === playerId);
    return player ? player.name : "Unknown Player";
  };

  const getQuizTitle = (quizId: string) => {
    const quiz = quizzes.find((q) => q.id === quizId);
    return quiz ? quiz.title : "Unknown Quiz";
  };

  const getQuestionDetails = (questionId: string) => {
    if (!selectedQuiz) return null;
    return selectedQuiz.questions.find((q) => q.id === questionId);
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
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Individual Results</h1>
          <Link
            to="/"
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Back to Home
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Search Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Player Selection */}
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Select Player
              </label>
              <select
                value={selectedPlayerId}
                onChange={(e) => setSelectedPlayerId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              >
                <option value="">-- Select a player --</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Quiz Selection */}
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Select Quiz
              </label>
              <select
                value={selectedQuizId}
                onChange={(e) => setSelectedQuizId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              >
                <option value="">-- Select a quiz --</option>
                {quizzes.map((quiz) => (
                  <option key={quiz.id} value={quiz.id}>
                    {quiz.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Display */}
        {selectedPlayerId && selectedQuizId && (
          <div className="bg-white rounded-lg shadow-md p-6">
            {filteredResult && selectedQuiz ? (
              <div>
                {/* Header */}
                <div className="mb-6 pb-4 border-b-2 border-gray-200">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    {getPlayerName(filteredResult.playerId)}
                  </h2>
                  <p className="text-xl text-gray-600 mb-1">
                    Quiz: {getQuizTitle(filteredResult.quizId)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Completed: {new Date(filteredResult.completedAt).toLocaleString()}
                  </p>
                </div>

                {/* Total Score */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg mb-1">Total Score</div>
                      <div className="text-5xl font-bold">{filteredResult.totalScore}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg mb-1">Max Possible</div>
                      <div className="text-5xl font-bold">
                        {selectedQuiz.questions.reduce((sum, q) => sum + q.maxPoints, 0)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg mb-1">Percentage</div>
                      <div className="text-5xl font-bold">
                        {Math.round(
                          (filteredResult.totalScore /
                            selectedQuiz.questions.reduce((sum, q) => sum + q.maxPoints, 0)) *
                            100
                        )}
                        %
                      </div>
                    </div>
                  </div>
                </div>

                {/* Question-by-Question Breakdown */}
                <h3 className="text-2xl font-semibold mb-4">Question Breakdown</h3>
                <div className="space-y-4">
                  {filteredResult.questionResults.map((qr, index) => {
                    const question = getQuestionDetails(qr.questionId);
                    if (!question) return null;

                    const percentage = (qr.pointsAwarded / question.maxPoints) * 100;

                    return (
                      <div
                        key={qr.questionId}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-lg font-bold text-gray-700">
                                Q{index + 1}
                              </span>
                              <span className="text-gray-800">{question.questionText}</span>
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                              Type: {question.type === "multiple-choice" ? "Multiple Choice" : "Text"}
                              {question.correctAnswer && (
                                <span className="ml-4">
                                  Correct Answer: <strong>{question.correctAnswer}</strong>
                                </span>
                              )}
                            </div>
                            {/* Progress Bar */}
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                                <span>Score</span>
                                <span>
                                  {qr.pointsAwarded} / {question.maxPoints} ({Math.round(percentage)}%)
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                  className={`h-3 rounded-full transition-all ${
                                    percentage >= 80
                                      ? "bg-green-500"
                                      : percentage >= 50
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                  }`}
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className={`text-3xl font-bold ${
                                percentage >= 80
                                  ? "text-green-600"
                                  : percentage >= 50
                                  ? "text-yellow-600"
                                  : "text-red-600"
                              }`}
                            >
                              {qr.pointsAwarded}
                            </div>
                            <div className="text-sm text-gray-600">points</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-xl text-gray-600 mb-2">No results found</p>
                <p className="text-gray-500">
                  This player hasn't completed this quiz yet, or the results haven't been entered.
                </p>
                <Link
                  to="/results"
                  className="inline-block mt-4 text-blue-500 hover:underline text-lg"
                >
                  Enter Results
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        {!selectedPlayerId || !selectedQuizId ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <div className="text-4xl mb-3">👆</div>
            <p className="text-lg text-gray-700">
              Select a player and a quiz above to view detailed results
            </p>
          </div>
        ) : null}

        {/* All Results Summary */}
        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-2xl font-semibold mb-4">All Results Summary</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Player
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Quiz
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      Score
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {results.map((result) => (
                    <tr key={result.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-800">
                        {getPlayerName(result.playerId)}
                      </td>
                      <td className="px-4 py-3 text-gray-800">{getQuizTitle(result.quizId)}</td>
                      <td className="px-4 py-3 text-center font-semibold text-blue-600">
                        {result.totalScore}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-sm">
                        {new Date(result.completedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => {
                            setSelectedPlayerId(result.playerId);
                            setSelectedQuizId(result.quizId);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="text-blue-500 hover:text-blue-700 font-medium text-sm"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default IndividualResults;

