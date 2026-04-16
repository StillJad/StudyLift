const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatLog = document.getElementById('chat-log');
const sendBtn = document.getElementById('send-btn');
const statusPill = document.getElementById('status-pill');
const modelInput = document.getElementById('assistant-model');
const promptChips = document.querySelectorAll('.prompt-chip');

function addMessage(text, role) {
  const el = document.createElement('div');
  el.className = `message ${role}`;
  el.textContent = text;
  chatLog.appendChild(el);
  chatLog.scrollTop = chatLog.scrollHeight;
  return el;
}

function setBusy(isBusy) {
  sendBtn.disabled = isBusy;
  chatInput.disabled = isBusy;
  statusPill.textContent = isBusy ? 'Thinking...' : 'Ready';
}

async function getGeminiReply(prompt) {
  const model = modelInput.value.trim() || 'gemini-2.5-flash';

  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt, model })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Request failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('No text was returned by Gemini.');
  }

  return text;
}

chatForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const prompt = chatInput.value.trim();
  if (!prompt) return;

  addMessage(prompt, 'user');
  chatInput.value = '';
  setBusy(true);

  const loading = addMessage('Thinking...', 'assistant');

  try {
    const reply = await getGeminiReply(prompt);
    loading.remove();
    addMessage(reply, 'assistant');
  } catch (error) {
    loading.remove();
    addMessage(error.message || 'Something went wrong.', 'assistant');
  } finally {
    setBusy(false);
    chatInput.focus();
  }
});

promptChips.forEach((chip) => {
  chip.addEventListener('click', () => {
    chatInput.value = chip.dataset.prompt || '';
    chatInput.focus();
  });
});

addMessage('Hi. Ask me anything you are studying, and I will keep it clear and exam-focused.', 'assistant');
