import type { Quiz, Player, Result, LeaderboardEntry, UploadResponse, BulkResultsSubmission } from "../types";

const API_BASE = "/api";

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem("authToken");
};

// Helper function for making API calls
const apiCall = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Add existing headers
  if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      if (typeof value === 'string') {
        headers[key] = value;
      }
    });
  }

  // Add authorization header if token exists
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }

  return response.json();
};

// Quiz API
export const quizApi = {
  getAll: () => apiCall<Quiz[]>(`${API_BASE}/quizzes`),
  getById: (id: string) => apiCall<Quiz>(`${API_BASE}/quizzes/${id}`),
  create: (quiz: Partial<Quiz>) =>
    apiCall<Quiz>(`${API_BASE}/quizzes`, {
      method: "POST",
      body: JSON.stringify(quiz),
    }),
  update: (id: string, quiz: Partial<Quiz>) =>
    apiCall<Quiz>(`${API_BASE}/quizzes/${id}`, {
      method: "PUT",
      body: JSON.stringify(quiz),
    }),
  delete: (id: string) =>
    apiCall<{ message: string }>(`${API_BASE}/quizzes/${id}`, {
      method: "DELETE",
    }),
  addQuestion: (quizId: string, question: unknown) =>
    apiCall(`${API_BASE}/quizzes/${quizId}/questions`, {
      method: "POST",
      body: JSON.stringify(question),
    }),
  updateQuestion: (quizId: string, questionId: string, question: unknown) =>
    apiCall(`${API_BASE}/quizzes/${quizId}/questions/${questionId}`, {
      method: "PUT",
      body: JSON.stringify(question),
    }),
  deleteQuestion: (quizId: string, questionId: string) =>
    apiCall<{ message: string }>(`${API_BASE}/quizzes/${quizId}/questions/${questionId}`, {
      method: "DELETE",
    }),
};

// Player API
export const playerApi = {
  getAll: () => apiCall<Player[]>(`${API_BASE}/players`),
  getById: (id: string) => apiCall<Player>(`${API_BASE}/players/${id}`),
  create: (player: Partial<Player>) =>
    apiCall<Player>(`${API_BASE}/players`, {
      method: "POST",
      body: JSON.stringify(player),
    }),
  update: (id: string, player: Partial<Player>) =>
    apiCall<Player>(`${API_BASE}/players/${id}`, {
      method: "PUT",
      body: JSON.stringify(player),
    }),
  delete: (id: string) =>
    apiCall<{ message: string }>(`${API_BASE}/players/${id}`, {
      method: "DELETE",
    }),
};

// Results API
export const resultsApi = {
  getAll: () => apiCall<Result[]>(`${API_BASE}/results`),
  getByQuiz: (quizId: string) => apiCall<Result[]>(`${API_BASE}/results/quiz/${quizId}`),
  getByPlayer: (playerId: string) => apiCall<Result[]>(`${API_BASE}/results/player/${playerId}`),
  save: (result: Partial<Result>) =>
    apiCall<Result>(`${API_BASE}/results`, {
      method: "POST",
      body: JSON.stringify(result),
    }),
  saveBulk: (bulkResults: BulkResultsSubmission) =>
    apiCall<{ message: string; results: Result[] }>(`${API_BASE}/results/bulk`, {
      method: "POST",
      body: JSON.stringify(bulkResults),
    }),
  delete: (id: string) =>
    apiCall<{ message: string }>(`${API_BASE}/results/${id}`, {
      method: "DELETE",
    }),
  getLeaderboard: () => apiCall<LeaderboardEntry[]>(`${API_BASE}/results/leaderboard`),
  getRankingLeaderboard: () => apiCall<LeaderboardEntry[]>(`${API_BASE}/results/leaderboard/ranking`),
};

// Upload API
export const uploadFile = async (file: File): Promise<UploadResponse> => {
  const token = getAuthToken();
  const formData = new FormData();
  formData.append("file", file);

  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Upload failed" }));
    throw new Error(error.error || "Upload failed");
  }

  return response.json();
};
