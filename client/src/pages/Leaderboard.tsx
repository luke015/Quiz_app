import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { resultsApi } from "../services/api";

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await resultsApi.getLeaderboard();
      setLeaderboard(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getMedalEmoji = (position) => {
    switch (position) {
      case 0:
        return "🥇";
      case 1:
        return "🥈";
      case 2:
        return "🥉";
      default:
        return "🏅";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-400 to-orange-500">
        <div className="text-3xl text-white font-bold">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg">🏆 Leaderboard</h1>
          <Link
            to="/"
            className="bg-white bg-opacity-20 backdrop-blur-sm text-gray-900 px-6 py-3 rounded-lg hover:bg-opacity-30 transition-colors text-lg font-semibold"
          >
            Back to Home
          </Link>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        {leaderboard.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <p className="text-gray-600 text-2xl mb-6">No results yet. Start playing quizzes and entering scores!</p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/quizzes"
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors text-lg"
              >
                View Quizzes
              </Link>
              <Link
                to="/results"
                className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors text-lg"
              >
                Enter Results
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-8">
                <div className="flex items-end justify-center gap-4 max-w-3xl mx-auto">
                  {/* Second Place */}
                  <div className="flex-1 text-center">
                    <div className="bg-white rounded-lg p-6 transform hover:scale-105 transition-transform">
                      <div className="text-6xl mb-2">🥈</div>
                      <div className="text-2xl font-bold text-gray-800 mb-2">{leaderboard[1].playerName}</div>
                      <div className="text-3xl font-bold text-purple-600">{leaderboard[1].totalPoints}</div>
                      <div className="text-sm text-gray-600">points</div>
                    </div>
                  </div>

                  {/* First Place */}
                  <div className="flex-1 text-center">
                    <div className="bg-yellow-100 border-4 border-yellow-400 rounded-lg p-8 transform hover:scale-105 transition-transform">
                      <div className="text-8xl mb-2">🥇</div>
                      <div className="text-3xl font-bold text-gray-800 mb-2">{leaderboard[0].playerName}</div>
                      <div className="text-5xl font-bold text-yellow-600">{leaderboard[0].totalPoints}</div>
                      <div className="text-lg text-gray-600">points</div>
                    </div>
                  </div>

                  {/* Third Place */}
                  <div className="flex-1 text-center">
                    <div className="bg-white rounded-lg p-6 transform hover:scale-105 transition-transform">
                      <div className="text-6xl mb-2">🥉</div>
                      <div className="text-2xl font-bold text-gray-800 mb-2">{leaderboard[2].playerName}</div>
                      <div className="text-3xl font-bold text-orange-600">{leaderboard[2].totalPoints}</div>
                      <div className="text-sm text-gray-600">points</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Full Rankings Table */}
            <div className="p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Full Rankings</h2>
              <div className="space-y-3">
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.playerId}
                    className={`flex items-center justify-between p-6 rounded-xl transition-all ${
                      index < 3
                        ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-6">
                      <div className="text-5xl font-bold text-gray-400 w-16 text-center">{index + 1}</div>
                      <div className="text-4xl">{getMedalEmoji(index)}</div>
                      <div>
                        <div className="text-2xl font-bold text-gray-800">{entry.playerName}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-blue-600">{entry.totalPoints}</div>
                      <div className="text-lg text-gray-600">points</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <button
            onClick={loadLeaderboard}
            className="bg-white bg-opacity-20 backdrop-blur-sm text-gray-900 px-8 py-4 rounded-lg hover:bg-opacity-30 transition-colors text-xl font-semibold"
          >
            🔄 Refresh Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
