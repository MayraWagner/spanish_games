# 🇪🇸 VerbaMundo — Spanish Vocabulary Games

An interactive website with **15 games** to help you master Spanish vocabulary and explore the culture, geography, history, politics, and music of Spain.

## 🎮 Games

| # | Game | Type | Description |
|---|------|------|-------------|
| 1 | **Naming Blitz** | ⏱ Timed | Name as many items in a category (food, animals) as fast as possible |
| 2 | **Speed Translate** | ⏱ Streak | Translate English → Spanish before the timer expires |
| 3 | **Story Fill-In** | 📖 Reading | Fill missing verb forms in real Latin American history stories |
| 4 | **Verb Flashcards** | 🃏 Review | Self-rated flashcard drill through verb meanings and examples |
| 5 | **Conjugation Forge** | ⚙️ Grammar | Type all 5 conjugation forms for random verb+tense combos |
| 6 | **Ahorcado (Hangman)** | 🪢 Spelling | Classic hangman with Spanish vocabulary and cultural hints |
| 7 | **Word Scramble** | 🔀 Spelling | Tap letters in the right order to unscramble the word |
| 8 | **Quick Draw** | 🎯 Multiple Choice | 4-option vocabulary quiz, 10 seconds per question |
| 9 | **Category Sort** | 📂 Classification | Sort verbs into the correct semantic category |
| 10 | **Verb Sprint** | 🏃 Production | Type as many verb infinitives as you can in 90 seconds |
| 11 | **True/False Blitz** | ✅ Judgment | Fast-fire correct/incorrect translation judgments |
| 12 | **Pop Culture Spotlight** | 📺 Culture | Spanish television, film, presenters, actors, and famous programmes |
| 13 | **Spain Explorer** | 🗺️ Geography | Cities, regions, rivers, islands, and landmarks |
| 14 | **Politics & History** | 🏛️ Civics | Spanish institutions, political vocabulary, and major historical periods |
| 15 | **Spanish Music Cloze** | 🎵 Music | Changing vocabulary and grammar blanks in original song-inspired learning passages |

## 🚀 Deploy to GitHub Pages

1. Create a new GitHub repository (e.g. `spanish-games`)
2. Upload all three files: `index.html`, `data.js`, `games.js`
3. Go to **Settings → Pages** → Source: **Deploy from branch** → branch: `main` → folder: `/ (root)` → Save
4. Your site will be live at `https://YOUR_USERNAME.github.io/spanish-games/`

## 📁 Files

```
index.html   ← Main HTML, styles, layout
data.js      ← All vocabulary data (verbs, words, stories, conjugations)
games.js     ← All 11 game engines
```

## 🌟 Features

- **Persistent score** saved in localStorage
- **Streak tracking** across all games
- **Cumulative correct-answer counter**
- 450+ vocabulary items, including a 257-entry advanced gym module plus board-game and relationship conversation sets
- Focused gym practice for equipment, facilities, anatomy and pain, exercises and programming, body positioning, and real conversations
- 3 Latin American history stories with grammar exercises
- Full verb conjugation tables (presente, pretérito, imperfecto, futuro)
- Mobile responsive design
- No dependencies, no build step — pure HTML/CSS/JS

## ➕ Adding More Words

Open `data.js` and extend any of the arrays:
- `DATA.verbs` — add verb objects with `{es, en, cat, ex}`
- `DATA.food.frutas` / `DATA.food.verduras` etc. — add food words
- `DATA.wordPairs` — add `{en, es}` translation pairs
- `DATA.hangmanWords` — add `{word, hint}` objects
- `DATA.stories` — add new story objects with fill-in-the-blank exercises
