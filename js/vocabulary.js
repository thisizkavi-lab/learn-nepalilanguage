/**
 * ══════════════════════════════════════════════════════════════════════
 * Learn Nepali — Scalable Nepali Vocabulary Builder (App Engine)
 * Data-driven, accessible, persistence-backed, audio-integrated
 * ══════════════════════════════════════════════════════════════════════
 */

(function () {
    'use strict';

    // ── 1. Persistence Layer (Local-only prototype, clearly identified) ──
    const STORAGE_KEY = 'nepali_vocabulary_status_v1';
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
                return data ? JSON.parse(data) : { viewMode: 'grid', speed: 1.0, activeTheme: 'all' };
            } catch (e) {
                return { viewMode: 'grid', speed: 1.0, activeTheme: 'all' };
            }
        },

        savePrefs(prefs) {
            try {
                const current = this.getPrefs();
                localStorage.setItem(PREFS_KEY, JSON.stringify({ ...current, ...prefs }));
            } catch (e) {
                // Ignore storage errors
            }
        },

        exportProgressJSON() {
            const payload = {
                version: 1,
                exportedAt: new Date().toISOString(),
                data: this.getAll()
            };
            return JSON.stringify(payload, null, 2);
        },

        importProgressJSON(jsonStr) {
            try {
                const parsed = JSON.parse(jsonStr);
                if (parsed && typeof parsed.data === 'object') {
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
                // Check for Nepali voice (ne-NP or ne)
                this.nepaliVoice = voices.find(v => v.lang.startsWith('ne')) || null;
            };
            findVoice();
            if (this.synth.onvoiceschanged !== undefined) {
                this.synth.onvoiceschanged = findVoice;
            }
        },

        speakText(text, onEnd) {
            if (!this.synth) {
                if (onEnd) onEnd();
                return;
            }
            this.synth.cancel();

            // Strip parenthesis context notes
            const cleanText = text.replace(/\(.*?\)/g, '').split(';')[0].trim();
            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.rate = this.playbackSpeed;
            
            if (this.nepaliVoice) {
                utterance.voice = this.nepaliVoice;
                utterance.lang = 'ne-NP';
            } else {
                // Default language fallback
                utterance.lang = 'ne-NP';
            }

            utterance.onend = () => {
                if (onEnd) onEnd();
            };
            utterance.onerror = () => {
                if (onEnd) onEnd();
            };

            this.synth.speak(utterance);
        },

        stop() {
            if (this.synth) this.synth.cancel();
            this.isPlayingSequence = false;
            this.highlightCard(null);
            this.updatePlayerUI();
        },

        playSingle(entry) {
            this.stop();
            this.speakText(entry.nepaliText, () => {
                if (this.repeatItem) {
                    setTimeout(() => this.playSingle(entry), 400);
                }
            });
        },

        startSequence(entries) {
            if (!entries || entries.length === 0) return;
            this.sequenceQueue = entries;
            this.currentIndex = 0;
            this.isPlayingSequence = true;
            this.updatePlayerUI();
            this.playNextInSequence();
        },

        playNextInSequence() {
            if (!this.isPlayingSequence || this.currentIndex >= this.sequenceQueue.length) {
                this.stop();
                return;
            }

            const entry = this.sequenceQueue[this.currentIndex];
            this.highlightCard(entry.id);
            this.updatePlayerUI();

            this.speakText(entry.nepaliText, () => {
                if (!this.isPlayingSequence) return;
                
                if (this.repeatItem) {
                    setTimeout(() => {
                        if (this.isPlayingSequence) this.playNextInSequence();
                    }, 500);
                } else {
                    this.currentIndex++;
                    setTimeout(() => {
                        if (this.isPlayingSequence) this.playNextInSequence();
                    }, 800);
                }
            });
        },

        prev() {
            if (this.currentIndex > 0) {
                this.currentIndex--;
                this.playNextInSequence();
            }
        },

        next() {
            if (this.currentIndex < this.sequenceQueue.length - 1) {
                this.currentIndex++;
                this.playNextInSequence();
            } else {
                this.stop();
            }
        },

        highlightCard(entryId) {
            document.querySelectorAll('.vocab-card.playing, .vocab-row-item.playing').forEach(el => {
                el.classList.remove('playing');
            });
            if (!entryId) return;
            const target = document.querySelector(`[data-entry-id="${entryId}"]`);
            if (target) {
                target.classList.add('playing');
                target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        },

        updatePlayerUI() {
            const playBtn = document.getElementById('player-play-btn');
            const statusText = document.getElementById('player-status-text');
            const repeatBtn = document.getElementById('player-repeat-btn');

            if (playBtn) {
                playBtn.innerHTML = this.isPlayingSequence
                    ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`
                    : `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
                playBtn.setAttribute('aria-label', this.isPlayingSequence ? 'Pause sequence' : 'Play sequence');
            }

            if (repeatBtn) {
                repeatBtn.classList.toggle('active', this.repeatItem);
            }

            if (statusText) {
                if (this.isPlayingSequence && this.currentIndex >= 0 && this.currentIndex < this.sequenceQueue.length) {
                    const cur = this.sequenceQueue[this.currentIndex];
                    statusText.textContent = `Playing ${this.currentIndex + 1} of ${this.sequenceQueue.length}: ${cur.englishHeadword}`;
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
        viewMode: 'grid',          // 'grid' | 'rows'
        searchQuery: '',
        activeDetailId: null,

        getLesson(num) {
            return VOCABULARY_DATA.lessons.find(l => l.number === num) || VOCABULARY_DATA.lessons[0];
        },

        getFilteredEntries() {
            const lesson = this.getLesson(this.activeLessonNum);
            let entries = lesson.entries;

            // Global search override: if search query has >= 2 characters, search across the library or current lesson
            if (this.searchQuery.trim().length >= 2) {
                const q = this.searchQuery.trim().toLowerCase();
                // Filter entries matching English, Nepali, or Romanization
                entries = lesson.entries.filter(e => {
                    const mEng = e.englishHeadword.toLowerCase().includes(q);
                    const mNep = e.nepaliText.toLowerCase().includes(q);
                    const mRom = e.romanization && e.romanization.toLowerCase().includes(q);
                    return mEng || mNep || mRom;
                });
            }

            // Filter by section tab
            if (this.activeTab === 'main') {
                entries = entries.filter(e => e.sourceSection === 'main');
            } else if (this.activeTab === 'practical') {
                entries = entries.filter(e => e.sourceSection === 'practical');
            }

            // Filter by learning status
            if (this.activeStatusFilter !== 'all') {
                entries = entries.filter(e => {
                    const st = VocabularyStorage.getStatus(e.id);
                    return st === this.activeStatusFilter;
                });
            }

            return entries;
        }
    };

    // ── 4. UI Helper Functions & Icons ──
    const Icons = {
        concrete: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>`,
        action: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
        phrase: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
        idiom: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2v1"/><path d="M12 7a5 5 0 0 0-5 5c0 1.5.8 2.8 2 3.6V17h6v-1.4c1.2-.8 2-2.1 2-3.6a5 5 0 0 0-5-5z"/></svg>`,
        abstract: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`,
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
            btn.addEventListener('click', (e) => {
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

        // Compute learning progress for mini bars
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
                    <div class="vocab-lesson-badge">${l.number}</div>
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
                // Close mobile drawer if open
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

        // Overall status counts for this lesson
        const allStatuses = VocabularyStorage.getAll();
        let counts = { unsorted: 0, difficult: 0, learning: 0, known: 0 };
        lesson.entries.forEach(e => {
            const st = allStatuses[e.id] || 'unsorted';
            counts[st] = (counts[st] || 0) + 1;
        });

        headerEl.innerHTML = `
            <div class="vocab-lesson-heading-row">
                <div>
                    <div class="vocab-lesson-number-tag">Lesson ${lesson.number} • ${escapeHtml(themeLabel)}</div>
                    <h2 class="vocab-lesson-main-title">${escapeHtml(lesson.title)}</h2>
                    <div class="vocab-lesson-subtitle">Source companion: Everyday Nepali equivalents (${lesson.entriesCount} headwords)</div>
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
                <!-- Section Tabs -->
                <div class="vocab-tabs" role="tablist">
                    <button class="vocab-tab-btn ${State.activeTab === 'all' ? 'active' : ''}" data-tab="all">All (${lesson.entriesCount})</button>
                    <button class="vocab-tab-btn ${State.activeTab === 'main' ? 'active' : ''}" data-tab="main">Main List (${lesson.mainCount})</button>
                    <button class="vocab-tab-btn ${State.activeTab === 'practical' ? 'active' : ''}" data-tab="practical">Practical Additions (${lesson.practicalCount})</button>
                    ${lesson.variantsCount > 0 ? `<button class="vocab-tab-btn ${State.activeTab === 'variants' ? 'active' : ''}" data-tab="variants">Recognition Variants (${lesson.variantsCount})</button>` : ''}
                </div>

                <!-- Learning Status Filter -->
                <div class="vocab-status-filters" role="group" aria-label="Filter by learning status">
                    <button class="vocab-status-btn ${State.activeStatusFilter === 'all' ? 'active' : ''}" data-status="all">
                        <span>All</span>
                    </button>
                    <button class="vocab-status-btn ${State.activeStatusFilter === 'unsorted' ? 'active' : ''}" data-status="unsorted" title="Unsorted items">
                        <span class="status-dot status-dot-unsorted"></span>
                        <span>Unsorted (${counts.unsorted})</span>
                    </button>
                    <button class="vocab-status-btn ${State.activeStatusFilter === 'difficult' ? 'active' : ''}" data-status="difficult" title="Marked as Difficult">
                        <span class="status-dot status-dot-difficult"></span>
                        <span>Difficult (${counts.difficult})</span>
                    </button>
                    <button class="vocab-status-btn ${State.activeStatusFilter === 'learning' ? 'active' : ''}" data-status="learning" title="Currently Learning">
                        <span class="status-dot status-dot-learning"></span>
                        <span>Learning (${counts.learning})</span>
                    </button>
                    <button class="vocab-status-btn ${State.activeStatusFilter === 'known' ? 'active' : ''}" data-status="known" title="Already Known">
                        <span class="status-dot status-dot-known"></span>
                        <span>Known (${counts.known})</span>
                    </button>
                </div>

                <!-- View Switcher -->
                <div class="vocab-view-toggle">
                    <button class="vocab-view-btn ${State.viewMode === 'grid' ? 'active' : ''}" id="view-grid-btn" title="Cards Grid View" aria-label="Cards Grid View">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                    </button>
                    <button class="vocab-view-btn ${State.viewMode === 'rows' ? 'active' : ''}" id="view-rows-btn" title="Compact Table View" aria-label="Compact Table View">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                    </button>
                </div>
            </div>
        `;

        // Event listeners
        headerEl.querySelector('#prev-lesson-btn')?.addEventListener('click', () => {
            if (lesson.number > 1) selectActiveLesson(lesson.number - 1);
        });
        headerEl.querySelector('#next-lesson-btn')?.addEventListener('click', () => {
            if (lesson.number < VOCABULARY_DATA.lessons.length) selectActiveLesson(lesson.number + 1);
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

        headerEl.querySelector('#view-grid-btn')?.addEventListener('click', () => {
            State.viewMode = 'grid';
            VocabularyStorage.savePrefs({ viewMode: 'grid' });
            renderWorkspaceHeader();
            renderVocabularyContent();
        });

        headerEl.querySelector('#view-rows-btn')?.addEventListener('click', () => {
            State.viewMode = 'rows';
            VocabularyStorage.savePrefs({ viewMode: 'rows' });
            renderWorkspaceHeader();
            renderVocabularyContent();
        });
    }

    function renderVocabularyContent() {
        const container = document.getElementById('vocab-content-container');
        if (!container) return;

        // If 'variants' tab is chosen, display recognition variants notes
        if (State.activeTab === 'variants') {
            renderVariantsTab(container);
            return;
        }

        const entries = State.getFilteredEntries();

        // Feed entries to Audio controller
        VocabularyAudio.sequenceQueue = entries;
        VocabularyAudio.updatePlayerUI();

        if (entries.length === 0) {
            container.innerHTML = `
                <div class="vocab-empty-state">
                    <div class="vocab-empty-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                    </div>
                    <div class="vocab-empty-title">No vocabulary entries found</div>
                    <p>Try clearing your search query or switching the learning status filter.</p>
                </div>
            `;
            return;
        }

        if (State.viewMode === 'rows') {
            renderRowsView(container, entries);
        } else {
            renderGridView(container, entries);
        }
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

    function renderGridView(container, entries) {
        let html = `<div class="vocab-cards-grid">`;

        entries.forEach(entry => {
            const status = VocabularyStorage.getStatus(entry.id);
            const statusInfo = getStatusLabel(status);
            const typeIcon = Icons[entry.illustrationType] || Icons.concrete;

            html += `
                <div class="vocab-card" data-entry-id="${entry.id}" tabindex="0" role="article" aria-label="${escapeHtml(entry.nepaliText)} - ${escapeHtml(entry.englishHeadword)}">
                    <div>
                        <div class="vocab-card-header">
                            <span class="vocab-type-tag vocab-type-${entry.illustrationType}">
                                ${typeIcon}
                                <span>${entry.illustrationType}</span>
                            </span>
                            <div class="vocab-card-actions">
                                <button class="vocab-item-audio-btn" data-audio-id="${entry.id}" title="Pronounce (नेपाली)" aria-label="Pronounce ${escapeHtml(entry.nepaliText)}">
                                    ${Icons.sound}
                                </button>
                            </div>
                        </div>

                        <div class="vocab-card-body">
                            <div class="vocab-nepali-anchor">${escapeHtml(entry.nepaliText)}</div>
                            ${entry.romanization ? `<div class="vocab-romanization">${escapeHtml(entry.romanization)}</div>` : ''}
                            <div class="vocab-english-meaning">${escapeHtml(entry.englishHeadword)}</div>
                            ${entry.contextNote ? `<div class="vocab-context-chip">${escapeHtml(entry.contextNote)}</div>` : ''}
                            ${entry.recognitionVariants ? `
                                <div class="vocab-variant-note" title="Also called in British English / variant">
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                                    <span>Variant: ${escapeHtml(entry.recognitionVariants[0].variant)}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>

                    <div class="vocab-card-footer">
                        <button class="vocab-status-pill ${statusInfo.cls}" data-status-btn="${entry.id}" title="Click to cycle status (Unsorted → Learning → Known → Difficult)">
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
                            ${entry.illustrationType}
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

    function bindCardEvents(container) {
        // Audio button click
        container.querySelectorAll('[data-audio-id]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-audio-id');
                const entry = findEntryById(id);
                if (entry) VocabularyAudio.playSingle(entry);
            });
        });

        // Status pill cycle button click
        container.querySelectorAll('[data-status-btn]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-status-btn');
                const cur = VocabularyStorage.getStatus(id);
                const nxt = cycleStatus(cur);
                VocabularyStorage.setStatus(id, nxt);
                
                // Update button in place
                const info = getStatusLabel(nxt);
                btn.className = `vocab-status-pill ${info.cls}`;
                btn.innerHTML = `<span class="status-dot status-dot-${info.cls}"></span><span>${info.text}</span>`;
                
                // Update mini progress bar in sidebar
                renderSidebarLessonList();
            });
        });

        // Card / Row click opens Detail Drawer
        container.querySelectorAll('[data-entry-id]').forEach(el => {
            el.addEventListener('click', () => {
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
        const statusInfo = getStatusLabel(status);

        // Find surrounding entries for Next / Prev in current view
        const currentList = State.getFilteredEntries();
        const curIdx = currentList.findIndex(e => e.id === entry.id);
        const prevEntry = curIdx > 0 ? currentList[curIdx - 1] : null;
        const nextEntry = curIdx >= 0 && curIdx < currentList.length - 1 ? currentList[curIdx + 1] : null;

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
                        Lesson ${entry.lessonNumber}: ${escapeHtml(entry.lessonTitle)} • ${entry.sourceSection === 'main' ? 'Main Vocabulary' : 'Practical Addition'} (Row #${entry.sourceRow})
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
                        ${entry.contextNote ? `
                            <div style="margin-top: 8px; font-size: 0.85rem; color: var(--text-muted);">
                                <strong>Context / Specific sense:</strong> ${escapeHtml(entry.contextNote)}
                            </div>
                        ` : ''}
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
                                ${getIllustrationTypeDescription(entry.illustrationType)}
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

                    <!-- Storage Citation -->
                    <div style="font-size: 0.72rem; color: var(--text-muted); line-height: 1.5; margin-top: 20px;">
                        Status is saved automatically to your device's browser local storage.
                    </div>
                </div>
            </div>
        `;

        modal.classList.add('open');
        document.body.style.overflow = 'hidden';

        // Close button & click outside
        modal.querySelector('#drawer-close-btn')?.addEventListener('click', closeDetailDrawer);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeDetailDrawer();
        });

        // Prev / Next button
        modal.querySelector('#drawer-prev-btn')?.addEventListener('click', () => {
            if (prevEntry) openDetailDrawer(prevEntry.id);
        });
        modal.querySelector('#drawer-next-btn')?.addEventListener('click', () => {
            if (nextEntry) openDetailDrawer(nextEntry.id);
        });

        // Audio play in drawer
        modal.querySelector('#drawer-audio-play-btn')?.addEventListener('click', () => {
            VocabularyAudio.playSingle(entry);
        });

        // Copy Devanagari text
        modal.querySelector('#drawer-copy-btn')?.addEventListener('click', () => {
            navigator.clipboard.writeText(entry.nepaliText).then(() => {
                const lbl = document.getElementById('copy-text-label');
                if (lbl) {
                    lbl.textContent = 'Copied!';
                    setTimeout(() => { lbl.textContent = 'Copy'; }, 1500);
                }
            });
        });

        // Status setter buttons
        modal.querySelectorAll('[data-set-status]').forEach(btn => {
            btn.addEventListener('click', () => {
                const newStatus = btn.getAttribute('data-set-status');
                VocabularyStorage.setStatus(entry.id, newStatus);
                openDetailDrawer(entry.id); // re-render drawer
                renderVocabularyContent();  // re-render background cards
                renderSidebarLessonList();
            });
        });
    }

    function closeDetailDrawer() {
        const modal = document.getElementById('vocab-detail-modal');
        if (modal) {
            modal.classList.remove('open');
            document.body.style.overflow = '';
            State.activeDetailId = null;
        }
    }

    function getIllustrationTypeDescription(type) {
        switch (type) {
            case 'concrete': return 'Concrete object, place, or living thing';
            case 'action': return 'Action, dynamic verb, or routine activity';
            case 'phrase': return 'Everyday conversational phrase or spoken turn';
            case 'idiom': return 'Figurative or idiomatic expression';
            case 'abstract': return 'Abstract concept, measurement, or emotional quality';
            default: return 'Standard vocabulary headword';
        }
    }

    // ── 7. Global Keyboard Handlers ──
    document.addEventListener('keydown', (e) => {
        // When modal is open
        if (State.activeDetailId) {
            if (e.key === 'Escape') {
                closeDetailDrawer();
            } else if (e.key === 'ArrowLeft') {
                document.getElementById('drawer-prev-btn')?.click();
            } else if (e.key === 'ArrowRight') {
                document.getElementById('drawer-next-btn')?.click();
            } else if (['1', '2', '3', '4'].includes(e.key)) {
                const map = { '1': 'unsorted', '2': 'difficult', '3': 'learning', '4': 'known' };
                document.querySelector(`[data-set-status="${map[e.key]}"]`)?.click();
            } else if (e.key === ' ' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON') {
                e.preventDefault();
                document.getElementById('drawer-audio-play-btn')?.click();
            }
            return;
        }

        // Global shortcuts when drawer is closed
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        if (e.key === 'ArrowLeft') {
            document.getElementById('prev-lesson-btn')?.click();
        } else if (e.key === 'ArrowRight') {
            document.getElementById('next-lesson-btn')?.click();
        } else if (e.key === 'f' || e.key === '/') {
            e.preventDefault();
            document.getElementById('vocab-search-input')?.focus();
        }
    });

    // ── 8. Navigation & Hash Routing ──
    function selectActiveLesson(num) {
        if (num < 1 || num > VOCABULARY_DATA.lessons.length) return;
        VocabularyAudio.stop();
        State.activeLessonNum = num;
        window.location.hash = `lesson-${num}`;
        renderSidebarLessonList();
        renderWorkspaceHeader();
        renderVocabularyContent();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function initHashRoute() {
        const hash = window.location.hash.substring(1);
        if (hash.startsWith('lesson-')) {
            const num = parseInt(hash.replace('lesson-', ''), 10);
            if (num >= 1 && num <= VOCABULARY_DATA.lessons.length) {
                State.activeLessonNum = num;
            }
        }
    }

    // ── 9. Setup Search & Toolbar ──
    function initSearch() {
        const input = document.getElementById('vocab-search-input');
        const clearBtn = document.getElementById('vocab-search-clear');
        if (!input) return;

        input.addEventListener('input', () => {
            State.searchQuery = input.value;
            if (clearBtn) clearBtn.style.display = input.value ? 'flex' : 'none';
            renderVocabularyContent();
        });

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                input.value = '';
                State.searchQuery = '';
                clearBtn.style.display = 'none';
                renderVocabularyContent();
                input.focus();
            });
        }
    }

    function initAudioToolbar() {
        const playBtn = document.getElementById('player-play-btn');
        const prevBtn = document.getElementById('player-prev-btn');
        const nextBtn = document.getElementById('player-next-btn');
        const repeatBtn = document.getElementById('player-repeat-btn');
        const speedBtn = document.getElementById('player-speed-btn');

        playBtn?.addEventListener('click', () => {
            if (VocabularyAudio.isPlayingSequence) {
                VocabularyAudio.stop();
            } else {
                VocabularyAudio.startSequence(State.getFilteredEntries());
            }
        });

        prevBtn?.addEventListener('click', () => VocabularyAudio.prev());
        nextBtn?.addEventListener('click', () => VocabularyAudio.next());

        repeatBtn?.addEventListener('click', () => {
            VocabularyAudio.repeatItem = !VocabularyAudio.repeatItem;
            VocabularyAudio.updatePlayerUI();
        });

        speedBtn?.addEventListener('click', () => {
            const current = VocabularyAudio.playbackSpeed;
            const nextSpeed = current === 1.0 ? 0.8 : 1.0;
            VocabularyAudio.playbackSpeed = nextSpeed;
            speedBtn.textContent = `${nextSpeed}x`;
            VocabularyStorage.savePrefs({ speed: nextSpeed });
        });
    }

    function initMobileMenu() {
        const btn = document.getElementById('vocab-mobile-menu-btn');
        const sidebar = document.getElementById('vocab-sidebar');
        const backdrop = document.getElementById('vocab-sidebar-backdrop');

        btn?.addEventListener('click', () => {
            sidebar?.classList.toggle('mobile-open');
            backdrop?.classList.toggle('open');
        });

        backdrop?.addEventListener('click', () => {
            sidebar?.classList.remove('mobile-open');
            backdrop?.classList.remove('open');
        });
    }

    function initThemeToggle() {
        const themeBtn = document.getElementById('theme-toggle');
        if (!themeBtn) return;
        themeBtn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme') || 'light';
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('nepali-theme', next);
        });
    }

    function initDataModal() {
        const btn = document.getElementById('vocab-data-mgmt-btn');
        if (!btn) return;
        btn.addEventListener('click', () => {
            const currentCount = Object.keys(VocabularyStorage.getAll()).length;
            const action = window.prompt(
                `Vocabulary Progress Management (Local Storage)\n\n` +
                `You currently have ${currentCount} categorized items saved on this device.\n\n` +
                `Type "export" to download backup JSON\n` +
                `Type "reset" to clear all status tags\n` +
                `Type "cancel" to exit:`
            );

            if (action === 'export') {
                const jsonStr = VocabularyStorage.exportProgressJSON();
                const blob = new Blob([jsonStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `nepali-vocabulary-progress-${new Date().toISOString().slice(0, 10)}.json`;
                a.click();
            } else if (action === 'reset') {
                if (window.confirm('Are you sure you want to reset all your vocabulary learning tags on this device?')) {
                    localStorage.removeItem(STORAGE_KEY);
                    VocabularyStorage._cache = {};
                    renderSidebarLessonList();
                    renderWorkspaceHeader();
                    renderVocabularyContent();
                }
            }
        });
    }

    // ── 10. Bootstrap Application ──
    document.addEventListener('DOMContentLoaded', () => {
        // Load saved preferences
        const prefs = VocabularyStorage.getPrefs();
        State.viewMode = prefs.viewMode || 'grid';
        VocabularyAudio.playbackSpeed = prefs.speed || 1.0;
        const speedBtn = document.getElementById('player-speed-btn');
        if (speedBtn) speedBtn.textContent = `${VocabularyAudio.playbackSpeed}x`;

        // Initialize audio engine
        VocabularyAudio.init();

        // Check hash
        initHashRoute();

        // Render UI
        renderThematicPills();
        renderSidebarLessonList();
        renderWorkspaceHeader();
        renderVocabularyContent();

        // Bind interactive components
        initSearch();
        initAudioToolbar();
        initMobileMenu();
        initThemeToggle();
        initDataModal();
    });

})();
