import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Home() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-6xl font-bold text-white">Quiz Application</h1>
          {isAuthenticated && (
            <button
              onClick={logout}
              className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Logout
            </button>
          )}
        </div>

        {isAuthenticated && (
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg mb-6 text-center font-semibold">
            🔓 Admin Mode - Full Access
          </div>
        )}

        {!isAuthenticated && (
          <div className="bg-yellow-400 text-gray-800 px-6 py-3 rounded-lg mb-6 text-center">
            <p className="font-semibold">Guest Mode - Limited Access</p>
            <p className="text-sm mt-1">
              <Link to="/login" className="underline hover:text-gray-900">
                Login
              </Link>{" "}
              to access all features
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Admin-only features */}
          {isAuthenticated && (
            <>
              <Link
                to="/quizzes"
                className="bg-white rounded-lg p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105"
              >
                <div className="text-4xl mb-4">📝</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Manage Quizzes</h2>
                <p className="text-gray-600">Create, edit, and manage your quiz questions</p>
              </Link>

              <Link
                to="/players"
                className="bg-white rounded-lg p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105"
              >
                <div className="text-4xl mb-4">👥</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Manage Players</h2>
                <p className="text-gray-600">Add and manage quiz participants</p>
              </Link>

              <Link
                to="/results"
                className="bg-white rounded-lg p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105"
              >
                <div className="text-4xl mb-4">📊</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Enter Results</h2>
                <p className="text-gray-600">Record player scores for completed quizzes</p>
              </Link>
            </>
          )}

          {/* Public features - available to everyone */}
          <Link
            to="/results/individual"
            className="bg-white rounded-lg p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105"
          >
            <div className="text-4xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Individual Results</h2>
            <p className="text-gray-600">View detailed results for specific players</p>
          </Link>

          <Link
            to="/leaderboard"
            className="bg-white rounded-lg p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105"
          >
            <div className="text-4xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Leaderboard</h2>
            <p className="text-gray-600">View overall player rankings and scores</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
