const messagesEl = document.getElementById('messages');
const welcomeEl = document.getElementById('welcome');
const inputEl = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const voiceBtn = document.getElementById('voiceBtn');
const voiceHint = document.getElementById('voiceHint');

function addMessage(text, who) {
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
  return row;
}

function demoReply(message) {
  const text = message.toLowerCase();
  if (/\b(hi|hello|hey|namaste|नमस्ते)\b/.test(text)) return 'Hey! 😊 Main Melesa hoon. Tum kaise ho? Aaj kis baare mein baat karein?';
  if (text.includes('kaise ho') || text.includes('कैसी हो') || text.includes('कैसे हो')) return 'Main badhiya hoon! 😊 Tumse baat karne ke liye ready. Tum batao, aaj kya chal raha hai?';
  if (text.includes('idea') || text.includes('project')) return 'Ek useful idea: “Daily Skill Tracker” banao jahan tum apni learning, practice time aur daily progress save kar sako. Pehle simple HTML/CSS/JavaScript se start karo, phir Firebase add karna. ✨';
  if (text.includes('plan') || text.includes('routine')) return 'Chalo simple plan banate hain:\n1. Aaj ka ek important task choose karo.\n2. Us par 25 minute focus karo.\n3. 5 minute break lo.\n4. End mein apni progress note karo.\n\nApna main goal bataoge toh main plan ko aur useful bana sakti hoon.';
  if (text.includes('sad') || text.includes('udaas') || text.includes('tension') || text.includes('pareshan')) return 'Mujhe afsos hai ki tum aisa feel kar rahe ho. ❤️ Aaram se batao kya hua—main tumhari baat sunungi aur next step sochne mein help karungi.';
  if (text.includes('help') || text.includes('madad')) return 'Bilkul, main help karne ki koshish karungi. 😊 Apni problem thoda detail mein batao, phir hum use chhote-chhote steps mein solve karenge.';
  return 'Thanks for sharing! 💜 Main abhi starter/demo mode mein hoon, isliye live AI se jawab generate nahi kar rahi. Tumhara message UI mein kaam kar raha hai. Agle step mein secure backend + AI API connect karenge, taaki Melesa tumhare sawaalon ke real answers de sake.';
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
  const voices = window.speechSynthesis.getVoices();
  const hindiVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('hi'));
  if (hindiVoice) utterance.voice = hindiVoice;
  window.speechSynthesis.speak(utterance);
}

function sendMessage(text = inputEl.value) {
  const message = String(text).trim();
  if (!message) return;
  addMessage(message, 'user');
  inputEl.value = '';
  inputEl.style.height = 'auto';
  sendBtn.disabled = true;
  const pending = addMessage('Ek second…', 'assistant');
  window.setTimeout(() => {
    const reply = demoReply(message);
    const bubble = pending.querySelector('.bubble');
    if (bubble) bubble.textContent = reply;
    sendBtn.disabled = false;
    inputEl.focus();
  }, 450);
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
document.querySelectorAll('[data-prompt]').forEach(button => {
  button.addEventListener('click', () => sendMessage(button.dataset.prompt));
});
document.getElementById('newChat').addEventListener('click', resetChat);
document.getElementById('clearChat').addEventListener('click', resetChat);

function resetChat() {
  messagesEl.replaceChildren();
  welcomeEl.hidden = false;
  inputEl.value = '';
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

let recognition = null;
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.lang = 'hi-IN';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.addEventListener('start', () => {
    voiceBtn.classList.add('listening');
    voiceHint.textContent = 'Sun rahi hoon… ab bolo';
  });
  recognition.addEventListener('result', event => {
    const transcript = event.results[0][0].transcript;
    inputEl.value = transcript;
    inputEl.focus();
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
  voiceBtn.addEventListener('click', () => {
    voiceHint.textContent = 'Voice input is browser mein supported nahi hai. Chrome try karo ya type karo.';
  });
}
window.speechSynthesis?.getVoices?.();