// Reason: API client fetching base URL and Bearer token with aman-secret fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_TOKEN = import.meta.env.VITE_API_TOKEN || 'aman-secret';

function getAuthHeaders(customHeaders = {}) {
  const headers = { ...customHeaders };
  if (API_TOKEN) {
    headers['Authorization'] = `Bearer ${API_TOKEN}`;
  }
  return headers;
}

export async function uploadFiles(questionFile, answerFile = null) {
  const formData = new FormData();
  if (questionFile) {
    formData.append('question_paper', questionFile);
  }
  if (answerFile) {
    formData.append('answer_sheet', answerFile);
  }

  const url = `${API_BASE_URL}/upload`;
  console.log(`[API] Uploading files to: ${url}`);
  const res = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Upload failed (${res.status}): ${errText || res.statusText}`);
  }
  return res.json();
}

export async function processSession(sessionId) {
  const url = `${API_BASE_URL}/process/${sessionId}`;
  console.log(`[API] Processing session at: ${url}`);
  const res = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' })
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Process failed (${res.status}): ${errText || res.statusText}`);
  }
  return res.json();
}

export async function getSessionData(sessionId) {
  const url = `${API_BASE_URL}/session/${sessionId}`;
  console.log(`[API] Fetching session results from: ${url}`);
  const res = await fetch(url, {
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Fetch session failed (${res.status}): ${errText || res.statusText}`);
  }
  return res.json();
}
