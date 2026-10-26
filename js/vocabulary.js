/**
 * ══════════════════════════════════════════════════════════════════════
 * Learn Nepali — Scalable Nepali Vocabulary Builder (App Engine)
 * Manifests DK Visual Presentation Inventory:
 * 1. Visual Book Spread Viewer (All 78 Lessons, 156 Teaching Spreads)
 * 2. Visual Modules & Specialized Diagrams (World Map, Numbers Table,
 *    Calendar, Routines, Colors, Body Map, Family Tree)
 * 3. Interactive Practice Arena (Match-Up, Listening Quiz, Flashcards)
 * 4. Searchable Word Index Table & Persistence
 * ══════════════════════════════════════════════════════════════════════
 */

(function () {
    'use strict';

    // ── 1. Persistence Layer ──
    const STORAGE_KEY = 'nepali_vocabulary_status_v1';
    const NOTES_KEY = 'nepali_vocabulary_notes_v1';
    const PREFS_KEY = 'nepali_vocabulary_prefs_v1';

    const VocabularyStorage = {
        _cache: null,
        
        getAll() {
            if (this._cache) return this._cache;
            try {
                const data = localStorage.getItem(STORAGE_KEY);
                this._cache = data ? JSON.parse(data) : {};
            } catch (e) {
                console.warn('Could not read vocabulary status from localStorage:', e);
                this._cache = {};
            }
            return this._cache;
        },

        getStatus(id) {
            const all = this.getAll();
            return all[id] || 'unsorted';
        },

        setStatus(id, status) {
            const all = this.getAll();
            if (status === 'unsorted') {
                delete all[id];
            } else {
                all[id] = status;
            }
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
            } catch (e) {
                console.warn('Could not persist vocabulary status to localStorage:', e);
            }
            return status;
        },

        getPrefs() {
            try {
                const data = localStorage.getItem(PREFS_KEY);
                return data ? JSON.parse(data) : { viewMode: 'spread', speed: 1.0, activeTheme: 'all', spreadPage: 'p1' };
            } catch (e) {
                return { viewMode: 'spread', speed: 1.0, activeTheme: 'all', spreadPage: 'p1' };
            }
        },

        savePrefs(prefs) {
            try {
                const current = this.getPrefs();
                localStorage.setItem(PREFS_KEY, JSON.stringify({ ...current, ...prefs }));
            } catch (e) {}
        },

        exportProgressJSON() {
            const payload = {
                version: 2,
                exportedAt: new Date().toISOString(),
                status: this.getAll(),
                notes: VocabularyNotes.getAll()
            };
            return JSON.stringify(payload, null, 2);
        },

        importProgressJSON(jsonStr) {
            try {
                const parsed = JSON.parse(jsonStr);
                if (parsed && typeof parsed.status === 'object') {
                    this._cache = parsed.status;
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._cache));
                    if (parsed.notes) {
                        localStorage.setItem(NOTES_KEY, JSON.stringify(parsed.notes));
                        VocabularyNotes._cache = parsed.notes;
                    }
                    return true;
                } else if (parsed && typeof parsed.data === 'object') {
                    this._cache = parsed.data;
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._cache));
                    return true;
                }
            } catch (e) {
                console.error('Import failed:', e);
            }
            return false;
        },

        resetLesson(lessonEntries) {
            const all = this.getAll();
            lessonEntries.forEach(e => delete all[e.id]);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
        }
    };

    // ── 1.1 Learner's Write-on Notes Persistence ──
    const VocabularyNotes = {
        _cache: null,

        getAll() {
            if (this._cache) return this._cache;
            try {
                const raw = localStorage.getItem(NOTES_KEY);
                this._cache = raw ? JSON.parse(raw) : {};
            } catch (e) {
                this._cache = {};
            }
            return this._cache;
        },

        get(id) {
            return this.getAll()[id] || '';
        },

        set(id, noteText) {
            const all = this.getAll();
            if (!noteText || noteText.trim() === '') {
                delete all[id];
            } else {
                all[id] = noteText.trim();
            }
            try {
                localStorage.setItem(NOTES_KEY, JSON.stringify(all));
            } catch (e) {}
        }
    };

    // ── 2. Audio Controller & Web Speech Synthesis ──
    const VocabularyAudio = {
        synth: window.speechSynthesis || null,
        nepaliVoice: null,
        isPlayingSequence: false,
        sequenceQueue: [],
        currentIndex: -1,
        repeatItem: false,
        playbackSpeed: 1.0,
        activeCardEl: null,

        init() {
            if (!this.synth) return;
            const findVoice = () => {
                const voices = this.synth.getVoices();
                this.nepaliVoice = voices.find(v => v.lang.startsWith('ne')) || null;
            };
            findVoice();
            if (this.synth.onvoiceschanged !== undefined) {
                this.synth.onvoiceschanged = findVoice;
            }
        },

        playSingle(entryOrText) {
            if (!this.synth) {
                alert('Audio synthesis is not supported on this browser.');
                return;
            }
            this.synth.cancel();

            let textToSpeak = '';
            if (typeof entryOrText === 'string') {
                textToSpeak = entryOrText;
            } else if (entryOrText && entryOrText.nepaliText) {
                textToSpeak = entryOrText.nepaliText;
            } else if (entryOrText && entryOrText.nep) {
                textToSpeak = entryOrText.nep;
            }

            let cleanText = textToSpeak.replace(/\(.*?\)/g, '').trim();
            if (cleanText.includes(';')) cleanText = cleanText.split(';')[0].trim();
            if (cleanText.includes('/')) cleanText = cleanText.split('/')[0].trim();

            const utter = new SpeechSynthesisUtterance(cleanText);
            utter.lang = 'ne-NP';
            utter.rate = this.playbackSpeed;
            if (this.nepaliVoice) utter.voice = this.nepaliVoice;

            this.synth.speak(utter);
        },

        playModule(moduleId) {
            const lesson = State.getLesson(State.activeLessonNum);
            const modEntries = lesson.entries.filter(e => e.moduleId === moduleId);
            if (!modEntries.length) return;
            this.sequenceQueue = modEntries;
            this.currentIndex = -1;
            this.isPlayingSequence = true;
            this.playNextInSequence();
        },

        playSequence() {
            if (!this.sequenceQueue.length) {
                this.sequenceQueue = State.getFilteredEntries();
            }
            if (!this.sequenceQueue.length) return;

            this.isPlayingSequence = true;
            this.updatePlayerUI();
            this.playNextInSequence();
        },

        pauseSequence() {
            this.isPlayingSequence = false;
            if (this.synth) this.synth.cancel();
            this.updatePlayerUI();
            this.clearActiveHighlight();
        },

        togglePlayPause() {
            if (this.isPlayingSequence) {
                this.pauseSequence();
            } else {
                this.playSequence();
            }
        },

        playNextInSequence() {
            if (!this.isPlayingSequence) return;
            if (!this.repeatItem) {
                this.currentIndex++;
            }
            if (this.currentIndex >= this.sequenceQueue.length) {
                this.currentIndex = 0;
            }

            const entry = this.sequenceQueue[this.currentIndex];
            if (!entry) {
                this.pauseSequence();
                return;
            }

            this.highlightCard(entry.id);
            this.updatePlayerUI();

            if (!this.synth) return;
            this.synth.cancel();

            let cleanText = entry.nepaliText.replace(/\(.*?\)/g, '').trim();
            if (cleanText.includes(';')) cleanText = cleanText.split(';')[0].trim();
            if (cleanText.includes('/')) cleanText = cleanText.split('/')[0].trim();

            const utter = new SpeechSynthesisUtterance(cleanText);
            utter.lang = 'ne-NP';
            utter.rate = this.playbackSpeed;
            if (this.nepaliVoice) utter.voice = this.nepaliVoice;

            utter.onend = () => {
                if (this.isPlayingSequence) {
                    setTimeout(() => {
                        this.playNextInSequence();
                    }, 800);
                }
            };

            utter.onerror = (err) => {
                console.warn('SpeechSynthesis error:', err);
                if (this.isPlayingSequence) {
                    setTimeout(() => {
                        this.playNextInSequence();
                    }, 1000);
                }
            };

            this.synth.speak(utter);
        },

        highlightCard(id) {
            this.clearActiveHighlight();
            const el = document.querySelector(`[data-entry-id="${id}"]`);
            if (el) {
                el.classList.add('playing-audio');
                this.activeCardEl = el;
                el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        },

        clearActiveHighlight() {
            if (this.activeCardEl) {
                this.activeCardEl.classList.remove('playing-audio');
                this.activeCardEl = null;
            }
        },

        updatePlayerUI() {
            const playBtn = document.getElementById('player-play-btn');
            const statusText = document.getElementById('player-status-text');
            const repeatBtn = document.getElementById('player-repeat-btn');
            const speedBtn = document.getElementById('player-speed-btn');

            if (playBtn) {
                if (this.isPlayingSequence) {
                    playBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
                    playBtn.classList.add('active');
                } else {
                    playBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
                    playBtn.classList.remove('active');
                }
            }

            if (repeatBtn) {
                if (this.repeatItem) repeatBtn.classList.add('active');
                else repeatBtn.classList.remove('active');
            }

            if (speedBtn) {
                speedBtn.textContent = `${this.playbackSpeed.toFixed(1)}x`;
            }

            if (statusText) {
                if (this.isPlayingSequence && this.currentIndex >= 0 && this.currentIndex < this.sequenceQueue.length) {
                    const cur = this.sequenceQueue[this.currentIndex];
                    statusText.textContent = `Playing ${this.currentIndex + 1} of ${this.sequenceQueue.length}: ${cur.englishHeadword || cur.eng}`;
                } else {
                    statusText.textContent = `Sequence ready (${this.sequenceQueue.length} items)`;
                }
            }
        }
    };

    // ── 3. Application State ──
    const State = {
        activeLessonNum: 1,
        activeThemeId: 'all',
        activeTab: 'all',          // 'all' | 'main' | 'practical' | 'variants'
        activeStatusFilter: 'all', // 'all' | 'unsorted' | 'difficult' | 'learning' | 'known'
        viewMode: 'spread',        // 'spread' | 'modules' | 'practice' | 'rows'
        spreadPage: 'p1',          // 'p1' | 'p2' | 'dual'
        spreadZoom: 1.0,           // 1.0, 1.25, 1.5, etc.
        spreadModuleFilter: 'all', // filter companion deck by module
        practiceSubmode: 'match',  // 'match' | 'listening' | 'flashcard'
        showPairingView: false,    // Lesson 1 country ➔ nationality conversion view
        searchQuery: '',
        activeDetailId: null,

        // Match-up game state
        matchState: {
            items: [],
            selectedNepali: null,
            selectedEnglish: null,
            matchedIds: new Set(),
            score: 0
        },

        // Listening quiz state
        listeningState: {
            currentEntry: null,
            options: [],
            score: 0,
            hasAnswered: false
        },

        // Flashcard state
        flashcardState: {
            index: 0,
            isFlipped: false
        },

        getLesson(num) {
            return VOCABULARY_DATA.lessons.find(l => l.number === num) || VOCABULARY_DATA.lessons[0];
        },

        getFilteredEntries() {
            const lesson = this.getLesson(this.activeLessonNum);
            let entries = lesson.entries;

            if (this.searchQuery.trim().length >= 2) {
                const q = this.searchQuery.trim().toLowerCase();
                entries = lesson.entries.filter(e => {
                    const mEng = e.englishHeadword.toLowerCase().includes(q);
                    const mNep = e.nepaliText.toLowerCase().includes(q);
                    const mRom = e.romanization && e.romanization.toLowerCase().includes(q);
                    return mEng || mNep || mRom;
                });
            }

            if (this.activeTab === 'main') {
                entries = entries.filter(e => e.sourceSection === 'main');
            } else if (this.activeTab === 'practical') {
                entries = entries.filter(e => e.sourceSection === 'practical');
            }

            if (this.activeStatusFilter !== 'all') {
                entries = entries.filter(e => {
                    const st = VocabularyStorage.getStatus(e.id);
                    return st === this.activeStatusFilter;
                });
            }

            return entries;
        }
    };

    // ── 4. UI Icons & Helpers ──
    const Icons = {
        concrete: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>`,
        action: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
        phrase: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
        idiom: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2v1"/><path d="M12 7a5 5 0 0 0-5 5c0 1.5.8 2.8 2 3.6V17h6v-1.4c1.2-.8 2-2.1 2-3.6a5 5 0 0 0-5-5z"/></svg>`,
        sound: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>`
    };

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function getStatusLabel(status) {
        switch (status) {
            case 'difficult': return { text: 'Difficult', devanagari: 'अप्ठ्यारो', cls: 'difficult' };
            case 'learning': return { text: 'Learning', devanagari: 'सिक्दै गरेको', cls: 'learning' };
            case 'known': return { text: 'Already Know', devanagari: 'आउँछ', cls: 'known' };
            default: return { text: 'Unsorted', devanagari: 'छुट्याइएको छैन', cls: 'unsorted' };
        }
    }

    function cycleStatus(current) {
        if (current === 'unsorted') return 'learning';
        if (current === 'learning') return 'known';
        if (current === 'known') return 'difficult';
        return 'unsorted';
    }

    // ── 5. Render Functions ──

    function renderThematicPills() {
        const container = document.getElementById('vocab-themes-scroller');
        if (!container) return;

        let html = `<button class="vocab-theme-pill ${State.activeThemeId === 'all' ? 'active' : ''}" data-theme-id="all">All (${VOCABULARY_DATA.meta.totalLessons})</button>`;
        VOCABULARY_DATA.thematicGroups.forEach(g => {
            const isAct = State.activeThemeId === g.id;
            html += `<button class="vocab-theme-pill ${isAct ? 'active' : ''}" data-theme-id="${g.id}">${escapeHtml(g.name)}</button>`;
        });
        container.innerHTML = html;

        container.querySelectorAll('.vocab-theme-pill').forEach(btn => {
            btn.addEventListener('click', () => {
                State.activeThemeId = btn.getAttribute('data-theme-id');
                renderThematicPills();
                renderSidebarLessonList();
            });
        });
    }

    function renderSidebarLessonList() {
        const list = document.getElementById('vocab-lesson-list');
        if (!list) return;

        let lessons = VOCABULARY_DATA.lessons;
        if (State.activeThemeId !== 'all') {
            const grp = VOCABULARY_DATA.thematicGroups.find(g => g.id === State.activeThemeId);
            if (grp) {
                lessons = lessons.filter(l => grp.lessons.includes(l.number));
            }
        }

        const allStatuses = VocabularyStorage.getAll();
        let html = '';
        lessons.forEach(l => {
            const isAct = l.number === State.activeLessonNum;
            let knownCount = 0;
            l.entries.forEach(e => {
                if (allStatuses[e.id] === 'known') knownCount++;
            });
            const pct = l.entriesCount > 0 ? Math.round((knownCount / l.entriesCount) * 100) : 0;

            html += `
                <li class="vocab-lesson-item ${isAct ? 'active' : ''}" data-lesson-num="${l.number}" role="button" tabindex="0">
                    <div class="vocab-lesson-badge">${l.unitMarker || l.number}</div>
                    <div class="vocab-lesson-info">
                        <div class="vocab-lesson-title">${escapeHtml(l.title)}</div>
                        <div class="vocab-lesson-meta">
                            <span>${l.entriesCount} words</span>
                            <div class="vocab-mini-progress" title="${knownCount}/${l.entriesCount} words known (${pct}%)">
                                <div class="vocab-mini-progress-bar" style="width: ${pct}%;"></div>
                            </div>
                        </div>
                    </div>
                </li>
            `;
        });

        list.innerHTML = html;

        list.querySelectorAll('.vocab-lesson-item').forEach(el => {
            const selectLesson = () => {
                const num = parseInt(el.getAttribute('data-lesson-num'), 10);
                selectActiveLesson(num);
                document.getElementById('vocab-sidebar')?.classList.remove('mobile-open');
            };
            el.addEventListener('click', selectLesson);
            el.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    selectLesson();
                }
            });
        });
    }

    function renderWorkspaceHeader() {
        const lesson = State.getLesson(State.activeLessonNum);
        const headerEl = document.getElementById('vocab-header-panel');
        if (!headerEl) return;

        const grp = VOCABULARY_DATA.thematicGroups.find(g => g.lessons.includes(lesson.number));
        const themeLabel = grp ? grp.name : 'Vocabulary';

        const allStatuses = VocabularyStorage.getAll();
        let counts = { unsorted: 0, difficult: 0, learning: 0, known: 0 };
        lesson.entries.forEach(e => {
            const st = allStatuses[e.id] || 'unsorted';
            counts[st] = (counts[st] || 0) + 1;
        });

        headerEl.innerHTML = `
            <div class="vocab-lesson-header-flex">
                <div class="vocab-unit-marker" title="Lesson Unit ${lesson.unitMarker || lesson.number}">
                    <span class="vocab-unit-label">UNIT</span>
                    <span class="vocab-unit-number">${lesson.unitMarker || lesson.number}</span>
                </div>
                <div class="vocab-lesson-header-details">
                    <div class="vocab-lesson-number-tag">Lesson ${lesson.number} • ${escapeHtml(themeLabel)}</div>
                    <h2 class="vocab-lesson-main-title">${escapeHtml(lesson.title)}</h2>
                    <div class="vocab-lesson-subtitle">General American companion • Spoken Nepali equivalents (${lesson.entriesCount} headwords)</div>
                </div>
                <div class="vocab-nav-buttons">
                    <button class="vocab-btn" id="prev-lesson-btn" ${lesson.number <= 1 ? 'disabled' : ''} title="Previous Lesson (←)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
                        <span>Prev</span>
                    </button>
                    <button class="vocab-btn" id="next-lesson-btn" ${lesson.number >= VOCABULARY_DATA.lessons.length ? 'disabled' : ''} title="Next Lesson (→)">
                        <span>Next</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                </div>
            </div>

            <div class="vocab-control-bar">
                <!-- 4 Core View Modes -->
                <div class="vocab-rhythm-switcher" role="group" aria-label="Book rhythm mode">
                    <button class="vocab-rhythm-btn ${State.viewMode === 'spread' ? 'active' : ''}" id="mode-spread-btn" title="Authentic illustrated book spreads with interactive Devanagari companion">
                        🎨 Visual Book Spread
                    </button>
                    <button class="vocab-rhythm-btn ${State.viewMode === 'modules' ? 'active' : ''}" id="mode-modules-btn" title="Visual modules, interactive maps & structured diagram components">
                        📦 Visual Modules
                    </button>
                    <button class="vocab-rhythm-btn ${State.viewMode === 'practice' ? 'active' : ''}" id="mode-practice-btn" title="Interactive match-up, listening quiz & flashcard recall">
                        ✍️ Practice Arena
                    </button>
                    <button class="vocab-rhythm-btn ${State.viewMode === 'rows' ? 'active' : ''}" id="mode-rows-btn" title="Compact searchable table view">
                        📋 Word List
                    </button>
                </div>

                <!-- Section Tabs & Learning Status Filters -->
                ${(State.viewMode === 'spread' || State.viewMode === 'modules') ? `
                    <div class="vocab-tabs" role="tablist">
                        <button class="vocab-tab-btn ${State.activeTab === 'all' ? 'active' : ''}" data-tab="all">All (${lesson.entriesCount})</button>
                        <button class="vocab-tab-btn ${State.activeTab === 'main' ? 'active' : ''}" data-tab="main">Main List (${lesson.mainCount})</button>
                        <button class="vocab-tab-btn ${State.activeTab === 'practical' ? 'active' : ''}" data-tab="practical">Practical Additions (${lesson.practicalCount})</button>
                        ${lesson.variantsCount > 0 ? `<button class="vocab-tab-btn ${State.activeTab === 'variants' ? 'active' : ''}" data-tab="variants">Variants (${lesson.variantsCount})</button>` : ''}
                    </div>

                    <!-- Learning Status Filter -->
                    <div class="vocab-status-filters" role="group" aria-label="Filter by learning status">
                        <button class="vocab-status-btn ${State.activeStatusFilter === 'all' ? 'active' : ''}" data-status="all">All</button>
                        <button class="vocab-status-btn ${State.activeStatusFilter === 'unsorted' ? 'active' : ''}" data-status="unsorted">
                            <span class="status-dot status-dot-unsorted"></span> Unsorted (${counts.unsorted})
                        </button>
                        <button class="vocab-status-btn ${State.activeStatusFilter === 'difficult' ? 'active' : ''}" data-status="difficult">
                            <span class="status-dot status-dot-difficult"></span> Difficult (${counts.difficult})
                        </button>
                        <button class="vocab-status-btn ${State.activeStatusFilter === 'learning' ? 'active' : ''}" data-status="learning">
                            <span class="status-dot status-dot-learning"></span> Learning (${counts.learning})
                        </button>
                        <button class="vocab-status-btn ${State.activeStatusFilter === 'known' ? 'active' : ''}" data-status="known">
                            <span class="status-dot status-dot-known"></span> Known (${counts.known})
                        </button>
                    </div>
                ` : ''}
            </div>
        `;

        // Event listeners
        headerEl.querySelector('#prev-lesson-btn')?.addEventListener('click', () => {
            if (lesson.number > 1) selectActiveLesson(lesson.number - 1);
        });
        headerEl.querySelector('#next-lesson-btn')?.addEventListener('click', () => {
            if (lesson.number < VOCABULARY_DATA.lessons.length) selectActiveLesson(lesson.number + 1);
        });

        headerEl.querySelector('#mode-spread-btn')?.addEventListener('click', () => {
            State.viewMode = 'spread';
            VocabularyStorage.savePrefs({ viewMode: 'spread' });
            renderWorkspaceHeader();
            renderVocabularyContent();
        });

        headerEl.querySelector('#mode-modules-btn')?.addEventListener('click', () => {
            State.viewMode = 'modules';
            VocabularyStorage.savePrefs({ viewMode: 'modules' });
            renderWorkspaceHeader();
            renderVocabularyContent();
        });

        headerEl.querySelector('#mode-practice-btn')?.addEventListener('click', () => {
            State.viewMode = 'practice';
            VocabularyStorage.savePrefs({ viewMode: 'practice' });
            initPracticeMode();
            renderWorkspaceHeader();
            renderVocabularyContent();
        });

        headerEl.querySelector('#mode-rows-btn')?.addEventListener('click', () => {
            State.viewMode = 'rows';
            VocabularyStorage.savePrefs({ viewMode: 'rows' });
            renderWorkspaceHeader();
            renderVocabularyContent();
        });

        headerEl.querySelectorAll('.vocab-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                State.activeTab = btn.getAttribute('data-tab');
                renderWorkspaceHeader();
                renderVocabularyContent();
            });
        });

        headerEl.querySelectorAll('.vocab-status-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                State.activeStatusFilter = btn.getAttribute('data-status');
                renderWorkspaceHeader();
                renderVocabularyContent();
            });
        });
    }

    function renderVocabularyContent() {
        const container = document.getElementById('vocab-content-container');
        if (!container) return;

        // 1. If actively searching (2+ chars), display instant search results
        if (State.searchQuery.trim().length >= 2) {
            document.getElementById('vocab-audio-player-bar').style.display = 'flex';
            const entries = State.getFilteredEntries();
            VocabularyAudio.sequenceQueue = entries;
            VocabularyAudio.updatePlayerUI();
            renderGridView(container, entries);
            return;
        }

        // 2. Practice Arena Mode
        if (State.viewMode === 'practice') {
            document.getElementById('vocab-audio-player-bar').style.display = 'none';
            renderPracticeSpread(container);
            return;
        }

        document.getElementById('vocab-audio-player-bar').style.display = 'flex';

        // 3. Word List Mode
        if (State.viewMode === 'rows') {
            const entries = State.getFilteredEntries();
            VocabularyAudio.sequenceQueue = entries;
            VocabularyAudio.updatePlayerUI();
            renderRowsView(container, entries);
            return;
        }

        // 4. Recognition Variants Tab
        if (State.activeTab === 'variants') {
            renderVariantsTab(container);
            return;
        }

        // 5. Visual Book Spread View
        if (State.viewMode === 'spread') {
            renderVisualBookSpreadView(container);
            return;
        }

        // 6. Visual Modules & Specialized Diagrams View
        renderVisualModulesView(container);
    }

    // ── 5.0 Visual Book Spread View Implementation ──
    function renderVisualBookSpreadView(container) {
        const lesson = State.getLesson(State.activeLessonNum);
        const spreads = lesson.visualSpreads || {
            page1: `assets/visuals/spreads/lesson_${String(lesson.number).padStart(2, '0')}_p1.webp`,
            page2: `assets/visuals/spreads/lesson_${String(lesson.number).padStart(2, '0')}_p2.webp`,
            printedPages: `${10 + (lesson.number - 1) * 4}–${11 + (lesson.number - 1) * 4}`
        };

        const curPage = State.spreadPage || 'p1';
        const zoom = State.spreadZoom || 1.0;
        const entries = State.getFilteredEntries();

        // Feed entries to Audio controller
        VocabularyAudio.sequenceQueue = entries;
        VocabularyAudio.updatePlayerUI();

        let stageHtml = '';
        if (curPage === 'p1') {
            stageHtml = `
                <div class="vocab-spread-page-frame" style="transform: scale(${zoom}); transform-origin: top center;">
                    <img src="${spreads.page1}" class="vocab-spread-img" alt="Lesson ${lesson.number} Teaching Spread Page 1" loading="eager">
                    <span class="vocab-spread-page-badge">Spread 1 (Page ${spreads.printedPages.split('–')[0] || '1'})</span>
                </div>
            `;
        } else if (curPage === 'p2') {
            stageHtml = `
                <div class="vocab-spread-page-frame" style="transform: scale(${zoom}); transform-origin: top center;">
                    <img src="${spreads.page2}" class="vocab-spread-img" alt="Lesson ${lesson.number} Teaching Spread Page 2" loading="eager">
                    <span class="vocab-spread-page-badge">Spread 2 (Page ${spreads.printedPages.split('–')[1] || '2'})</span>
                </div>
            `;
        } else {
            // Dual Spread Side-by-Side
            stageHtml = `
                <div style="display: flex; gap: 16px; width: 100%; max-width: 1400px; transform: scale(${zoom}); transform-origin: top center;">
                    <div class="vocab-spread-page-frame" style="flex: 1;">
                        <img src="${spreads.page1}" class="vocab-spread-img" alt="Lesson ${lesson.number} Spread Page 1" loading="eager">
                        <span class="vocab-spread-page-badge">Spread 1</span>
                    </div>
                    <div class="vocab-spread-page-frame" style="flex: 1;">
                        <img src="${spreads.page2}" class="vocab-spread-img" alt="Lesson ${lesson.number} Spread Page 2" loading="eager">
                        <span class="vocab-spread-page-badge">Spread 2</span>
                    </div>
                </div>
            `;
        }

        container.innerHTML = `
            <div class="vocab-spread-wrapper">
                <!-- Spread Toolbar -->
                <div class="vocab-spread-toolbar">
                    <div class="vocab-spread-toolbar-group">
                        <span class="vocab-spread-toolbar-title">Spread:</span>
                        <button class="vocab-spread-btn ${curPage === 'p1' ? 'active' : ''}" id="spread-p1-btn">📄 Page 1</button>
                        <button class="vocab-spread-btn ${curPage === 'p2' ? 'active' : ''}" id="spread-p2-btn">📄 Page 2</button>
                        <button class="vocab-spread-btn ${curPage === 'dual' ? 'active' : ''}" id="spread-dual-btn">📖 Dual Spread</button>
                    </div>

                    <div class="vocab-spread-toolbar-group">
                        <span class="vocab-spread-toolbar-title" style="display: none;">Zoom:</span>
                        <button class="vocab-spread-btn" id="spread-zoom-in-btn" title="Zoom In (+)">🔍+</button>
                        <button class="vocab-spread-btn" id="spread-zoom-out-btn" title="Zoom Out (-)">🔍-</button>
                        <button class="vocab-spread-btn" id="spread-zoom-reset-btn" title="Reset Zoom">↺ ${Math.round(zoom * 100)}%</button>
                        <button class="vocab-spread-btn" id="spread-fullscreen-btn" title="Toggle Fullscreen View">⛶ Fullscreen</button>
                        <button class="vocab-spread-btn" id="spread-play-all-btn" title="Play Sequential Audio for this Spread">
                            ${Icons.sound} Play Audio (${entries.length})
                        </button>
                    </div>
                </div>

                <!-- Spread Viewport -->
                <div class="vocab-spread-viewport" id="vocab-spread-viewport">
                    <button class="vocab-spread-fullscreen-close" id="spread-fs-close-btn">&times; Close Fullscreen (Esc)</button>
                    <div class="vocab-spread-stage" id="vocab-spread-stage">
                        ${stageHtml}
                    </div>
                </div>

                <!-- Interactive Devanagari Companion Deck -->
                <div class="vocab-spread-companion">
                    <div class="vocab-spread-companion-header">
                        <div class="vocab-companion-title-area">
                            <h3>
                                <span>🎨 सचित्र पुस्तक शब्दावली साथी</span>
                                <span style="font-size: 0.8rem; font-weight: 500; color: var(--vocab-sage-primary); background: var(--vocab-sage-light); padding: 2px 8px; border-radius: 6px;">
                                    Devanagari Companion Deck
                                </span>
                            </h3>
                            <p>Click any card to pronounce with natural audio, write notes, or track your learning progress.</p>
                        </div>
                        <div class="vocab-companion-module-tabs">
                            <button class="vocab-companion-tab-btn ${State.spreadModuleFilter === 'all' ? 'active' : ''}" data-mod-filter="all">All Modules (${entries.length})</button>
                            ${lesson.modules.map(m => `
                                <button class="vocab-companion-tab-btn ${State.spreadModuleFilter === m.id ? 'active' : ''}" data-mod-filter="${m.id}">
                                    Mod ${m.id} (${m.count})
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Cards Grid -->
                    <div class="vocab-cards-grid">
                        ${(State.spreadModuleFilter === 'all' ? entries : entries.filter(e => e.moduleId === State.spreadModuleFilter))
                            .map(e => renderCardHtml(e)).join('')}
                    </div>
                </div>
            </div>
        `;

        bindCardEvents(container);

        // Bind spread controls
        container.querySelector('#spread-p1-btn')?.addEventListener('click', () => {
            State.spreadPage = 'p1';
            VocabularyStorage.savePrefs({ spreadPage: 'p1' });
            renderVisualBookSpreadView(container);
        });

        container.querySelector('#spread-p2-btn')?.addEventListener('click', () => {
            State.spreadPage = 'p2';
            VocabularyStorage.savePrefs({ spreadPage: 'p2' });
            renderVisualBookSpreadView(container);
        });

        container.querySelector('#spread-dual-btn')?.addEventListener('click', () => {
            State.spreadPage = 'dual';
            VocabularyStorage.savePrefs({ spreadPage: 'dual' });
            renderVisualBookSpreadView(container);
        });

        container.querySelector('#spread-zoom-in-btn')?.addEventListener('click', () => {
            State.spreadZoom = Math.min(2.0, (State.spreadZoom || 1.0) + 0.15);
            renderVisualBookSpreadView(container);
        });

        container.querySelector('#spread-zoom-out-btn')?.addEventListener('click', () => {
            State.spreadZoom = Math.max(0.6, (State.spreadZoom || 1.0) - 0.15);
            renderVisualBookSpreadView(container);
        });

        container.querySelector('#spread-zoom-reset-btn')?.addEventListener('click', () => {
            State.spreadZoom = 1.0;
            renderVisualBookSpreadView(container);
        });

        const viewport = container.querySelector('#vocab-spread-viewport');
        container.querySelector('#spread-fullscreen-btn')?.addEventListener('click', () => {
            if (viewport) {
                viewport.classList.toggle('fullscreen');
                document.body.style.overflow = viewport.classList.contains('fullscreen') ? 'hidden' : '';
            }
        });

        container.querySelector('#spread-fs-close-btn')?.addEventListener('click', () => {
            if (viewport) {
                viewport.classList.remove('fullscreen');
                document.body.style.overflow = '';
            }
        });

        container.querySelector('#spread-play-all-btn')?.addEventListener('click', () => {
            VocabularyAudio.togglePlayPause();
        });

        container.querySelectorAll('[data-mod-filter]').forEach(btn => {
            btn.addEventListener('click', () => {
                State.spreadModuleFilter = btn.getAttribute('data-mod-filter');
                renderVisualBookSpreadView(container);
            });
        });
    }

    // ── 5.1 Visual Modules & Specialized Visual Renderers ──
    function renderVisualModulesView(container) {
        const lesson = State.getLesson(State.activeLessonNum);

        // Feed entries to Audio controller
        VocabularyAudio.sequenceQueue = State.getFilteredEntries();
        VocabularyAudio.updatePlayerUI();

        if (lesson.number === 1) {
            renderSpecializedLesson1(container, lesson);
        } else if (lesson.number === 2) {
            renderSpecializedLesson2(container, lesson);
        } else if (lesson.number === 3) {
            renderSpecializedLesson3(container, lesson);
        } else if (lesson.number === 4) {
            renderSpecializedLesson4(container, lesson);
        } else if (lesson.number === 5) {
            renderSpecializedLesson5(container, lesson);
        } else if (lesson.number === 14) {
            renderSpecializedLesson14(container, lesson);
        } else if (lesson.number === 20) {
            renderSpecializedLesson20(container, lesson);
        } else {
            renderModuleFramesView(container);
        }
    }

    // ── Specialized Lesson 1: Interactive World Map & Flag Grid ──
    const WORLD_MAP_COUNTRIES = [
        { country: 'Nepal', nepali: 'नेपाल', flag: '🇳🇵', x: 68.5, y: 44, nat: 'नेपाली (Nepali)' },
        { country: 'United Kingdom', nepali: 'बेलायत', flag: '🇬🇧', x: 48, y: 26, nat: 'बेलायती (British)' },
        { country: 'United States', nepali: 'संयुक्त राज्य अमेरिका', flag: '🇺🇸', x: 21, y: 35, nat: 'अमेरिकी (American)' },
        { country: 'Canada', nepali: 'क्यानाडा', flag: '🇨🇦', x: 20, y: 24, nat: 'क्यानेडियन (Canadian)' },
        { country: 'Japan', nepali: 'जापान', flag: '🇯🇵', x: 84, y: 37, nat: 'जापानी (Japanese)' },
        { country: 'Australia', nepali: 'अष्ट्रेलिया', flag: '🇦🇺', x: 84, y: 72, nat: 'अष्ट्रेलियन (Australian)' },
        { country: 'China', nepali: 'चीन', flag: '🇨🇳', x: 73, y: 38, nat: 'चिनियाँ (Chinese)' },
        { country: 'India', nepali: 'भारत', flag: '🇮🇳', x: 67, y: 46, nat: 'भारतीय (Indian)' },
        { country: 'France', nepali: 'फ्रान्स', flag: '🇫🇷', x: 48.5, y: 31, nat: 'फ्रान्सेली (French)' },
        { country: 'Germany', nepali: 'जर्मनी', flag: '🇩🇪', x: 50.5, y: 28, nat: 'जर्मन (German)' },
        { country: 'Italy', nepali: 'इटाली', flag: '🇮🇹', x: 51.5, y: 33, nat: 'इटालियन (Italian)' },
        { country: 'Spain', nepali: 'स्पेन', flag: '🇪🇸', x: 47, y: 34, nat: 'स्पेनिस (Spanish)' },
        { country: 'Brazil', nepali: 'ब्राजिल', flag: '🇧🇷', x: 34, y: 64, nat: 'ब्राजिलियन (Brazilian)' },
        { country: 'Mexico', nepali: 'मेक्सिको', flag: '🇲🇽', x: 17, y: 44, nat: 'मेक्सिकन (Mexican)' },
        { country: 'South Africa', nepali: 'दक्षिण अफ्रिका', flag: '🇿🇦', x: 53.5, y: 74, nat: 'दक्षिण अफ्रिकी (South African)' },
        { country: 'Egypt', nepali: 'इजिप्ट', flag: '🇪🇬', x: 55, y: 40, nat: 'इजिप्सियन (Egyptian)' },
        { country: 'Russia', nepali: 'रसिया', flag: '🇷🇺', x: 70, y: 20, nat: 'रसियन (Russian)' },
        { country: 'Argentina', nepali: 'अर्जेन्टिना', flag: '🇦🇷', x: 30, y: 76, nat: 'अर्जेन्टिनी (Argentine)' },
        { country: 'Colombia', nepali: 'कोलम्बिया', flag: '🇨🇴', x: 26, y: 52, nat: 'कोलम्बियन (Colombian)' }
    ];

    function renderSpecializedLesson1(container, lesson) {
        let html = `
            <div class="vocab-worldmap-wrapper">
                <div class="vocab-worldmap-header">
                    <div>
                        <h3 style="margin: 0; font-size: 1.25rem; color: var(--text-main);">
                            🌍 सचित्र विश्व नक्सा (Illustrated World Map)
                        </h3>
                        <p style="margin: 4px 0 0; font-size: 0.85rem; color: var(--text-muted);">
                            Interactive Country & Nationality Exploration — Tap any flag pin on the world map to listen to natural Nepali pronunciation.
                        </p>
                    </div>
                    <button class="vocab-btn vocab-btn-sage" id="l1-play-all-map-btn">
                        ${Icons.sound} Pronounce Countries
                    </button>
                </div>

                <!-- Stylized SVG World Canvas with Pins -->
                <div class="vocab-worldmap-canvas">
                    <svg class="vocab-svg-map" viewBox="0 0 1000 500" preserveAspectRatio="none">
                        <!-- North America -->
                        <path class="vocab-map-landmass" d="M120,70 Q220,50 300,90 Q340,150 260,220 Q190,260 160,210 Q90,140 120,70 Z"/>
                        <!-- South America -->
                        <path class="vocab-map-landmass" d="M250,260 Q340,280 370,360 Q320,450 270,440 Q240,350 250,260 Z"/>
                        <!-- Europe -->
                        <path class="vocab-map-landmass" d="M450,110 Q540,90 570,160 Q520,200 460,190 Q430,150 450,110 Z"/>
                        <!-- Africa -->
                        <path class="vocab-map-landmass" d="M470,210 Q580,220 590,320 Q540,430 490,410 Q450,310 470,210 Z"/>
                        <!-- Asia -->
                        <path class="vocab-map-landmass" d="M580,90 Q820,70 880,180 Q820,290 680,270 Q590,220 580,90 Z"/>
                        <!-- Australia -->
                        <path class="vocab-map-landmass" d="M780,330 Q880,320 890,410 Q810,430 780,330 Z"/>
                    </svg>

                    ${WORLD_MAP_COUNTRIES.map(c => `
                        <div class="vocab-map-pin" style="left: ${c.x}%; top: ${c.y}%;" data-map-country="${c.country}" data-speak="${c.nepali}">
                            <div class="vocab-map-pin-flag">${c.flag}</div>
                            <div class="vocab-map-pin-pill">
                                <span class="vocab-map-pin-nepali">${c.nepali}</span>
                                <span style="font-size: 0.65rem; color: var(--text-muted); margin-left: 2px;">(${c.country})</span>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- National Flag & Leader Line Grid -->
                <div style="margin-top: 24px;">
                    <h4 style="margin: 0 0 10px; font-size: 1rem; color: var(--text-main);">National Flags & Nepali Equivalents (राष्ट्रिय झन्डा र देशहरू)</h4>
                    <div class="vocab-flags-showcase">
                        ${WORLD_MAP_COUNTRIES.map(c => `
                            <div class="vocab-flag-card" data-speak="${c.nepali}">
                                <div class="vocab-flag-card-flag">${c.flag}</div>
                                <div>
                                    <div class="vocab-flag-card-nepali">${c.nepali}</div>
                                    <div class="vocab-flag-card-eng">${c.country} ➔ ${c.nat}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Country ➔ Nationality Conversion Board -->
                <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border-color);">
                    <h4 style="margin: 0 0 12px; font-size: 1rem; color: var(--text-main);">Country ➔ Nationality Conversion Board (देश र नागरिकता रूपान्तरण)</h4>
                    <div class="vocab-pairing-grid">
                        ${(VOCABULARY_DATA.countryNationalityPairs || []).map(p => `
                            <div class="vocab-pairing-card" data-speak="${p.nationalityNepali}">
                                <div class="vocab-pairing-side">
                                    <div class="vocab-pairing-nepali">${p.flag} ${p.countryNepali}</div>
                                    <div class="vocab-pairing-eng">${p.country}</div>
                                </div>
                                <div class="vocab-pairing-arrow">➔</div>
                                <div class="vocab-pairing-side" style="text-align: right;">
                                    <div class="vocab-pairing-nepali" style="color: var(--vocab-sage-primary);">${p.nationalityNepali}</div>
                                    <div class="vocab-pairing-eng">${p.nationality}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;

        // Click on map pin or flag card to speak
        container.querySelectorAll('[data-speak]').forEach(el => {
            el.addEventListener('click', () => {
                const text = el.getAttribute('data-speak');
                VocabularyAudio.playSingle(text);
            });
        });

        container.querySelector('#l1-play-all-map-btn')?.addEventListener('click', () => {
            VocabularyAudio.togglePlayPause();
        });
    }

    // ── Specialized Lesson 2: Structured Numbers & Ordinals (Image 2 Match) ──
    const NUMBERS_1_100 = [
        { num: 1, devNum: '१', eng: 'one', nep: 'एक', rom: 'ek' },
        { num: 2, devNum: '२', eng: 'two', nep: 'दुई', rom: 'duee' },
        { num: 3, devNum: '३', eng: 'three', nep: 'तीन', rom: 'teen' },
        { num: 4, devNum: '४', eng: 'four', nep: 'चार', rom: 'chaar' },
        { num: 5, devNum: '५', eng: 'five', nep: 'पाँच', rom: 'paanch' },
        { num: 6, devNum: '६', eng: 'six', nep: 'छ', rom: 'chh' },
        { num: 7, devNum: '७', eng: 'seven', nep: 'सात', rom: 'saat' },
        { num: 8, devNum: '८', eng: 'eight', nep: 'आठ', rom: 'aath' },
        { num: 9, devNum: '९', eng: 'nine', nep: 'नौ', rom: 'nau' },
        { num: 10, devNum: '१०', eng: 'ten', nep: 'दस', rom: 'das' },
        { num: 11, devNum: '११', eng: 'eleven', nep: 'एघार', rom: 'eghaar' },
        { num: 12, devNum: '१२', eng: 'twelve', nep: 'बाह्र', rom: 'baahr' },
        { num: 13, devNum: '१३', eng: 'thirteen', nep: 'तेह्र', rom: 'tehr' },
        { num: 14, devNum: '१४', eng: 'fourteen', nep: 'चौध', rom: 'chaudh' },
        { num: 15, devNum: '१५', eng: 'fifteen', nep: 'पन्ध्र', rom: 'pandhr' },
        { num: 16, devNum: '१६', eng: 'sixteen', nep: 'सोह्र', rom: 'sohr' },
        { num: 17, devNum: '१७', eng: 'seventeen', nep: 'सत्र', rom: 'satr' },
        { num: 18, devNum: '१८', eng: 'eighteen', nep: 'अठार', rom: 'athaar' },
        { num: 19, devNum: '१९', eng: 'nineteen', nep: 'उन्नाइस', rom: 'unnaais' },
        { num: 20, devNum: '२०', eng: 'twenty', nep: 'बीस', rom: 'bees' },
        { num: 21, devNum: '२१', eng: 'twenty-one', nep: 'एक्काइस', rom: 'ekkaais' },
        { num: 22, devNum: '२२', eng: 'twenty-two', nep: 'बाइस', rom: 'baais' },
        { num: 30, devNum: '३०', eng: 'thirty', nep: 'तीस', rom: 'tees' },
        { num: 40, devNum: '४०', eng: 'forty', nep: 'चालीस', rom: 'chaalees' },
        { num: 50, devNum: '५०', eng: 'fifty', nep: 'पचास', rom: 'pachaas' },
        { num: 60, devNum: '६०', eng: 'sixty', nep: 'साठी', rom: 'saathee' },
        { num: 70, devNum: '७०', eng: 'seventy', nep: 'सत्तरी', rom: 'sattaree' },
        { num: 80, devNum: '८०', eng: 'eighty', nep: 'असी', rom: 'asee' },
        { num: 90, devNum: '९०', eng: 'ninety', nep: 'नब्बे', rom: 'nabbe' },
        { num: 100, devNum: '१००', eng: 'one hundred', nep: 'एक सय', rom: 'ek saya' }
    ];

    const ORDINALS_LIST = [
        { ord: '1st', devOrd: '१औं', eng: 'first', nep: 'पहिलो', rom: 'pahilo' },
        { ord: '2nd', devOrd: '२औं', eng: 'second', nep: 'दोस्रो', rom: 'dosro' },
        { ord: '3rd', devOrd: '३औं', eng: 'third', nep: 'तेस्रो', rom: 'tesro' },
        { ord: '4th', devOrd: '४औं', eng: 'fourth', nep: 'चौथो', rom: 'chautho' },
        { ord: '5th', devOrd: '५औं', eng: 'fifth', nep: 'पाँचौँ', rom: 'paanchaun' },
        { ord: '6th', devOrd: '६औं', eng: 'sixth', nep: 'छैटौँ', rom: 'chhaitaun' },
        { ord: '7th', devOrd: '७औं', eng: 'seventh', nep: 'सातौँ', rom: 'saataun' },
        { ord: '8th', devOrd: '८औं', eng: 'eighth', nep: 'आठौँ', rom: 'aathaun' },
        { ord: '9th', devOrd: '९औं', eng: 'ninth', nep: 'नवौँ', rom: 'nawaun' },
        { ord: '10th', devOrd: '१०औं', eng: 'tenth', nep: 'दसौँ', rom: 'dasaun' },
        { ord: '11th', devOrd: '११औं', eng: 'eleventh', nep: 'एघारौँ', rom: 'eghaaraun' },
        { ord: '12th', devOrd: '१२औं', eng: 'twelfth', nep: 'बाह्रौँ', rom: 'baahraun' },
        { ord: '13th', devOrd: '१३औं', eng: 'thirteenth', nep: 'तेह्रौँ', rom: 'tehraun' },
        { ord: '14th', devOrd: '१४औं', eng: 'fourteenth', nep: 'चौधौँ', rom: 'chaudhaun' },
        { ord: '15th', devOrd: '१५औं', eng: 'fifteenth', nep: 'पन्ध्रौँ', rom: 'pandhraun' },
        { ord: '16th', devOrd: '१६औं', eng: 'sixteenth', nep: 'सोह्रौँ', rom: 'sohraun' },
        { ord: '17th', devOrd: '१७औं', eng: 'seventeenth', nep: 'सत्रौँ', rom: 'satraun' },
        { ord: '18th', devOrd: '१८औं', eng: 'eighteenth', nep: 'अठारौँ', rom: 'athaaraun' },
        { ord: '19th', devOrd: '१९औं', eng: 'nineteenth', nep: 'उन्नाइसौँ', rom: 'unnaaisaun' },
        { ord: '20th', devOrd: '२०औं', eng: 'twentieth', nep: 'बीसौँ', rom: 'beesaun' },
        { ord: '21st', devOrd: '२१औं', eng: 'twenty-first', nep: 'एक्काइसौँ', rom: 'ekkaaisaun' },
        { ord: '30th', devOrd: '३०औं', eng: 'thirtieth', nep: 'तीसौँ', rom: 'teesaun' },
        { ord: '100th', devOrd: '१००औं', eng: 'one hundredth', nep: 'सयौँ', rom: 'sayaun' }
    ];

    function renderSpecializedLesson2(container, lesson) {
        let html = `
            <!-- Module 2.1 Numbers Grid -->
            <div class="vocab-numbers-section">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                    <div>
                        <div style="font-size: 0.75rem; font-weight: 700; color: #2563eb; text-transform: uppercase; letter-spacing: 0.05em;">MODULE 2.1</div>
                        <h3 style="margin: 2px 0 0; font-size: 1.3rem; color: var(--text-main);">🔢 Numbers (सङ्ख्याहरू: १ देखि १०० सम्म)</h3>
                        <p style="margin: 4px 0 0; font-size: 0.85rem; color: var(--text-muted);">
                            Structured number tables matching DK visual layout with blue digits, Devanagari numerals, and write-on lines.
                        </p>
                    </div>
                    <button class="vocab-module-play-btn" data-play-module="2.1">
                        ${Icons.sound} Play Module 2.1
                    </button>
                </div>

                <div class="vocab-numbers-grid">
                    ${NUMBERS_1_100.map(item => {
                        const entry = lesson.entries.find(e => e.englishHeadword.toLowerCase() === item.eng.toLowerCase()) || { id: `num-${item.num}`, nepaliText: item.nep };
                        const note = VocabularyNotes.get(entry.id);
                        return `
                            <div class="vocab-number-item" data-speak="${item.nep}">
                                <div>
                                    <div class="vocab-number-header-row">
                                        <span class="vocab-number-digit">${item.num}</span>
                                        <span class="vocab-number-dev-digit">${item.devNum}</span>
                                    </div>
                                    <div class="vocab-number-nepali-word">${item.nep}</div>
                                    <div class="vocab-number-eng-word">${item.eng} • <em>${item.rom}</em></div>
                                </div>
                                <div class="vocab-number-writeon">
                                    <input type="text" class="vocab-number-writeon-input" data-writeon-id="${entry.id}" placeholder="✎ Note / translation..." value="${escapeHtml(note)}">
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <!-- Module 2.2 Ordinal Numbers Strip -->
            <div class="vocab-numbers-section">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                    <div>
                        <div style="font-size: 0.75rem; font-weight: 700; color: #d97706; text-transform: uppercase; letter-spacing: 0.05em;">MODULE 2.2</div>
                        <h3 style="margin: 2px 0 0; font-size: 1.3rem; color: var(--text-main);">🥇 Ordinal Numbers (क्रमवाचक सङ्ख्याहरू: १औं देखि १००औं सम्म)</h3>
                        <p style="margin: 4px 0 0; font-size: 0.85rem; color: var(--text-muted);">
                            Order, sequence, rankings, and calendar dates in natural spoken Nepali.
                        </p>
                    </div>
                    <button class="vocab-module-play-btn" data-play-module="2.2">
                        ${Icons.sound} Play Module 2.2
                    </button>
                </div>

                <div class="vocab-ordinals-strip">
                    ${ORDINALS_LIST.map(item => {
                        const entry = lesson.entries.find(e => e.englishHeadword.toLowerCase() === item.eng.toLowerCase()) || { id: `ord-${item.ord}`, nepaliText: item.nep };
                        const note = VocabularyNotes.get(entry.id);
                        return `
                            <div class="vocab-ordinal-card" data-speak="${item.nep}">
                                <div>
                                    <div class="vocab-ordinal-badge">${item.ord} • ${item.devOrd}</div>
                                    <div class="vocab-number-nepali-word">${item.nep}</div>
                                    <div class="vocab-number-eng-word">${item.eng} • <em>${item.rom}</em></div>
                                </div>
                                <div class="vocab-number-writeon">
                                    <input type="text" class="vocab-number-writeon-input" data-writeon-id="${entry.id}" placeholder="✎ Note..." value="${escapeHtml(note)}">
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <!-- Modules 2.3, 2.4, 2.5 -->
            ${lesson.modules.filter(m => ['2.3', '2.4', '2.5'].includes(m.id)).map(mod => {
                const modEntries = lesson.entries.filter(e => e.moduleId === mod.id);
                if (!modEntries.length) return '';
                return `
                    <section class="vocab-module-frame" id="module-${mod.id}">
                        <div class="vocab-module-header">
                            <div class="vocab-module-tag">
                                <span class="vocab-module-badge">${mod.id}</span>
                                <h3 class="vocab-module-title">${escapeHtml(mod.title)}</h3>
                            </div>
                            <button class="vocab-module-play-btn" data-play-module="${mod.id}">
                                ${Icons.sound} Play Module (${mod.count})
                            </button>
                        </div>
                        <div class="vocab-cards-grid">
                            ${modEntries.map(e => renderCardHtml(e)).join('')}
                        </div>
                    </section>
                `;
            }).join('')}
        `;

        container.innerHTML = html;
        bindCardEvents(container);

        container.querySelectorAll('[data-speak]').forEach(el => {
            el.addEventListener('click', (e) => {
                if (e.target.tagName === 'INPUT') return;
                const text = el.getAttribute('data-speak');
                VocabularyAudio.playSingle(text);
            });
        });

        container.querySelectorAll('[data-play-module]').forEach(btn => {
            btn.addEventListener('click', () => {
                const modId = btn.getAttribute('data-play-module');
                VocabularyAudio.playModule(modId);
            });
        });
    }

    // ── Specialized Lesson 3: Calendar & Seasons ──
    const CALENDAR_MONTHS = [
        { eng: 'January', nep: 'जनवरी', rom: 'janawaree', num: 1 },
        { eng: 'February', nep: 'फेब्रुअरी', rom: 'phebruwaree', num: 2 },
        { eng: 'March', nep: 'मार्च', rom: 'maarch', num: 3 },
        { eng: 'April', nep: 'अप्रिल', rom: 'april', num: 4 },
        { eng: 'May', nep: 'मे', rom: 'me', num: 5 },
        { eng: 'June', nep: 'जुन', rom: 'jun', num: 6 },
        { eng: 'July', nep: 'जुलाई', rom: 'julaaee', num: 7 },
        { eng: 'August', nep: 'अगस्ट', rom: 'agasta', num: 8 },
        { eng: 'September', nep: 'सेप्टेम्बर', rom: 'septembar', num: 9 },
        { eng: 'October', nep: 'अक्टोबर', rom: 'aktobar', num: 10 },
        { eng: 'November', nep: 'नोभेम्बर', rom: 'nobhembar', num: 11 },
        { eng: 'December', nep: 'डिसेम्बर', rom: 'disembar', num: 12 }
    ];

    const DAYS_OF_WEEK = [
        { eng: 'Sunday', nep: 'आइतबार', rom: 'aaitabaar' },
        { eng: 'Monday', nep: 'सोमबार', rom: 'somabaar' },
        { eng: 'Tuesday', nep: 'मंगलबार', rom: 'mangalabaar' },
        { eng: 'Wednesday', nep: 'बुधबार', rom: 'budhabaar' },
        { eng: 'Thursday', nep: 'बिहीबार', rom: 'biheebaar' },
        { eng: 'Friday', nep: 'शुक्रबार', rom: 'shukrabaar' },
        { eng: 'Saturday', nep: 'शनिबार', rom: 'shanibaar' }
    ];

    const SEASONS_DATA = [
        { eng: 'spring', nep: 'वसन्त ऋतु', icon: '🌸', cls: 'season-spring', desc: 'Blooming & warm' },
        { eng: 'summer', nep: 'ग्रीष्म ऋतु', icon: '☀️', cls: 'season-summer', desc: 'Sunny & hot' },
        { eng: 'autumn', nep: 'शरद ऋतु', icon: '🍂', cls: 'season-autumn', desc: 'Crisp & festival time' },
        { eng: 'winter', nep: 'हिउँद ऋतु', icon: '❄️', cls: 'season-winter', desc: 'Chilly & frosty' }
    ];

    function renderSpecializedLesson3(container, lesson) {
        let html = `
            <div class="vocab-numbers-section">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--text-main);">📅 The 12 Months of the Year (१२ महिनाहरू)</h3>
                <p style="margin: 4px 0 16px; font-size: 0.85rem; color: var(--text-muted);">
                    Gregorian calendar months widely used in business, international communication, and urban spoken Nepali.
                </p>
                <div class="vocab-calendar-board">
                    ${CALENDAR_MONTHS.map(m => `
                        <div class="vocab-calendar-month-tile" data-speak="${m.nep}">
                            <div class="vocab-month-banner">${m.eng} • Month ${m.num}</div>
                            <div class="vocab-month-body">
                                <div class="vocab-month-nepali">${m.nep}</div>
                                <div class="vocab-month-english">${m.rom}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- Days of Week Strip -->
                <div style="margin-top: 24px;">
                    <h4 style="margin: 0 0 10px; font-size: 1rem; color: var(--text-main);">Days of the Week (हप्ताका दिनहरू)</h4>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        ${DAYS_OF_WEEK.map(d => `
                            <div class="vocab-flag-card" style="flex: 1; min-width: 130px; text-align: center; justify-content: center;" data-speak="${d.nep}">
                                <div>
                                    <div style="font-weight: 700; color: var(--text-main); font-size: 1rem;">${d.nep}</div>
                                    <div style="font-size: 0.75rem; color: var(--text-muted);">${d.eng}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- 4 Seasons Wheel -->
                <div style="margin-top: 28px;">
                    <h4 style="margin: 0 0 10px; font-size: 1rem; color: var(--text-main);">The 4 Seasons (चार ऋतुहरू)</h4>
                    <div class="vocab-seasons-grid">
                        ${SEASONS_DATA.map(s => `
                            <div class="vocab-season-card" data-speak="${s.nep}">
                                <div class="vocab-season-icon-wrap ${s.cls}">${s.icon}</div>
                                <div>
                                    <div style="font-size: 1.15rem; font-weight: 700; color: var(--text-main);">${s.nep}</div>
                                    <div style="font-size: 0.8125rem; color: var(--text-muted); text-transform: capitalize;">${s.eng} • ${s.desc}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- Standard Modules -->
            ${lesson.modules.map(mod => {
                const modEntries = lesson.entries.filter(e => e.moduleId === mod.id);
                if (!modEntries.length) return '';
                return `
                    <section class="vocab-module-frame" id="module-${mod.id}">
                        <div class="vocab-module-header">
                            <div class="vocab-module-tag">
                                <span class="vocab-module-badge">${mod.id}</span>
                                <h3 class="vocab-module-title">${escapeHtml(mod.title)}</h3>
                            </div>
                            <button class="vocab-module-play-btn" data-play-module="${mod.id}">
                                ${Icons.sound} Play Module (${mod.count})
                            </button>
                        </div>
                        <div class="vocab-cards-grid">
                            ${modEntries.map(e => renderCardHtml(e)).join('')}
                        </div>
                    </section>
                `;
            }).join('')}
        `;

        container.innerHTML = html;
        bindCardEvents(container);

        container.querySelectorAll('[data-speak]').forEach(el => {
            el.addEventListener('click', () => {
                const text = el.getAttribute('data-speak');
                VocabularyAudio.playSingle(text);
            });
        });

        container.querySelectorAll('[data-play-module]').forEach(btn => {
            btn.addEventListener('click', () => {
                const modId = btn.getAttribute('data-play-module');
                VocabularyAudio.playModule(modId);
            });
        });
    }

    // ── Specialized Lesson 4: Daily Routines Timeline ──
    const DAILY_ROUTINES_DATA = [
        { time: '06:30 AM', eng: 'wake up', nep: 'ब्युँझनु', icon: '⏰', period: 'Morning' },
        { time: '07:00 AM', eng: 'brush teeth', nep: 'दाँत माझ्नु', icon: '🪥', period: 'Morning' },
        { time: '07:30 AM', eng: 'take a shower', nep: 'नुहाउनु', icon: '🚿', period: 'Morning' },
        { time: '08:00 AM', eng: 'have breakfast', nep: 'बिहानको खाजा खानु', icon: '🍳', period: 'Morning' },
        { time: '08:45 AM', eng: 'go to work / school', nep: 'काममा / विद्यालय जानु', icon: '🚌', period: 'Daytime' },
        { time: '01:00 PM', eng: 'have lunch', nep: 'दिउँसोको खाना खानु', icon: '🍱', period: 'Daytime' },
        { time: '05:30 PM', eng: 'come home', nep: 'घर फर्कनु', icon: '🏠', period: 'Evening' },
        { time: '07:30 PM', eng: 'cook dinner', nep: 'बेलुकीको खाना पकाउनु', icon: '🍲', period: 'Evening' },
        { time: '08:15 PM', eng: 'have dinner', nep: 'बेलुकीको खाना खानु', icon: '🍽️', period: 'Evening' },
        { time: '10:30 PM', eng: 'go to bed', nep: 'सुत्न जानु', icon: '🛏️', period: 'Night' }
    ];

    function renderSpecializedLesson4(container, lesson) {
        let html = `
            <div class="vocab-timeline-container">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                    <div>
                        <h3 style="margin: 0; font-size: 1.25rem; color: var(--text-main);">
                            ⏳ 24-Hour Chronological Routine Flow (दैनिक तालिका)
                        </h3>
                        <p style="margin: 4px 0 0; font-size: 0.85rem; color: var(--text-muted);">
                            Follow daily actions from dawn to bedtime in everyday spoken Nepali.
                        </p>
                    </div>
                    <button class="vocab-btn vocab-btn-sage" id="l4-play-routines-btn">
                        ${Icons.sound} Play Routines Sequence
                    </button>
                </div>

                <div class="vocab-routine-track">
                    ${DAILY_ROUTINES_DATA.map(step => `
                        <div class="vocab-routine-step" data-speak="${step.nep}">
                            <div style="display: flex; align-items: center; gap: 14px;">
                                <span style="font-size: 1.6rem;">${step.icon}</span>
                                <div>
                                    <div style="font-size: 1.15rem; font-weight: 700; color: var(--text-main);">${step.nep}</div>
                                    <div style="font-size: 0.85rem; color: var(--text-muted);">${step.eng}</div>
                                </div>
                            </div>
                            <div style="text-align: right;">
                                <span style="font-size: 0.75rem; font-weight: 700; color: var(--vocab-sage-primary); background: var(--vocab-sage-light); padding: 3px 8px; border-radius: 6px;">
                                    ${step.time}
                                </span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            ${renderStandardModulesHtml(lesson)}
        `;

        container.innerHTML = html;
        bindCardEvents(container);

        container.querySelectorAll('[data-speak]').forEach(el => {
            el.addEventListener('click', () => {
                const text = el.getAttribute('data-speak');
                VocabularyAudio.playSingle(text);
            });
        });

        container.querySelector('#l4-play-routines-btn')?.addEventListener('click', () => {
            VocabularyAudio.togglePlayPause();
        });
    }

    // ── Specialized Lesson 5: Colors Palette & Materials ──
    const COLORS_DATA = [
        { eng: 'red', nep: 'रातो', rom: 'raato', hex: '#ef4444' },
        { eng: 'blue', nep: 'नीलो', rom: 'neelo', hex: '#3b82f6' },
        { eng: 'green', nep: 'हरियो', rom: 'hariyo', hex: '#22c55e' },
        { eng: 'yellow', nep: 'पहेँलो', rom: 'pahenlo', hex: '#eab308' },
        { eng: 'orange', nep: 'सुन्तला रङ', rom: 'suntalaa rang', hex: '#f97316' },
        { eng: 'purple', nep: 'बैजनी', rom: 'baijanee', hex: '#a855f7' },
        { eng: 'pink', nep: 'गुलाबी', rom: 'gulaabee', hex: '#ec4899' },
        { eng: 'brown', nep: 'खैरो', rom: 'khairo', hex: '#78350f' },
        { eng: 'black', nep: 'कालो', rom: 'kaalo', hex: '#0f172a' },
        { eng: 'white', nep: 'सेतो', rom: 'seto', hex: '#ffffff' },
        { eng: 'gray', nep: 'फुस्रो / खैरो', rom: 'phusro', hex: '#64748b' },
        { eng: 'gold', nep: 'सुनौलो', rom: 'sunaulo', hex: '#d97706' },
        { eng: 'silver', nep: 'चाँदी जस्तो', rom: 'chaandee jasto', hex: '#94a3b8' }
    ];

    const MATERIALS_DATA = [
        { eng: 'cotton', nep: 'सुती', icon: '🧵' },
        { eng: 'wool', nep: 'ऊन', icon: '🧶' },
        { eng: 'silk', nep: 'रेशम', icon: '🧣' },
        { eng: 'leather', nep: 'छाला', icon: '👞' },
        { eng: 'wood', nep: 'काठ', icon: '🪵' },
        { eng: 'glass', nep: 'सिसा', icon: '🪟' },
        { eng: 'metal', nep: 'धातु', icon: '⚙️' },
        { eng: 'plastic', nep: 'प्लास्टिक', icon: '🥤' }
    ];

    function renderSpecializedLesson5(container, lesson) {
        let html = `
            <div class="vocab-numbers-section">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--text-main);">🎨 Color Palette Swatches (रङहरू)</h3>
                <p style="margin: 4px 0 16px; font-size: 0.85rem; color: var(--text-muted);">
                    Interactive visual color chips with spoken Nepali terms.
                </p>
                <div class="vocab-color-palette-grid">
                    ${COLORS_DATA.map(c => `
                        <div class="vocab-color-tile" data-speak="${c.nep}">
                            <div class="vocab-color-tile-preview" style="background-color: ${c.hex};"></div>
                            <div class="vocab-color-tile-info">
                                <div style="font-size: 1.1rem; font-weight: 700; color: var(--text-main);">${c.nep}</div>
                                <div style="font-size: 0.8125rem; color: var(--text-muted); text-transform: capitalize;">${c.eng} • <em>${c.rom}</em></div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- Materials & Textures Grid -->
                <div style="margin-top: 28px;">
                    <h4 style="margin: 0 0 12px; font-size: 1rem; color: var(--text-main);">Materials & Substances (सामग्री तथा वस्तुहरू)</h4>
                    <div class="vocab-flags-showcase">
                        ${MATERIALS_DATA.map(m => `
                            <div class="vocab-flag-card" data-speak="${m.nep}">
                                <div style="font-size: 1.6rem;">${m.icon}</div>
                                <div>
                                    <div class="vocab-flag-card-nepali">${m.nep}</div>
                                    <div class="vocab-flag-card-eng">${m.eng}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            ${renderStandardModulesHtml(lesson)}
        `;

        container.innerHTML = html;
        bindCardEvents(container);

        container.querySelectorAll('[data-speak]').forEach(el => {
            el.addEventListener('click', () => {
                const text = el.getAttribute('data-speak');
                VocabularyAudio.playSingle(text);
            });
        });
    }

    // ── Specialized Lesson 14: The Body ──
    const BODY_PARTS_DATA = [
        { eng: 'head', nep: 'टाउको', rom: 'taauko', icon: '🗣️' },
        { eng: 'hair', nep: 'कपाल', rom: 'kapaal', icon: '💇' },
        { eng: 'eye', nep: 'आँखा', rom: 'aankhaa', icon: '👁️' },
        { eng: 'ear', nep: 'कान', rom: 'kaan', icon: '👂' },
        { eng: 'nose', nep: 'नाक', rom: 'naak', icon: '👃' },
        { eng: 'mouth', nep: 'मुख', rom: 'mukh', icon: '👄' },
        { eng: 'neck', nep: 'घाँटी', rom: 'ghaantee', icon: '🧣' },
        { eng: 'shoulder', nep: 'काँध', rom: 'kaandh', icon: '💪' },
        { eng: 'arm', nep: 'हात / बाहु', rom: 'baahu', icon: '🦾' },
        { eng: 'hand', nep: 'हात', rom: 'haat', icon: '✋' },
        { eng: 'finger', nep: 'औंला', rom: 'aunlaa', icon: '☝️' },
        { eng: 'chest', nep: 'छाती', rom: 'chhaatee', icon: '🫁' },
        { eng: 'leg', nep: 'खुट्टा', rom: 'khuttaa', icon: '🦵' },
        { eng: 'knee', nep: 'घुँडा', rom: 'ghundaa', icon: '🦵' },
        { eng: 'foot', nep: 'पैताला / खुट्टा', rom: 'paitaalaa', icon: '🦶' },
        { eng: 'toe', nep: 'खुट्टाको औंला', rom: 'khuttaako aunlaa', icon: '👣' }
    ];

    function renderSpecializedLesson14(container, lesson) {
        let html = `
            <div class="vocab-body-diagram-wrap">
                <div class="vocab-body-silhouette-box">
                    <svg class="vocab-body-silhouette-svg" viewBox="0 0 200 400" fill="none" stroke="currentColor">
                        <!-- Head -->
                        <circle cx="100" cy="45" r="28" stroke-width="2.5" fill="var(--vocab-sage-light)"/>
                        <!-- Neck -->
                        <rect x="94" y="73" width="12" height="18" stroke-width="2" fill="var(--vocab-sage-light)"/>
                        <!-- Torso -->
                        <path d="M70,92 L130,92 L120,210 L80,210 Z" stroke-width="2.5" fill="var(--vocab-sage-light)"/>
                        <!-- Left Arm -->
                        <path d="M70,95 L40,170 L30,220" stroke-width="3" stroke-linecap="round"/>
                        <!-- Right Arm -->
                        <path d="M130,95 L160,170 L170,220" stroke-width="3" stroke-linecap="round"/>
                        <!-- Left Leg -->
                        <path d="M85,210 L80,310 L75,380" stroke-width="3.5" stroke-linecap="round"/>
                        <!-- Right Leg -->
                        <path d="M115,210 L120,310 L125,380" stroke-width="3.5" stroke-linecap="round"/>
                    </svg>
                </div>

                <div>
                    <h3 style="margin: 0; font-size: 1.25rem; color: var(--text-main);">
                        🧍 Human Anatomy & Body Parts (मानव शरीरका अङ्गहरू)
                    </h3>
                    <p style="margin: 4px 0 16px; font-size: 0.85rem; color: var(--text-muted);">
                        Tap any body part to listen and review spoken Nepali terms.
                    </p>
                    <div class="vocab-body-parts-list">
                        ${BODY_PARTS_DATA.map(b => `
                            <div class="vocab-flag-card" data-speak="${b.nep}">
                                <div style="font-size: 1.4rem;">${b.icon}</div>
                                <div>
                                    <div class="vocab-flag-card-nepali">${b.nep}</div>
                                    <div class="vocab-flag-card-eng">${b.eng} • <em>${b.rom}</em></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            ${renderStandardModulesHtml(lesson)}
        `;

        container.innerHTML = html;
        bindCardEvents(container);

        container.querySelectorAll('[data-speak]').forEach(el => {
            el.addEventListener('click', () => {
                const text = el.getAttribute('data-speak');
                VocabularyAudio.playSingle(text);
            });
        });
    }

    // ── Specialized Lesson 20: The Family ──
    const FAMILY_TREE_DATA = {
        grandparents: [
            { eng: 'grandfather', nep: 'हजुरबुबा / बाजे', icon: '👴' },
            { eng: 'grandmother', nep: 'हजुरआमा / बज्यै', icon: '👵' }
        ],
        parents: [
            { eng: 'father', nep: 'बुबा / बुवा', icon: '👨' },
            { eng: 'mother', nep: 'आमा', icon: '👩' },
            { eng: 'uncle', nep: 'काका / मामा', icon: '🧔' },
            { eng: 'aunt', nep: 'काकी / माइजु', icon: '👱‍♀️' }
        ],
        siblings: [
            { eng: 'elder brother', nep: 'दाजु', icon: '👦' },
            { eng: 'younger brother', nep: 'भाइ', icon: '🧒' },
            { eng: 'elder sister', nep: 'दिदी', icon: '👧' },
            { eng: 'younger sister', nep: 'बहिनी', icon: '👶' },
            { eng: 'cousin', nep: 'काकाको छोरा/छोरी', icon: '🧑' }
        ],
        children: [
            { eng: 'son', nep: 'छोरा', icon: '👦' },
            { eng: 'daughter', nep: 'छोरी', icon: '👧' }
        ]
    };

    function renderSpecializedLesson20(container, lesson) {
        let html = `
            <div class="vocab-family-tree-wrap">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--text-main); text-align: center;">
                    🌳 Genealogical Family Tree (पारिवारिक वंशावली)
                </h3>
                <p style="margin: 4px 0 20px; font-size: 0.85rem; color: var(--text-muted); text-align: center;">
                    Kinship terms across 4 generations in everyday spoken Nepali.
                </p>

                <!-- Generation 1: Grandparents -->
                <div style="font-size: 0.75rem; font-weight: 700; color: var(--vocab-sage-primary); text-transform: uppercase; text-align: center; margin-bottom: 8px;">
                    Generation 1 • हजुरबुबा / हजुरआमा
                </div>
                <div class="vocab-family-generation">
                    ${FAMILY_TREE_DATA.grandparents.map(m => `
                        <div class="vocab-family-card" data-speak="${m.nep}">
                            <div class="vocab-family-card-icon">${m.icon}</div>
                            <div class="vocab-family-card-nepali">${m.nep}</div>
                            <div class="vocab-family-card-eng">${m.eng}</div>
                        </div>
                    `).join('')}
                </div>

                <!-- Generation 2: Parents & Uncles/Aunts -->
                <div style="font-size: 0.75rem; font-weight: 700; color: var(--vocab-sage-primary); text-transform: uppercase; text-align: center; margin-bottom: 8px;">
                    Generation 2 • बुबा / आमा / काका / काकी
                </div>
                <div class="vocab-family-generation">
                    ${FAMILY_TREE_DATA.parents.map(m => `
                        <div class="vocab-family-card" data-speak="${m.nep}">
                            <div class="vocab-family-card-icon">${m.icon}</div>
                            <div class="vocab-family-card-nepali">${m.nep}</div>
                            <div class="vocab-family-card-eng">${m.eng}</div>
                        </div>
                    `).join('')}
                </div>

                <!-- Generation 3: Siblings & Cousins -->
                <div style="font-size: 0.75rem; font-weight: 700; color: var(--vocab-sage-primary); text-transform: uppercase; text-align: center; margin-bottom: 8px;">
                    Generation 3 • दाजु / भाइ / दिदी / बहिनी
                </div>
                <div class="vocab-family-generation">
                    ${FAMILY_TREE_DATA.siblings.map(m => `
                        <div class="vocab-family-card" data-speak="${m.nep}">
                            <div class="vocab-family-card-icon">${m.icon}</div>
                            <div class="vocab-family-card-nepali">${m.nep}</div>
                            <div class="vocab-family-card-eng">${m.eng}</div>
                        </div>
                    `).join('')}
                </div>

                <!-- Generation 4: Children -->
                <div style="font-size: 0.75rem; font-weight: 700; color: var(--vocab-sage-primary); text-transform: uppercase; text-align: center; margin-bottom: 8px;">
                    Generation 4 • छोरा / छोरी
                </div>
                <div class="vocab-family-generation" style="margin-bottom: 0;">
                    ${FAMILY_TREE_DATA.children.map(m => `
                        <div class="vocab-family-card" data-speak="${m.nep}">
                            <div class="vocab-family-card-icon">${m.icon}</div>
                            <div class="vocab-family-card-nepali">${m.nep}</div>
                            <div class="vocab-family-card-eng">${m.eng}</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            ${renderStandardModulesHtml(lesson)}
        `;

        container.innerHTML = html;
        bindCardEvents(container);

        container.querySelectorAll('[data-speak]').forEach(el => {
            el.addEventListener('click', () => {
                const text = el.getAttribute('data-speak');
                VocabularyAudio.playSingle(text);
            });
        });
    }

    function renderStandardModulesHtml(lesson) {
        return lesson.modules.map(mod => {
            const modEntries = lesson.entries.filter(e => e.moduleId === mod.id);
            if (!modEntries.length) return '';
            return `
                <section class="vocab-module-frame" id="module-${mod.id}">
                    <div class="vocab-module-header">
                        <div class="vocab-module-tag">
                            <span class="vocab-module-badge">${mod.id}</span>
                            <h3 class="vocab-module-title">${escapeHtml(mod.title)}</h3>
                        </div>
                        <div class="vocab-module-actions">
                            <button class="vocab-module-play-btn" data-play-module="${mod.id}" title="Play Module ${mod.id} Audio (${mod.count} words)">
                                ${Icons.sound}
                                <span>Play Module (${mod.count})</span>
                            </button>
                        </div>
                    </div>
                    <div class="vocab-cards-grid">
                        ${modEntries.map(e => renderCardHtml(e)).join('')}
                    </div>
                </section>
            `;
        }).join('');
    }

    function renderCardHtml(entry) {
        const status = VocabularyStorage.getStatus(entry.id);
        const statusInfo = getStatusLabel(status);
        const typeIcon = Icons[entry.illustrationType] || Icons.concrete;
        const note = VocabularyNotes.get(entry.id);

        let visualBadge = '';
        if (entry.visualMeta && entry.visualMeta.flag) {
            visualBadge = `<div class="vocab-flag-badge" title="National flag">${entry.visualMeta.flag}</div>`;
        } else if (entry.visualMeta && entry.visualMeta.colorHex) {
            visualBadge = `<div class="vocab-color-swatch-badge" style="background-color: ${entry.visualMeta.colorHex};" title="Color swatch: ${entry.englishHeadword}"></div>`;
        } else if (entry.visualMeta && entry.visualMeta.symbol) {
            visualBadge = `<div class="vocab-numeric-badge">${entry.visualMeta.symbol} • ${entry.visualMeta.nepaliSymbol || ''}</div>`;
        }

        return `
            <div class="vocab-card" data-entry-id="${entry.id}" tabindex="0" role="article" aria-label="${escapeHtml(entry.nepaliText)} - ${escapeHtml(entry.englishHeadword)}">
                <div>
                    <div class="vocab-card-header">
                        <span class="vocab-type-tag vocab-type-${entry.illustrationType}">
                            ${typeIcon}
                            <span>${entry.moduleId ? `Mod ${entry.moduleId}` : entry.illustrationType}</span>
                        </span>
                        <div class="vocab-card-actions">
                            <button class="vocab-item-audio-btn" data-audio-id="${entry.id}" title="Pronounce (नेपाली)" aria-label="Pronounce ${escapeHtml(entry.nepaliText)}">
                                ${Icons.sound}
                            </button>
                        </div>
                    </div>

                    <div class="vocab-card-body">
                        ${visualBadge}
                        <div class="vocab-nepali-anchor">${escapeHtml(entry.nepaliText)}</div>
                        ${entry.romanization ? `<div class="vocab-romanization">${escapeHtml(entry.romanization)}</div>` : ''}
                        <div class="vocab-english-meaning">${escapeHtml(entry.englishHeadword)}</div>
                        ${entry.visualMeta && entry.visualMeta.bracketedMeaning ? `<div class="vocab-idiom-bracketed">${escapeHtml(entry.visualMeta.bracketedMeaning)}</div>` : ''}
                        ${entry.contextNote && (!entry.visualMeta || !entry.visualMeta.bracketedMeaning) ? `<div class="vocab-context-chip">${escapeHtml(entry.contextNote)}</div>` : ''}
                        ${entry.recognitionVariants ? `
                            <div class="vocab-variant-note" title="Also called in British English / variant">
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                                <span>Variant: ${escapeHtml(entry.recognitionVariants[0].variant)}</span>
                            </div>
                        ` : ''}
                        
                        <!-- Write-on Line (DK Learner note) -->
                        <div class="vocab-writeon-box">
                            <div class="vocab-writeon-line">
                                <span class="vocab-writeon-pencil">✎</span>
                                <input type="text" class="vocab-writeon-input" data-writeon-id="${entry.id}" placeholder="Note / translation..." value="${escapeHtml(note)}" title="Write-on line: add personal note">
                            </div>
                        </div>
                    </div>
                </div>

                <div class="vocab-card-footer">
                    <button class="vocab-status-pill ${statusInfo.cls}" data-status-btn="${entry.id}" title="Status: ${statusInfo.text} (Click to cycle)">
                        <span class="status-dot status-dot-${statusInfo.cls}"></span>
                        <span>${statusInfo.text}</span>
                    </button>
                    <span class="vocab-card-more-link">
                        <span>Details</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                    </span>
                </div>
            </div>
        `;
    }

    function renderModuleFramesView(container) {
        const lesson = State.getLesson(State.activeLessonNum);
        let html = '';

        lesson.modules.forEach(mod => {
            const modEntries = lesson.entries.filter(e => e.moduleId === mod.id);
            if (!modEntries.length) return;

            html += `
                <section class="vocab-module-frame" id="module-${mod.id}">
                    <div class="vocab-module-header">
                        <div class="vocab-module-tag">
                            <span class="vocab-module-badge">${mod.id}</span>
                            <h3 class="vocab-module-title">${escapeHtml(mod.title)}</h3>
                        </div>
                        <div class="vocab-module-actions">
                            <button class="vocab-module-play-btn" data-play-module="${mod.id}" title="Play Module ${mod.id} Audio (${mod.count} words)">
                                ${Icons.sound}
                                <span>Play Module (${mod.count})</span>
                            </button>
                        </div>
                    </div>
                    <div class="vocab-cards-grid">
                        ${modEntries.map(e => renderCardHtml(e)).join('')}
                    </div>
                </section>
            `;
        });

        container.innerHTML = html;
        bindCardEvents(container);

        container.querySelectorAll('[data-play-module]').forEach(btn => {
            btn.addEventListener('click', () => {
                const modId = btn.getAttribute('data-play-module');
                VocabularyAudio.playModule(modId);
            });
        });
    }

    function renderGridView(container, entries) {
        let html = `<div class="vocab-cards-grid">`;
        entries.forEach(entry => {
            html += renderCardHtml(entry);
        });
        html += `</div>`;
        container.innerHTML = html;
        bindCardEvents(container);
    }

    function renderRowsView(container, entries) {
        let html = `
            <div class="vocab-rows-list">
                <div class="vocab-row-header">
                    <span>#</span>
                    <span>नेपाली (Devanagari)</span>
                    <span>English Equivalent</span>
                    <span class="vocab-row-type">Category</span>
                    <span>Status</span>
                </div>
        `;

        entries.forEach((entry, idx) => {
            const status = VocabularyStorage.getStatus(entry.id);
            const statusInfo = getStatusLabel(status);

            html += `
                <div class="vocab-row-item" data-entry-id="${entry.id}" tabindex="0">
                    <span style="font-size: 0.75rem; color: var(--text-muted);">${idx + 1}</span>
                    <div>
                        <div class="vocab-row-nepali">${escapeHtml(entry.nepaliText)}</div>
                        ${entry.romanization ? `<div style="font-size: 0.72rem; color: var(--text-muted); font-style: italic;">${escapeHtml(entry.romanization)}</div>` : ''}
                    </div>
                    <div>
                        <div class="vocab-row-english">${escapeHtml(entry.englishHeadword)}</div>
                        ${entry.contextNote ? `<span class="vocab-context-chip" style="margin-top: 2px;">${escapeHtml(entry.contextNote)}</span>` : ''}
                    </div>
                    <span class="vocab-row-type">
                        <span class="vocab-type-tag vocab-type-${entry.illustrationType}">
                            ${entry.moduleId ? `Mod ${entry.moduleId}` : entry.illustrationType}
                        </span>
                    </span>
                    <div>
                        <button class="vocab-status-pill ${statusInfo.cls}" data-status-btn="${entry.id}">
                            <span class="status-dot status-dot-${statusInfo.cls}"></span>
                            <span>${statusInfo.text}</span>
                        </button>
                    </div>
                </div>
            `;
        });

        html += `</div>`;
        container.innerHTML = html;
        bindCardEvents(container);
    }

    function renderVariantsTab(container) {
        const lesson = State.getLesson(State.activeLessonNum);
        if (!lesson.recognitionVariants || lesson.recognitionVariants.length === 0) {
            container.innerHTML = `
                <div class="vocab-empty-state">
                    <div class="vocab-empty-title">No recognition variants for this lesson</div>
                    <p>This lesson uses standard vocabulary across English varieties without separate spelling or dialect notes.</p>
                </div>
            `;
            return;
        }

        let html = `
            <div style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 10px; padding: 20px 24px; box-shadow: var(--card-shadow);">
                <h3 style="margin-top: 0; font-size: 1.15rem; color: var(--text-main);">Recognition Variants in Lesson ${lesson.number}</h3>
                <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 20px;">
                    British English, alternative spellings, or regional terms recognized in the General American companion text.
                </p>
                <div style="display: flex; flex-direction: column; gap: 12px;">
        `;

        lesson.recognitionVariants.forEach(v => {
            html += `
                <div style="padding: 12px 16px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-surface); display: flex; align-items: baseline; justify-content: space-between; gap: 12px;">
                    <div>
                        <strong style="font-size: 0.95rem; color: var(--text-main);">${escapeHtml(v.variant)}</strong>
                        ${v.standard ? `<span style="color: var(--text-muted); font-size: 0.85rem;"> → standard: <em>${escapeHtml(v.standard)}</em></span>` : ''}
                    </div>
                    ${v.note ? `<div style="font-size: 0.875rem; color: var(--vocab-sage-primary); font-weight: 500;">${escapeHtml(v.note)}</div>` : ''}
                </div>
            `;
        });

        html += `</div></div>`;
        container.innerHTML = html;
    }

    // ── 5.2 Interactive Practice Spread Implementation ──

    function initPracticeMode() {
        const lesson = State.getLesson(State.activeLessonNum);
        const entries = [...lesson.entries];

        // Shuffle entries
        for (let i = entries.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [entries[i], entries[j]] = [entries[j], entries[i]];
        }

        // Init Match-Up
        State.matchState.items = entries.slice(0, 5);
        State.matchState.selectedNepali = null;
        State.matchState.selectedEnglish = null;
        State.matchState.matchedIds = new Set();
        State.matchState.score = 0;
        State.matchState.shuffledEng = null;

        // Init Listening
        initListeningQuestion();

        // Init Flashcard
        State.flashcardState.index = 0;
        State.flashcardState.isFlipped = false;
    }

    function initListeningQuestion() {
        const lesson = State.getLesson(State.activeLessonNum);
        const entries = lesson.entries;
        if (!entries.length) return;

        const correct = entries[Math.floor(Math.random() * entries.length)];
        const distractors = entries.filter(e => e.id !== correct.id);
        distractors.sort(() => 0.5 - Math.random());
        const options = [correct, ...distractors.slice(0, 3)];
        options.sort(() => 0.5 - Math.random());

        State.listeningState.currentEntry = correct;
        State.listeningState.options = options;
        State.listeningState.hasAnswered = false;
    }

    function renderPracticeSpread(container) {
        let html = `
            <div class="vocab-practice-container">
                <div class="vocab-practice-tabs" role="tablist">
                    <button class="vocab-practice-tab-btn ${State.practiceSubmode === 'match' ? 'active' : ''}" data-practice-tab="match">
                        🧩 Match-Up Challenge
                    </button>
                    <button class="vocab-practice-tab-btn ${State.practiceSubmode === 'listening' ? 'active' : ''}" data-practice-tab="listening">
                        🎧 Listening Selection
                    </button>
                    <button class="vocab-practice-tab-btn ${State.practiceSubmode === 'flashcard' ? 'active' : ''}" data-practice-tab="flashcard">
                        🎴 Flashcard Recall
                    </button>
                </div>
                <div id="vocab-practice-arena"></div>
            </div>
        `;

        container.innerHTML = html;

        container.querySelectorAll('[data-practice-tab]').forEach(btn => {
            btn.addEventListener('click', () => {
                State.practiceSubmode = btn.getAttribute('data-practice-tab');
                renderPracticeSpread(container);
            });
        });

        const arena = container.querySelector('#vocab-practice-arena');
        if (State.practiceSubmode === 'match') {
            renderMatchUpArena(arena);
        } else if (State.practiceSubmode === 'listening') {
            renderListeningArena(arena);
        } else {
            renderFlashcardArena(arena);
        }
    }

    function renderMatchUpArena(arena) {
        const items = State.matchState.items;
        if (!items || items.length === 0) {
            arena.innerHTML = `<p>No items to practice in this lesson.</p>`;
            return;
        }

        const isComplete = State.matchState.matchedIds.size === items.length;

        // Shuffle English side
        if (!State.matchState.shuffledEng) {
            State.matchState.shuffledEng = [...items].sort(() => 0.5 - Math.random());
        }

        let html = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h3 style="margin: 0; font-size: 1.25rem;">Picture & Word Match-Up</h3>
                <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 4px;">
                    Tap a Nepali word in Column A, then tap its English equivalent in Column B to match them.
                </p>
                <div style="font-weight: 700; color: var(--vocab-sage-primary); font-size: 0.9rem; margin-top: 8px;">
                    Matched: ${State.matchState.matchedIds.size} / ${items.length}
                </div>
            </div>

            <div class="vocab-match-grid">
                <!-- Column A: Nepali -->
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); text-align: center;">Column A (नेपाली)</div>
                    ${items.map(item => {
                        const isMatched = State.matchState.matchedIds.has(item.id);
                        const isSelected = State.matchState.selectedNepali === item.id;
                        return `
                            <button class="vocab-match-item-btn ${isMatched ? 'matched' : ''} ${isSelected ? 'selected' : ''}" data-match-nepali="${item.id}" ${isMatched ? 'disabled' : ''}>
                                ${escapeHtml(item.nepaliText)}
                            </button>
                        `;
                    }).join('')}
                </div>

                <!-- Column B: English -->
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); text-align: center;">Column B (English)</div>
                    ${State.matchState.shuffledEng.map(item => {
                        const isMatched = State.matchState.matchedIds.has(item.id);
                        const isSelected = State.matchState.selectedEnglish === item.id;
                        return `
                            <button class="vocab-match-item-btn ${isMatched ? 'matched' : ''} ${isSelected ? 'selected' : ''}" data-match-english="${item.id}" ${isMatched ? 'disabled' : ''}>
                                ${escapeHtml(item.englishHeadword)}
                            </button>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        if (isComplete) {
            html += `
                <div style="text-align: center; margin-top: 24px; padding: 20px; background: var(--status-known-bg); border: 2px solid var(--status-known); border-radius: 12px;">
                    <h4 style="margin: 0; color: var(--status-known); font-size: 1.2rem;">🎉 Excellent! All 5 Pairs Matched</h4>
                    <p style="margin: 6px 0 16px; font-size: 0.85rem; color: var(--text-main);">Great job practicing the vocabulary of this lesson.</p>
                    <button class="vocab-btn vocab-btn-sage" id="match-next-round-btn">Practice Next 5 Words</button>
                </div>
            `;
        }

        arena.innerHTML = html;

        // Bind match-up clicks
        arena.querySelectorAll('[data-match-nepali]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-match-nepali');
                State.matchState.selectedNepali = id;
                checkMatchSelection(arena);
            });
        });

        arena.querySelectorAll('[data-match-english]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-match-english');
                State.matchState.selectedEnglish = id;
                checkMatchSelection(arena);
            });
        });

        arena.querySelector('#match-next-round-btn')?.addEventListener('click', () => {
            initPracticeMode();
            renderMatchUpArena(arena);
        });
    }

    function checkMatchSelection(arena) {
        const { selectedNepali, selectedEnglish } = State.matchState;
        if (!selectedNepali || !selectedEnglish) {
            renderMatchUpArena(arena);
            return;
        }

        if (selectedNepali === selectedEnglish) {
            // Correct Match!
            State.matchState.matchedIds.add(selectedNepali);
            State.matchState.selectedNepali = null;
            State.matchState.selectedEnglish = null;

            const item = findEntryById(selectedNepali);
            if (item) VocabularyAudio.playSingle(item);

            renderMatchUpArena(arena);
        } else {
            // Mismatch
            const btnNep = arena.querySelector(`[data-match-nepali="${selectedNepali}"]`);
            const btnEng = arena.querySelector(`[data-match-english="${selectedEnglish}"]`);
            if (btnNep) btnNep.classList.add('error');
            if (btnEng) btnEng.classList.add('error');

            setTimeout(() => {
                State.matchState.selectedNepali = null;
                State.matchState.selectedEnglish = null;
                renderMatchUpArena(arena);
            }, 500);
        }
    }

    function renderListeningArena(arena) {
        const cur = State.listeningState.currentEntry;
        if (!cur) {
            arena.innerHTML = `<p>No entries available for listening practice.</p>`;
            return;
        }

        let html = `
            <div class="vocab-listening-challenge">
                <h3 style="margin: 0; font-size: 1.25rem;">Listening Selection</h3>
                <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 4px;">
                    Listen to the Nepali audio track and select the correct English meaning below:
                </p>

                <button class="vocab-listening-big-audio-btn" id="listen-play-trigger" title="Listen to word">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                    </svg>
                </button>

                <div class="vocab-listening-options">
                    ${State.listeningState.options.map(opt => `
                        <button class="vocab-listening-option-btn" data-listening-opt-id="${opt.id}">
                            ${escapeHtml(opt.englishHeadword)}
                        </button>
                    `).join('')}
                </div>

                <div id="listening-feedback" style="margin-top: 20px; font-weight: 600; min-height: 24px;"></div>
                
                <div style="margin-top: 20px;">
                    <button class="vocab-btn vocab-btn-sage" id="listening-next-btn" style="display: none;">Next Word ➔</button>
                </div>
            </div>
        `;

        arena.innerHTML = html;

        setTimeout(() => {
            VocabularyAudio.playSingle(cur);
        }, 200);

        arena.querySelector('#listen-play-trigger')?.addEventListener('click', () => {
            VocabularyAudio.playSingle(cur);
        });

        arena.querySelectorAll('[data-listening-opt-id]').forEach(btn => {
            btn.addEventListener('click', () => {
                if (State.listeningState.hasAnswered) return;
                State.listeningState.hasAnswered = true;

                const selectedId = btn.getAttribute('data-listening-opt-id');
                const feedbackEl = arena.querySelector('#listening-feedback');
                const nextBtn = arena.querySelector('#listening-next-btn');

                if (selectedId === cur.id) {
                    btn.style.borderColor = 'var(--status-known)';
                    btn.style.background = 'var(--status-known-bg)';
                    btn.style.color = 'var(--status-known)';
                    feedbackEl.innerHTML = `<span style="color: var(--status-known);">✓ Correct! ${escapeHtml(cur.nepaliText)} = ${escapeHtml(cur.englishHeadword)}</span>`;
                } else {
                    btn.style.borderColor = 'var(--status-difficult)';
                    btn.style.background = 'var(--status-difficult-bg)';
                    btn.style.color = 'var(--status-difficult)';
                    feedbackEl.innerHTML = `<span style="color: var(--status-difficult);">✗ Incorrect. The correct answer was "${escapeHtml(cur.englishHeadword)}" (${escapeHtml(cur.nepaliText)})</span>`;
                }

                if (nextBtn) nextBtn.style.display = 'inline-flex';
            });
        });

        arena.querySelector('#listening-next-btn')?.addEventListener('click', () => {
            initListeningQuestion();
            renderListeningArena(arena);
        });
    }

    function renderFlashcardArena(arena) {
        const lesson = State.getLesson(State.activeLessonNum);
        const entries = lesson.entries;
        if (!entries.length) return;

        const idx = State.flashcardState.index % entries.length;
        const cur = entries[idx];
        const isFlipped = State.flashcardState.isFlipped;

        let html = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h3 style="margin: 0; font-size: 1.25rem;">Flashcard Recall Practice</h3>
                <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 4px;">
                    Card ${idx + 1} of ${entries.length} • Tap the card to flip and verify your recall.
                </p>
            </div>

            <div class="vocab-flashcard-box">
                <div class="vocab-flashcard-card" id="flashcard-surface">
                    ${!isFlipped ? `
                        <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin-bottom: 12px;">English Meaning</div>
                        <div style="font-size: 1.6rem; font-weight: 700; color: var(--text-main); margin-bottom: 8px;">${escapeHtml(cur.englishHeadword)}</div>
                        ${cur.contextNote ? `<div style="font-size: 0.85rem; color: var(--text-muted); font-style: italic;">${escapeHtml(cur.contextNote)}</div>` : ''}
                        <div style="margin-top: 24px; font-size: 0.8125rem; color: var(--vocab-sage-primary); font-weight: 600;">(Tap to reveal Devanagari)</div>
                    ` : `
                        <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--vocab-sage-primary); font-weight: 700; margin-bottom: 12px;">नेपाली (Devanagari)</div>
                        <div style="font-size: 2.2rem; font-weight: 700; color: var(--text-main); margin-bottom: 4px;">${escapeHtml(cur.nepaliText)}</div>
                        ${cur.romanization ? `<div style="font-size: 1.1rem; color: var(--text-muted); font-style: italic; margin-bottom: 12px;">${escapeHtml(cur.romanization)}</div>` : ''}
                        <div style="font-size: 0.95rem; color: var(--text-main); font-weight: 500;">${escapeHtml(cur.englishHeadword)}</div>
                        <button class="vocab-btn vocab-btn-sage" id="flashcard-audio-btn" style="margin-top: 16px;">
                            ${Icons.sound} <span>Listen</span>
                        </button>
                    `}
                </div>

                ${isFlipped ? `
                    <div style="display: flex; gap: 10px; margin-top: 20px; justify-content: center;">
                        <button class="vocab-btn" style="border-color: var(--status-difficult); color: var(--status-difficult);" id="fc-again-btn">
                            🔴 Again (Difficult)
                        </button>
                        <button class="vocab-btn" style="border-color: var(--status-learning); color: var(--status-learning);" id="fc-good-btn">
                            🟡 Learning
                        </button>
                        <button class="vocab-btn" style="border-color: var(--status-known); color: var(--status-known);" id="fc-easy-btn">
                            🟢 Already Know
                        </button>
                    </div>
                ` : `
                    <div style="display: flex; justify-content: center; margin-top: 20px;">
                        <button class="vocab-btn vocab-btn-sage" id="fc-flip-btn">Flip Card ↻</button>
                    </div>
                `}
            </div>
        `;

        arena.innerHTML = html;

        const flipAction = () => {
            State.flashcardState.isFlipped = !State.flashcardState.isFlipped;
            renderFlashcardArena(arena);
            if (State.flashcardState.isFlipped) {
                VocabularyAudio.playSingle(cur);
            }
        };

        arena.querySelector('#flashcard-surface')?.addEventListener('click', flipAction);
        arena.querySelector('#fc-flip-btn')?.addEventListener('click', flipAction);

        arena.querySelector('#flashcard-audio-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            VocabularyAudio.playSingle(cur);
        });

        const nextCard = (status) => {
            VocabularyStorage.setStatus(cur.id, status);
            renderSidebarLessonList();
            State.flashcardState.index++;
            State.flashcardState.isFlipped = false;
            renderFlashcardArena(arena);
        };

        arena.querySelector('#fc-again-btn')?.addEventListener('click', () => nextCard('difficult'));
        arena.querySelector('#fc-good-btn')?.addEventListener('click', () => nextCard('learning'));
        arena.querySelector('#fc-easy-btn')?.addEventListener('click', () => nextCard('known'));
    }

    function bindCardEvents(container) {
        // Individual Audio Click
        container.querySelectorAll('[data-audio-id]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-audio-id');
                const entry = findEntryById(id);
                if (entry) VocabularyAudio.playSingle(entry);
            });
        });

        // Status pill cycle button
        container.querySelectorAll('[data-status-btn]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-status-btn');
                const cur = VocabularyStorage.getStatus(id);
                const nxt = cycleStatus(cur);
                VocabularyStorage.setStatus(id, nxt);
                
                const info = getStatusLabel(nxt);
                btn.className = `vocab-status-pill ${info.cls}`;
                btn.innerHTML = `<span class="status-dot status-dot-${info.cls}"></span><span>${info.text}</span>`;
                
                renderSidebarLessonList();
            });
        });

        // Write-on line input handlers
        container.querySelectorAll('[data-writeon-id]').forEach(input => {
            input.addEventListener('click', (e) => {
                e.stopPropagation();
            });
            input.addEventListener('input', (e) => {
                const id = input.getAttribute('data-writeon-id');
                VocabularyNotes.set(id, e.target.value);
            });
        });

        // Card / Row click opens Detail Drawer
        container.querySelectorAll('[data-entry-id]').forEach(el => {
            el.addEventListener('click', (e) => {
                if (e.target.closest('[data-writeon-id]') || e.target.closest('[data-audio-id]') || e.target.closest('[data-status-btn]')) {
                    return;
                }
                const id = el.getAttribute('data-entry-id');
                openDetailDrawer(id);
            });
            el.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const id = el.getAttribute('data-entry-id');
                    openDetailDrawer(id);
                }
            });
        });
    }

    function findEntryById(id) {
        for (const lesson of VOCABULARY_DATA.lessons) {
            const found = lesson.entries.find(e => e.id === id);
            if (found) return found;
        }
        return null;
    }

    // ── 6. Detail View Slide-over Drawer / Modal ──

    function openDetailDrawer(entryId) {
        const entry = findEntryById(entryId);
        if (!entry) return;

        State.activeDetailId = entryId;
        const modal = document.getElementById('vocab-detail-modal');
        if (!modal) return;

        const status = VocabularyStorage.getStatus(entry.id);
        const currentList = State.getFilteredEntries();
        const curIdx = currentList.findIndex(e => e.id === entry.id);
        const prevEntry = curIdx > 0 ? currentList[curIdx - 1] : null;
        const nextEntry = curIdx >= 0 && curIdx < currentList.length - 1 ? currentList[curIdx + 1] : null;
        const userNote = VocabularyNotes.get(entry.id);

        modal.innerHTML = `
            <div class="vocab-drawer" role="dialog" aria-modal="true" aria-label="${escapeHtml(entry.nepaliText)} Details">
                <div class="vocab-drawer-header">
                    <div class="vocab-drawer-nav">
                        <button class="vocab-btn" id="drawer-prev-btn" ${!prevEntry ? 'disabled' : ''} title="Previous word (Left Arrow)">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
                        </button>
                        <button class="vocab-btn" id="drawer-next-btn" ${!nextEntry ? 'disabled' : ''} title="Next word (Right Arrow)">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                        </button>
                    </div>
                    <button class="vocab-drawer-close-btn" id="drawer-close-btn" aria-label="Close details (Escape)">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>

                <div class="vocab-drawer-body">
                    <div class="vocab-detail-source-tag">
                        Lesson ${entry.lessonNumber}: ${escapeHtml(entry.lessonTitle)} • Module ${entry.moduleId} (${escapeHtml(entry.moduleTitle)}) • Row #${entry.sourceRow}
                    </div>

                    <div class="vocab-detail-nepali-hero">
                        <span>${escapeHtml(entry.nepaliText)}</span>
                        <button class="vocab-copy-btn" id="drawer-copy-btn" title="Copy Devanagari text">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                            <span id="copy-text-label">Copy</span>
                        </button>
                    </div>

                    ${entry.romanization ? `<div class="vocab-detail-romanization">${escapeHtml(entry.romanization)}</div>` : ''}

                    <div style="display: flex; gap: 8px; margin-bottom: 24px;">
                        <button class="vocab-btn vocab-btn-sage" id="drawer-audio-play-btn" style="flex-grow: 1;">
                            ${Icons.sound}
                            <span>Listen to Pronunciation</span>
                        </button>
                    </div>

                    <!-- Meaning & Context Section -->
                    <div class="vocab-detail-section">
                        <div class="vocab-detail-label">English Meaning / Equivalent</div>
                        <div class="vocab-detail-value">${escapeHtml(entry.englishHeadword)}</div>
                        ${entry.visualMeta && entry.visualMeta.bracketedMeaning ? `
                            <div class="vocab-idiom-bracketed" style="margin-top: 8px;">
                                ${escapeHtml(entry.visualMeta.bracketedMeaning)}
                            </div>
                        ` : ''}
                        ${entry.contextNote && (!entry.visualMeta || !entry.visualMeta.bracketedMeaning) ? `
                            <div style="margin-top: 8px; font-size: 0.85rem; color: var(--text-muted);">
                                <strong>Context / Sense:</strong> ${escapeHtml(entry.contextNote)}
                            </div>
                        ` : ''}
                    </div>

                    <!-- Learner Write-on Line -->
                    <div class="vocab-detail-section">
                        <div class="vocab-detail-label">Learner's Write-on Line (Personal Note / Translation)</div>
                        <div class="vocab-writeon-line" style="margin-top: 6px;">
                            <span class="vocab-writeon-pencil">✎</span>
                            <input type="text" class="vocab-writeon-input" id="drawer-writeon-input" placeholder="Type personal notes, memory hooks, or translation..." value="${escapeHtml(userNote)}" style="font-size: 0.9rem;">
                        </div>
                    </div>

                    <!-- Presentation Classification -->
                    <div class="vocab-detail-section">
                        <div class="vocab-detail-label">Presentation Classification</div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span class="vocab-type-tag vocab-type-${entry.illustrationType}">
                                ${Icons[entry.illustrationType] || Icons.concrete}
                                <span>${entry.illustrationType}</span>
                            </span>
                            <span style="font-size: 0.8125rem; color: var(--text-muted);">
                                Module ${entry.moduleId}: ${escapeHtml(entry.moduleTitle)}
                            </span>
                        </div>
                    </div>

                    <!-- Recognition Variants -->
                    ${entry.recognitionVariants && entry.recognitionVariants.length > 0 ? `
                        <div class="vocab-detail-section">
                            <div class="vocab-detail-label">British / Regional Variant</div>
                            <div style="background: var(--bg-surface); padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border-color); font-size: 0.85rem;">
                                <strong>${escapeHtml(entry.recognitionVariants[0].variant)}</strong>
                                ${entry.recognitionVariants[0].note ? `<span style="color: var(--text-muted);"> — ${escapeHtml(entry.recognitionVariants[0].note)}</span>` : ''}
                            </div>
                        </div>
                    ` : ''}

                    <!-- Learning Status Switcher -->
                    <div class="vocab-detail-section">
                        <div class="vocab-detail-label">Your Learning Status (Press 1–4)</div>
                        <div class="vocab-detail-status-grid">
                            <button class="vocab-detail-status-option ${status === 'unsorted' ? 'selected' : ''}" data-set-status="unsorted">
                                <span class="status-dot status-dot-unsorted"></span>
                                <span>1. Unsorted</span>
                            </button>
                            <button class="vocab-detail-status-option ${status === 'difficult' ? 'selected' : ''}" data-set-status="difficult">
                                <span class="status-dot status-dot-difficult"></span>
                                <span>2. Difficult</span>
                            </button>
                            <button class="vocab-detail-status-option ${status === 'learning' ? 'selected' : ''}" data-set-status="learning">
                                <span class="status-dot status-dot-learning"></span>
                                <span>3. Learning</span>
                            </button>
                            <button class="vocab-detail-status-option ${status === 'known' ? 'selected' : ''}" data-set-status="known">
                                <span class="status-dot status-dot-known"></span>
                                <span>4. Already Know</span>
                            </button>
                        </div>
                    </div>

                    <div style="font-size: 0.72rem; color: var(--text-muted); line-height: 1.5; margin-top: 20px;">
                        Status and write-on notes are saved automatically to your device's browser local storage.
                    </div>
                </div>
            </div>
        `;

        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        // Bind Drawer Events
        modal.querySelector('#drawer-close-btn')?.addEventListener('click', closeDetailDrawer);
        modal.querySelector('#drawer-prev-btn')?.addEventListener('click', () => {
            if (prevEntry) openDetailDrawer(prevEntry.id);
        });
        modal.querySelector('#drawer-next-btn')?.addEventListener('click', () => {
            if (nextEntry) openDetailDrawer(nextEntry.id);
        });

        modal.querySelector('#drawer-audio-play-btn')?.addEventListener('click', () => {
            VocabularyAudio.playSingle(entry);
        });

        // Copy Devanagari text
        modal.querySelector('#drawer-copy-btn')?.addEventListener('click', () => {
            navigator.clipboard.writeText(entry.nepaliText).then(() => {
                const label = modal.querySelector('#copy-text-label');
                if (label) {
                    label.textContent = 'Copied!';
                    setTimeout(() => { label.textContent = 'Copy'; }, 1500);
                }
            });
        });

        // Write-on line in drawer
        modal.querySelector('#drawer-writeon-input')?.addEventListener('input', (e) => {
            VocabularyNotes.set(entry.id, e.target.value);
            const cardInput = document.querySelector(`.vocab-writeon-input[data-writeon-id="${entry.id}"]`);
            if (cardInput) cardInput.value = e.target.value;
        });

        // Status switch buttons
        modal.querySelectorAll('[data-set-status]').forEach(btn => {
            btn.addEventListener('click', () => {
                const newStatus = btn.getAttribute('data-set-status');
                VocabularyStorage.setStatus(entry.id, newStatus);
                
                modal.querySelectorAll('[data-set-status]').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');

                const cardPill = document.querySelector(`[data-status-btn="${entry.id}"]`);
                if (cardPill) {
                    const info = getStatusLabel(newStatus);
                    cardPill.className = `vocab-status-pill ${info.cls}`;
                    cardPill.innerHTML = `<span class="status-dot status-dot-${info.cls}"></span><span>${info.text}</span>`;
                }

                renderSidebarLessonList();
            });
        });
    }

    function closeDetailDrawer() {
        const modal = document.getElementById('vocab-detail-modal');
        if (!modal) return;
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        State.activeDetailId = null;
    }

    // ── 7. Global Keyboard Handlers ──
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            // Space toggles audio player
            if (e.code === 'Space') {
                e.preventDefault();
                VocabularyAudio.togglePlayPause();
                return;
            }

            // Escape closes detail drawer, fullscreen spread, or modal
            if (e.key === 'Escape') {
                closeDetailDrawer();
                closeDataManagementModal();
                const viewport = document.getElementById('vocab-spread-viewport');
                if (viewport && viewport.classList.contains('fullscreen')) {
                    viewport.classList.remove('fullscreen');
                    document.body.style.overflow = '';
                }
                return;
            }

            // Detail view hotkeys
            if (State.activeDetailId) {
                if (e.key === '1') setDrawerStatus('unsorted');
                else if (e.key === '2') setDrawerStatus('difficult');
                else if (e.key === '3') setDrawerStatus('learning');
                else if (e.key === '4') setDrawerStatus('known');
                else if (e.key === 'ArrowLeft') document.getElementById('drawer-prev-btn')?.click();
                else if (e.key === 'ArrowRight') document.getElementById('drawer-next-btn')?.click();
                return;
            }

            // Zoom hotkeys in spread view
            if (State.viewMode === 'spread') {
                if (e.key === '+' || e.key === '=') {
                    e.preventDefault();
                    document.getElementById('spread-zoom-in-btn')?.click();
                    return;
                } else if (e.key === '-' || e.key === '_') {
                    e.preventDefault();
                    document.getElementById('spread-zoom-out-btn')?.click();
                    return;
                } else if (e.key === '0') {
                    e.preventDefault();
                    document.getElementById('spread-zoom-reset-btn')?.click();
                    return;
                }
            }

            // Left / Right navigates lessons
            if (e.key === 'ArrowLeft') {
                if (State.activeLessonNum > 1) selectActiveLesson(State.activeLessonNum - 1);
            } else if (e.key === 'ArrowRight') {
                if (State.activeLessonNum < VOCABULARY_DATA.lessons.length) selectActiveLesson(State.activeLessonNum + 1);
            }
        });
    }

    function setDrawerStatus(st) {
        const modal = document.getElementById('vocab-detail-modal');
        if (!modal) return;
        const btn = modal.querySelector(`[data-set-status="${st}"]`);
        if (btn) btn.click();
    }

    // ── 8. Navigation & Routing ──
    function selectActiveLesson(num) {
        if (num < 1 || num > VOCABULARY_DATA.lessons.length) return;
        State.activeLessonNum = num;
        State.activeTab = 'all';
        State.activeStatusFilter = 'all';
        State.spreadModuleFilter = 'all';
        State.showPairingView = false;
        
        window.location.hash = `lesson-${num}`;

        renderSidebarLessonList();
        renderWorkspaceHeader();
        renderVocabularyContent();
    }

    function parseHashRoute() {
        const hash = window.location.hash;
        if (!hash) return;
        const match = hash.match(/^#lesson-(\d+)$/);
        if (match) {
            const num = parseInt(match[1], 10);
            if (num >= 1 && num <= VOCABULARY_DATA.lessons.length) {
                State.activeLessonNum = num;
            }
        }
    }

    // ── 9. Setup Search & Toolbar ──
    function setupThemeToggle() {
        const savedTheme = localStorage.getItem('nepali-theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        }
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const current = document.documentElement.getAttribute('data-theme');
                const next = current === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', next);
                localStorage.setItem('nepali-theme', next);
            });
        }
    }

    function setupSearch() {
        const searchInput = document.getElementById('vocab-search-input');
        const clearBtn = document.getElementById('vocab-search-clear');
        if (!searchInput) return;

        searchInput.addEventListener('input', () => {
            State.searchQuery = searchInput.value;
            if (clearBtn) {
                clearBtn.style.display = searchInput.value.length > 0 ? 'inline-flex' : 'none';
            }
            renderVocabularyContent();
        });

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                searchInput.value = '';
                State.searchQuery = '';
                clearBtn.style.display = 'none';
                renderVocabularyContent();
                searchInput.focus();
            });
        }
    }

    function setupAudioPlayerBar() {
        document.getElementById('player-play-btn')?.addEventListener('click', () => {
            VocabularyAudio.togglePlayPause();
        });

        document.getElementById('player-repeat-btn')?.addEventListener('click', () => {
            VocabularyAudio.repeatItem = !VocabularyAudio.repeatItem;
            VocabularyAudio.updatePlayerUI();
        });

        document.getElementById('player-speed-btn')?.addEventListener('click', () => {
            if (VocabularyAudio.playbackSpeed === 1.0) {
                VocabularyAudio.playbackSpeed = 0.8;
            } else if (VocabularyAudio.playbackSpeed === 0.8) {
                VocabularyAudio.playbackSpeed = 1.2;
            } else {
                VocabularyAudio.playbackSpeed = 1.0;
            }
            VocabularyStorage.savePrefs({ speed: VocabularyAudio.playbackSpeed });
            VocabularyAudio.updatePlayerUI();
        });

        document.getElementById('player-prev-btn')?.addEventListener('click', () => {
            if (VocabularyAudio.sequenceQueue.length === 0) return;
            VocabularyAudio.currentIndex = Math.max(0, VocabularyAudio.currentIndex - 2);
            VocabularyAudio.playNextInSequence();
        });

        document.getElementById('player-next-btn')?.addEventListener('click', () => {
            if (VocabularyAudio.sequenceQueue.length === 0) return;
            VocabularyAudio.playNextInSequence();
        });
    }

    function setupDataManagementModal() {
        const btn = document.getElementById('vocab-data-mgmt-btn');
        if (!btn) return;

        btn.addEventListener('click', () => {
            const jsonStr = VocabularyStorage.exportProgressJSON();
            const all = VocabularyStorage.getAll();
            const totalMarked = Object.keys(all).length;

            const modalHtml = `
                <div class="vocab-data-modal" style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 300; display: flex; align-items: center; justify-content: center; padding: 20px;" id="data-backup-modal">
                    <div style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; width: 100%; max-width: 520px; padding: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                            <h3 style="margin: 0; font-size: 1.15rem; color: var(--text-main);">Study Progress & Write-on Notes</h3>
                            <button id="close-data-modal-btn" style="background: none; border: none; font-size: 1.25rem; color: var(--text-muted); cursor: pointer;">&times;</button>
                        </div>
                        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 16px;">
                            You have marked <strong>${totalMarked}</strong> of ${VOCABULARY_DATA.meta.totalEntries} entries across ${VOCABULARY_DATA.meta.totalLessons} lessons.
                        </p>
                        
                        <div style="margin-bottom: 16px;">
                            <label style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); display: block; margin-bottom: 6px;">JSON Backup Payload</label>
                            <textarea id="data-export-area" readonly style="width: 100%; height: 120px; font-family: monospace; font-size: 0.75rem; border: 1px solid var(--border-color); border-radius: 6px; padding: 8px; background: var(--bg-surface); color: var(--text-main);">${escapeHtml(jsonStr)}</textarea>
                        </div>

                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                            <button class="vocab-btn vocab-btn-sage" id="btn-copy-backup">Copy JSON</button>
                            <button class="vocab-btn" id="btn-import-backup">Import JSON</button>
                            <button class="vocab-btn" style="color: var(--status-difficult); border-color: var(--status-difficult);" id="btn-reset-lesson">Reset This Lesson</button>
                        </div>
                    </div>
                </div>
            `;

            const existing = document.getElementById('data-backup-modal');
            if (existing) existing.remove();

            document.body.insertAdjacentHTML('beforeend', modalHtml);

            document.getElementById('close-data-modal-btn')?.addEventListener('click', closeDataManagementModal);
            document.getElementById('data-backup-modal')?.addEventListener('click', (e) => {
                if (e.target.id === 'data-backup-modal') closeDataManagementModal();
            });

            document.getElementById('btn-copy-backup')?.addEventListener('click', () => {
                navigator.clipboard.writeText(jsonStr).then(() => {
                    const btn = document.getElementById('btn-copy-backup');
                    if (btn) {
                        btn.textContent = 'Copied to Clipboard!';
                        setTimeout(() => { btn.textContent = 'Copy JSON'; }, 1500);
                    }
                });
            });

            document.getElementById('btn-import-backup')?.addEventListener('click', () => {
                const pasted = prompt('Paste your previously exported JSON backup here:');
                if (pasted && VocabularyStorage.importProgressJSON(pasted)) {
                    alert('Progress and write-on notes imported successfully!');
                    closeDataManagementModal();
                    renderSidebarLessonList();
                    renderWorkspaceHeader();
                    renderVocabularyContent();
                } else if (pasted) {
                    alert('Invalid JSON backup string.');
                }
            });

            document.getElementById('btn-reset-lesson')?.addEventListener('click', () => {
                const lesson = State.getLesson(State.activeLessonNum);
                if (confirm(`Reset all statuses for Lesson ${lesson.number}: ${lesson.title}?`)) {
                    VocabularyStorage.resetLesson(lesson.entries);
                    closeDataManagementModal();
                    renderSidebarLessonList();
                    renderWorkspaceHeader();
                    renderVocabularyContent();
                }
            });
        });
    }

    function closeDataManagementModal() {
        document.getElementById('data-backup-modal')?.remove();
    }

    function setupMobileNavigation() {
        const toggleBtn = document.getElementById('vocab-mobile-menu-btn');
        const sidebar = document.getElementById('vocab-sidebar');
        const backdrop = document.getElementById('vocab-sidebar-backdrop');

        if (toggleBtn && sidebar) {
            toggleBtn.addEventListener('click', () => {
                sidebar.classList.toggle('mobile-open');
                backdrop?.classList.toggle('active');
            });
        }

        if (backdrop && sidebar) {
            backdrop.addEventListener('click', () => {
                sidebar.classList.remove('mobile-open');
                backdrop.classList.remove('active');
            });
        }

        // Close detail drawer on backdrop click
        document.getElementById('vocab-detail-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'vocab-detail-modal') {
                closeDetailDrawer();
            }
        });
    }

    // ── 10. Bootstrap Application ──
    function init() {
        if (typeof VOCABULARY_DATA === 'undefined') {
            console.error('VOCABULARY_DATA is not loaded.');
            return;
        }

        const prefs = VocabularyStorage.getPrefs();
        State.viewMode = prefs.viewMode || 'spread';
        State.spreadPage = prefs.spreadPage || 'p1';
        VocabularyAudio.playbackSpeed = prefs.speed || 1.0;

        parseHashRoute();
        window.addEventListener('hashchange', () => {
            parseHashRoute();
            renderSidebarLessonList();
            renderWorkspaceHeader();
            renderVocabularyContent();
        });

        VocabularyAudio.init();
        setupThemeToggle();
        renderThematicPills();
        renderSidebarLessonList();
        renderWorkspaceHeader();
        renderVocabularyContent();

        setupSearch();
        setupAudioPlayerBar();
        setupDataManagementModal();
        setupMobileNavigation();
        setupKeyboardShortcuts();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
