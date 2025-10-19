import { Quiz, Question } from '../types/index.js';

/**
 * Remove correct answers from a question for public viewing
 */
export function sanitizeQuestion(question: Question): Question {
  return {
    ...question,
    correctAnswer: '', // Remove the correct answer
  };
}

/**
 * Remove correct answers from all questions in a quiz for public viewing
 */
export function sanitizeQuiz(quiz: Quiz): Quiz {
  return {
    ...quiz,
    questions: quiz.questions.map(sanitizeQuestion),
  };
}

/**
 * Remove correct answers from multiple quizzes for public viewing
 */
export function sanitizeQuizzes(quizzes: Quiz[]): Quiz[] {
  return quizzes.map(sanitizeQuiz);
}

