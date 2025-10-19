import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <h1 className="text-6xl font-bold text-white text-center mb-12">Quiz Application</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
