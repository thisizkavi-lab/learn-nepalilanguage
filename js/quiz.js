// Quiz Logic — Flashcard & Multiple Choice
(function () {
    'use strict';

    // ─── State ───
    let mode = 'flashcard';     // 'flashcard' | 'mcq'
    let content = 'words';      // 'words' | 'phrases'
    let direction = 'np-en';    // 'np-en' | 'en-np'
    let totalQ = 20;
    let questions = [];
    let currentQ = 0;
    let correct = 0;
    let wrong = 0;
    let streak = 0;
    let maxStreak = 0;
    let pool = [];

    // ─── Data source ───
    function getPool() {
        return content === 'words' ? QUIZ_WORDS : QUIZ_PHRASES;
    }

    function getPrompt(item) {
        return direction === 'np-en' ? item.np : item.en;
    }

    function getAnswer(item) {
        return direction === 'np-en' ? item.en : item.np;
    }

    // ─── Shuffle ───
    function shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    // ─── Generate Questions ───
    function generateQuestions() {
        pool = getPool();
        const shuffled = shuffle(pool);
        const count = Math.min(totalQ, shuffled.length);
        questions = shuffled.slice(0, count);
        currentQ = 0;
        correct = 0;
        wrong = 0;
        streak = 0;
        maxStreak = 0;
    }

    // ─── UI Updates ───
    function updateScoreBar() {
        document.getElementById('correct').textContent = correct;
        document.getElementById('wrong').textContent = wrong;
        document.getElementById('streak').textContent = streak;
        document.getElementById('q-progress').textContent = `${currentQ + 1} / ${questions.length}`;
    }

    function showScreen(id) {
        ['quiz-setup', 'quiz-play', 'quiz-results'].forEach(s => {
            document.getElementById(s).classList.toggle('hidden', s !== id);
        });
    }

    // ─── Flashcard ───
    function showFlashcard() {
        const flashArea = document.getElementById('flashcard-area');
        const mcqArea = document.getElementById('mcq-area');
        flashArea.classList.remove('hidden');
        mcqArea.classList.add('hidden');

        const card = document.getElementById('flashcard');
        card.classList.remove('flipped');

        const item = questions[currentQ];
        const frontText = document.getElementById('front-text');
        const backText = document.getElementById('back-text');

        frontText.textContent = getPrompt(item);
        backText.textContent = getAnswer(item);

        // Set font based on direction
        frontText.style.fontFamily = direction === 'np-en'
            ? "'Kalimati', 'Noto Sans Devanagari', serif"
            : "'Inter', sans-serif";
        backText.style.fontFamily = direction === 'np-en'
            ? "'Inter', sans-serif"
            : "'Kalimati', 'Noto Sans Devanagari', serif";

        updateScoreBar();
    }

    function flipCard() {
        document.getElementById('flashcard').classList.toggle('flipped');
    }

    function flashAnswer(isCorrect) {
        if (isCorrect) {
            correct++;
            streak++;
            if (streak > maxStreak) maxStreak = streak;
        } else {
            wrong++;
            streak = 0;
        }
        nextQuestion();
    }

    // ─── Multiple Choice ───
    function showMCQ() {
        const flashArea = document.getElementById('flashcard-area');
        const mcqArea = document.getElementById('mcq-area');
        flashArea.classList.add('hidden');
        mcqArea.classList.remove('hidden');

        const item = questions[currentQ];
        const prompt = document.getElementById('mcq-prompt');
        prompt.textContent = getPrompt(item);
        prompt.style.fontFamily = direction === 'np-en'
            ? "'Kalimati', 'Noto Sans Devanagari', serif"
            : "'Inter', sans-serif";

        // Generate 4 options (1 correct + 3 wrong)
        const correctAnswer = getAnswer(item);
        const allAnswers = pool.map(i => getAnswer(i)).filter(a => a !== correctAnswer);
        const wrongAnswers = shuffle(allAnswers).slice(0, 3);
        const options = shuffle([correctAnswer, ...wrongAnswers]);

        const optContainer = document.getElementById('mcq-options');
        optContainer.innerHTML = '';

        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'mcq-opt';
            btn.textContent = opt;
            if (direction === 'en-np') {
                btn.style.fontFamily = "'Kalimati', 'Noto Sans Devanagari', serif";
                btn.style.fontSize = '1.25rem';
            }
            btn.addEventListener('click', () => handleMCQAnswer(btn, opt, correctAnswer));
            optContainer.appendChild(btn);
        });

        updateScoreBar();
    }

    function handleMCQAnswer(btn, selected, correctAnswer) {
        // Disable all buttons
        document.querySelectorAll('.mcq-opt').forEach(b => {
            b.style.pointerEvents = 'none';
            if (b.textContent === correctAnswer) b.classList.add('correct');
        });

        if (selected === correctAnswer) {
            correct++;
            streak++;
            if (streak > maxStreak) maxStreak = streak;
        } else {
            btn.classList.add('wrong');
            wrong++;
            streak = 0;
        }

        updateScoreBar();

        // Auto-advance after a short delay
        setTimeout(() => nextQuestion(), 1000);
    }

    // ─── Navigation ───
    function nextQuestion() {
        currentQ++;
        if (currentQ >= questions.length) {
            showResults();
            return;
        }

        if (mode === 'flashcard') showFlashcard();
        else showMCQ();
    }

    // ─── Results ───
    function showResults() {
        showScreen('quiz-results');

        const pct = Math.round((correct / questions.length) * 100);
        document.getElementById('results-score').textContent = `${pct}%`;

        let grade = '';
        if (pct >= 90) grade = 'Excellent! 🌟';
        else if (pct >= 70) grade = 'Great job! 👏';
        else if (pct >= 50) grade = 'Keep practicing! 💪';
        else grade = 'Keep studying! 📖';

        document.getElementById('results-details').innerHTML = `
            <p>${grade}</p>
            <p>${correct} correct, ${wrong} wrong out of ${questions.length}</p>
            <p>Best streak: ${maxStreak}</p>
        `;
    }

    // ─── Setup Button Logic ───
    function setupOptionButtons() {
        document.querySelectorAll('.option-buttons').forEach(group => {
            group.querySelectorAll('.opt-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    group.querySelectorAll('.opt-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                });
            });
        });
    }

    function getSelectedValue(groupId) {
        const group = document.getElementById(groupId);
        const active = group.querySelector('.opt-btn.active');
        return active ? active.dataset.value : null;
    }

    function startQuiz() {
        mode = getSelectedValue('mode-select') || 'flashcard';
        content = getSelectedValue('content-select') || 'words';
        direction = getSelectedValue('direction-select') || 'np-en';
        totalQ = parseInt(getSelectedValue('count-select') || '20');

        generateQuestions();
        showScreen('quiz-play');

        if (mode === 'flashcard') showFlashcard();
        else showMCQ();
    }

    // ─── Init ───
    document.addEventListener('DOMContentLoaded', () => {
        setupOptionButtons();

        // Start button
        document.getElementById('start-quiz').addEventListener('click', startQuiz);

        // Flashcard events
        document.getElementById('flashcard').addEventListener('click', flipCard);
        document.getElementById('flash-correct').addEventListener('click', () => flashAnswer(true));
        document.getElementById('flash-wrong').addEventListener('click', () => flashAnswer(false));

        // Results buttons
        document.getElementById('retry-quiz').addEventListener('click', () => {
            generateQuestions();
            showScreen('quiz-play');
            if (mode === 'flashcard') showFlashcard();
            else showMCQ();
        });
        document.getElementById('new-quiz').addEventListener('click', () => {
            showScreen('quiz-setup');
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
    });
})();
