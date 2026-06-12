// ======================================================
// VERBAMUNDO — Games Engine
// ======================================================

// ─── GLOBAL STATE ─────────────────────────────────────
let globalScore = parseInt(localStorage.getItem('vm_score') || '0');
let gamesPlayed = parseInt(localStorage.getItem('vm_played') || '0');
let wordsLearned = parseInt(localStorage.getItem('vm_words') || '0');
let bestStreak = parseInt(localStorage.getItem('vm_streak') || '0');
let currentStreak = 0;
let gameTimer = null;
let gameActive = false;

// ─── GAME CATALOG ─────────────────────────────────────
const GAMES = [
  {
    id: 'naming_blitz',
    icon: '🍎',
    title: 'Naming Blitz',
    desc: '60 seconds to name as many items in a category as possible. Type fast — every valid Spanish word scores!',
    badges: ['timed','60s'],
    accentColor: '#e8a838',
    launch: launchNamingBlitz
  },
  {
    id: 'speed_translate',
    icon: '⚡',
    title: 'Speed Translate',
    desc: 'A word flashes on screen — type its Spanish translation before time runs out. Build a streak for bonus points.',
    badges: ['timed','streak'],
    accentColor: '#c8474a',
    launch: launchSpeedTranslate
  },
  {
    id: 'story_fill',
    icon: '📜',
    title: 'Story Fill-In',
    desc: 'Read a real story about Latin American history and fill in the missing verb forms. Context clues help!',
    badges: ['story','verb'],
    accentColor: '#4a9e8a',
    launch: launchStoryFill
  },
  {
    id: 'flashcards',
    icon: '🃏',
    title: 'Verb Flashcards',
    desc: 'Flip through cards showing Spanish verbs. Self-rate how well you knew it — spaced repetition style.',
    badges: ['verbs','review'],
    accentColor: '#7c6aeb',
    launch: launchFlashcards
  },
  {
    id: 'conjugation_forge',
    icon: '⚙️',
    title: 'Conjugation Forge',
    desc: 'Fill in all forms of a verb conjugation table. Presente, pretérito, imperfecto, futuro — can you nail them all?',
    badges: ['verb','grammar'],
    accentColor: '#e8a838',
    launch: launchConjugationForge
  },
  {
    id: 'hangman',
    icon: '🪢',
    title: 'Ahorcado (Hangman)',
    desc: 'Classic hangman with Spanish vocabulary. Each word comes with a hint about its meaning or cultural context.',
    badges: ['spelling','vocab'],
    accentColor: '#4a9e8a',
    launch: launchHangman
  },
  {
    id: 'scramble',
    icon: '🔀',
    title: 'Word Scramble',
    desc: 'Unscramble the letters to form a Spanish word. A clue tells you what it means. Tap letters in order.',
    badges: ['spelling','timed'],
    accentColor: '#c8474a',
    launch: launchScramble
  },
  {
    id: 'multiple_choice',
    icon: '🎯',
    title: 'Quick Draw',
    desc: 'Four options, one correct translation. You have 10 seconds per question — how many can you chain together?',
    badges: ['timed','vocab'],
    accentColor: '#e8a838',
    launch: launchQuickDraw
  },
  {
    id: 'category_sort',
    icon: '📂',
    title: 'Category Sort',
    desc: 'Words pour in — drag them into the right Spanish category buckets. Movement, Emotion, Communication…',
    badges: ['sorting','vocab'],
    accentColor: '#7c6aeb',
    launch: launchCategorySort
  },
  {
    id: 'verb_sprint',
    icon: '🏃',
    title: 'Verb Sprint',
    desc: '90 seconds, Spanish verbs only — type as many verb infinitivos as you can recall. No repeats!',
    badges: ['timed','verbs'],
    accentColor: '#4a9e8a',
    launch: launchVerbSprint
  },
  {
    id: 'vocab_quiz',
    icon: '🧠',
    title: 'True/False Blitz',
    desc: 'A Spanish word and a proposed translation appear. Is it correct? Tap Yes or No as fast as possible!',
    badges: ['timed','vocab'],
    accentColor: '#c8474a',
    launch: launchTrueFalse
  },
];

// ─── BOOT ─────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  renderGameGrid();
  updateGlobalScore();
  updateStats();
});

function renderGameGrid() {
  const grid = document.getElementById('gamesGrid');
  grid.innerHTML = GAMES.map(g => `
    <div class="game-card" style="--card-accent:${g.accentColor}" onclick="GAMES.find(x=>x.id==='${g.id}').launch()">
      <div class="card-icon">${g.icon}</div>
      <div class="card-title">${g.title}</div>
      <div class="card-desc">${g.desc}</div>
      <div class="card-meta">
        ${g.badges.map(b => `<span class="badge ${b==='timed'?'timed':b==='story'||b==='vocab'?'story':b==='verb'||b==='verbs'?'verb':''}">${b}</span>`).join('')}
      </div>
    </div>
  `).join('');
}

// ─── MODAL HELPERS ────────────────────────────────────
function openModal(html) {
  document.getElementById('gameArea').innerHTML = html;
  document.getElementById('modalOverlay').classList.remove('hidden');
}

function closeModal() {
  clearTimers();
  gameActive = false;
  document.getElementById('modalOverlay').classList.add('hidden');
}

function clearTimers() {
  if (gameTimer) { clearInterval(gameTimer); gameTimer = null; }
}

// ─── NOTIFICATIONS ────────────────────────────────────
function showNotif(msg, type='', dur=1600) {
  const n = document.getElementById('notif');
  n.textContent = msg;
  n.className = `notif show ${type}`;
  setTimeout(() => n.className = 'notif', dur);
}

// ─── SCORE HELPERS ────────────────────────────────────
function addScore(pts) {
  globalScore += pts;
  localStorage.setItem('vm_score', globalScore);
  updateGlobalScore();
}

function addWordsLearned(n) {
  wordsLearned += n;
  localStorage.setItem('vm_words', wordsLearned);
}

function incStreak() {
  currentStreak++;
  if (currentStreak > bestStreak) {
    bestStreak = currentStreak;
    localStorage.setItem('vm_streak', bestStreak);
  }
  updateStats();
}

function resetStreak() { currentStreak = 0; }

function bumpPlayed() {
  gamesPlayed++;
  localStorage.setItem('vm_played', gamesPlayed);
  updateStats();
}

function updateGlobalScore() {
  document.getElementById('globalScore').textContent = `⭐ ${globalScore.toLocaleString()} pts`;
}

function updateStats() {
  document.getElementById('statPlayed').textContent = gamesPlayed;
  document.getElementById('statWords').textContent = wordsLearned;
  document.getElementById('statStreak').textContent = bestStreak;
}

// ─── UTILS ────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom(arr, n) {
  return shuffle(arr).slice(0, n);
}

function normalizeSpanish(s) {
  return s.trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function timerHTML(id='timerFill', labelId='timerLabel') {
  return `
    <div class="timer-wrap">
      <div class="timer-bar"><div class="timer-fill" id="${id}" style="width:100%"></div></div>
      <div class="timer-label" id="${labelId}">—</div>
    </div>`;
}

function startTimer(seconds, onTick, onEnd, fillId='timerFill', labelId='timerLabel') {
  let remaining = seconds;
  const fill = document.getElementById(fillId);
  const label = document.getElementById(labelId);
  clearTimers();
  const update = () => {
    if (!fill) return;
    const pct = (remaining / seconds) * 100;
    fill.style.width = pct + '%';
    fill.style.background = pct > 50 ? 'var(--accent)' : pct > 20 ? '#e87838' : 'var(--danger)';
    label.textContent = `${remaining}s remaining`;
    onTick(remaining);
    if (remaining <= 0) { clearTimers(); onEnd(); return; }
    remaining--;
  };
  update();
  gameTimer = setInterval(update, 1000);
}

// ─── GAME 1: NAMING BLITZ ─────────────────────────────
function launchNamingBlitz() {
  const categories = Object.keys(DATA.food);
  const cat = categories[Math.floor(Math.random() * categories.length)];
  const validWords = DATA.food[cat].map(w => normalizeSpanish(w));
  const found = [];
  const SECONDS = 60;
  bumpPlayed();

  openModal(`
    <div class="modal-title">🍎 Naming Blitz</div>
    <div class="modal-subtitle">Name as many <strong>${cat}</strong> as you know in Spanish!</div>
    ${timerHTML()}
    <div class="score-display" id="blitzScore">0 words</div>
    <div class="game-input-wrap">
      <input class="game-input" id="blitzInput" placeholder="Type a Spanish word…" autocomplete="off" />
      <button class="btn" onclick="blitzSubmit()">Enter</button>
    </div>
    <div class="word-pile" id="blitzPile"></div>
    <div class="hint-text" id="blitzHint">Type and press Enter or click the button!</div>
  `);

  const input = document.getElementById('blitzInput');
  input.focus();
  input.addEventListener('keydown', e => { if (e.key === 'Enter') blitzSubmit(); });

  startTimer(SECONDS, () => {}, () => blitzEnd(found, cat, validWords));

  window.blitzSubmit = () => {
    const raw = input.value.trim();
    const norm = normalizeSpanish(raw);
    input.value = '';
    if (!norm) return;
    if (found.includes(norm)) { showNotif('Already got that one!', 'error'); return; }
    if (validWords.includes(norm)) {
      found.push(norm);
      document.getElementById('blitzPile').innerHTML += `<span class="word-chip">${raw.toLowerCase()}</span>`;
      document.getElementById('blitzScore').textContent = `${found.length} word${found.length!==1?'s':''}`;
      addScore(10);
      incStreak();
      showNotif(`+10 ✓ ${raw}`, 'success');
    } else {
      input.classList.add('wrong');
      setTimeout(() => input.classList.remove('wrong'), 500);
      resetStreak();
      showNotif('Not in that category!', 'error');
    }
  };
}

function blitzEnd(found, cat, validWords) {
  gameActive = false;
  const missed = DATA.food[cat].filter(w => !found.includes(normalizeSpanish(w)));
  const pts = found.length * 10;
  addScore(pts);
  addWordsLearned(found.length);
  document.getElementById('gameArea').innerHTML = `
    <div class="result-screen">
      <h2>⏱ Time's Up!</h2>
      <p>You named <strong style="color:var(--accent)">${found.length}</strong> ${cat} correctly.</p>
      <div class="score-display">+${pts} pts</div>
      <div class="result-words">
        <strong>✅ You got:</strong> ${found.join(', ') || 'None'}<br><br>
        <span class="missed-words"><strong>❌ Missed:</strong> ${missed.slice(0,20).join(', ')}${missed.length>20?'…':''}</span>
      </div>
      <div class="gap">
        <button class="btn" onclick="launchNamingBlitz()">Play Again</button>
        <button class="btn secondary" onclick="closeModal()">Menu</button>
      </div>
    </div>`;
}

// ─── GAME 2: SPEED TRANSLATE ──────────────────────────
let stState = {};

function launchSpeedTranslate() {
  const pool = shuffle(DATA.wordPairs);
  stState = { pool, idx: 0, score: 0, streak: 0, lives: 3, total: 20 };
  bumpPlayed();
  openModal(`
    <div class="modal-title">⚡ Speed Translate</div>
    <div class="modal-subtitle">Translate each English word to Spanish. 8 seconds per word.</div>
    <div id="stGameArea"></div>
  `);
  stNext();
}

function stNext() {
  const s = stState;
  if (s.idx >= s.total || s.lives <= 0) return stEnd();
  const pair = s.pool[s.idx];
  const livesDisplay = '❤️'.repeat(s.lives) + '🖤'.repeat(3 - s.lives);

  document.getElementById('stGameArea').innerHTML = `
    ${timerHTML('stFill','stLabel')}
    <div class="flex-between mt1">
      <div class="lives-row">${livesDisplay}</div>
      <div class="streak-display">Streak <span>${s.streak}</span></div>
      <div class="progress-text">${s.idx + 1}/${s.total}</div>
    </div>
    <div class="big-word" id="stWord">${pair.en}</div>
    <div class="game-input-wrap">
      <input class="game-input" id="stInput" placeholder="Spanish translation…" autocomplete="off" />
      <button class="btn" onclick="stSubmit()">→</button>
    </div>
    <div class="hint-text" id="stFeedback">Type and press Enter</div>
  `;

  const input = document.getElementById('stInput');
  input.focus();
  input.addEventListener('keydown', e => { if (e.key === 'Enter') stSubmit(); });

  startTimer(8, () => {}, () => {
    showNotif(`Time! It was: ${pair.es}`, 'error');
    stState.lives--;
    resetStreak();
    stState.streak = 0;
    stState.idx++;
    setTimeout(stNext, 1200);
  }, 'stFill', 'stLabel');

  window.stSubmit = () => {
    clearTimers();
    const val = normalizeSpanish(document.getElementById('stInput').value);
    const correct = normalizeSpanish(pair.es);
    if (val === correct || correct.includes(val) && val.length > 3) {
      stState.score += 10 + stState.streak * 2;
      stState.streak++;
      incStreak();
      addScore(10 + stState.streak * 2);
      showNotif(`✓ Correct! +${10 + (stState.streak - 1) * 2}`, 'success');
    } else {
      showNotif(`✗ It was: ${pair.es}`, 'error');
      stState.lives--;
      stState.streak = 0;
      resetStreak();
    }
    stState.idx++;
    setTimeout(stNext, 900);
  };
}

function stEnd() {
  addWordsLearned(stState.idx);
  document.getElementById('stGameArea').innerHTML = `
    <div class="result-screen">
      <h2>🏁 Done!</h2>
      <p>You translated <strong style="color:var(--accent)">${Math.min(stState.idx, stState.total)}</strong> words.</p>
      <div class="score-display">+${stState.score} pts</div>
      <div class="gap mt2">
        <button class="btn" onclick="launchSpeedTranslate()">Play Again</button>
        <button class="btn secondary" onclick="closeModal()">Menu</button>
      </div>
    </div>`;
}

// ─── GAME 3: STORY FILL-IN ────────────────────────────
let sfState = {};

function launchStoryFill() {
  const story = DATA.stories[Math.floor(Math.random() * DATA.stories.length)];
  sfState = { story, answers: {}, submitted: false };
  bumpPlayed();

  // Build story HTML with blank spans
  let storyHTML = story.text;
  story.blanks.forEach(b => {
    storyHTML = storyHTML.replace(`{${b.pos}}`,
      `<span class="story-blank" id="sfBlank${b.pos}" data-pos="${b.pos}" onclick="sfSelectBlank(${b.pos})">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>`);
  });

  openModal(`
    <div class="modal-title">📜 ${story.title}</div>
    <div class="modal-subtitle">Fill in the missing verb forms. Click a blank, then choose below.</div>
    <div class="story-text">${storyHTML}</div>
    <div id="sfChoiceArea">
      <div class="hint-text">← Click a blank in the text to see choices</div>
    </div>
    <div id="sfVocab" style="margin-top:1rem;font-size:0.82rem;color:var(--muted)">
      <strong style="color:var(--text)">Key vocab:</strong> ${story.vocab.map(v=>`<span style="color:var(--accent3)">${v.word}</span> = ${v.def}`).join(' · ')}
    </div>
    <div class="mt2 gap" id="sfActions">
      <button class="btn" onclick="sfCheck()">Check Answers</button>
    </div>
  `);

  window.sfSelectBlank = (pos) => {
    // Highlight selected
    story.blanks.forEach(b => {
      const el = document.getElementById(`sfBlank${b.pos}`);
      if (el) el.style.outline = 'none';
    });
    const el = document.getElementById(`sfBlank${pos}`);
    if (el) el.style.outline = '2px solid var(--accent)';

    const blank = story.blanks.find(b => b.pos === pos);
    if (!blank) return;

    document.getElementById('sfChoiceArea').innerHTML = `
      <div style="font-size:0.82rem;color:var(--muted);margin-bottom:0.5rem">Hint: ${blank.hint}</div>
      <div class="choices-grid">
        ${blank.options.map((opt, i) => `
          <button class="choice-btn" onclick="sfAnswer(${pos}, ${i})">${opt}</button>
        `).join('')}
      </div>`;
  };

  window.sfAnswer = (pos, idx) => {
    sfState.answers[pos] = idx;
    const blank = story.blanks.find(b => b.pos === pos);
    const el = document.getElementById(`sfBlank${pos}`);
    if (el) {
      el.textContent = blank.options[idx];
      el.classList.add('filled');
      el.style.outline = 'none';
    }
  };
}

function sfCheck() {
  const story = sfState.story;
  let correct = 0;
  story.blanks.forEach(b => {
    const el = document.getElementById(`sfBlank${b.pos}`);
    const answer = sfState.answers[b.pos];
    if (answer === b.correct) {
      correct++;
      if (el) el.style.color = 'var(--success)';
    } else {
      if (el) { el.classList.add('wrong-blank'); el.style.color = 'var(--danger)'; }
      // Show correct answer
      if (el && answer !== undefined) {
        el.title = `Correct: ${b.options[b.correct]}`;
      }
    }
  });

  const pts = correct * 20;
  addScore(pts);
  addWordsLearned(correct);
  document.getElementById('sfActions').innerHTML = `
    <div class="result-screen" style="padding:0">
      <div class="score-display">${correct}/${story.blanks.length} correct · +${pts} pts</div>
      <div class="gap mt1">
        <button class="btn" onclick="launchStoryFill()">New Story</button>
        <button class="btn secondary" onclick="closeModal()">Menu</button>
      </div>
    </div>`;
}

// ─── GAME 4: FLASHCARDS ───────────────────────────────
let fcState = {};

function launchFlashcards() {
  const deck = shuffle(DATA.verbs).slice(0, 20);
  fcState = { deck, idx: 0, correct: 0, flipped: false };
  bumpPlayed();
  openModal(`<div id="fcArea"></div>`);
  fcRender();
}

function fcRender() {
  const s = fcState;
  if (s.idx >= s.deck.length) return fcEnd();
  const verb = s.deck[s.idx];

  document.getElementById('fcArea').innerHTML = `
    <div class="flex-between" style="margin-bottom:1rem">
      <div class="modal-title">🃏 Verb Flashcards</div>
      <div class="progress-text">${s.idx + 1}/${s.deck.length}</div>
    </div>
    <div class="progress-row">
      <div class="progress-bar"><div class="progress-fill" style="width:${(s.idx/s.deck.length)*100}%"></div></div>
    </div>
    <div class="flashcard" id="fc" onclick="fcFlip()">
      <div class="flashcard-inner">
        <div class="flashcard-front">
          <div class="card-word">${verb.es}</div>
          <div class="card-hint">Tap to reveal meaning</div>
        </div>
        <div class="flashcard-back">
          <div class="card-translation">${verb.en}</div>
          <div class="card-example">${verb.ex}</div>
          <div style="margin-top:0.5rem;font-size:0.75rem;color:var(--muted)">${verb.cat}</div>
        </div>
      </div>
    </div>
    <div id="fcButtons" style="display:none;margin-top:1rem">
      <p style="text-align:center;color:var(--muted);font-size:0.85rem;margin-bottom:0.75rem">How well did you know it?</p>
      <div class="gap" style="justify-content:center">
        <button class="btn danger" onclick="fcRate(false)">😕 Missed</button>
        <button class="btn secondary" onclick="fcRate(true)">🤔 Almost</button>
        <button class="btn" onclick="fcRate(true)">✅ Got it!</button>
      </div>
    </div>
    <div style="text-align:center;margin-top:0.75rem">
      <span class="hint-text">Tap the card to flip</span>
    </div>
  `;

  window.fcFlip = () => {
    document.getElementById('fc').classList.toggle('flipped');
    document.getElementById('fcButtons').style.display = 'block';
  };
}

function fcRate(knew) {
  if (knew) { fcState.correct++; addScore(5); incStreak(); }
  else resetStreak();
  fcState.idx++;
  fcRender();
}

function fcEnd() {
  addWordsLearned(fcState.correct);
  document.getElementById('fcArea').innerHTML = `
    <div class="result-screen">
      <h2>🃏 Deck Complete</h2>
      <p>You knew <strong style="color:var(--accent)">${fcState.correct}</strong> out of ${fcState.deck.length} verbs.</p>
      <div class="score-display">+${fcState.correct * 5} pts</div>
      <div class="gap mt2">
        <button class="btn" onclick="launchFlashcards()">New Deck</button>
        <button class="btn secondary" onclick="closeModal()">Menu</button>
      </div>
    </div>`;
}

// ─── GAME 5: CONJUGATION FORGE ────────────────────────
let cjState = {};

function launchConjugationForge() {
  const conj = DATA.conjugations[Math.floor(Math.random() * DATA.conjugations.length)];
  const subjects = ['yo','tú','él','nosotros','ellos'];
  cjState = { conj, checked: false };
  bumpPlayed();

  const rows = subjects.map(subj => `
    <tr class="conj-cell" id="cjRow_${subj}">
      <td style="color:var(--muted);font-weight:600">${subj}</td>
      <td><input class="conj-input" id="cjInp_${subj}" placeholder="…" autocomplete="off" /></td>
      <td id="cjCheck_${subj}"></td>
    </tr>
  `).join('');

  openModal(`
    <div class="modal-title">⚙️ Conjugation Forge</div>
    <div class="modal-subtitle">Fill in all forms of <strong style="color:var(--accent)">${conj.verb}</strong> — ${conj.tense} (${conj.type})</div>
    <table class="conj-table">
      <thead><tr><th>Subject</th><th>Conjugation</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="gap">
      <button class="btn" onclick="cjCheck()">Check</button>
      <button class="btn secondary" onclick="launchConjugationForge()">New Verb</button>
    </div>
  `);

  // Focus first input
  setTimeout(() => document.getElementById('cjInp_yo').focus(), 100);

  // Allow Enter to advance
  subjects.forEach((s, i) => {
    document.getElementById(`cjInp_${s}`).addEventListener('keydown', e => {
      if (e.key === 'Enter' && i < subjects.length - 1) {
        document.getElementById(`cjInp_${subjects[i+1]}`).focus();
      }
    });
  });
}

function cjCheck() {
  const { conj } = cjState;
  const subjects = ['yo','tú','él','nosotros','ellos'];
  let correct = 0;

  subjects.forEach(subj => {
    const inp = document.getElementById(`cjInp_${subj}`);
    const check = document.getElementById(`cjCheck_${subj}`);
    const row = document.getElementById(`cjRow_${subj}`);
    const expected = normalizeSpanish(conj.forms[subj] || '');
    const given = normalizeSpanish(inp.value);

    if (given === expected) {
      correct++;
      row.classList.add('correct-cell');
      check.innerHTML = '<span style="color:var(--success)">✓</span>';
    } else {
      row.classList.add('wrong-cell');
      check.innerHTML = `<span style="color:var(--danger);font-size:0.8rem">${conj.forms[subj]}</span>`;
      inp.style.color = 'var(--danger)';
    }
  });

  addScore(correct * 15);
  addWordsLearned(correct);
  showNotif(`${correct}/5 correct · +${correct * 15} pts`, correct >= 4 ? 'success' : '');
}

// ─── GAME 6: HANGMAN (AHORCADO) ───────────────────────
let hmState = {};

function launchHangman() {
  const entry = DATA.hangmanWords[Math.floor(Math.random() * DATA.hangmanWords.length)];
  const word = entry.word.toLowerCase();
  const letters = [...new Set(word.replace(/[^a-záéíóúñü]/g,''))];
  hmState = { word, letters, guessed: [], wrong: 0, maxWrong: 6 };
  bumpPlayed();
  openModal(`<div id="hmArea"></div>`);
  hmRender();
}

function hmRender() {
  const s = hmState;
  const entry = DATA.hangmanWords.find(e => e.word.toLowerCase() === s.word);
  const wordLetters = s.word.split('').filter(c => /[a-záéíóúñü]/.test(c));
  const allRevealed = wordLetters.every(l => s.guessed.includes(l));
  const lost = s.wrong >= s.maxWrong;

  const wordDisplay = s.word.split('').map(c => {
    if (!/[a-záéíóúñü]/.test(c)) return `<span style="margin:0 2px;font-size:1.4rem">${c}</span>`;
    return `<div class="hangman-letter">${s.guessed.includes(c) ? c : ''}</div>`;
  }).join('');

  const alphabet = 'abcdefghijklmnñopqrstuvwxyzáéíóúü'.split('');

  const svgParts = [
    '',
    '<line x1="30" y1="130" x2="110" y2="130" stroke="currentColor" stroke-width="3"/>',
    '<line x1="70" y1="130" x2="70" y2="10" stroke="currentColor" stroke-width="3"/>',
    '<line x1="70" y1="10" x2="120" y2="10" stroke="currentColor" stroke-width="3"/>',
    '<line x1="120" y1="10" x2="120" y2="30" stroke="currentColor" stroke-width="3"/>',
    '<circle cx="120" cy="40" r="12" stroke="currentColor" stroke-width="3" fill="none"/>',
    '<line x1="120" y1="52" x2="120" y2="90" stroke="currentColor" stroke-width="3"/><line x1="120" y1="65" x2="100" y2="80" stroke="currentColor" stroke-width="3"/><line x1="120" y1="65" x2="140" y2="80" stroke="currentColor" stroke-width="3"/><line x1="120" y1="90" x2="100" y2="110" stroke="currentColor" stroke-width="3"/><line x1="120" y1="90" x2="140" y2="110" stroke="currentColor" stroke-width="3"/>',
  ];

  document.getElementById('hmArea').innerHTML = `
    <div class="flex-between" style="margin-bottom:0.75rem">
      <div class="modal-title">🪢 Ahorcado</div>
      <div class="badge">Wrong: ${s.wrong}/${s.maxWrong}</div>
    </div>
    <div class="modal-subtitle">Hint: ${entry ? entry.hint : ''}</div>
    <svg class="hangman-svg" viewBox="0 0 180 140" width="140" height="110" style="color:var(--muted)">
      ${svgParts.slice(0, s.wrong + 1).join('')}
    </svg>
    <div class="hangman-word">${wordDisplay}</div>
    ${lost ? `<div style="text-align:center;color:var(--danger);margin-bottom:1rem">The word was: <strong style="color:var(--accent)">${s.word}</strong></div>` : ''}
    ${allRevealed && !lost ? `<div style="text-align:center;color:var(--success);margin-bottom:1rem;font-weight:600">¡Correcto! 🎉</div>` : ''}
    ${!lost && !allRevealed ? `
    <div class="keyboard-row">
      ${alphabet.slice(0,13).map(l => `<button class="key-btn ${s.guessed.includes(l) ? (hmState.word.includes(l) ? 'hit' : 'miss') : ''}" onclick="hmGuess('${l}')" ${s.guessed.includes(l)?'disabled':''}>${l}</button>`).join('')}
    </div>
    <div class="keyboard-row">
      ${alphabet.slice(13).map(l => `<button class="key-btn ${s.guessed.includes(l) ? (hmState.word.includes(l) ? 'hit' : 'miss') : ''}" onclick="hmGuess('${l}')" ${s.guessed.includes(l)?'disabled':''}>${l}</button>`).join('')}
    </div>` : ''}
    <div class="gap mt1" style="justify-content:center">
      <button class="btn" onclick="launchHangman()">New Word</button>
      <button class="btn secondary" onclick="closeModal()">Menu</button>
    </div>
  `;

  if (allRevealed && !lost) { addScore(50); addWordsLearned(1); incStreak(); }
  if (lost) resetStreak();
}

window.hmGuess = (letter) => {
  if (hmState.guessed.includes(letter)) return;
  hmState.guessed.push(letter);
  if (!hmState.word.includes(letter)) hmState.wrong++;
  hmRender();
};

// ─── GAME 7: WORD SCRAMBLE ────────────────────────────
let wsState = {};

function launchScramble() {
  const allWords = [...DATA.hangmanWords.filter(w => w.word.length >= 5 && w.word.length <= 12)];
  const entry = allWords[Math.floor(Math.random() * allWords.length)];
  const word = entry.word.replace(/[^a-záéíóúñü]/g, '');
  const scrambled = shuffle([...word]);
  wsState = { word, entry, scrambled, selected: [], usedIndices: [] };
  bumpPlayed();
  openModal(`<div id="wsArea"></div>`);
  wsRender();
  startTimer(30, () => {}, wsTimeOut, 'wsFill', 'wsLabel');
}

function wsRender() {
  const s = wsState;

  document.getElementById('wsArea').innerHTML = `
    <div class="flex-between" style="margin-bottom:0.5rem">
      <div class="modal-title">🔀 Scramble</div>
    </div>
    <div class="modal-subtitle">Hint: ${s.entry.hint}</div>
    ${timerHTML('wsFill','wsLabel')}
    <p style="text-align:center;color:var(--muted);font-size:0.85rem;margin-bottom:0.5rem">Tap letters to build the word:</p>
    <div class="answer-row" id="wsAnswer">
      ${s.selected.map((obj, i) => `<div class="answer-tile" onclick="wsRemove(${i})">${obj.letter}</div>`).join('')}
    </div>
    <div class="letters-row">
      ${s.scrambled.map((l, i) => `<div class="letter-tile ${s.usedIndices.includes(i) ? 'used' : ''}" onclick="wsPick(${i})">${l}</div>`).join('')}
    </div>
    <div class="gap" style="justify-content:center">
      <button class="btn" onclick="wsCheck()">Check</button>
      <button class="btn secondary" onclick="wsClear()">Clear</button>
      <button class="btn secondary" onclick="launchScramble()">Skip</button>
    </div>
  `;
}

window.wsPick = (idx) => {
  if (wsState.usedIndices.includes(idx)) return;
  wsState.selected.push({ letter: wsState.scrambled[idx], srcIdx: idx });
  wsState.usedIndices.push(idx);
  wsRender();
};

window.wsRemove = (selIdx) => {
  const removed = wsState.selected.splice(selIdx, 1)[0];
  wsState.usedIndices = wsState.usedIndices.filter(i => i !== removed.srcIdx);
  wsRender();
};

window.wsClear = () => {
  wsState.selected = [];
  wsState.usedIndices = [];
  wsRender();
};

window.wsCheck = () => {
  const attempt = wsState.selected.map(o => o.letter).join('');
  const norm = normalizeSpanish(attempt);
  const correct = normalizeSpanish(wsState.word);
  if (norm === correct) {
    clearTimers();
    addScore(40);
    addWordsLearned(1);
    incStreak();
    document.getElementById('wsArea').innerHTML = `
      <div class="result-screen">
        <h2>¡Excelente! 🎉</h2>
        <p>The word was <strong style="color:var(--accent)">${wsState.word}</strong></p>
        <div class="score-display">+40 pts</div>
        <div class="gap mt2">
          <button class="btn" onclick="launchScramble()">Next Word</button>
          <button class="btn secondary" onclick="closeModal()">Menu</button>
        </div>
      </div>`;
  } else {
    showNotif('Not quite — keep trying!', 'error');
    resetStreak();
    wsClear();
  }
};

window.wsTimeOut = () => {
  document.getElementById('wsArea').innerHTML = `
    <div class="result-screen">
      <h2>⏱ Too slow!</h2>
      <p>The word was <strong style="color:var(--accent)">${wsState.word}</strong></p>
      <p style="color:var(--muted)">Hint: ${wsState.entry.hint}</p>
      <div class="gap mt2">
        <button class="btn" onclick="launchScramble()">Try Another</button>
        <button class="btn secondary" onclick="closeModal()">Menu</button>
      </div>
    </div>`;
};

// ─── GAME 8: QUICK DRAW (MULTIPLE CHOICE) ─────────────
let qdState = {};

function launchQuickDraw() {
  const pool = shuffle(DATA.wordPairs).slice(0, 15);
  qdState = { pool, idx: 0, score: 0, correct: 0 };
  bumpPlayed();
  openModal(`<div id="qdArea"></div>`);
  qdNext();
}

function qdNext() {
  const s = qdState;
  if (s.idx >= s.pool.length) return qdEnd();
  const pair = s.pool[s.idx];

  // Build wrong options
  const others = shuffle(DATA.wordPairs.filter(p => p.es !== pair.es)).slice(0, 3).map(p => p.es);
  const choices = shuffle([pair.es, ...others]);

  document.getElementById('qdArea').innerHTML = `
    <div class="flex-between" style="margin-bottom:0.75rem">
      <div class="modal-title">🎯 Quick Draw</div>
      <div class="progress-text">${s.idx + 1}/${s.pool.length}</div>
    </div>
    ${timerHTML('qdFill','qdLabel')}
    <div class="question-text">Translate to Spanish:<br><strong style="color:var(--accent);font-size:1.4rem">${pair.en}</strong></div>
    <div class="choices-grid">
      ${choices.map(c => `<button class="choice-btn" onclick="qdAnswer('${c}','${pair.es}')">${c}</button>`).join('')}
    </div>
  `;

  startTimer(10, () => {}, () => {
    qdReveal(null, pair.es, choices);
  }, 'qdFill', 'qdLabel');
}

window.qdAnswer = (chosen, correct) => {
  clearTimers();
  const choices = Array.from(document.querySelectorAll('.choice-btn')).map(b => b.textContent);
  qdReveal(chosen, correct, choices);
};

function qdReveal(chosen, correct, choices) {
  document.querySelectorAll('.choice-btn').forEach(b => {
    b.disabled = true;
    if (b.textContent === correct) b.classList.add('correct-choice');
    else if (b.textContent === chosen) b.classList.add('wrong-choice');
  });

  if (chosen === correct) {
    qdState.correct++;
    qdState.score += 15;
    addScore(15);
    incStreak();
    showNotif('✓ Correct! +15', 'success');
  } else {
    resetStreak();
    showNotif(chosen ? `✗ It was: ${correct}` : `Time! It was: ${correct}`, 'error');
  }
  qdState.idx++;
  setTimeout(qdNext, 1200);
}

function qdEnd() {
  addWordsLearned(qdState.correct);
  document.getElementById('qdArea').innerHTML = `
    <div class="result-screen">
      <h2>🎯 Finished!</h2>
      <p><strong style="color:var(--accent)">${qdState.correct}/${qdState.pool.length}</strong> correct answers</p>
      <div class="score-display">+${qdState.score} pts</div>
      <div class="gap mt2">
        <button class="btn" onclick="launchQuickDraw()">Play Again</button>
        <button class="btn secondary" onclick="closeModal()">Menu</button>
      </div>
    </div>`;
}

// ─── GAME 9: CATEGORY SORT ────────────────────────────
let csState = {};

function launchCategorySort() {
  const cats = ['movement','communication','thinking','emotion','action'];
  const catLabels = { movement:'🏃 Movement', communication:'💬 Communication', thinking:'🧠 Thinking', emotion:'❤️ Emotion', action:'⚡ Action' };
  const words = shuffle(DATA.verbs.filter(v => cats.includes(v.cat))).slice(0, 16);
  csState = { words, cats, catLabels, answers: {}, idx: 0, score: 0 };
  bumpPlayed();
  openModal(`<div id="csArea"></div>`);
  csRender();
}

function csRender() {
  const s = csState;
  if (s.idx >= s.words.length) return csEnd();
  const verb = s.words[s.idx];

  document.getElementById('csArea').innerHTML = `
    <div class="flex-between" style="margin-bottom:0.75rem">
      <div class="modal-title">📂 Category Sort</div>
      <div class="progress-text">${s.idx + 1}/${s.words.length}</div>
    </div>
    <div class="progress-row">
      <div class="progress-bar"><div class="progress-fill" style="width:${(s.idx/s.words.length)*100}%"></div></div>
    </div>
    <p style="text-align:center;color:var(--muted);font-size:0.85rem;margin-bottom:0.5rem">Sort this verb into the right category:</p>
    <div class="big-word">${verb.es}</div>
    <p style="text-align:center;color:var(--muted);font-size:0.82rem;margin-bottom:1rem">Means: <em>${verb.en}</em></p>
    <div class="choices-grid">
      ${s.cats.map(cat => `
        <button class="choice-btn" onclick="csSort('${cat}','${verb.cat}')">
          ${s.catLabels[cat]}
        </button>`).join('')}
    </div>
  `;
}

window.csSort = (chosen, correct) => {
  if (chosen === correct) {
    csState.score += 10;
    addScore(10);
    incStreak();
    showNotif('✓ Correct!', 'success');
  } else {
    resetStreak();
    showNotif(`✗ It's ${csState.catLabels[correct]}`, 'error');
  }
  csState.idx++;
  setTimeout(csRender, 700);
};

function csEnd() {
  addWordsLearned(Math.floor(csState.score / 10));
  document.getElementById('csArea').innerHTML = `
    <div class="result-screen">
      <h2>📂 Sorted!</h2>
      <p>You scored <strong style="color:var(--accent)">${csState.score}/${csState.words.length * 10}</strong> points</p>
      <div class="score-display">+${csState.score} pts</div>
      <div class="gap mt2">
        <button class="btn" onclick="launchCategorySort()">Play Again</button>
        <button class="btn secondary" onclick="closeModal()">Menu</button>
      </div>
    </div>`;
}

// ─── GAME 10: VERB SPRINT ─────────────────────────────
function launchVerbSprint() {
  const validVerbs = DATA.verbs.map(v => normalizeSpanish(v.es));
  const found = [];
  const SECONDS = 90;
  bumpPlayed();

  openModal(`
    <div class="modal-title">🏃 Verb Sprint</div>
    <div class="modal-subtitle">Type as many Spanish verb infinitivos as you can in 90 seconds!</div>
    ${timerHTML()}
    <div class="score-display" id="sprintScore">0 verbs</div>
    <div class="game-input-wrap">
      <input class="game-input" id="sprintInput" placeholder="Type a verb infinitive…" autocomplete="off" />
      <button class="btn" onclick="sprintSubmit()">Enter</button>
    </div>
    <div class="word-pile" id="sprintPile"></div>
    <div class="hint-text">Any verb form ending in -ar, -er, -ir counts!</div>
  `);

  const input = document.getElementById('sprintInput');
  input.focus();
  input.addEventListener('keydown', e => { if (e.key === 'Enter') sprintSubmit(); });

  startTimer(SECONDS, () => {}, () => sprintEnd(found));

  window.sprintSubmit = () => {
    const raw = input.value.trim();
    const norm = normalizeSpanish(raw);
    input.value = '';
    if (!norm) return;
    if (found.includes(norm)) { showNotif('Already got that!', 'error'); return; }

    // Check it looks like a verb (-ar/-er/-ir) and is in our dataset or ends in verb suffix
    const isVerb = validVerbs.includes(norm) || /[aei]r$/.test(norm);
    if (isVerb) {
      found.push(norm);
      const known = DATA.verbs.find(v => normalizeSpanish(v.es) === norm);
      document.getElementById('sprintPile').innerHTML += `<span class="word-chip" title="${known ? known.en : ''}">${raw.toLowerCase()}</span>`;
      document.getElementById('sprintScore').textContent = `${found.length} verb${found.length!==1?'s':''}`;
      addScore(8);
      incStreak();
      showNotif(`+8 ✓`, 'success');
    } else {
      input.classList.add('wrong');
      setTimeout(() => input.classList.remove('wrong'), 400);
      resetStreak();
    }
  };
}

function sprintEnd(found) {
  const pts = found.length * 8;
  addScore(pts);
  addWordsLearned(found.length);
  document.getElementById('gameArea').innerHTML = `
    <div class="result-screen">
      <h2>⏱ Sprint Done!</h2>
      <p>You produced <strong style="color:var(--accent)">${found.length}</strong> Spanish verbs!</p>
      <div class="score-display">+${pts} pts</div>
      <div class="result-words">${found.join(', ') || 'None'}</div>
      <div class="gap">
        <button class="btn" onclick="launchVerbSprint()">Sprint Again</button>
        <button class="btn secondary" onclick="closeModal()">Menu</button>
      </div>
    </div>`;
}

// ─── GAME 11: TRUE/FALSE BLITZ ────────────────────────
let tfState = {};

function launchTrueFalse() {
  const pool = shuffle(DATA.wordPairs).slice(0, 20);
  tfState = { pool, idx: 0, score: 0, correct: 0 };
  bumpPlayed();
  openModal(`<div id="tfArea"></div>`);
  tfNext();
}

function tfNext() {
  const s = tfState;
  if (s.idx >= s.pool.length) return tfEnd();
  const pair = s.pool[s.idx];

  // 50% chance of showing wrong translation
  const isTrue = Math.random() > 0.45;
  let shown;
  if (isTrue) {
    shown = pair.es;
  } else {
    const other = DATA.wordPairs.find(p => p.es !== pair.es);
    shown = other ? other.es : pair.es + 'x';
  }

  document.getElementById('tfArea').innerHTML = `
    <div class="flex-between" style="margin-bottom:0.75rem">
      <div class="modal-title">🧠 True / False</div>
      <div class="progress-text">${s.idx + 1}/${s.pool.length}</div>
    </div>
    ${timerHTML('tfFill','tfLabel')}
    <div style="text-align:center;margin:1.5rem 0">
      <div style="font-size:1rem;color:var(--muted);margin-bottom:0.5rem">Does this mean</div>
      <div style="font-family:'Playfair Display',serif;font-size:2rem;color:var(--accent)">${pair.en}</div>
      <div style="font-size:0.9rem;color:var(--muted);margin:0.5rem 0">?</div>
      <div style="font-size:2rem;color:var(--text);font-weight:700">${shown}</div>
    </div>
    <div class="gap" style="justify-content:center">
      <button class="btn" style="min-width:100px;font-size:1.1rem;padding:1rem" onclick="tfAnswer(true,${isTrue})">✅ Sí</button>
      <button class="btn danger" style="min-width:100px;font-size:1.1rem;padding:1rem" onclick="tfAnswer(false,${isTrue})">❌ No</button>
    </div>
  `;

  startTimer(6, () => {}, () => {
    tfAnswer(null, isTrue);
  }, 'tfFill', 'tfLabel');
}

window.tfAnswer = (answer, isTrue) => {
  clearTimers();
  const correct = (answer === isTrue) || (answer === null ? false : false);
  const right = (answer !== null && answer === isTrue);

  if (right) {
    tfState.score += 10;
    tfState.correct++;
    addScore(10);
    incStreak();
    showNotif('✓ Correct!', 'success');
  } else {
    resetStreak();
    showNotif(answer === null ? 'Too slow!' : '✗ Wrong!', 'error');
  }
  tfState.idx++;
  setTimeout(tfNext, 600);
};

function tfEnd() {
  addWordsLearned(tfState.correct);
  document.getElementById('tfArea').innerHTML = `
    <div class="result-screen">
      <h2>🧠 Done!</h2>
      <p><strong style="color:var(--accent)">${tfState.correct}/${tfState.pool.length}</strong> correct</p>
      <div class="score-display">+${tfState.score} pts</div>
      <div class="gap mt2">
        <button class="btn" onclick="launchTrueFalse()">Play Again</button>
        <button class="btn secondary" onclick="closeModal()">Menu</button>
      </div>
    </div>`;
}
