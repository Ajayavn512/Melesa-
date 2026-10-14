const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN ? process.env.ALLOWED_ORIGIN.split(',').map(x => x.trim()) : true
}));
app.use(express.json({ limit: '32kb' }));

app.get('/', (_req, res) => res.json({ name: 'Melesa AI API', status: 'online' }));
app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/api/chat', async (req, res) => {
  try {
    if (!API_KEY) return res.status(503).json({ error: 'Server setup incomplete: add GEMINI_API_KEY in hosting environment variables.' });
    const messages = Array.isArray(req.body.messages) ? req.body.messages : [];
    const latest = messages[messages.length - 1];
    if (!latest || typeof latest.content !== 'string' || !latest.content.trim()) {
      return res.status(400).json({ error: 'Please send a message.' });
    }
    const history = messages.slice(-12).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(m.content).slice(0, 4000) }]
    })).filter(m => m.parts[0].text.trim());

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(MODEL) + ':generateContent?key=' + encodeURIComponent(API_KEY),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: 'You are Melesa, a friendly, helpful AI companion. Reply naturally in the language the user uses, especially Hindi or Hinglish. Be clear, warm, honest, and practical. For complex tasks, explain step by step. Never claim to be human or to have feelings. Keep answers appropriately concise.' }] },
          contents: history,
          generationConfig: { temperature: 0.8, maxOutputTokens: 900 }
        })
      }
    );

    const data = await response.json();
    if (!response.ok) {
      console.error('Gemini API returned status', response.status);
      return res.status(502).json({ error: 'AI provider request failed. Check the API key, model name, and provider quota.' });
    }
    const answer = data.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('').trim();
    if (!answer) return res.status(502).json({ error: 'AI provider returned an empty reply. Please try again.' });
    res.json({ reply: answer });
  } catch (error) {
    console.error('Chat endpoint error:', error.message);
    res.status(500).json({ error: 'Something went wrong on the server. Please try again.' });
  }
});

app.listen(PORT, () => console.log('Melesa AI API listening on port ' + PORT));