# नेपाली सिक्नुहोस् — Learn Nepali
A free, open-source tool for learning spoken Nepali — the way people actually talk, not textbook style.
**Live site →** [thisizkavi-lab.github.io/learn-nepalilanguage](https://thisizkavi-lab.github.io/learn-nepalilanguage/)
---
## Why This Exists
30 million people speak Nepali. Good free resources for learning it — especially for speaking and listening — are hard to find. Most material out there is either textbook grammar or scattered across random PDFs.
This project focuses on **real-life Nepali**: common words, everyday phrases, how people actually greet each other, order food, and have conversations. The goal is to use **multimedia** (audio, images, video, text) to make learning feel natural, not academic.
I'm one person starting this. I won't capture everything or get everything right. If you speak Nepali and something is off — a wrong translation, a phrase nobody actually says, or something important that's missing — **your suggestions are welcome**.
## What's Here
| Section | What It Does |
|---------|-------------|
| **Home** | Reference docs — alphabet, vowels, consonants, script basics |
| **Writing Practice** | Trace and practice Devanagari characters |
| **Reading Practice** | 100 common words → phrases → sentences → paragraphs → essays |
| **Quiz** | Flashcards with flip + multiple choice, test both directions |
### Features
- 🔊 **Audio pronunciation** — click any word or phrase to hear it (Web Speech API)
- **Aa** **Romanization toggle** — show/hide transliteration under each word
- ✓ **Progress tracking** — mark words as learned, progress bar per level
- 🃏 **Flashcard quiz** — 3D flip cards with self-grading
- 📝 **Multiple choice quiz** — 4 options, streak tracking, configurable question count
- 🌙 **Dark/light theme** — saved across sessions
## Run Locally
```bash
git clone https://github.com/thisizkavi-lab/learn-nepalilanguage.git
cd learn-nepalilanguage
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.
## Contributing
This is an open project. If you speak Nepali and want to help:
- **Fix something wrong** — open an [issue](https://github.com/thisizkavi-lab/learn-nepalilanguage/issues) or PR
- **Add content** — more words, phrases, real conversations, stories
- **Add media** — record audio clips, suggest images/videos that help explain concepts
- **Improve translations** — make things sound more natural, less textbook
- **Suggest features** — what would actually help someone learn Nepali?
No contribution is too small. Even pointing out "nobody says it like that" is useful.
## Roadmap
- [ ] illustrated stories (short stories with images)
- [ ] Real audio recordings (native speaker clips instead of TTS)
- [ ] Conversation practice (dialogue-based scenarios)
- [ ] More vocabulary themes (travel, food, family, work)
## Tech
Plain HTML, CSS, JavaScript. Vite for dev server. No frameworks. Deployed on GitHub Pages.
