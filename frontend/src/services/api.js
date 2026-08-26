// Reason: API client fetching base URL exclusively from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function uploadFiles(questionFile, answerFile) {
  const formData = new FormData();
  formData.append('question_paper', questionFile);
  formData.append('answer_sheet', answerFile);

  const res = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
  return res.json();
}

export async function processSession(sessionId) {
  const res = await fetch(`${API_BASE_URL}/process/${sessionId}`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error(`Process failed: ${res.statusText}`);
  return res.json();
}

export async function getSessionData(sessionId) {
  const res = await fetch(`${API_BASE_URL}/session/${sessionId}`);
  if (!res.ok) throw new Error(`Fetch session failed: ${res.statusText}`);
  return res.json();
}
