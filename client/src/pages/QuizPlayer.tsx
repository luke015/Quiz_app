import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { quizApi } from "../services/api";

function QuizPlayer({ mode = "guessing" }) {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    loadQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, quiz]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const data = await quizApi.getById(id);
      setQuiz(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-3xl text-white">Loading quiz...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="text-3xl text-red-400 mb-4">{error}</div>
          <Link to="/quizzes" className="text-blue-400 hover:underline text-xl">
            Back to Quizzes
          </Link>
        </div>
      </div>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="text-3xl text-white mb-4">This quiz has no questions yet</div>
          <Link to="/quizzes" className="text-blue-400 hover:underline text-xl">
            Back to Quizzes
          </Link>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isAnswerMode = mode === "answers";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">{quiz.title}</h1>
            <p className="text-xl text-gray-300">{isAnswerMode ? "Answer Mode" : "Guessing Mode"}</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={toggleFullscreen}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-6 py-3 rounded-lg text-lg transition-colors text-gray-900"
            >
              {isFullscreen ? "Exit Fullscreen (F)" : "Fullscreen (F)"}
            </button>
            <Link
              to="/quizzes"
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-6 py-3 rounded-lg text-lg transition-colors text-gray-900"
            >
              Exit Quiz
            </Link>
          </div>
        </div>

        {/* Question Counter */}
        <div className="text-center mb-8">
          <div className="text-3xl font-bold">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </div>
          <div className="text-xl text-gray-300 mt-2">Max Points: {currentQuestion.maxPoints}</div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 md:p-12 mb-8 min-h-[500px] flex flex-col text-gray-900">
          {/* Question Text */}
          <div className="mb-8">
            <h2 className="text-3xl md:text-5xl font-bold leading-tight">{currentQuestion.questionText}</h2>
          </div>

          {/* Media Display */}
          {currentQuestion.mediaType !== "none" && (
            <div className="flex-1 flex items-center justify-center mb-8">
              {currentQuestion.mediaPath ? (
                <>
                  {currentQuestion.mediaType === "image" && (
                    <img
                      src={currentQuestion.mediaPath}
                      alt="Question media"
                      className="max-w-full max-h-[400px] rounded-lg shadow-2xl"
                    />
                  )}
                  {currentQuestion.mediaType === "video" && (
                    <video controls className="max-w-full max-h-[400px] rounded-lg shadow-2xl">
                      <source src={currentQuestion.mediaPath} />
                      Your browser does not support video playback.
                    </video>
                  )}
                  {currentQuestion.mediaType === "audio" && (
                    <div className="w-full max-w-2xl">
                      <audio controls className="w-full" controlsList="nodownload">
                        <source src={currentQuestion.mediaPath} type={
                          currentQuestion.mediaPath?.endsWith('.mp3') ? 'audio/mpeg' :
                          currentQuestion.mediaPath?.endsWith('.wav') ? 'audio/wav' :
                          currentQuestion.mediaPath?.endsWith('.ogg') ? 'audio/ogg' :
                          currentQuestion.mediaPath?.endsWith('.m4a') ? 'audio/mp4' :
                          'audio/mpeg'
                        } />
                        Your browser does not support audio playback.
                      </audio>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-yellow-500 bg-opacity-20 border-2 border-yellow-400 rounded-xl p-6 text-white">
                  <div className="text-xl font-semibold">
                    ⚠️ Media file not uploaded for this question ({currentQuestion.mediaType})
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Multiple Choice Options */}
          {currentQuestion.type === "multiple-choice" && currentQuestion.options && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {currentQuestion.options.map(
                (option, index) =>
                  option && (
                    <div
                      key={index}
                      className="bg-white bg-opacity-20 p-6 rounded-xl text-2xl font-semibold text-gray-900"
                    >
                      {String.fromCharCode(65 + index)}) {option}
                    </div>
                  )
              )}
            </div>
          )}

          {/* Answer Display (only in answer mode) */}
          {isAnswerMode && currentQuestion.correctAnswer && (
            <div className="mt-auto">
              <div className="bg-green-500 bg-opacity-30 border-2 border-green-400 rounded-xl p-6 text-white">
                <div className="text-2xl font-bold mb-2">Answer:</div>
                <div className="text-3xl">{currentQuestion.correctAnswer}</div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className={`px-8 py-4 rounded-lg text-2xl font-bold transition-all text-white ${
              currentQuestionIndex === 0 ? "bg-gray-600 cursor-not-allowed opacity-50" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            ← Previous
          </button>

          <div className="text-xl text-gray-300">Use arrow keys to navigate</div>

          <button
            onClick={handleNext}
            disabled={currentQuestionIndex === quiz.questions.length - 1}
            className={`px-8 py-4 rounded-lg text-2xl font-bold transition-all text-white ${
              currentQuestionIndex === quiz.questions.length - 1
                ? "bg-gray-600 cursor-not-allowed opacity-50"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuizPlayer;
