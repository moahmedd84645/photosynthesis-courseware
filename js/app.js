/* ============================================
   رحلة الطاقة - Energy Journey
   Core Application JavaScript
   ============================================ */

// === Progress Manager ===
class ProgressManager {
    constructor() {
        this.storageKey = 'energyJourney_progress';
        this.data = this.load();
    }

    load() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            return saved ? JSON.parse(saved) : {
                completedSections: [],
                quizScores: {},
                activityCompleted: [],
                lastVisited: null,
                startedAt: new Date().toISOString()
            };
        } catch (e) {
            return { completedSections: [], quizScores: {}, activityCompleted: [], lastVisited: null, startedAt: new Date().toISOString() };
        }
    }

    save() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        } catch (e) {
            console.warn('Could not save progress');
        }
    }

    markComplete(sectionId) {
        if (!this.data.completedSections.includes(sectionId)) {
            this.data.completedSections.push(sectionId);
            this.save();
        }
    }

    isComplete(sectionId) {
        return this.data.completedSections.includes(sectionId);
    }

    saveScore(quizId, score, total) {
        this.data.quizScores[quizId] = { score, total, percentage: Math.round((score / total) * 100), date: new Date().toISOString() };
        this.save();
    }

    getScore(quizId) {
        return this.data.quizScores[quizId] || null;
    }

    markActivity(activityId) {
        if (!this.data.activityCompleted.includes(activityId)) {
            this.data.activityCompleted.push(activityId);
            this.save();
        }
    }

    setLastVisited(pageId) {
        this.data.lastVisited = pageId;
        this.save();
    }

    getOverallProgress() {
        const totalSections = 13; // 5 + 4 parts + 2 assessments + relationship + final
        return Math.round((this.data.completedSections.length / totalSections) * 100);
    }

    getStationProgress(stationPrefix) {
        const sectionMap = {
            'lesson1': ['l1p1', 'l1p2', 'l1p3', 'l1p4', 'l1p5', 'l1assess'],
            'lesson2': ['l2p1', 'l2p2', 'l2p3', 'l2p4', 'l2assess'],
            'relationship': ['relationship'],
            'final': ['final-assess']
        };
        const sections = sectionMap[stationPrefix] || [];
        if (sections.length === 0) return 0;
        const completed = sections.filter(s => this.data.completedSections.includes(s)).length;
        return Math.round((completed / sections.length) * 100);
    }

    reset() {
        this.data = { completedSections: [], quizScores: {}, activityCompleted: [], lastVisited: null, startedAt: new Date().toISOString() };
        this.save();
    }
}

// === Quiz Engine ===
class QuizEngine {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Quiz container not found:', containerId);
            return;
        }
        this.questions = [];
        this.answers = {};
        this.submitted = false;
        this.onComplete = options.onComplete || null;
        this.quizId = options.quizId || containerId;
        this.showOneByOne = options.showOneByOne || false;
    }

    addMCQ(config) {
        this.questions.push({ type: 'mcq', ...config });
    }

    addTrueFalse(config) {
        this.questions.push({ type: 'tf', ...config });
    }

    addOrdering(config) {
        this.questions.push({ type: 'ordering', ...config });
    }

    addMatching(config) {
        this.questions.push({ type: 'matching', ...config });
    }

    addDragDrop(config) {
        this.questions.push({ type: 'dragdrop', ...config });
    }

    render() {
        if (!this.container) return;
        let html = '';

        this.questions.forEach((q, i) => {
            html += `<div class="question-card" id="q-${this.quizId}-${i}" data-index="${i}">`;
            html += `<div class="question-text"><span class="q-num">${i + 1}.</span><span>${q.question}</span></div>`;

            switch (q.type) {
                case 'mcq': html += this._renderMCQ(q, i); break;
                case 'tf': html += this._renderTF(q, i); break;
                case 'ordering': html += this._renderOrdering(q, i); break;
                case 'matching': html += this._renderMatching(q, i); break;
                case 'dragdrop': html += this._renderDragDrop(q, i); break;
            }

            html += `<div class="feedback" id="feedback-${this.quizId}-${i}"></div>`;
            html += `</div>`;
        });

        html += `<button class="check-btn" id="check-${this.quizId}" onclick="quizEngines['${this.quizId}'].submit()">
                    تحقق من إجاباتك
                 </button>`;

        html += `<div class="score-display" id="score-${this.quizId}" style="display:none;"></div>`;

        this.container.innerHTML = html;
        this._initInteractions();

        // Register globally
        if (!window.quizEngines) window.quizEngines = {};
        window.quizEngines[this.quizId] = this;
    }

    _renderMCQ(q, idx) {
        const letters = ['أ', 'ب', 'ج', 'د', 'هـ', 'و'];
        let html = '<div class="options-list">';
        q.options.forEach((opt, j) => {
            html += `<button class="option-btn" data-q="${idx}" data-opt="${j}" onclick="quizEngines['${this.quizId}'].selectOption(${idx}, ${j})">
                        <span class="option-letter">${letters[j]}</span>
                        <span>${opt}</span>
                     </button>`;
        });
        html += '</div>';
        return html;
    }

    _renderTF(q, idx) {
        return `<div class="tf-buttons">
                    <button class="tf-btn" data-q="${idx}" data-val="true" onclick="quizEngines['${this.quizId}'].selectTF(${idx}, true)">✓ صح</button>
                    <button class="tf-btn" data-q="${idx}" data-val="false" onclick="quizEngines['${this.quizId}'].selectTF(${idx}, false)">✗ خطأ</button>
                </div>`;
    }

    _renderOrdering(q, idx) {
        let html = `<div class="ordering-list" id="ordering-${this.quizId}-${idx}">`;
        const shuffled = [...q.items].sort(() => Math.random() - 0.5);
        shuffled.forEach((item, j) => {
            html += `<div class="ordering-item" data-original="${q.items.indexOf(item)}" data-q="${idx}">
                        <span class="order-num">${j + 1}</span>
                        <span class="order-text">${item}</span>
                        <span class="order-arrows">
                            <button onclick="quizEngines['${this.quizId}'].moveItem(${idx}, this, -1)">▲</button>
                            <button onclick="quizEngines['${this.quizId}'].moveItem(${idx}, this, 1)">▼</button>
                        </span>
                     </div>`;
        });
        html += '</div>';
        return html;
    }

    _renderMatching(q, idx) {
        const shuffledRight = [...q.pairs.map(p => p.right)].sort(() => Math.random() - 0.5);
        let html = `<div class="matching-container" id="matching-${this.quizId}-${idx}">`;
        html += '<div class="matching-column">';
        q.pairs.forEach((p, j) => {
            html += `<div class="matching-item matching-left" data-q="${idx}" data-pair="${j}" 
                         onclick="quizEngines['${this.quizId}'].selectMatchLeft(${idx}, ${j})">${p.left}</div>`;
        });
        html += '</div>';
        html += '<div class="matching-column">';
        shuffledRight.forEach((text, j) => {
            const originalIdx = q.pairs.findIndex(p => p.right === text);
            html += `<div class="matching-item matching-right" data-q="${idx}" data-pair="${originalIdx}"
                         onclick="quizEngines['${this.quizId}'].selectMatchRight(${idx}, ${originalIdx})">${text}</div>`;
        });
        html += '</div>';
        html += '</div>';

        this._matchingState = this._matchingState || {};
        this._matchingState[idx] = { selectedLeft: null, matches: {} };

        return html;
    }

    _renderDragDrop(q, idx) {
        let html = `<div id="dd-${this.quizId}-${idx}">`;
        html += '<div class="drag-items-pool">';
        const shuffledItems = [...q.items].sort(() => Math.random() - 0.5);
        shuffledItems.forEach((item, j) => {
            const origIdx = q.items.indexOf(item);
            html += `<div class="drag-item" draggable="true" data-q="${idx}" data-item="${origIdx}" 
                         id="di-${this.quizId}-${idx}-${origIdx}">${item.text || item}</div>`;
        });
        html += '</div>';
        html += '<div class="drop-zones-row">';
        q.zones.forEach((zone, j) => {
            html += `<div class="drop-zone" data-q="${idx}" data-zone="${j}" id="dz-${this.quizId}-${idx}-${j}">
                        <span class="zone-label">${zone.label}</span>
                     </div>`;
        });
        html += '</div>';
        html += '</div>';
        return html;
    }

    _initInteractions() {
        // Init drag & drop for all drag-drop questions
        this.questions.forEach((q, idx) => {
            if (q.type === 'dragdrop') {
                this._initDragDrop(idx);
            }
        });
    }

    _initDragDrop(qIdx) {
        const container = document.getElementById(`dd-${this.quizId}-${qIdx}`);
        if (!container) return;

        const items = container.querySelectorAll('.drag-item');
        const zones = container.querySelectorAll('.drop-zone');
        const pool = container.querySelector('.drag-items-pool');

        items.forEach(item => {
            // Mouse drag
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', item.id);
                item.classList.add('dragging');
            });
            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
                zones.forEach(z => z.classList.remove('highlight'));
            });

            // Touch drag
            let touchClone = null;
            let startX, startY;

            item.addEventListener('touchstart', (e) => {
                const touch = e.touches[0];
                startX = touch.clientX;
                startY = touch.clientY;
                item.classList.add('dragging');
            }, { passive: true });

            item.addEventListener('touchmove', (e) => {
                e.preventDefault();
                const touch = e.touches[0];
                const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
                zones.forEach(z => {
                    if (z === elementBelow || z.contains(elementBelow)) {
                        z.classList.add('highlight');
                    } else {
                        z.classList.remove('highlight');
                    }
                });
            }, { passive: false });

            item.addEventListener('touchend', (e) => {
                item.classList.remove('dragging');
                const touch = e.changedTouches[0];
                const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
                zones.forEach(z => {
                    z.classList.remove('highlight');
                    if (z === elementBelow || z.contains(elementBelow)) {
                        z.appendChild(item);
                    }
                });
            });
        });

        zones.forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                zone.classList.add('highlight');
            });
            zone.addEventListener('dragleave', () => {
                zone.classList.remove('highlight');
            });
            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('highlight');
                const itemId = e.dataTransfer.getData('text/plain');
                const item = document.getElementById(itemId);
                if (item) zone.appendChild(item);
            });
        });

        // Allow dropping back to pool
        pool.addEventListener('dragover', (e) => e.preventDefault());
        pool.addEventListener('drop', (e) => {
            e.preventDefault();
            const itemId = e.dataTransfer.getData('text/plain');
            const item = document.getElementById(itemId);
            if (item) pool.appendChild(item);
        });
    }

    selectOption(qIdx, optIdx) {
        if (this.submitted) return;
        this.answers[qIdx] = optIdx;
        const btns = this.container.querySelectorAll(`.option-btn[data-q="${qIdx}"]`);
        btns.forEach(btn => {
            btn.classList.remove('selected');
            if (parseInt(btn.dataset.opt) === optIdx) btn.classList.add('selected');
        });
    }

    selectTF(qIdx, value) {
        if (this.submitted) return;
        this.answers[qIdx] = value;
        const btns = this.container.querySelectorAll(`.tf-btn[data-q="${qIdx}"]`);
        btns.forEach(btn => {
            btn.classList.remove('selected');
            if (btn.dataset.val === String(value)) btn.classList.add('selected');
        });
    }

    moveItem(qIdx, btn, direction) {
        if (this.submitted) return;
        const item = btn.closest('.ordering-item');
        const list = item.parentElement;
        const items = Array.from(list.children);
        const currentIdx = items.indexOf(item);
        const newIdx = currentIdx + direction;

        if (newIdx < 0 || newIdx >= items.length) return;

        if (direction === -1) {
            list.insertBefore(item, items[newIdx]);
        } else {
            list.insertBefore(item, items[newIdx].nextSibling);
        }

        // Update numbers
        Array.from(list.children).forEach((child, i) => {
            child.querySelector('.order-num').textContent = i + 1;
        });
    }

    selectMatchLeft(qIdx, pairIdx) {
        if (this.submitted) return;
        if (!this._matchingState) this._matchingState = {};
        if (!this._matchingState[qIdx]) this._matchingState[qIdx] = { selectedLeft: null, matches: {} };

        const state = this._matchingState[qIdx];
        const container = document.getElementById(`matching-${this.quizId}-${qIdx}`);
        const leftItems = container.querySelectorAll('.matching-left');

        // Don't select already matched
        if (state.matches[pairIdx] !== undefined) return;

        leftItems.forEach(el => el.classList.remove('selected'));
        const selected = container.querySelector(`.matching-left[data-pair="${pairIdx}"]`);
        selected.classList.add('selected');
        state.selectedLeft = pairIdx;
    }

    selectMatchRight(qIdx, pairIdx) {
        if (this.submitted) return;
        if (!this._matchingState || !this._matchingState[qIdx]) return;

        const state = this._matchingState[qIdx];
        if (state.selectedLeft === null) return;

        // Check if this right item is already matched
        const alreadyMatched = Object.values(state.matches).includes(pairIdx);
        if (alreadyMatched) return;

        const container = document.getElementById(`matching-${this.quizId}-${qIdx}`);
        const leftEl = container.querySelector(`.matching-left[data-pair="${state.selectedLeft}"]`);
        const rightEl = container.querySelector(`.matching-right[data-pair="${pairIdx}"]`);

        // Record the match
        state.matches[state.selectedLeft] = pairIdx;
        leftEl.classList.remove('selected');
        leftEl.classList.add('matched');
        rightEl.classList.add('matched');

        state.selectedLeft = null;

        // Store answer
        this.answers[qIdx] = { ...state.matches };
    }

    submit() {
        if (this.submitted) return;
        this.submitted = true;

        let correct = 0;
        const total = this.questions.length;

        this.questions.forEach((q, i) => {
            const card = document.getElementById(`q-${this.quizId}-${i}`);
            const feedbackEl = document.getElementById(`feedback-${this.quizId}-${i}`);
            let isCorrect = false;

            switch (q.type) {
                case 'mcq':
                    isCorrect = this.answers[i] === q.correct;
                    this._showMCQResult(i, q, isCorrect);
                    break;
                case 'tf':
                    isCorrect = this.answers[i] === q.correct;
                    this._showTFResult(i, q, isCorrect);
                    break;
                case 'ordering':
                    isCorrect = this._checkOrdering(i, q);
                    this._showOrderingResult(i, q, isCorrect);
                    break;
                case 'matching':
                    isCorrect = this._checkMatching(i, q);
                    this._showMatchingResult(i, q, isCorrect);
                    break;
                case 'dragdrop':
                    isCorrect = this._checkDragDrop(i, q);
                    this._showDragDropResult(i, q, isCorrect);
                    break;
            }

            if (isCorrect) {
                correct++;
                card.classList.add('answered-correct');
                feedbackEl.className = 'feedback correct show';
                feedbackEl.innerHTML = `<span class="feedback-icon" style="color:var(--success); font-weight:900;">✓</span> ${q.correctFeedback || 'إجابة صحيحة! أحسنت!'}`;
            } else {
                card.classList.add('answered-wrong');
                feedbackEl.className = 'feedback wrong show';
                feedbackEl.innerHTML = `<span class="feedback-icon" style="color:var(--error); font-weight:900;">✕</span> ${q.wrongFeedback || 'إجابة خاطئة. راجع الشرح مرة أخرى.'}`;
            }
        });

        // Disable all interactions
        this.container.querySelectorAll('.option-btn, .tf-btn, .ordering-item button, .matching-item').forEach(el => {
            el.classList.add('disabled');
            el.style.pointerEvents = 'none';
        });

        // Hide check button
        const checkBtn = document.getElementById(`check-${this.quizId}`);
        if (checkBtn) checkBtn.style.display = 'none';

        // Show score
        this._showScore(correct, total);

        // Save progress
        if (window.progress) {
            window.progress.saveScore(this.quizId, correct, total);
        }

        // Callback
        if (this.onComplete) {
            this.onComplete(correct, total);
        }
    }

    _showMCQResult(idx, q, isCorrect) {
        const btns = this.container.querySelectorAll(`.option-btn[data-q="${idx}"]`);
        btns.forEach(btn => {
            const optIdx = parseInt(btn.dataset.opt);
            if (optIdx === q.correct) btn.classList.add('correct');
            if (optIdx === this.answers[idx] && !isCorrect) btn.classList.add('wrong');
        });
    }

    _showTFResult(idx, q, isCorrect) {
        const btns = this.container.querySelectorAll(`.tf-btn[data-q="${idx}"]`);
        btns.forEach(btn => {
            const val = btn.dataset.val === 'true';
            if (val === q.correct) btn.classList.add('correct');
            if (val === this.answers[idx] && !isCorrect) btn.classList.add('wrong');
        });
    }

    _checkOrdering(idx, q) {
        const list = document.getElementById(`ordering-${this.quizId}-${idx}`);
        const items = Array.from(list.children);
        return items.every((item, i) => parseInt(item.dataset.original) === (q.correctOrder ? q.correctOrder[i] : i));
    }

    _showOrderingResult(idx, q, isCorrect) {
        const list = document.getElementById(`ordering-${this.quizId}-${idx}`);
        const items = Array.from(list.children);
        items.forEach((item, i) => {
            const correctPos = q.correctOrder ? q.correctOrder[i] : i;
            if (parseInt(item.dataset.original) === correctPos) {
                item.classList.add('correct-order');
            } else {
                item.classList.add('wrong-order');
            }
        });
    }

    _checkMatching(idx, q) {
        const answer = this.answers[idx];
        if (!answer || typeof answer !== 'object') return false;
        return q.pairs.every((p, i) => answer[i] === i);
    }

    _showMatchingResult(idx, q, isCorrect) {
        if (!isCorrect) {
            const container = document.getElementById(`matching-${this.quizId}-${idx}`);
            const state = this._matchingState && this._matchingState[idx];
            if (state) {
                Object.entries(state.matches).forEach(([left, right]) => {
                    if (parseInt(left) !== parseInt(right)) {
                        const leftEl = container.querySelector(`.matching-left[data-pair="${left}"]`);
                        const rightEl = container.querySelector(`.matching-right[data-pair="${right}"]`);
                        if (leftEl) leftEl.classList.replace('matched', 'wrong-match');
                        if (rightEl) rightEl.classList.replace('matched', 'wrong-match');
                    }
                });
            }
        }
    }

    _checkDragDrop(idx, q) {
        const zones = this.container.querySelectorAll(`#dd-${this.quizId}-${idx} .drop-zone`);
        let allCorrect = true;
        zones.forEach(zone => {
            const zoneIdx = parseInt(zone.dataset.zone);
            const itemsInZone = zone.querySelectorAll('.drag-item');
            const expectedItems = q.correctMapping[zoneIdx] || [];
            const actualItems = Array.from(itemsInZone).map(el => parseInt(el.dataset.item));
            if (expectedItems.length !== actualItems.length || !expectedItems.every(e => actualItems.includes(e))) {
                allCorrect = false;
            }
        });
        return allCorrect;
    }

    _showDragDropResult(idx, q, isCorrect) {
        const zones = this.container.querySelectorAll(`#dd-${this.quizId}-${idx} .drop-zone`);
        zones.forEach(zone => {
            const zoneIdx = parseInt(zone.dataset.zone);
            const itemsInZone = zone.querySelectorAll('.drag-item');
            const expectedItems = q.correctMapping[zoneIdx] || [];
            itemsInZone.forEach(item => {
                const itemIdx = parseInt(item.dataset.item);
                if (expectedItems.includes(itemIdx)) {
                    item.classList.add('placed');
                } else {
                    item.classList.add('wrong');
                }
            });
        });
    }

    _showScore(correct, total) {
        const scoreEl = document.getElementById(`score-${this.quizId}`);
        if (!scoreEl) return;

        const percentage = Math.round((correct / total) * 100);
        let level, message;

        if (percentage >= 90) {
            level = 'excellent';
            message = 'ممتاز! أداء استثنائي متقن!';
        } else if (percentage >= 70) {
            level = 'good';
            message = 'جيد جدًا! استمر في مسار التقدم.';
        } else if (percentage >= 50) {
            level = 'needs-work';
            message = 'جيد، لكن تحتاج مراجعة بعض المفاهيم.';
        } else {
            level = 'poor';
            message = 'تحتاج إلى مراجعة الشرح والمعمل مرة أخرى.';
        }

        scoreEl.style.display = 'block';
        scoreEl.innerHTML = `
            <div class="score-circle ${level}">
                <span>${percentage}%</span>
                <span class="score-label">${correct}/${total}</span>
            </div>
            <p class="score-message">${message}</p>
        `;
        scoreEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// === Click Explore Activity ===
class ClickExploreActivity {
    constructor(containerId, config) {
        this.container = document.getElementById(containerId);
        this.hotspots = config.hotspots || [];
        this.svgContent = config.svgContent || '';
        this.discovered = new Set();
        this.onAllDiscovered = config.onAllDiscovered || null;
        this.activityId = config.activityId || containerId;
    }

    render() {
        if (!this.container) return;

        let html = `<div class="explore-container" style="position:relative;display:inline-block;">`;
        html += this.svgContent;

        this.hotspots.forEach((h, i) => {
            html += `<div class="hotspot" id="hs-${this.activityId}-${i}" 
                         style="top:${h.y}%;right:${h.x}%;" 
                         onclick="clickExplores['${this.activityId}'].toggle(${i})"
                         title="اضغط لتكتشف"></div>`;
            html += `<div class="hotspot-tooltip" id="ht-${this.activityId}-${i}" 
                         style="top:${h.tooltipY || (h.y - 5)}%;right:${h.tooltipX || (h.x + 5)}%;">
                        <div class="tooltip-title">${h.title}</div>
                        <div>${h.description}</div>
                     </div>`;
        });

        html += `</div>`;
        html += `<p style="text-align:center;color:var(--text-light);font-size:0.85rem;margin-top:0.5rem;">
                    اضغط على النقاط المضيئة لتكتشف (<span id="discover-count-${this.activityId}">0</span>/${this.hotspots.length})
                 </p>`;

        this.container.innerHTML = html;

        if (!window.clickExplores) window.clickExplores = {};
        window.clickExplores[this.activityId] = this;
    }

    toggle(idx) {
        const tooltip = document.getElementById(`ht-${this.activityId}-${idx}`);
        const hotspot = document.getElementById(`hs-${this.activityId}-${idx}`);

        // Hide all other tooltips
        this.hotspots.forEach((_, i) => {
            if (i !== idx) {
                document.getElementById(`ht-${this.activityId}-${i}`).classList.remove('visible');
            }
        });

        tooltip.classList.toggle('visible');
        hotspot.classList.add('discovered');
        this.discovered.add(idx);

        const counter = document.getElementById(`discover-count-${this.activityId}`);
        if (counter) counter.textContent = this.discovered.size;

        if (this.discovered.size === this.hotspots.length) {
            if (window.progress) {
                window.progress.markActivity(this.activityId);
            }
            if (this.onAllDiscovered) this.onAllDiscovered();
        }
    }
}

// === Matching Activity (Standalone, not quiz) ===
class MatchingActivity {
    constructor(containerId, config) {
        this.container = document.getElementById(containerId);
        this.pairs = config.pairs || [];
        this.selectedLeft = null;
        this.matches = {};
        this.activityId = config.activityId || containerId;
        this.onComplete = config.onComplete || null;
        this.feedback = config.feedback || {};
    }

    render() {
        if (!this.container) return;

        const shuffledRight = [...this.pairs].sort(() => Math.random() - 0.5);

        let html = `<div class="matching-container" id="mc-${this.activityId}">`;
        html += '<div class="matching-column">';
        this.pairs.forEach((p, i) => {
            html += `<div class="matching-item matching-left" data-idx="${i}" 
                         onclick="matchingActivities['${this.activityId}'].selectLeft(${i})">${p.left}</div>`;
        });
        html += '</div>';
        html += '<div class="matching-column">';
        shuffledRight.forEach((p) => {
            const origIdx = this.pairs.indexOf(p);
            html += `<div class="matching-item matching-right" data-idx="${origIdx}"
                         onclick="matchingActivities['${this.activityId}'].selectRight(${origIdx})">${p.right}</div>`;
        });
        html += '</div>';
        html += '</div>';
        html += `<div class="feedback" id="mfeedback-${this.activityId}"></div>`;

        this.container.innerHTML = html;

        if (!window.matchingActivities) window.matchingActivities = {};
        window.matchingActivities[this.activityId] = this;
    }

    selectLeft(idx) {
        if (this.matches[idx] !== undefined) return;
        const container = document.getElementById(`mc-${this.activityId}`);
        container.querySelectorAll('.matching-left').forEach(el => el.classList.remove('selected'));
        container.querySelector(`.matching-left[data-idx="${idx}"]`).classList.add('selected');
        this.selectedLeft = idx;
    }

    selectRight(idx) {
        if (this.selectedLeft === null) return;
        if (Object.values(this.matches).includes(idx)) return;

        const container = document.getElementById(`mc-${this.activityId}`);
        const leftEl = container.querySelector(`.matching-left[data-idx="${this.selectedLeft}"]`);
        const rightEl = container.querySelector(`.matching-right[data-idx="${idx}"]`);

        if (this.selectedLeft === idx) {
            // Correct match
            this.matches[this.selectedLeft] = idx;
            leftEl.classList.remove('selected');
            leftEl.classList.add('matched');
            rightEl.classList.add('matched');
        } else {
            // Wrong match
            leftEl.classList.add('wrong-match');
            rightEl.classList.add('wrong-match');
            setTimeout(() => {
                leftEl.classList.remove('wrong-match', 'selected');
                rightEl.classList.remove('wrong-match');
            }, 800);
        }

        this.selectedLeft = null;

        // Check completion
        if (Object.keys(this.matches).length === this.pairs.length) {
            const feedbackEl = document.getElementById(`mfeedback-${this.activityId}`);
            if (feedbackEl) {
                feedbackEl.className = 'feedback correct show';
                feedbackEl.innerHTML = `<span class="feedback-icon" style="color:var(--success); font-weight:900;">✓</span> ${this.feedback.complete || 'أحسنت! وصّلت كل الأجزاء صح!'}`;
            }
            if (window.progress) window.progress.markActivity(this.activityId);
            if (this.onComplete) this.onComplete();
        }
    }
}

// === Ordering Activity (Standalone) ===
class OrderingActivity {
    constructor(containerId, config) {
        this.container = document.getElementById(containerId);
        this.items = config.items || [];
        this.correctOrder = config.correctOrder || this.items.map((_, i) => i);
        this.activityId = config.activityId || containerId;
        this.onComplete = config.onComplete || null;
        this.feedback = config.feedback || {};
    }

    render() {
        if (!this.container) return;
        const shuffled = [...this.items].map((text, origIdx) => ({ text, origIdx })).sort(() => Math.random() - 0.5);

        let html = `<div class="ordering-list" id="ol-${this.activityId}">`;
        shuffled.forEach((item, i) => {
            html += `<div class="ordering-item" data-original="${item.origIdx}">
                        <span class="order-num">${i + 1}</span>
                        <span class="order-text">${item.text}</span>
                        <span class="order-arrows">
                            <button onclick="orderingActivities['${this.activityId}'].move(this, -1)">▲</button>
                            <button onclick="orderingActivities['${this.activityId}'].move(this, 1)">▼</button>
                        </span>
                     </div>`;
        });
        html += '</div>';
        html += `<button class="check-btn" onclick="orderingActivities['${this.activityId}'].check()">تحقق من الترتيب</button>`;
        html += `<div class="feedback" id="ofeedback-${this.activityId}"></div>`;

        this.container.innerHTML = html;

        if (!window.orderingActivities) window.orderingActivities = {};
        window.orderingActivities[this.activityId] = this;
    }

    move(btn, direction) {
        const item = btn.closest('.ordering-item');
        const list = item.parentElement;
        const items = Array.from(list.children);
        const idx = items.indexOf(item);
        const newIdx = idx + direction;

        if (newIdx < 0 || newIdx >= items.length) return;

        if (direction === -1) list.insertBefore(item, items[newIdx]);
        else list.insertBefore(item, items[newIdx].nextSibling);

        Array.from(list.children).forEach((child, i) => {
            child.querySelector('.order-num').textContent = i + 1;
            child.classList.remove('correct-order', 'wrong-order');
        });
    }

    check() {
        const list = document.getElementById(`ol-${this.activityId}`);
        const items = Array.from(list.children);
        let allCorrect = true;

        items.forEach((item, i) => {
            const origIdx = parseInt(item.dataset.original);
            if (origIdx === this.correctOrder[i]) {
                item.classList.add('correct-order');
            } else {
                item.classList.add('wrong-order');
                allCorrect = false;
            }
        });

        const feedbackEl = document.getElementById(`ofeedback-${this.activityId}`);
        if (allCorrect) {
            feedbackEl.className = 'feedback correct show';
            feedbackEl.innerHTML = `<span class="feedback-icon" style="color:var(--success); font-weight:900;">✓</span> ${this.feedback.correct || 'ترتيب صحيح! ممتاز!'}`;
            if (window.progress) window.progress.markActivity(this.activityId);
            if (this.onComplete) this.onComplete();
        } else {
            feedbackEl.className = 'feedback wrong show';
            feedbackEl.innerHTML = `<span class="feedback-icon" style="color:var(--error); font-weight:900;">✕</span> ${this.feedback.wrong || 'الترتيب غير صحيح. حاول مرة أخرى!'}`;
            // Allow retry
            setTimeout(() => {
                items.forEach(item => item.classList.remove('correct-order', 'wrong-order'));
                feedbackEl.classList.remove('show');
            }, 2000);
        }
    }
}

// === Simulation Activity ===
class SimulationActivity {
    constructor(containerId, config) {
        this.container = document.getElementById(containerId);
        this.variables = config.variables || [];
        this.calculate = config.calculate || (() => 0);
        this.resultLabel = config.resultLabel || 'النتيجة';
        this.activityId = config.activityId || containerId;
        this.explanation = config.explanation || null;
        this.visualize = config.visualize || null;
    }

    render() {
        if (!this.container) return;

        let html = '<div class="simulation-area">';
        html += '<div class="simulation-controls">';
        this.variables.forEach((v, i) => {
            html += `<div class="sim-control">
                        <label>${v.label}:</label>
                        <input type="range" id="sim-${this.activityId}-${i}" 
                               min="${v.min}" max="${v.max}" value="${v.default}" step="${v.step || 1}"
                               oninput="simulations['${this.activityId}'].update()">
                        <span class="sim-value" id="simval-${this.activityId}-${i}">${v.default}${v.unit || ''}</span>
                     </div>`;
        });
        html += '</div>';

        html += `<div class="sim-visualization" id="simviz-${this.activityId}"></div>`;
        html += `<div class="simulation-result" id="simresult-${this.activityId}">
                    <div class="result-value" id="simresultval-${this.activityId}">-</div>
                    <div class="result-label">${this.resultLabel}</div>
                 </div>`;

        if (this.explanation) {
            html += `<div class="info-box note" style="margin-top:1rem;">
                        <span class="icon" style="color:var(--info); font-weight:bold;">•</span>
                        <span>${this.explanation}</span>
                     </div>`;
        }

        html += '</div>';
        this.container.innerHTML = html;

        if (!window.simulations) window.simulations = {};
        window.simulations[this.activityId] = this;

        this.update();
    }

    update() {
        const values = {};
        this.variables.forEach((v, i) => {
            const input = document.getElementById(`sim-${this.activityId}-${i}`);
            const display = document.getElementById(`simval-${this.activityId}-${i}`);
            values[v.name] = parseFloat(input.value);
            display.textContent = input.value + (v.unit || '');
        });

        const result = this.calculate(values);
        const resultEl = document.getElementById(`simresultval-${this.activityId}`);
        if (resultEl) resultEl.textContent = typeof result === 'number' ? result.toFixed(1) : result;

        if (this.visualize) {
            const vizEl = document.getElementById(`simviz-${this.activityId}`);
            this.visualize(vizEl, values, result);
        }
    }
}

// === Drag-Drop Category Activity (Standalone) ===
class DragDropActivity {
    constructor(containerId, config) {
        this.container = document.getElementById(containerId);
        this.items = config.items || [];
        this.zones = config.zones || [];
        this.correctMapping = config.correctMapping || {};
        this.activityId = config.activityId || containerId;
        this.onComplete = config.onComplete || null;
        this.feedback = config.feedback || {};
    }

    render() {
        if (!this.container) return;

        const shuffled = [...this.items].map((item, i) => ({ ...item, origIdx: i })).sort(() => Math.random() - 0.5);

        let html = '<div class="drag-items-pool" id="pool-' + this.activityId + '">';
        shuffled.forEach(item => {
            html += `<div class="drag-item" draggable="true" data-item="${item.origIdx}" 
                         id="ddi-${this.activityId}-${item.origIdx}">${item.text}</div>`;
        });
        html += '</div>';
        html += '<div class="drop-zones-row">';
        this.zones.forEach((zone, j) => {
            html += `<div class="drop-zone" data-zone="${j}" id="ddz-${this.activityId}-${j}" style="min-width:${zone.width || '140px'}">
                        <span class="zone-label">${zone.label}</span>
                     </div>`;
        });
        html += '</div>';
        html += `<button class="check-btn" onclick="ddActivities['${this.activityId}'].check()">تحقق من الإجابة</button>`;
        html += `<div class="feedback" id="ddfeedback-${this.activityId}"></div>`;

        this.container.innerHTML = html;
        this._initDrag();

        if (!window.ddActivities) window.ddActivities = {};
        window.ddActivities[this.activityId] = this;
    }

    _initDrag() {
        const pool = document.getElementById('pool-' + this.activityId);
        const items = this.container.querySelectorAll('.drag-item');
        const zones = this.container.querySelectorAll('.drop-zone');

        items.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', item.id);
                item.classList.add('dragging');
            });
            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
                zones.forEach(z => z.classList.remove('highlight'));
            });

            // Touch support
            item.addEventListener('touchstart', (e) => {
                item.classList.add('dragging');
                item._touchData = { startX: e.touches[0].clientX, startY: e.touches[0].clientY };
            }, { passive: true });

            item.addEventListener('touchmove', (e) => {
                e.preventDefault();
                const touch = e.touches[0];
                const el = document.elementFromPoint(touch.clientX, touch.clientY);
                zones.forEach(z => {
                    z.classList.toggle('highlight', z === el || z.contains(el));
                });
            }, { passive: false });

            item.addEventListener('touchend', (e) => {
                item.classList.remove('dragging');
                const touch = e.changedTouches[0];
                const el = document.elementFromPoint(touch.clientX, touch.clientY);
                zones.forEach(z => {
                    z.classList.remove('highlight');
                    if (z === el || z.contains(el)) {
                        z.appendChild(item);
                    }
                });
            });
        });

        const allDropTargets = [pool, ...zones];
        allDropTargets.forEach(target => {
            target.addEventListener('dragover', (e) => {
                e.preventDefault();
                if (target.classList.contains('drop-zone')) target.classList.add('highlight');
            });
            target.addEventListener('dragleave', () => {
                target.classList.remove('highlight');
            });
            target.addEventListener('drop', (e) => {
                e.preventDefault();
                target.classList.remove('highlight');
                const itemId = e.dataTransfer.getData('text/plain');
                const item = document.getElementById(itemId);
                if (item) target.appendChild(item);
            });
        });
    }

    check() {
        let allCorrect = true;
        const zones = this.container.querySelectorAll('.drop-zone');

        // Reset
        this.container.querySelectorAll('.drag-item').forEach(item => {
            item.classList.remove('placed', 'wrong');
        });

        zones.forEach(zone => {
            const zoneIdx = parseInt(zone.dataset.zone);
            const itemsInZone = zone.querySelectorAll('.drag-item');
            const expected = this.correctMapping[zoneIdx] || [];
            const actual = Array.from(itemsInZone).map(el => parseInt(el.dataset.item));

            itemsInZone.forEach(item => {
                const itemIdx = parseInt(item.dataset.item);
                if (expected.includes(itemIdx)) {
                    item.classList.add('placed');
                } else {
                    item.classList.add('wrong');
                    allCorrect = false;
                }
            });

            // Check if all expected items are present
            if (expected.length !== actual.length || !expected.every(e => actual.includes(e))) {
                allCorrect = false;
            }
        });

        const feedbackEl = document.getElementById(`ddfeedback-${this.activityId}`);
        if (allCorrect) {
            feedbackEl.className = 'feedback correct show';
            feedbackEl.innerHTML = `<span class="feedback-icon" style="color:var(--success); font-weight:900;">✓</span> ${this.feedback.correct || 'إجابة صحيحة! أحسنت!'}`;
            if (window.progress) window.progress.markActivity(this.activityId);
            if (this.onComplete) this.onComplete();
        } else {
            feedbackEl.className = 'feedback wrong show';
            feedbackEl.innerHTML = `<span class="feedback-icon" style="color:var(--error); font-weight:900;">✕</span> ${this.feedback.wrong || 'بعض العناصر في المكان الخطأ. حاول مرة أخرى!'}`;
            setTimeout(() => {
                this.container.querySelectorAll('.drag-item.wrong').forEach(item => {
                    item.classList.remove('wrong');
                });
                feedbackEl.classList.remove('show');
            }, 2500);
        }
    }
}

// === Utility Functions ===
function updateProgressBar() {
    if (!window.progress) return;
    const overall = window.progress.getOverallProgress();
    const bar = document.querySelector('.progress-bar-mini .fill');
    const text = document.querySelector('.progress-text');
    if (bar) bar.style.width = overall + '%';
    if (text) text.textContent = overall + '%';
}

function navigateTo(page) {
    window.location.href = page;
}

// === Initialize on page load ===
document.addEventListener('DOMContentLoaded', () => {
    window.progress = new ProgressManager();
    updateProgressBar();

    // Update station cards if on main page
    const stationCards = document.querySelectorAll('.station-card');
    stationCards.forEach(card => {
        const station = card.dataset.station;
        if (station) {
            const prog = window.progress.getStationProgress(station);
            const bar = card.querySelector('.station-progress .bar .fill');
            const text = card.querySelector('.station-progress .prog-text');
            if (bar) bar.style.width = prog + '%';
            if (text) text.textContent = prog + '%';
            if (prog === 100) card.classList.add('completed');
        }
    });
});

