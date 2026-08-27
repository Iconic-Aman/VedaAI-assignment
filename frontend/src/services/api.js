// Reason: API client with verbose failure logging for Render / Vercel cloud debugging
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
    console.log(`[API Upload] Appending question_paper: ${questionFile.name} (${questionFile.size} bytes)`);
  }
  if (answerFile) {
    formData.append('answer_sheet', answerFile);
    console.log(`[API Upload] Appending answer_sheet: ${answerFile.name} (${answerFile.size} bytes)`);
  }

  const url = `${API_BASE_URL}/upload`;
  console.log(`[API Upload] POST to: ${url}`);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error(`[API Upload ERROR] Status ${res.status}: ${errText}`);
      throw new Error(`Upload failed (${res.status}): ${errText || res.statusText}`);
    }
    const data = await res.json();
    console.log('[API Upload SUCCESS]', data);
    return data;
  } catch (err) {
    console.error('[API Upload NETWORK ERROR]', err);
    throw err;
  }
}

export async function processSession(sessionId) {
  const url = `${API_BASE_URL}/process/${sessionId}`;
  console.log(`[API Process] POST to: ${url}`);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' })
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error(`[API Process ERROR] Status ${res.status}: ${errText}`);
      throw new Error(`Process failed (${res.status}): ${errText || res.statusText}`);
    }
    const data = await res.json();
    console.log('[API Process SUCCESS]', data);
    return data;
  } catch (err) {
    console.error('[API Process NETWORK ERROR]', err);
    throw err;
  }
}

export async function getSessionData(sessionId) {
  const url = `${API_BASE_URL}/session/${sessionId}`;
  console.log(`[API Session] GET: ${url}`);
  try {
    const res = await fetch(url, {
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error(`[API Session ERROR] Status ${res.status}: ${errText}`);
      throw new Error(`Fetch session failed (${res.status}): ${errText || res.statusText}`);
    }
    const data = await res.json();
    console.log('[API Session SUCCESS]', data);
    return data;
  } catch (err) {
    console.error('[API Session NETWORK ERROR]', err);
    throw err;
  }
}
