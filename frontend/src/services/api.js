import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 300000, // 5 min timeout for first-time model loading + LLM operations
});

// ── Upload Service ───────────────────────────────────────
export const uploadDocument = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      if (onProgress) onProgress(percent);
    },
  });
  return response.data;
};

// ── Query Service ────────────────────────────────────────
export const queryDocuments = async (question, documentId = null, topK = 5) => {
  const response = await api.post('/query', {
    question,
    document_id: documentId,
    top_k: topK,
  });
  return response.data;
};

// ── Summarize Service ────────────────────────────────────
export const summarizeDocument = async (documentId, summaryType = 'concise') => {
  const response = await api.post('/summarize', {
    document_id: documentId,
    summary_type: summaryType,
  });
  return response.data;
};

// ── Translate Service ────────────────────────────────────
export const translateText = async (text, targetLanguage = 'hi') => {
  const response = await api.post('/translate', {
    text,
    target_language: targetLanguage,
  });
  return response.data;
};

// ── TTS Service ──────────────────────────────────────────
export const textToSpeech = async (text, language = 'en') => {
  const response = await api.post('/tts', {
    text,
    language,
  });
  return response.data;
};

// ── Documents Service ────────────────────────────────────
export const getDocuments = async () => {
  const response = await api.get('/documents');
  return response.data;
};

export const deleteDocument = async (docId) => {
  const response = await api.delete(`/document/${docId}`);
  return response.data;
};

// ── Languages Service ────────────────────────────────────
export const getLanguages = async () => {
  const response = await api.get('/languages');
  return response.data;
};

// ── Health Check ─────────────────────────────────────────
export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
