const messagesEl = document.getElementById('messages');
const welcomeEl = document.getElementById('welcome');
const inputEl = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const voiceBtn = document.getElementById('voiceBtn');
const voiceHint = document.getElementById('voiceHint');
const STORAGE_KEY = 'melesa-chat-v1';
let isSending = false;

function addMessage(text, who, save = true) {
  welcomeEl.hidden = true;
  const row = document.createElement('div');
  row.className = 'message ' + who;
  if (who === 'assistant') {
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = 'M';
    row.appendChild(avatar);
  }
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = text;
  row.appendChild(bubble);
  messagesEl.appendChild(row);
  row.scrollIntoView({ behavior: 'smooth', block: 'end' });
  if (save) persistChat();
  return row;
}

function persistChat() {
  try {
    const items = [...messagesEl.querySelectorAll('.message')].map(row => ({
      role: row.classList.contains('user') ? 'user' : 'assistant',
      text: row.querySelector('.bubble')?.textContent || ''
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(-80)));
  } catch (error) {
    console.warn('Chat history could not be saved on this browser.', error);
  }
}

function restoreChat() {
  try {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(items) || !items.length) return;
    items.forEach(item => {
      if (item && typeof item.text === 'string' && ['user', 'assistant'].includes(item.role)) {
        addMessage(item.text, item.role, false);
      }
    });
  } catch (_) {
    localStorage.removeItem(STORAGE_KEY);
  }
  if (messagesEl.children.length) welcomeEl.hidden = true;
}

function demoReply(message) {
  const text = message.toLowerCase().trim();
  if (/^(hi|hello|hey|namaste|नमस्ते|hii|helo)[!. ]*$/.test(text)) {
    return 'Hey! 😊 Main Melesa hoon. Tum Hindi ya Hinglish mein baat kar sakte ho. Aaj main kis cheez mein help karun?';
  }
  if (text.includes('love you') || text.includes('i love you')) {
    return 'Aww, ye sweet hai 💜 Main ek AI companion hoon—main friendly conversation, ideas aur support ke liye yahan hoon. Batao, aaj kya baat karein?';
  }
  if (text.includes('kaise ho') || text.includes('कैसी हो') || text.includes('कैसे हो')) {
    return 'Main theek hoon aur help ke liye ready! 😊 Tum kaise ho? Aaj kya chal raha hai?';
  }
  if (text.includes('idea') || text.includes('project')) {
    return 'Ek practical idea: Daily Skill Tracker banao. Isme apna goal, aaj ki practice aur progress note karo. Pehle simple web page se shuru kar sakte ho. ✨';
  }
  if (text.includes('plan') || text.includes('routine')) {
    return 'Chalo ek simple plan banate hain:\n\n1. Aaj ka ek important task choose karo.\n2. 25 minute us par focus karo.\n3. Chhota break lo.\n4. End mein progress note karo.\n\nTumhara main goal kya hai? Main uske hisaab se plan banane mein help karungi.';
  }
  if (text.includes('sad') || text.includes('udaas') || text.includes('tension') || text.includes('pareshan') || text.includes(' परेशान')) {
    return 'Ye sunkar bura laga ki tum pareshan ho. ❤️ Aaram se batao kya hua. Main tumhari baat sun sakti hoon aur next step sochne mein help karungi.';
  }
  if (text.includes('help') || text.includes('madad') || text.includes('kya karu')) {
    return 'Bilkul, chalo step-by-step dekhte hain. 😊 Tum apni problem ya goal thoda detail mein batao—main use simple steps mein samjhane ki koshish karungi.';
  }
  return 'Main tumhari baat samajhne ki koshish kar rahi hoon. 💜 Abhi Melesa ka live AI connection set nahi hua hai, isliye ye demo mode hai aur main har sawaal ka real AI answer nahi de sakti. Live AI connect karne ke baad tum natural conversation kar paoge.';
}

async function getAIReply(message) {
  const apiBase = window.MELESA_API_URL;
  if (!apiBase) {
    await new Promise(resolve => window.setTimeout(resolve, 350));
    return demoReply(message);
  }
  const history = [...messagesEl.querySelectorAll('.message')].slice(-12).map(row => ({
    role: row.classList.contains('user') ? 'user' : 'assistant',
    content: row.querySelector('.bubble')?.textContent || ''
  })).filter(item => item.content && item.content !== 'Soch rahi hoon…');
  const response = await fetch(apiBase.replace(/\\/$/, '') + '/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: history })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'AI connection abhi available nahi hai.');
  if (typeof data.reply !== 'string' || !data.reply.trim()) throw new Error('AI se reply nahi mila. Dobara try karo.');
  return data.reply;
}

async function sendMessage(text = inputEl.value) {
  const message = String(text).trim();
  if (!message || isSending) return;
  addMessage(message, 'user');
  inputEl.value = '';
  inputEl.style.height = 'auto';
  isSending = true;
  sendBtn.disabled = true;
  inputEl.disabled = true;
  const pending = addMessage('Soch rahi hoon…', 'assistant');
  try {
    const reply = await getAIReply(message);
    const bubble = pending.querySelector('.bubble');
    if (bubble) bubble.textContent = reply;
  } catch (error) {
    const bubble = pending.querySelector('.bubble');
    if (bubble) bubble.textContent = 'AI connection error: ' + error.message + '\\n\\nBackend setup complete hone ke baad dobara try karo.';
  } finally {
    persistChat();
    isSending = false;
    sendBtn.disabled = false;
    inputEl.disabled = false;
    inputEl.focus();
  }
}

function resetChat() {
  messagesEl.replaceChildren();
  welcomeEl.hidden = false;
  inputEl.value = '';
  try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  inputEl.focus();
}

function speak(text) {
  if (!('speechSynthesis' in window)) {
    voiceHint.textContent = 'Is browser mein voice output supported nahi hai.';
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'hi-IN';
  utterance.rate = 0.96;
  const hindiVoice = window.speechSynthesis.getVoices().find(v => v.lang && v.lang.toLowerCase().startsWith('hi'));
  if (hindiVoice) utterance.voice = hindiVoice;
  window.speechSynthesis.speak(utterance);
}

sendBtn.addEventListener('click', () => sendMessage());
inputEl.addEventListener('keydown', event => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});
inputEl.addEventListener('input', () => {
  inputEl.style.height = 'auto';
  inputEl.style.height = Math.min(inputEl.scrollHeight, 140) + 'px';
});
document.querySelectorAll('[data-prompt]').forEach(button => button.addEventListener('click', () => sendMessage(button.dataset.prompt)));
document.getElementById('newChat').addEventListener('click', resetChat);
document.getElementById('clearChat').addEventListener('click', resetChat);

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang = 'hi-IN';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.addEventListener('start', () => {
    voiceBtn.classList.add('listening');
    voiceHint.textContent = 'Sun rahi hoon… ab bolo';
  });
  recognition.addEventListener('result', event => {
    inputEl.value = event.results[0][0].transcript;
    inputEl.focus();
    inputEl.dispatchEvent(new Event('input'));
  });
  recognition.addEventListener('end', () => {
    voiceBtn.classList.remove('listening');
    voiceHint.textContent = 'Enter to send · Shift + Enter for new line';
  });
  recognition.addEventListener('error', event => {
    voiceHint.textContent = event.error === 'not-allowed' ? 'Mic permission allow karo.' : 'Voice input available nahi hua; type karke bhejo.';
  });
  voiceBtn.addEventListener('click', () => {
    try { recognition.start(); } catch (_) { voiceHint.textContent = 'Voice input already starting hai.'; }
  });
} else {
  voiceBtn.addEventListener('click', () => { voiceHint.textContent = 'Voice input is browser mein supported nahi hai. Chrome try karo ya type karo.'; });
}

restoreChat();