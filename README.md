# Melesa AI 💜

A separate personal AI companion project with a Hindi/Hinglish chat interface and browser voice features.

## Current starter features
- Responsive chat interface for desktop and mobile
- Hindi/Hinglish demo replies (not connected to a live AI model yet)
- Browser speech-to-text where supported
- Hindi text-to-speech where a Hindi voice is installed
- New chat / clear chat controls
- No API keys or secrets stored in the frontend

## Run locally
1. Download or clone this repository.
2. Open the folder in VS Code.
3. Open `index.html` in a browser, or use the VS Code Live Server extension.
4. Allow microphone access if you want to try voice input.

Voice recognition support depends on the browser and may require HTTPS or localhost. Voice output depends on available device voices.

## Publish with GitHub Pages
1. Open the repository's **Settings**.
2. Open **Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Choose branch `main` and folder `/ (root)`, then save.
5. Wait for GitHub Pages to publish the site. The Pages URL appears in the same section.

## Important
This is the first UI starter, not a complete AI assistant. The replies are demo responses. The next development step is a small backend that calls an AI provider using a server-side environment variable. Never paste an API key into `script.js` or commit it to GitHub.

## Roadmap
- [ ] Connect a real AI model through a secure backend
- [ ] Add optional sign-in and saved chat history
- [ ] Improve Hindi/Hinglish conversation quality
- [ ] Test mobile voice support
- [ ] Explore Android packaging after the web app works well