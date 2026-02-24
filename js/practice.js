// Nepali Writing Practice - Character Data & Logic

const VOWELS = [
    { char: 'अ', roman: 'a', name: 'A' },
    { char: 'आ', roman: 'aa', name: 'Aa' },
    { char: 'इ', roman: 'i', name: 'I' },
    { char: 'ई', roman: 'ee', name: 'Ee' },
    { char: 'उ', roman: 'u', name: 'U' },
    { char: 'ऊ', roman: 'oo', name: 'Oo' },
    { char: 'ऋ', roman: 'ri', name: 'Ri' },
    { char: 'ए', roman: 'e', name: 'E' },
    { char: 'ऐ', roman: 'ai', name: 'Ai' },
    { char: 'ओ', roman: 'o', name: 'O' },
    { char: 'औ', roman: 'au', name: 'Au' },
    { char: 'अं', roman: 'am', name: 'Am' },
    { char: 'अः', roman: 'ah', name: 'Ah' },
];

const CONSONANTS = [
    // Ka-varga
    { char: 'क', roman: 'ka', name: 'Ka', group: 'क-वर्ग' },
    { char: 'ख', roman: 'kha', name: 'Kha', group: 'क-वर्ग' },
    { char: 'ग', roman: 'ga', name: 'Ga', group: 'क-वर्ग' },
    { char: 'घ', roman: 'gha', name: 'Gha', group: 'क-वर्ग' },
    { char: 'ङ', roman: 'nga', name: 'Nga', group: 'क-वर्ग' },
    // Cha-varga
    { char: 'च', roman: 'cha', name: 'Cha', group: 'च-वर्ग' },
    { char: 'छ', roman: 'chha', name: 'Chha', group: 'च-वर्ग' },
    { char: 'ज', roman: 'ja', name: 'Ja', group: 'च-वर्ग' },
    { char: 'झ', roman: 'jha', name: 'Jha', group: 'च-वर्ग' },
    { char: 'ञ', roman: 'nya', name: 'Nya', group: 'च-वर्ग' },
    // Ta-varga (retroflex)
    { char: 'ट', roman: 'ṭa', name: 'Ta', group: 'ट-वर्ग' },
    { char: 'ठ', roman: 'ṭha', name: 'Tha', group: 'ट-वर्ग' },
    { char: 'ड', roman: 'ḍa', name: 'Da', group: 'ट-वर्ग' },
    { char: 'ढ', roman: 'ḍha', name: 'Dha', group: 'ट-वर्ग' },
    { char: 'ण', roman: 'ṇa', name: 'Na', group: 'ट-वर्ग' },
    // Ta-varga (dental)
    { char: 'त', roman: 'ta', name: 'Ta', group: 'त-वर्ग' },
    { char: 'थ', roman: 'tha', name: 'Tha', group: 'त-वर्ग' },
    { char: 'द', roman: 'da', name: 'Da', group: 'त-वर्ग' },
    { char: 'ध', roman: 'dha', name: 'Dha', group: 'त-वर्ग' },
    { char: 'न', roman: 'na', name: 'Na', group: 'त-वर्ग' },
    // Pa-varga
    { char: 'प', roman: 'pa', name: 'Pa', group: 'प-वर्ग' },
    { char: 'फ', roman: 'pha', name: 'Pha', group: 'प-वर्ग' },
    { char: 'ब', roman: 'ba', name: 'Ba', group: 'प-वर्ग' },
    { char: 'भ', roman: 'bha', name: 'Bha', group: 'प-वर्ग' },
    { char: 'म', roman: 'ma', name: 'Ma', group: 'प-वर्ग' },
    // Antastha & Ushma
    { char: 'य', roman: 'ya', name: 'Ya', group: 'अन्तस्थ' },
    { char: 'र', roman: 'ra', name: 'Ra', group: 'अन्तस्थ' },
    { char: 'ल', roman: 'la', name: 'La', group: 'अन्तस्थ' },
    { char: 'व', roman: 'wa', name: 'Wa', group: 'अन्तस्थ' },
    { char: 'श', roman: 'sha', name: 'Sha', group: 'ऊष्म' },
    { char: 'ष', roman: 'ṣha', name: 'Sha', group: 'ऊष्म' },
    { char: 'स', roman: 'sa', name: 'Sa', group: 'ऊष्म' },
    { char: 'ह', roman: 'ha', name: 'Ha', group: 'ऊष्म' },
    // Compound
    { char: 'क्ष', roman: 'ksha', name: 'Ksha', group: 'संयुक्त' },
    { char: 'त्र', roman: 'tra', name: 'Tra', group: 'संयुक्त' },
    { char: 'ज्ञ', roman: 'gya', name: 'Gya', group: 'संयुक्त' },
];

// Vowel markers (matras) used in Barakhari
const MATRAS = [
    { matra: '', vowel: 'अ', roman: 'a', name: '(inherent)' },
    { matra: 'ा', vowel: 'आ', roman: 'aa', name: 'aa-matra' },
    { matra: 'ि', vowel: 'इ', roman: 'i', name: 'i-matra' },
    { matra: 'ी', vowel: 'ई', roman: 'ee', name: 'ee-matra' },
    { matra: 'ु', vowel: 'उ', roman: 'u', name: 'u-matra' },
    { matra: 'ू', vowel: 'ऊ', roman: 'oo', name: 'oo-matra' },
    { matra: 'े', vowel: 'ए', roman: 'e', name: 'e-matra' },
    { matra: 'ै', vowel: 'ऐ', roman: 'ai', name: 'ai-matra' },
    { matra: 'ो', vowel: 'ओ', roman: 'o', name: 'o-matra' },
    { matra: 'ौ', vowel: 'औ', roman: 'au', name: 'au-matra' },
    { matra: 'ं', vowel: 'अं', roman: 'am', name: 'anusvara' },
    { matra: 'ः', vowel: 'अः', roman: 'ah', name: 'visarga' },
];

// Generate all 432 Barakhari combinations
const BARAKHARI = [];
CONSONANTS.forEach((cons, ci) => {
    MATRAS.forEach((m, mi) => {
        const combined = cons.char + m.matra;
        const roman = cons.roman.replace(/a$/, '') + m.roman;
        BARAKHARI.push({
            char: combined,
            roman: roman,
            name: `${cons.name}-${m.name}`,
            group: cons.group,
            base: cons.char,
            consIndex: ci,
            matraIndex: mi,
        });
    });
});

// ─── Nepali Numerals ───
const NUMERALS = [
    { char: '०', roman: '0', name: 'Zero' },
    { char: '१', roman: '1', name: 'One' },
    { char: '२', roman: '2', name: 'Two' },
    { char: '३', roman: '3', name: 'Three' },
    { char: '४', roman: '4', name: 'Four' },
    { char: '५', roman: '5', name: 'Five' },
    { char: '६', roman: '6', name: 'Six' },
    { char: '७', roman: '7', name: 'Seven' },
    { char: '८', roman: '8', name: 'Eight' },
    { char: '९', roman: '9', name: 'Nine' },
];

// ─── Special Marks / Symbols ───
const SPECIAL_MARKS = [
    { char: 'ँ', roman: 'chandrabindu', name: 'Chandrabindu (nasalisation)' },
    { char: 'ं', roman: 'anusvara', name: 'Anusvara (nasal)' },
    { char: 'ः', roman: 'visarga', name: 'Visarga (aspiration)' },
    { char: '्', roman: 'halant', name: 'Halant / Virama (vowel killer)' },
    { char: '।', roman: 'purna viram', name: 'Purna Viram (full stop)' },
    { char: '॥', roman: 'deergh viram', name: 'Deergh Viram (double stop)' },
    { char: 'ॐ', roman: 'om', name: 'Om' },
];

// ─── Conjunct / Half Consonants (संयुक्त व्यञ्जन) ───
const CONJUNCTS = [
    // Common half-consonant + consonant combinations
    { char: 'क्क', roman: 'kka', name: 'Kka', group: 'Geminate' },
    { char: 'क्ख', roman: 'kkha', name: 'Kkha', group: 'Geminate' },
    { char: 'ग्ग', roman: 'gga', name: 'Gga', group: 'Geminate' },
    { char: 'च्च', roman: 'ccha', name: 'Ccha', group: 'Geminate' },
    { char: 'ज्ज', roman: 'jja', name: 'Jja', group: 'Geminate' },
    { char: 'ट्ट', roman: 'tta', name: 'Tta', group: 'Geminate' },
    { char: 'ड्ड', roman: 'dda', name: 'Dda', group: 'Geminate' },
    { char: 'त्त', roman: 'tta', name: 'Tta', group: 'Geminate' },
    { char: 'द्द', roman: 'dda', name: 'Dda', group: 'Geminate' },
    { char: 'प्प', roman: 'ppa', name: 'Ppa', group: 'Geminate' },
    { char: 'म्म', roman: 'mma', name: 'Mma', group: 'Geminate' },
    { char: 'ल्ल', roman: 'lla', name: 'Lla', group: 'Geminate' },
    { char: 'स्स', roman: 'ssa', name: 'Ssa', group: 'Geminate' },
    // Nasal + consonant
    { char: 'ङ्ग', roman: 'nga', name: 'Ng+Ga', group: 'Nasal' },
    { char: 'ङ्क', roman: 'nka', name: 'Ng+Ka', group: 'Nasal' },
    { char: 'ञ्ज', roman: 'nja', name: 'Ny+Ja', group: 'Nasal' },
    { char: 'ञ्च', roman: 'ncha', name: 'Ny+Cha', group: 'Nasal' },
    { char: 'ण्ड', roman: 'nda', name: 'N+Da', group: 'Nasal' },
    { char: 'न्द', roman: 'nda', name: 'Na+Da', group: 'Nasal' },
    { char: 'न्ध', roman: 'ndha', name: 'Na+Dha', group: 'Nasal' },
    { char: 'म्ब', roman: 'mba', name: 'Ma+Ba', group: 'Nasal' },
    { char: 'न्न', roman: 'nna', name: 'Nna', group: 'Nasal' },
    // R-combinations
    { char: 'र्क', roman: 'rka', name: 'Ra+Ka (repha)', group: 'Ra-combo' },
    { char: 'र्ग', roman: 'rga', name: 'Ra+Ga (repha)', group: 'Ra-combo' },
    { char: 'र्म', roman: 'rma', name: 'Ra+Ma (repha)', group: 'Ra-combo' },
    { char: 'र्न', roman: 'rna', name: 'Ra+Na (repha)', group: 'Ra-combo' },
    { char: 'क्र', roman: 'kra', name: 'Ka+Ra', group: 'Ra-combo' },
    { char: 'प्र', roman: 'pra', name: 'Pa+Ra', group: 'Ra-combo' },
    { char: 'ग्र', roman: 'gra', name: 'Ga+Ra', group: 'Ra-combo' },
    { char: 'भ्र', roman: 'bhra', name: 'Bha+Ra', group: 'Ra-combo' },
    // Common conjuncts
    { char: 'द्ध', roman: 'ddha', name: 'Da+Dha', group: 'Common' },
    { char: 'द्व', roman: 'dwa', name: 'Da+Wa', group: 'Common' },
    { char: 'द्य', roman: 'dya', name: 'Da+Ya', group: 'Common' },
    { char: 'ट्य', roman: 'tya', name: 'Ta+Ya', group: 'Common' },
    { char: 'त्य', roman: 'tya', name: 'Ta+Ya', group: 'Common' },
    { char: 'श्र', roman: 'shra', name: 'Sha+Ra', group: 'Common' },
    { char: 'स्त', roman: 'sta', name: 'Sa+Ta', group: 'Common' },
    { char: 'स्थ', roman: 'stha', name: 'Sa+Tha', group: 'Common' },
    { char: 'ष्ट', roman: 'shta', name: 'Sha+Ta', group: 'Common' },
    { char: 'न्त', roman: 'nta', name: 'Na+Ta', group: 'Common' },
    { char: 'ध्य', roman: 'dhya', name: 'Dha+Ya', group: 'Common' },
    { char: 'त्थ', roman: 'ttha', name: 'Ta+Tha', group: 'Common' },
    { char: 'ह्य', roman: 'hya', name: 'Ha+Ya', group: 'Common' },
    { char: 'ह्र', roman: 'hra', name: 'Ha+Ra', group: 'Common' },
    { char: 'ल्प', roman: 'lpa', name: 'La+Pa', group: 'Common' },
];

// ─── Common Words (demonstrating conjuncts, half-consonants, special marks) ───
const COMMON_WORDS = [
    // Words with conjuncts
    { char: 'विद्या', roman: 'vidyā', name: 'knowledge' },
    { char: 'वृक्ष', roman: 'vriksha', name: 'tree' },
    { char: 'पत्र', roman: 'patra', name: 'letter/leaf' },
    { char: 'मित्र', roman: 'mitra', name: 'friend' },
    { char: 'शक्ति', roman: 'shakti', name: 'power' },
    { char: 'भक्त', roman: 'bhakta', name: 'devotee' },
    { char: 'श्रेष्ठ', roman: 'shreshtha', name: 'best/greatest' },
    { char: 'सत्य', roman: 'satya', name: 'truth' },
    { char: 'धर्म', roman: 'dharma', name: 'religion/duty' },
    { char: 'कर्म', roman: 'karma', name: 'action/deed' },
    // Words with chandrabindu / anusvara
    { char: 'हुँ', roman: 'hũ', name: 'am (I am)' },
    { char: 'छँ', roman: 'chã', name: 'is (informal)' },
    { char: 'गाउँ', roman: 'gāũ', name: 'village' },
    { char: 'ठाउँ', roman: 'thāũ', name: 'place' },
    { char: 'संस्कृति', roman: 'sanskriti', name: 'culture' },
    { char: 'हिंसा', roman: 'hinsā', name: 'violence' },
    // Words with halant / half letters visible
    { char: 'बुद्ध', roman: 'buddha', name: 'Buddha' },
    { char: 'सुन्दर', roman: 'sundar', name: 'beautiful' },
    { char: 'अन्त', roman: 'anta', name: 'end' },
    { char: 'मन्त्र', roman: 'mantra', name: 'mantra/spell' },
    { char: 'यन्त्र', roman: 'yantra', name: 'machine' },
    { char: 'तन्त्र', roman: 'tantra', name: 'system' },
    { char: 'चन्द्र', roman: 'chandra', name: 'moon' },
    { char: 'इन्द्र', roman: 'indra', name: 'Indra (king of gods)' },
    // Compound words commonly practiced
    { char: 'नमस्ते', roman: 'namaste', name: 'hello' },
    { char: 'नमस्कार', roman: 'namaskār', name: 'greeting' },
    { char: 'विद्यालय', roman: 'vidyālay', name: 'school' },
    { char: 'राष्ट्र', roman: 'rāshtra', name: 'nation' },
    { char: 'स्वतन्त्र', roman: 'swatantra', name: 'independent' },
    { char: 'उत्तर', roman: 'uttar', name: 'north/answer' },
    { char: 'उत्सव', roman: 'utsav', name: 'festival' },
    { char: 'प्रश्न', roman: 'prashna', name: 'question' },
    { char: 'दृष्टि', roman: 'drishti', name: 'vision' },
    { char: 'स्वास्थ्य', roman: 'swāsthya', name: 'health' },
    { char: 'व्यञ्जन', roman: 'vyañjan', name: 'consonant' },
    { char: 'अक्षर', roman: 'akshar', name: 'letter/character' },
    { char: 'क्षमा', roman: 'kshamā', name: 'forgiveness' },
    { char: 'ज्ञान', roman: 'gyān', name: 'knowledge/wisdom' },
    { char: 'प्रज्ञा', roman: 'pragyā', name: 'wisdom/intellect' },
    { char: 'श्रद्धा', roman: 'shraddhā', name: 'faith/devotion' },
];

const GRID_COLS = 10;
const GRID_ROWS = 2;

// State
const selectedChars = new Set();

document.addEventListener('DOMContentLoaded', () => {
    renderSidebar();
    setupControls();
});

function renderSidebar() {
    const vowelGrid = document.getElementById('vowel-grid');
    const consonantGrid = document.getElementById('consonant-grid');
    const barakhariContainer = document.getElementById('barakhari-container');
    const numeralGrid = document.getElementById('numeral-grid');
    const specialGrid = document.getElementById('special-grid');
    const conjunctGrid = document.getElementById('conjunct-grid');
    const wordGrid = document.getElementById('word-grid');

    VOWELS.forEach((v, i) => {
        const btn = createCharButton(v, 'vowel', i);
        vowelGrid.appendChild(btn);
    });

    CONSONANTS.forEach((c, i) => {
        const btn = createCharButton(c, 'consonant', i);
        consonantGrid.appendChild(btn);
    });

    // Render Barakhari grouped by consonant
    renderBarakhariSidebar(barakhariContainer);

    // Numerals
    NUMERALS.forEach((n, i) => {
        const btn = createCharButton(n, 'numeral', i);
        numeralGrid.appendChild(btn);
    });

    // Special Marks
    SPECIAL_MARKS.forEach((s, i) => {
        const btn = createCharButton(s, 'special', i);
        specialGrid.appendChild(btn);
    });

    // Conjuncts
    CONJUNCTS.forEach((c, i) => {
        const btn = createCharButton(c, 'conjunct', i);
        btn.classList.add('char-btn-small');
        conjunctGrid.appendChild(btn);
    });

    // Common Words
    COMMON_WORDS.forEach((w, i) => {
        const btn = createCharButton(w, 'word', i);
        btn.classList.add('char-btn-word');
        wordGrid.appendChild(btn);
    });
}

function renderBarakhariSidebar(container) {
    // Group by consonant index
    const groups = {};
    BARAKHARI.forEach((b, i) => {
        if (!groups[b.consIndex]) groups[b.consIndex] = [];
        groups[b.consIndex].push({ data: b, globalIndex: i });
    });

    Object.keys(groups).forEach(ci => {
        const items = groups[ci];
        const cons = CONSONANTS[ci];

        const row = document.createElement('div');
        row.className = 'barakhari-row';

        // Row header
        const rowHeader = document.createElement('div');
        rowHeader.className = 'barakhari-row-header';
        rowHeader.innerHTML = `
            <span class="barakhari-base">${cons.char}</span>
            <button class="barakhari-row-btn" data-action="select" data-cons="${ci}" title="Select all ${cons.char} combinations">+</button>
            <button class="barakhari-row-btn" data-action="clear" data-cons="${ci}" title="Clear ${cons.char}">−</button>
        `;
        row.appendChild(rowHeader);

        // Character grid for this consonant
        const grid = document.createElement('div');
        grid.className = 'barakhari-char-grid';

        items.forEach(({ data, globalIndex }) => {
            const btn = createCharButton(data, 'barakhari', globalIndex);
            btn.classList.add('char-btn-small');
            grid.appendChild(btn);
        });

        row.appendChild(grid);
        container.appendChild(row);
    });

    // Wire up row select/clear buttons
    container.addEventListener('click', (e) => {
        const btn = e.target.closest('.barakhari-row-btn');
        if (!btn) return;
        const action = btn.dataset.action;
        const ci = parseInt(btn.dataset.cons);
        const startIdx = ci * MATRAS.length;
        const endIdx = startIdx + MATRAS.length;

        for (let i = startIdx; i < endIdx; i++) {
            if (action === 'select') {
                selectedChars.add(`barakhari-${i}`);
            } else {
                selectedChars.delete(`barakhari-${i}`);
            }
        }
        updateSidebarSelection();
        renderWorksheet();
    });
}

function createCharButton(data, type, index) {
    const btn = document.createElement('button');
    btn.className = 'char-btn';
    btn.textContent = data.char;
    btn.dataset.type = type;
    btn.dataset.index = index;
    btn.title = `${data.roman} (${data.name})`;

    btn.addEventListener('click', () => {
        const key = `${type}-${index}`;
        if (selectedChars.has(key)) {
            selectedChars.delete(key);
            btn.classList.remove('selected');
        } else {
            selectedChars.add(key);
            btn.classList.add('selected');
        }
        renderWorksheet();
    });

    return btn;
}

function setupControls() {
    // Select All / Clear buttons
    document.getElementById('select-all-vowels').addEventListener('click', () => {
        VOWELS.forEach((_, i) => selectedChars.add(`vowel-${i}`));
        updateSidebarSelection();
        renderWorksheet();
    });

    document.getElementById('clear-vowels').addEventListener('click', () => {
        VOWELS.forEach((_, i) => selectedChars.delete(`vowel-${i}`));
        updateSidebarSelection();
        renderWorksheet();
    });

    document.getElementById('select-all-consonants').addEventListener('click', () => {
        CONSONANTS.forEach((_, i) => selectedChars.add(`consonant-${i}`));
        updateSidebarSelection();
        renderWorksheet();
    });

    document.getElementById('clear-consonants').addEventListener('click', () => {
        CONSONANTS.forEach((_, i) => selectedChars.delete(`consonant-${i}`));
        updateSidebarSelection();
        renderWorksheet();
    });

    document.getElementById('select-all-barakhari').addEventListener('click', () => {
        BARAKHARI.forEach((_, i) => selectedChars.add(`barakhari-${i}`));
        updateSidebarSelection();
        renderWorksheet();
    });

    document.getElementById('clear-barakhari').addEventListener('click', () => {
        BARAKHARI.forEach((_, i) => selectedChars.delete(`barakhari-${i}`));
        updateSidebarSelection();
        renderWorksheet();
    });

    // Numerals
    document.getElementById('select-all-numerals').addEventListener('click', () => {
        NUMERALS.forEach((_, i) => selectedChars.add(`numeral-${i}`));
        updateSidebarSelection();
        renderWorksheet();
    });
    document.getElementById('clear-numerals').addEventListener('click', () => {
        NUMERALS.forEach((_, i) => selectedChars.delete(`numeral-${i}`));
        updateSidebarSelection();
        renderWorksheet();
    });

    // Special Marks
    document.getElementById('select-all-special').addEventListener('click', () => {
        SPECIAL_MARKS.forEach((_, i) => selectedChars.add(`special-${i}`));
        updateSidebarSelection();
        renderWorksheet();
    });
    document.getElementById('clear-special').addEventListener('click', () => {
        SPECIAL_MARKS.forEach((_, i) => selectedChars.delete(`special-${i}`));
        updateSidebarSelection();
        renderWorksheet();
    });

    // Conjuncts
    document.getElementById('select-all-conjuncts').addEventListener('click', () => {
        CONJUNCTS.forEach((_, i) => selectedChars.add(`conjunct-${i}`));
        updateSidebarSelection();
        renderWorksheet();
    });
    document.getElementById('clear-conjuncts').addEventListener('click', () => {
        CONJUNCTS.forEach((_, i) => selectedChars.delete(`conjunct-${i}`));
        updateSidebarSelection();
        renderWorksheet();
    });

    // Common Words
    document.getElementById('select-all-words').addEventListener('click', () => {
        COMMON_WORDS.forEach((_, i) => selectedChars.add(`word-${i}`));
        updateSidebarSelection();
        renderWorksheet();
    });
    document.getElementById('clear-words').addEventListener('click', () => {
        COMMON_WORDS.forEach((_, i) => selectedChars.delete(`word-${i}`));
        updateSidebarSelection();
        renderWorksheet();
    });

    // Print button
    document.getElementById('print-btn').addEventListener('click', () => {
        window.print();
    });

    // Theme toggle
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

function updateSidebarSelection() {
    document.querySelectorAll('.char-btn').forEach(btn => {
        const key = `${btn.dataset.type}-${btn.dataset.index}`;
        btn.classList.toggle('selected', selectedChars.has(key));
    });
}

function renderWorksheet() {
    const worksheet = document.getElementById('worksheet');
    worksheet.innerHTML = '';

    if (selectedChars.size === 0) {
        worksheet.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">लेख्नुहोस्</div>
                <p>Select characters from the sidebar to generate your practice worksheet.</p>
                <p class="empty-hint">Click individual characters, or use "Select All" to add a whole section.</p>
            </div>
        `;
        return;
    }

    // Sort selected chars in logical order
    const typeOrder = { vowel: 0, consonant: 1, barakhari: 2, numeral: 3, special: 4, conjunct: 5, word: 6 };
    const sorted = Array.from(selectedChars).sort((a, b) => {
        const [typeA, idxA] = a.split('-');
        const [typeB, idxB] = b.split('-');
        if (typeA !== typeB) return typeOrder[typeA] - typeOrder[typeB];
        return parseInt(idxA) - parseInt(idxB);
    });

    const dataLookup = {
        vowel: VOWELS,
        consonant: CONSONANTS,
        barakhari: BARAKHARI,
        numeral: NUMERALS,
        special: SPECIAL_MARKS,
        conjunct: CONJUNCTS,
        word: COMMON_WORDS,
    };

    sorted.forEach(key => {
        const [type, idx] = key.split('-');
        const data = dataLookup[type][parseInt(idx)];
        const block = createPracticeBlock(data);
        worksheet.appendChild(block);
    });
}

function createPracticeBlock(data) {
    const block = document.createElement('div');
    block.className = 'practice-block';

    // Header with character info
    const header = document.createElement('div');
    header.className = 'practice-header';
    header.innerHTML = `
        <span class="practice-label"><strong>CHARACTER:</strong> <span class="practice-char-display">${data.char}</span></span>
        <span class="practice-label"><strong>ROMANIZED:</strong> ${data.roman}</span>
        ${data.group ? `<span class="practice-label"><strong>GROUP:</strong> <span class="practice-char-display">${data.group}</span></span>` : ''}
    `;
    block.appendChild(header);

    // Grid
    const grid = document.createElement('div');
    grid.className = 'practice-grid';

    for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
            const cell = document.createElement('div');
            cell.className = 'practice-cell';

            const cellIndex = row * GRID_COLS + col;

            if (cellIndex === 0) {
                // Reference: solid black
                cell.classList.add('cell-reference');
                cell.innerHTML = `<span class="cell-char">${data.char}</span>`;
            } else if (cellIndex <= 2) {
                // Traceable: light gray
                cell.classList.add('cell-trace');
                cell.innerHTML = `<span class="cell-char">${data.char}</span>`;
            } else {
                // Empty with crosshair guides
                cell.classList.add('cell-empty');
                cell.innerHTML = '<div class="crosshair"></div>';
            }

            grid.appendChild(cell);
        }
    }

    block.appendChild(grid);
    return block;
}
