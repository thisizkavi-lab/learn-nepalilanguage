/**
 * Nepali Writing Prompts (नेपाली लेखन विषयहरू)
 * Handles bilingual prompt browsing (215 canonical prompts across 14 categories),
 * multi-lingual search, category filtering, random prompt picker, and interactive writing notebook.
 * Strict language format: FIRST Nepali (Devanagari), THEN English.
 */

(function () {
    'use strict';

    // State
    const state = {
        activeMode: 'characters', // 'characters' | 'prompts'
        activeCategory: 'all',    // 'all' | category id (1..14)
        searchQuery: '',
        activePrompt: null,       // current prompt in writing notebook
        drafts: {}                // { promptNum: text }
    };

    // Load drafts from localStorage
    function loadSavedDrafts() {
        try {
            const raw = localStorage.getItem('nepali_writing_prompts_drafts_v1');
            if (raw) {
                state.drafts = JSON.parse(raw);
            }
        } catch (e) {
            console.warn('Could not load saved drafts from localStorage:', e);
            state.drafts = {};
        }
    }

    function saveDraft(promptNum, text) {
        if (!promptNum) return;
        if (text && text.trim().length > 0) {
            state.drafts[promptNum] = text;
        } else {
            delete state.drafts[promptNum];
        }
        try {
            localStorage.setItem('nepali_writing_prompts_drafts_v1', JSON.stringify(state.drafts));
        } catch (e) {
            console.warn('Could not save draft to localStorage:', e);
        }
        updateDraftBadge(promptNum);
    }

    function getPromptsData() {
        if (typeof window !== 'undefined' && window.WRITING_PROMPTS_DATA) {
            return window.WRITING_PROMPTS_DATA;
        }
        if (typeof WRITING_PROMPTS_DATA !== 'undefined') {
            return WRITING_PROMPTS_DATA;
        }
        return null;
    }

    // Helper: Find prompt by global number (1..215)
    function findPromptByNum(num) {
        const data = getPromptsData();
        if (!data || !data.categories) return null;
        const targetNum = parseInt(num, 10);
        for (const cat of data.categories) {
            for (const p of cat.prompts) {
                if (p.num === targetNum) {
                    return { prompt: p, category: cat };
                }
            }
        }
        return null;
    }

    // Initialize UI
    function init() {
        loadSavedDrafts();
        setupModeSwitching();
        renderCategoryFilters();
        renderPrompts();
        setupSearchAndControls();
        setupWritingDrawer();
        setupKeyboardShortcuts();
        handleHashRouting();

        window.addEventListener('hashchange', handleHashRouting);
    }

    // Handle initial and hashchange routing
    function handleHashRouting() {
        const hash = window.location.hash || '';
        if (hash.startsWith('#prompts')) {
            switchMode('prompts');
            const params = new URLSearchParams(hash.replace(/^#prompts\??/, ''));
            const catId = params.get('cat');
            const promptId = params.get('id');

            if (catId) {
                setCategory(catId);
            }
            if (promptId) {
                const found = findPromptByNum(promptId);
                if (found) {
                    openWritingDrawer(found.prompt, found.category);
                }
            }
        } else {
            switchMode('characters');
        }
    }

    // Mode Switching: Characters vs Prompts
    function setupModeSwitching() {
        const tabChars = document.getElementById('tab-btn-characters');
        const tabPrompts = document.getElementById('tab-btn-prompts');

        if (tabChars) {
            tabChars.addEventListener('click', () => {
                window.location.hash = '#characters';
                switchMode('characters');
            });
        }
        if (tabPrompts) {
            tabPrompts.addEventListener('click', () => {
                window.location.hash = '#prompts';
                switchMode('prompts');
            });
        }
    }

    function switchMode(mode) {
        state.activeMode = mode;
        const secChars = document.getElementById('section-characters');
        const secPrompts = document.getElementById('section-prompts');
        const tabChars = document.getElementById('tab-btn-characters');
        const tabPrompts = document.getElementById('tab-btn-prompts');
        const printBtn = document.getElementById('print-btn');
        const sidebarToggle = document.getElementById('sidebar-toggle');

        if (mode === 'prompts') {
            if (secChars) secChars.style.display = 'none';
            if (secPrompts) secPrompts.style.display = 'block';
            if (tabChars) tabChars.classList.remove('active');
            if (tabPrompts) tabPrompts.classList.add('active');
            if (sidebarToggle) sidebarToggle.style.display = 'none';
            if (printBtn) {
                printBtn.setAttribute('title', 'लेखन विषयहरू प्रिन्ट गर्नुहोस् (Print Writing Prompts)');
            }
        } else {
            if (secChars) secChars.style.display = 'flex';
            if (secPrompts) secPrompts.style.display = 'none';
            if (tabChars) tabChars.classList.add('active');
            if (tabPrompts) tabPrompts.classList.remove('active');
            if (sidebarToggle && window.innerWidth <= 900) {
                sidebarToggle.style.display = 'flex';
            }
            if (printBtn) {
                printBtn.setAttribute('title', 'अभ्यास पाना प्रिन्ट गर्नुहोस् (Print Worksheet)');
            }
        }
    }

    // Render Category Pills
    function renderCategoryFilters() {
        const container = document.getElementById('prompts-category-filters');
        const data = getPromptsData();
        if (!container || !data) return;

        let html = '';

        // All pill
        html += `
            <button type="button" class="category-pill active" data-category="all">
                <span class="pill-nep">सबै विषयहरू</span>
                <span class="pill-eng">All Prompts</span>
                <span class="pill-count">${data.meta.totalPrompts}</span>
            </button>
        `;

        data.categories.forEach(cat => {
            html += `
                <button type="button" class="category-pill" data-category="${cat.id}">
                    <span class="pill-nep">${cat.id}. ${cat.titleNep}</span>
                    <span class="pill-eng">${cat.titleEng}</span>
                    <span class="pill-count">${cat.prompts.length}</span>
                </button>
            `;
        });

        container.innerHTML = html;

        // Event delegation for pills
        container.addEventListener('click', (e) => {
            const pill = e.target.closest('.category-pill');
            if (!pill) return;
            const catId = pill.dataset.category;
            setCategory(catId);
        });
    }

    function setCategory(catId) {
        state.activeCategory = catId;
        const container = document.getElementById('prompts-category-filters');
        if (container) {
            container.querySelectorAll('.category-pill').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.category === String(catId));
            });
        }
        renderPrompts();
    }

    // Filter and Render Prompts
    function renderPrompts() {
        const container = document.getElementById('prompts-list-container');
        const emptyState = document.getElementById('prompts-empty-search');
        const countBadge = document.getElementById('prompts-matched-count');
        const data = getPromptsData();
        if (!container || !data) return;

        const query = state.searchQuery.trim().toLowerCase();
        let totalMatched = 0;
        let html = '';

        data.categories.forEach(cat => {
            if (state.activeCategory !== 'all' && String(cat.id) !== String(state.activeCategory)) {
                return;
            }

            // Filter prompts in this category
            const matchedPrompts = cat.prompts.filter(p => {
                if (!query) return true;
                const inNep = p.nepali.toLowerCase().includes(query);
                const inEng = p.english.toLowerCase().includes(query);
                const inNum = String(p.num) === query || `#${p.num}` === query;
                const inCatNep = cat.titleNep.toLowerCase().includes(query);
                const inCatEng = cat.titleEng.toLowerCase().includes(query);
                return inNep || inEng || inNum || inCatNep || inCatEng;
            });

            if (matchedPrompts.length === 0) return;
            totalMatched += matchedPrompts.length;

            html += `
                <section class="prompt-category-group" id="category-group-${cat.id}">
                    <div class="prompt-category-header">
                        <div class="prompt-category-title-wrap">
                            <span class="prompt-category-badge">${cat.id}</span>
                            <div class="prompt-category-text">
                                <h3 class="category-title-nep">${cat.titleNep}</h3>
                                <p class="category-title-eng">${cat.titleEng}</p>
                            </div>
                        </div>
                        <span class="category-count-badge">${matchedPrompts.length} विषयहरू (prompts)</span>
                    </div>

                    <div class="prompts-grid">
            `;

            matchedPrompts.forEach(p => {
                const hasDraft = !!state.drafts[p.num];
                const draftText = state.drafts[p.num] || '';
                const wordCount = draftText ? draftText.trim().split(/\s+/).filter(Boolean).length : 0;

                html += `
                    <article class="prompt-card" id="prompt-card-${p.num}" data-num="${p.num}">
                        <div class="prompt-card-top">
                            <span class="prompt-num-badge">#${p.num}</span>
                            <span class="prompt-category-tag">${cat.id}. ${cat.titleNep}</span>
                            <span class="prompt-draft-indicator ${hasDraft ? 'visible' : ''}" id="draft-indicator-${p.num}" title="तपाईंको मस्यौदा सुरक्षित छ (Draft saved)">
                                📝 मस्यौदा (${wordCount} शब्द)
                            </span>
                        </div>

                        <!-- FIRST NEPALI (DEVANAGARI) -->
                        <div class="prompt-body-nepali">
                            <p class="prompt-text-nepali">${escapeHtml(p.nepali)}</p>
                        </div>

                        <!-- THEN ENGLISH -->
                        <div class="prompt-body-english">
                            <p class="prompt-text-english">${escapeHtml(p.english)}</p>
                        </div>

                        <div class="prompt-card-actions">
                            <button type="button" class="prompt-btn-write" data-action="write" data-num="${p.num}">
                                ✍️ यहाँ लेख्नुहोस् <span class="btn-subtext">(Write Response)</span>
                            </button>
                            <button type="button" class="prompt-btn-copy" data-action="copy" data-num="${p.num}" title="विषय प्रतिलिपि गर्नुहोस् (Copy Prompt)">
                                📋 प्रतिलिपि
                            </button>
                        </div>
                    </article>
                `;
            });

            html += `
                    </div>
                </section>
            `;
        });

        if (totalMatched === 0) {
            container.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
        } else {
            container.innerHTML = html;
            if (emptyState) emptyState.style.display = 'none';
        }

        if (countBadge) {
            countBadge.textContent = `${totalMatched} / ${data.meta.totalPrompts}`;
        }

        // Delegate prompt card button clicks
        container.onclick = function (e) {
            const btn = e.target.closest('button[data-action]');
            if (!btn) return;
            const action = btn.dataset.action;
            const num = parseInt(btn.dataset.num, 10);
            const found = findPromptByNum(num);
            if (!found) return;

            if (action === 'write') {
                openWritingDrawer(found.prompt, found.category);
            } else if (action === 'copy') {
                copyPromptToClipboard(found.prompt, btn);
            }
        };
    }

    function updateDraftBadge(num) {
        const badge = document.getElementById(`draft-indicator-${num}`);
        if (!badge) return;
        const text = state.drafts[num] || '';
        if (text && text.trim().length > 0) {
            const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
            badge.textContent = `📝 मस्यौदा (${wordCount} शब्द)`;
            badge.classList.add('visible');
        } else {
            badge.classList.remove('visible');
        }
    }

    // Search and Header Controls
    function setupSearchAndControls() {
        const searchInput = document.getElementById('prompts-search-input');
        const clearSearchBtn = document.getElementById('prompts-clear-search');
        const randomBtn = document.getElementById('prompts-random-btn');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                state.searchQuery = e.target.value;
                if (clearSearchBtn) {
                    clearSearchBtn.style.display = state.searchQuery ? 'block' : 'none';
                }
                renderPrompts();
            });
        }

        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => {
                if (searchInput) {
                    searchInput.value = '';
                    state.searchQuery = '';
                    clearSearchBtn.style.display = 'none';
                    searchInput.focus();
                    renderPrompts();
                }
            });
        }

        if (randomBtn) {
            randomBtn.addEventListener('click', () => {
                pickRandomPrompt();
            });
        }
    }

    // Pick Random Prompt
    function pickRandomPrompt() {
        const data = getPromptsData();
        if (!data) return;
        let pool = [];

        if (state.activeCategory === 'all') {
            data.categories.forEach(cat => {
                cat.prompts.forEach(p => pool.push({ prompt: p, category: cat }));
            });
        } else {
            const cat = data.categories.find(c => String(c.id) === String(state.activeCategory));
            if (cat) {
                cat.prompts.forEach(p => pool.push({ prompt: p, category: cat }));
            }
        }

        if (pool.length === 0) return;
        const randomIndex = Math.floor(Math.random() * pool.length);
        const selected = pool[randomIndex];

        // Highlight card or directly open writing drawer
        openWritingDrawer(selected.prompt, selected.category);
        showToast(`🎲 विषय #${selected.prompt.num} रोजियो (Prompt #${selected.prompt.num} Selected)`);
    }

    // Copy Prompt to Clipboard
    function copyPromptToClipboard(prompt, triggerBtn) {
        const formatted = `विषय #${prompt.num}:\n${prompt.nepali}\n\nPrompt #${prompt.num}:\n${prompt.english}`;
        navigator.clipboard.writeText(formatted).then(() => {
            showToast('✅ विषय क्लिपबोर्डमा प्रतिलिपि गरियो (Prompt copied to clipboard)');
            if (triggerBtn) {
                const orig = triggerBtn.innerHTML;
                triggerBtn.innerHTML = '✓ प्रतिलिपि भयो!';
                setTimeout(() => { triggerBtn.innerHTML = orig; }, 1500);
            }
        }).catch(err => {
            console.error('Clipboard copy error:', err);
            showToast('प्रतिलिपि गर्न सकिएन (Failed to copy)');
        });
    }

    // Writing Drawer / Modal
    function setupWritingDrawer() {
        const modal = document.getElementById('prompt-drawer-modal');
        const closeBtn = document.getElementById('drawer-close-btn');
        const backdrop = document.getElementById('drawer-backdrop');
        const textarea = document.getElementById('drawer-textarea');
        const prevBtn = document.getElementById('drawer-prev-prompt');
        const nextBtn = document.getElementById('drawer-next-prompt');
        const copyTextBtn = document.getElementById('drawer-copy-text');
        const downloadBtn = document.getElementById('drawer-download-text');
        const clearTextBtn = document.getElementById('drawer-clear-text');
        const printTextBtn = document.getElementById('drawer-print-text');
        const helpersContainer = document.getElementById('devanagari-helpers');

        if (closeBtn) closeBtn.addEventListener('click', closeWritingDrawer);
        if (backdrop) backdrop.addEventListener('click', closeWritingDrawer);

        // Auto-save on input and update stats
        if (textarea) {
            textarea.addEventListener('input', () => {
                if (!state.activePrompt) return;
                const text = textarea.value;
                saveDraft(state.activePrompt.num, text);
                updateDrawerStats(text);
            });
        }

        // Previous and Next buttons
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (!state.activePrompt) return;
                const prevNum = state.activePrompt.num > 1 ? state.activePrompt.num - 1 : 215;
                const found = findPromptByNum(prevNum);
                if (found) openWritingDrawer(found.prompt, found.category);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (!state.activePrompt) return;
                const nextNum = state.activePrompt.num < 215 ? state.activePrompt.num + 1 : 1;
                const found = findPromptByNum(nextNum);
                if (found) openWritingDrawer(found.prompt, found.category);
            });
        }

        // Copy essay text
        if (copyTextBtn) {
            copyTextBtn.addEventListener('click', () => {
                if (!textarea) return;
                const text = textarea.value;
                if (!text.trim()) {
                    showToast('⚠️ प्रतिलिपि गर्न केही लेखिएको छैन (Nothing to copy)');
                    return;
                }
                navigator.clipboard.writeText(text).then(() => {
                    showToast('✅ रचना प्रतिलिपि गरियो (Your writing was copied)');
                });
            });
        }

        // Download essay text as .txt
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                if (!textarea || !state.activePrompt) return;
                const text = textarea.value;
                if (!text.trim()) {
                    showToast('⚠️ डाउनलोड गर्न केही लेखिएको छैन (Nothing to download)');
                    return;
                }
                const content = `नेपाली लेखन अभ्यास (Nepali Writing Practice)\nविषय #${state.activePrompt.num}:\n${state.activePrompt.nepali}\n\nPrompt #${state.activePrompt.num}:\n${state.activePrompt.english}\n\n----------------------------------------\nतपाईंको रचना (Your Response):\n----------------------------------------\n\n${text}\n`;
                const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `nepali-writing-prompt-${state.activePrompt.num}.txt`;
                a.click();
                URL.revokeObjectURL(url);
                showToast('📥 फाइल डाउनलोड भयो (Downloaded file)');
            });
        }

        // Clear essay text
        if (clearTextBtn) {
            clearTextBtn.addEventListener('click', () => {
                if (!textarea || !state.activePrompt) return;
                if (textarea.value.trim().length === 0) return;
                if (confirm('के तपाईं यो मस्यौदा खाली गर्न निश्चित हुनुहुन्छ? (Are you sure you want to clear this draft?)')) {
                    textarea.value = '';
                    saveDraft(state.activePrompt.num, '');
                    updateDrawerStats('');
                    showToast('🗑️ मस्यौदा खाली गरियो (Draft cleared)');
                }
            });
        }

        // Print response
        if (printTextBtn) {
            printTextBtn.addEventListener('click', () => {
                window.print();
            });
        }

        // Setup Devanagari Quick Helper Keys
        if (helpersContainer) {
            const helperChars = [
                { char: '।', label: 'पूर्णविराम' },
                { char: '॥', label: 'दीर्घविराम' },
                { char: 'ँ', label: 'चन्द्रबिन्दु' },
                { char: 'ं', label: 'अनुस्वार' },
                { char: 'ः', label: 'विसर्ग' },
                { char: '्', label: 'हलन्त' },
                { char: '?', label: 'प्रश्नचिन्ह' },
                { char: '!', label: 'उद्गारचिन्ह' },
                { char: '०', label: '०' },
                { char: '१', label: '१' },
                { char: '२', label: '२' },
                { char: '३', label: '३' },
                { char: '४', label: '४' },
                { char: '५', label: '५' },
                { char: '६', label: '६' },
                { char: '७', label: '७' },
                { char: '८', label: '८' },
                { char: '९', label: '९' }
            ];

            let helpersHtml = '<div class="devanagari-helper-label">द्रुत चिन्हहरू (Quick Symbols):</div><div class="helper-keys-row">';
            helperChars.forEach(item => {
                helpersHtml += `<button type="button" class="helper-char-btn" data-char="${item.char}" title="${item.label}">${item.char}</button>`;
            });
            helpersHtml += '</div>';
            helpersContainer.innerHTML = helpersHtml;

            helpersContainer.addEventListener('click', (e) => {
                const btn = e.target.closest('.helper-char-btn');
                if (!btn || !textarea) return;
                const char = btn.dataset.char;
                insertCharIntoTextarea(textarea, char);
            });
        }
    }

    function insertCharIntoTextarea(textarea, char) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const val = textarea.value;
        textarea.value = val.substring(0, start) + char + val.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + char.length;
        textarea.focus();

        if (state.activePrompt) {
            saveDraft(state.activePrompt.num, textarea.value);
            updateDrawerStats(textarea.value);
        }
    }

    function openWritingDrawer(prompt, category) {
        state.activePrompt = prompt;
        const modal = document.getElementById('prompt-drawer-modal');
        const numBadge = document.getElementById('drawer-prompt-num');
        const catBadge = document.getElementById('drawer-prompt-category');
        const nepaliText = document.getElementById('drawer-prompt-nepali');
        const englishText = document.getElementById('drawer-prompt-english');
        const textarea = document.getElementById('drawer-textarea');

        if (numBadge) numBadge.textContent = `#${prompt.num}`;
        if (catBadge) catBadge.textContent = `${category.id}. ${category.titleNep} (${category.titleEng})`;
        if (nepaliText) nepaliText.textContent = prompt.nepali;
        if (englishText) englishText.textContent = prompt.english;

        const saved = state.drafts[prompt.num] || '';
        if (textarea) {
            textarea.value = saved;
            updateDrawerStats(saved);
        }

        if (modal) {
            modal.classList.add('open');
            document.body.classList.add('modal-open');
            setTimeout(() => {
                if (textarea) textarea.focus();
            }, 100);
        }
    }

    function closeWritingDrawer() {
        const modal = document.getElementById('prompt-drawer-modal');
        if (modal) {
            modal.classList.remove('open');
            document.body.classList.remove('modal-open');
        }
    }

    function updateDrawerStats(text) {
        const wordBadge = document.getElementById('drawer-word-count');
        const charBadge = document.getElementById('drawer-char-count');
        const words = text ? text.trim().split(/\s+/).filter(Boolean).length : 0;
        const chars = text ? text.length : 0;

        if (wordBadge) wordBadge.textContent = `${words} शब्द (words)`;
        if (charBadge) charBadge.textContent = `${chars} अक्षर (chars)`;
    }

    // Keyboard shortcuts: Esc to close modal
    function setupKeyboardShortcuts() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = document.getElementById('prompt-drawer-modal');
                if (modal && modal.classList.contains('open')) {
                    closeWritingDrawer();
                }
            }
        });
    }

    // Utility: Toast notification
    function showToast(message) {
        let toast = document.getElementById('writing-prompt-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'writing-prompt-toast';
            toast.className = 'prompt-toast';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add('visible');
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => {
            toast.classList.remove('visible');
        }, 2600);
    }

    // Utility: Escape HTML
    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
