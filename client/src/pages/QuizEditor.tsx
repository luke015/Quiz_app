import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { quizApi, uploadFile } from "../services/api";

function QuizEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [quiz, setQuiz] = useState({
    title: "",
    description: "",
  });
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionForm, setQuestionForm] = useState({
    questionText: "",
    type: "text",
    mediaType: "none",
    mediaPath: null,
    maxPoints: 1,
    options: ["", "", "", ""],
    correctAnswer: "",
  });
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    if (isEdit) {
      loadQuiz();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const data = await quizApi.getById(id);
      setQuiz({ title: data.title, description: data.description });
      setQuestions(data.questions || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuiz = async (e) => {
    e.preventDefault();

    try {
      if (isEdit) {
        await quizApi.update(id, quiz);
      } else {
        const newQuiz = await quizApi.create(quiz);
        navigate(`/quizzes/${newQuiz.id}/edit`);
      }
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log('Uploading file:', file.name, 'Type:', file.type, 'Size:', file.size);

    try {
      setUploadingFile(true);
      const result = await uploadFile(file);
      console.log('Upload successful:', result);
      setQuestionForm((prev) => ({
        ...prev,
        mediaPath: result.path,
      }));
      setError(null);
    } catch (err) {
      console.error('Upload error:', err);
      setError(`Upload failed: ${err.message}`);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();

    if (!isEdit) {
      setError("Please save the quiz first before adding questions");
      return;
    }

    try {
      if (editingQuestion) {
        await quizApi.updateQuestion(id, editingQuestion.id, questionForm);
      } else {
        await quizApi.addQuestion(id, questionForm);
      }

      loadQuiz();
      resetQuestionForm();
      setShowQuestionForm(false);
      setEditingQuestion(null);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      await quizApi.deleteQuestion(id, questionId);
      loadQuiz();
    } catch (err) {
      setError(err.message);
    }
  };

  const startEditQuestion = (question) => {
    setEditingQuestion(question);
    setQuestionForm({
      questionText: question.questionText,
      type: question.type,
      mediaType: question.mediaType,
      mediaPath: question.mediaPath,
      maxPoints: question.maxPoints,
      options: question.options.length > 0 ? question.options : ["", "", "", ""],
      correctAnswer: question.correctAnswer,
    });
    setShowQuestionForm(true);
  };

  const resetQuestionForm = () => {
    setQuestionForm({
      questionText: "",
      type: "text",
      mediaType: "none",
      mediaPath: null,
      maxPoints: 1,
      options: ["", "", "", ""],
      correctAnswer: "",
    });
  };

  const cancelQuestionForm = () => {
    resetQuestionForm();
    setShowQuestionForm(false);
    setEditingQuestion(null);
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
          <h1 className="text-4xl font-bold text-gray-800">{isEdit ? "Edit Quiz" : "Create New Quiz"}</h1>
          <Link
            to="/quizzes"
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Back to Quizzes
          </Link>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Quiz Details</h2>
          <form onSubmit={handleSaveQuiz} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quiz Title *</label>
              <input
                type="text"
                value={quiz.title}
                onChange={(e) => setQuiz((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={quiz.description}
                onChange={(e) => setQuiz((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>

            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              {isEdit ? "Update Quiz" : "Create Quiz"}
            </button>
          </form>
        </div>

        {isEdit && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Questions ({questions.length})</h2>
              {!showQuestionForm && (
                <button
                  onClick={() => setShowQuestionForm(true)}
                  className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Add Question
                </button>
              )}
            </div>

            {showQuestionForm && (
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h3 className="text-xl font-semibold mb-4">{editingQuestion ? "Edit Question" : "New Question"}</h3>
                <form onSubmit={handleSaveQuestion} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Question Text *</label>
                    <textarea
                      value={questionForm.questionText}
                      onChange={(e) => setQuestionForm((prev) => ({ ...prev, questionText: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="2"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Question Type *</label>
                      <select
                        value={questionForm.type}
                        onChange={(e) => setQuestionForm((prev) => ({ ...prev, type: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="text">Text Answer</option>
                        <option value="multiple-choice">Multiple Choice</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max Points *</label>
                      <input
                        type="number"
                        value={questionForm.maxPoints}
                        onChange={(e) => setQuestionForm((prev) => ({ ...prev, maxPoints: parseInt(e.target.value) }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Media Type</label>
                    <select
                      value={questionForm.mediaType}
                      onChange={(e) => setQuestionForm((prev) => ({ ...prev, mediaType: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="none">No Media</option>
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                      <option value="audio">Audio</option>
                    </select>
                  </div>

                  {questionForm.mediaType !== "none" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Upload Media File</label>
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        accept={
                          questionForm.mediaType === "image"
                            ? "image/*"
                            : questionForm.mediaType === "video"
                              ? "video/*"
                              : "audio/*"
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={uploadingFile}
                      />
                      {uploadingFile && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
                      {questionForm.mediaPath && (
                        <p className="text-sm text-green-600 mt-1">File uploaded successfully</p>
                      )}
                    </div>
                  )}

                  {questionForm.type === "multiple-choice" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Answer Options</label>
                      {questionForm.options.map((option, index) => (
                        <input
                          key={index}
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...questionForm.options];
                            newOptions[index] = e.target.value;
                            setQuestionForm((prev) => ({ ...prev, options: newOptions }));
                          }}
                          placeholder={`Option ${String.fromCharCode(65 + index)}`}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                        />
                      ))}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Correct Answer (for reference)
                    </label>
                    <input
                      type="text"
                      value={questionForm.correctAnswer}
                      onChange={(e) => setQuestionForm((prev) => ({ ...prev, correctAnswer: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      {editingQuestion ? "Update Question" : "Add Question"}
                    </button>
                    <button
                      type="button"
                      onClick={cancelQuestionForm}
                      className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {questions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No questions yet. Add your first question!</p>
            ) : (
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div key={question.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-lg">Q{index + 1}.</span>
                          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">{question.type}</span>
                          <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                            {question.maxPoints} pts
                          </span>
                          {question.mediaType !== "none" && (
                            <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">
                              {question.mediaType}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-800 mb-2">{question.questionText}</p>
                        {question.type === "multiple-choice" && question.options.length > 0 && (
                          <div className="ml-4 text-sm text-gray-600">
                            {question.options.map((opt, idx) => (
                              <div key={idx}>
                                {String.fromCharCode(65 + idx)}) {opt}
                              </div>
                            ))}
                          </div>
                        )}
                        {question.correctAnswer && (
                          <p className="text-sm text-green-600 mt-2">Answer: {question.correctAnswer}</p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => startEditQuestion(question)}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizEditor;
