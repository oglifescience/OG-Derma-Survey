/* ============================================================
   survey.js — Survey state machine + Google Forms integration
   ============================================================

   SETUP: Replace the TODO constants below with your Google Form values.
   See SETUP.md for step-by-step instructions.
   ============================================================ */

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyKfSsAPUldmAJsi4OEL0N1cIUjx3nSxMXGYUqumWE0W1sIjeJ2o50Ata0EamZ_fgVohw/exec';

// ── SURVEY QUESTIONS DATA ────────────────────────────────────
const SURVEY_QUESTIONS = [
  {
    id: 'q1',
    type: 'text',
    text: 'In one line — what made you pick this?',
    placeholder: 'e.g. The ingredients were honest…',
  },
  {
    id: 'q2',
    type: 'likert',
    text: 'Knowing exactly what\'s in your cleanser matters to me.',
    ends: ['Strongly Disagree', 'Strongly Agree'],
    options: [
      { value: '1', label: 'Not at all' },
      { value: '2', label: 'Not really' },
      { value: '3', label: 'Somewhat' },
      { value: '4', label: 'Quite a lot' },
      { value: '5', label: 'Absolutely, it\'s everything' },
    ],
  },
  {
    id: 'q3',
    type: 'likert',
    text: 'My skin has a specific type AND a specific concern — I want a product built for that exact combination, not a generic formula.',
    options: [
      { value: '1', label: 'Strongly Disagree', hint: 'Generic products work fine' },
      { value: '2', label: 'Disagree', hint: '' },
      { value: '3', label: 'Slightly Disagree', hint: '' },
      { value: '4', label: 'Slightly Agree', hint: '' },
      { value: '5', label: 'Agree', hint: '' },
      { value: '6', label: 'Strongly Agree', hint: 'Need my exact combo' },
    ],
  },
  {
    id: 'q4',
    type: 'scale',
    text: 'How appealing is this to you Your skin. Your problem. We’ve got the product. No marketing jargon',
    options: [
      { value: '1', label: 'Not appealing', hint: 'I want full ingredient details' },
      { value: '2', label: 'Slightly', hint: 'Actives matter to me' },
      { value: '3', label: 'Somewhat', hint: 'Some info is fine' },
      { value: '4', label: 'Very appealing', hint: 'No jargon, just tell me it\'s for me' },
      { value: '5', label: 'Exactly this!', hint: 'Skin type + concern = done' },
    ],
  },
  {
    id: 'q5',
    type: 'likert',
    text: 'How likely are you to recommend this product to a friend?',
    ends: ['Never', 'Definitely!'],
    options: [
      { value: '1', label: 'Never' },
      { value: '2', label: 'Unlikely' },
      { value: '3', label: 'Maybe' },
      { value: '4', label: 'Likely' },
      { value: '5', label: 'Definitely!' },
    ],
  },
  {
    id: 'q6',
    type: 'pick',
    text: 'How do you prefer to learn about your skincare?',
    options: [
      { value: 'Read label', label: '📖', sublabel: 'Read the label' },
      { value: 'QR video', label: '📱', sublabel: 'Scan QR → short video' },
      { value: 'Derm / influencer', label: '👩‍⚕️', sublabel: 'Trust a derm / influencer' },
      { value: 'Other', label: '✍️', sublabel: 'Other' },
    ],
  },
];

// ── STATE ────────────────────────────────────────────────────
const surveyState = {
  product: null,       // product id
  productData: null,   // full product object
  screen: 'demo',     // 'demo' | 'questions'
  currentQ: 0,         // 0-indexed within SURVEY_QUESTIONS
  name: '',            // respondent name
  age: '',             // selected age range
  answers: {},         // { q1, q2, q3, q4, q5, q6 }
};

// ── DOM REFS ─────────────────────────────────────────────────
const modal = document.getElementById('checkout-modal');
const modalPanel = modal.querySelector('.modal-panel');
const closeBtn = document.getElementById('modal-close-btn');
const modalThumb = document.getElementById('modal-thumb');
const modalBrand = document.getElementById('modal-brand');
const modalProductName = document.getElementById('modal-product-name');
const modalPriceEl = document.getElementById('modal-price');
const progressFill = document.getElementById('modal-progress-fill');
const progressLabel = document.getElementById('modal-progress-label');
const questionText = document.getElementById('modal-question-text');
const optionsContainer = document.getElementById('modal-options');
const btnBack = document.getElementById('btn-back');
const btnNext = document.getElementById('btn-next');
const questionArea = document.getElementById('modal-question-area');
const thankyouScreen = document.getElementById('modal-thankyou');
const thankyouProduct = document.getElementById('thankyou-product');
const btnDone = document.getElementById('btn-done');
const preamble = document.getElementById('modal-preamble');

// ── PUBLIC API ───────────────────────────────────────────────

/**
 * Open the survey modal for a given product.
 * Called by app.js when "Buy Now" is clicked.
 * @param {string} productId - 'veritas' | 'skn'
 * @param {Object} product   - product data object
 */
function openModal(productId, product) {
  // Reset state
  surveyState.product = productId;
  surveyState.productData = product;
  surveyState.currentQ = 0;
  surveyState.answers = {};

  // Populate product summary header
  modalThumb.src = window.__ASSET_VERSION__
    ? (product.image + (product.image.includes('?') ? '&' : '?') + 'v=' + window.__ASSET_VERSION__)
    : product.image;
  modalThumb.alt = product.name;
  modalBrand.textContent = product.brand;
  modalProductName.textContent = product.name;
  modalPriceEl.textContent = '₹' + product.price;

  // Update preamble with selected product name highlighted
  preamble.innerHTML = `
    <span class="selected-product-tag">
      ✓ You selected: <strong>${escHtml(product.brand)} — ${escHtml(product.name)}</strong>
    </span>
    <span class="preamble-sub">Help us understand your choice — 6 quick questions.</span>
  `;
  preamble.hidden = false;

  // Show question area, hide thank you
  questionArea.hidden = false;
  thankyouScreen.hidden = true;
  document.getElementById('modal-progress-wrap').style.display = 'block';
  preamble.style.display = 'flex';
  document.getElementById('modal-product-summary').style.display = 'flex';

  // Show modal
  modal.hidden = false;
  document.body.style.overflow = 'hidden';

  requestAnimationFrame(() => {
    modal.classList.add('visible');
  });

  renderPreview();
}

// ── INTERNAL FUNCTIONS ───────────────────────────────────────

// SCREEN -1: Preview (Buy Now)
function renderPreview() {
  surveyState.screen = 'preview';

  document.getElementById('modal-progress-wrap').style.display = 'none';
  preamble.style.display = 'none';
  document.getElementById('modal-product-summary').style.display = 'none'; // hide top summary to give max space for preview

  questionText.style.display = 'none';
  questionText.textContent = '';

  let previewContent = `
    <div style="text-align: center; margin-top: -20px; margin-bottom: 5px;">
      <h2 style="font-size: 1.25rem; font-weight: 700; color: var(--color-text); margin: 0;">${escHtml(surveyState.productData.brand)}</h2>
      <p style="font-size: 0.9rem; color: var(--color-text-secondary); margin: 4px 0 0 0;">${escHtml(surveyState.productData.name)}</p>
    </div>
  `;
  if (surveyState.product === 'veritas') {
    previewContent += `
      <div class="preview-carousel preview-carousel--veritas">
        <img src="assets/images%20of%20concepts/IMG_1295.jpg?v=${Date.now()}" alt="Veritas Concept 1">
        <img src="assets/images%20of%20concepts/IMG_1296.jpg?v=${Date.now()}" alt="Veritas Concept 2">
        <div class="landscape-wrapper" style="flex: 0 0 100%; height: 50vh; overflow: hidden; scroll-snap-align: start; background-color: rgb(229, 239, 255); display: flex; align-items: center; justify-content: center;">
          <img src="assets/images%20of%20concepts/IMG_1297.jpg?v=${Date.now()}" alt="Veritas Concept 3" style="width: 100%; height: 100%; object-fit: contain; transform: scale(1);">
        </div>
      </div>
      <div class="carousel-hint">Swipe left to see more →</div>
      <p style="font-size: 0.9rem; color: var(--color-text-secondary); text-align: center; margin-bottom: 0;">
        What you see is what you get. Zero secrets, zero fluff. Just the exact formula your skin needs to remove acne and control oil.
      </p>
    `;
  } else if (surveyState.product === 'skn') {
    previewContent += `
      <div class="preview-carousel">
        <img src="assets/images%20of%20concepts/IMG_1286.jpg?v=${Date.now()}" alt="Skn Concept 1">
        <img src="assets/images%20of%20concepts/IMG_1288.jpg?v=${Date.now()}" alt="Skn Concept 2">
        <img src="assets/images%20of%20concepts/IMG_1289.jpg?v=${Date.now()}" alt="Skn Concept 3">
        <div class="landscape-wrapper" style="flex: 0 0 100%; height: 50vh; overflow: hidden; scroll-snap-align: start; background-color: rgb(224, 233, 255); display: flex; align-items: center; justify-content: center;">
          <img src="assets/images%20of%20concepts/IMG_1287.jpg?v=${Date.now()}" alt="Skn Concept 4" style="width: 100%; height: 100%; object-fit: contain; transform: scale(1);">
        </div>
      </div>
      <div class="carousel-hint">Swipe left to see more →</div>
      <p style="font-size: 0.9rem; color: var(--color-text-secondary); text-align: center; margin-bottom: 0; line-height: 1.5;">
        Skincare was never supposed to be this complicated. We just clear your pores and stop oil rebound. Zero fluff. 100% facts.
      </p>
    `;
  } else {
    const images = surveyState.productData.carouselImages || [surveyState.productData.image];
    previewContent += `
      <div class="preview-carousel">
        ${images.map((img, i) => `<img src="${escHtml(img)}" alt="Product Image ${i + 1}">`).join('')}
      </div>
      ${images.length > 1 ? '<div class="carousel-hint">Swipe left to see more &rarr;</div>' : ''}
      <p style="font-size: 0.9rem; color: var(--color-text-secondary); text-align: center; margin-bottom: 0;">
        ${escHtml(surveyState.productData.tagline || '')}
      </p>
    `;
  }

  optionsContainer.innerHTML = previewContent;
  optionsContainer.style.marginBottom = '16px';

  btnBack.style.visibility = 'hidden';
  btnNext.disabled = false;
  btnNext.textContent = 'Buy Now →';
}

// SCREEN 0: Demographics (Name + Age Range)
function renderDemographics() {
  surveyState.screen = 'demo';

  // Progress: step 0 of total (6 questions + 1 demo screen = 8 total steps)
  document.getElementById('modal-progress-wrap').style.display = 'block';
  document.getElementById('modal-product-summary').style.display = 'flex';
  progressFill.style.width = '0%';
  progressLabel.textContent = 'Step 1 of 8 — About you';

  questionText.style.display = 'block';
  questionText.textContent = 'Quick intro before we start ✦';
  preamble.style.display = 'flex';

  // Build demographics UI
  const AGE_OPTIONS = ['15 – 20', '20 – 25', '25 – 30', 'Others'];
  const savedAge = surveyState.age;

  optionsContainer.innerHTML = `
    <!-- Name field -->
    <div class="demo-field">
      <label class="demo-label" for="demo-name">Your Name</label>
      <input
        type="text"
        id="demo-name"
        class="demo-input"
        placeholder="e.g. Priya"
        value="${escHtml(surveyState.name)}"
        autocomplete="given-name"
        maxlength="60"
      />
    </div>

    <!-- Age range -->
    <div class="demo-field">
      <label class="demo-label">Age Range</label>
      <div class="demo-age-grid" role="radiogroup" aria-label="Age range">
        ${AGE_OPTIONS.map((opt, i) => `
          <label class="age-chip ${savedAge === opt ? 'selected' : ''}" for="age-${i}">
            <input type="radio" id="age-${i}" name="age-range" value="${escHtml(opt)}" ${savedAge === opt ? 'checked' : ''} />
            ${escHtml(opt)}
          </label>
        `).join('')}
      </div>
    </div>
  `;

  // Wire name input
  const nameInput = document.getElementById('demo-name');
  nameInput.addEventListener('input', () => {
    surveyState.name = nameInput.value.trim();
    validateDemo();
  });

  // Wire age chips
  optionsContainer.querySelectorAll('.age-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const radio = chip.querySelector('input');
      surveyState.age = radio.value;
      optionsContainer.querySelectorAll('.age-chip').forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      validateDemo();
    });
  });

  btnBack.style.visibility = 'visible';
  validateDemo();
  btnNext.textContent = 'Next →';
}

function validateDemo() {
  // Name required (at least 1 char) + age required
  const nameOk = surveyState.name.length > 0;
  const ageOk = surveyState.age.length > 0;
  btnNext.disabled = !(nameOk && ageOk);
}

// SCREENS 1-6: Survey questions
function renderQuestion(index) {
  surveyState.screen = 'questions';
  const q = SURVEY_QUESTIONS[index];
  const total = SURVEY_QUESTIONS.length;

  // Progress: demo was step 1, questions are steps 2-7, submit is step 8
  const pct = Math.round(((index + 1) / (total + 1)) * 100);
  progressFill.style.width = pct + '%';
  progressLabel.textContent = `Step ${index + 2} of 8 — Question ${index + 1} of ${total}`;

  questionText.style.display = 'block';
  questionText.textContent = q.text;
  questionText.focus();

  // Hide preamble once questions start
  preamble.style.display = 'none';

  optionsContainer.innerHTML = '';
  optionsContainer.style.marginBottom = '';

  // ── Text (open-ended) ──────────────────────────────────────
  if (q.type === 'text') {
    const saved = surveyState.answers[q.id] || '';
    optionsContainer.innerHTML = `
      <div class="open-text-wrap">
        <textarea
          id="open-text-${q.id}"
          class="open-text-input"
          placeholder="${escHtml(q.placeholder || '')}"
          maxlength="200"
          rows="4"
        >${escHtml(saved)}</textarea>
        <div class="open-text-hint">Your very first unfiltered thought! ✦</div>
      </div>
    `;
    const ta = document.getElementById(`open-text-${q.id}`);
    ta.addEventListener('input', () => {
      surveyState.answers[q.id] = ta.value.trim();
      btnNext.disabled = surveyState.answers[q.id].length === 0;
    });
    btnBack.style.visibility = 'visible';
    btnNext.disabled = saved.length === 0;
    btnNext.textContent = 'Next →';
    return;
  }

  // ── Stars (1–5 star rating) ────────────────────────────────
  if (q.type === 'stars') {
    const saved = surveyState.answers[q.id] || null;
    let starHtml = '<div class="star-rating-wrap">';
    q.options.forEach(opt => {
      const sel = saved === opt.value ? 'selected' : '';
      starHtml += `
        <button type="button" class="star-btn ${sel}" data-value="${escHtml(opt.value)}" aria-label="${escHtml(opt.label)}">
          <span class="star-icon">★</span>
          <span class="star-label">${escHtml(opt.label)}</span>
        </button>`;
    });
    starHtml += '</div>';
    optionsContainer.innerHTML = starHtml;
    optionsContainer.querySelectorAll('.star-btn').forEach((btn, i) => {
      btn.addEventListener('mouseenter', () => highlightStars(i));
      btn.addEventListener('mouseleave', () => restoreStars(q.id, q.options));
      btn.addEventListener('click', () => {
        surveyState.answers[q.id] = btn.dataset.value;
        selectStar(btn.dataset.value, q.options);
        btnNext.disabled = false;
      });
    });
    if (saved) selectStar(saved, q.options);
    btnBack.style.visibility = 'visible';
    btnNext.disabled = !saved;
    btnNext.textContent = 'Next →';
    return;
  }

  // ── Likert (agree/disagree or linear numeric scale) ────────
  if (q.type === 'likert') {
    const saved = surveyState.answers[q.id] || null;
    const leftEnd = q.ends ? q.ends[0] : 'Strongly Disagree';
    const rightEnd = q.ends ? q.ends[1] : 'Strongly Agree';

    let html = '<div class="likert-wrap">';
    html += `<div class="likert-ends"><span>${escHtml(leftEnd)}</span><span>${escHtml(rightEnd)}</span></div>`;
    html += '<div class="likert-row">';
    q.options.forEach(opt => {
      const sel = saved === opt.value ? 'selected' : '';
      html += `<button type="button" class="likert-btn ${sel}" data-value="${escHtml(opt.value)}" title="${escHtml(opt.hint || opt.label)}">${escHtml(opt.value)}</button>`;
    });
    html += '</div>';
    if (saved) {
      const selOpt = q.options.find(o => o.value === saved);
      html += `<div class="likert-selected-label">${escHtml(selOpt ? selOpt.label : '')}</div>`;
    } else {
      html += '<div class="likert-selected-label"></div>';
    }
    html += '</div>';
    optionsContainer.innerHTML = html;

    const lbl = optionsContainer.querySelector('.likert-selected-label');
    optionsContainer.querySelectorAll('.likert-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        surveyState.answers[q.id] = btn.dataset.value;
        optionsContainer.querySelectorAll('.likert-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        const selOpt = q.options.find(o => o.value === btn.dataset.value);
        if (lbl) {
          lbl.textContent = selOpt ? selOpt.label : '';
        }
        btnNext.disabled = false;
      });
    });
    btnBack.style.visibility = 'visible';
    btnNext.disabled = !saved;
    const isLast = index === total - 1;
    btnNext.textContent = isLast ? 'Submit ✓' : 'Next →';
    return;
  }

  // ── Scale (1–5 pill row) ───────────────────────────────────
  if (q.type === 'scale') {
    const saved = surveyState.answers[q.id] || null;
    let html = '<div class="scale-wrap">';
    q.options.forEach(opt => {
      const sel = saved === opt.value ? 'selected' : '';
      html += `
        <button type="button" class="scale-btn ${sel}" data-value="${escHtml(opt.value)}">
          <span class="scale-num">${escHtml(opt.value)}</span>
          <span class="scale-label">${escHtml(opt.label)}</span>
          ${opt.hint ? `<span class="scale-hint">${escHtml(opt.hint)}</span>` : ''}
        </button>`;
    });
    html += '</div>';
    optionsContainer.innerHTML = html;
    optionsContainer.querySelectorAll('.scale-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        surveyState.answers[q.id] = btn.dataset.value;
        optionsContainer.querySelectorAll('.scale-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        btnNext.disabled = false;
      });
    });
    btnBack.style.visibility = 'visible';
    btnNext.disabled = !saved;
    const isLast = index === total - 1;
    btnNext.textContent = isLast ? 'Submit ✓' : 'Next →';
    return;
  }

  // ── Pick (emoji quick-pick) ────────────────────────────────
  if (q.type === 'pick') {
    const saved = surveyState.answers[q.id] || null;
    const isOtherSaved = saved && (saved === 'Other' || saved.startsWith('Other:'));
    const otherText = isOtherSaved && saved.startsWith('Other:') ? saved.replace(/^Other:\s*/, '') : '';

    let html = '<div class="pick-wrap">';
    q.options.forEach(opt => {
      let isSel = false;
      if (opt.value === 'Other') {
        isSel = isOtherSaved;
      } else {
        isSel = saved === opt.value;
      }
      const selClass = isSel ? 'selected' : '';
      html += `
        <button type="button" class="pick-btn ${selClass}" data-value="${escHtml(opt.value)}">
          <span class="pick-emoji">${opt.label}</span>
          <span class="pick-sublabel">${escHtml(opt.sublabel)}</span>
        </button>`;
    });
    html += '</div>';

    // Other text field (shown when "Other" is selected)
    html += `
      <div class="pick-other-wrap" id="pick-other-wrap" style="display: ${isOtherSaved ? 'block' : 'none'};">
        <input
          type="text"
          id="pick-other-input"
          class="open-text-input"
          placeholder="Please tell us how you prefer to learn…"
          maxlength="150"
          value="${escHtml(otherText)}"
        />
      </div>
    `;

    optionsContainer.innerHTML = html;

    const otherWrap = document.getElementById('pick-other-wrap');
    const otherInput = document.getElementById('pick-other-input');

    optionsContainer.querySelectorAll('.pick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        optionsContainer.querySelectorAll('.pick-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');

        if (btn.dataset.value === 'Other') {
          otherWrap.style.display = 'block';
          const typed = otherInput.value.trim();
          surveyState.answers[q.id] = typed ? `Other: ${typed}` : 'Other';
          otherInput.focus();
        } else {
          otherWrap.style.display = 'none';
          surveyState.answers[q.id] = btn.dataset.value;
        }

        btnNext.disabled = false;
      });
    });

    if (otherInput) {
      otherInput.addEventListener('input', () => {
        const typed = otherInput.value.trim();
        surveyState.answers[q.id] = typed ? `Other: ${typed}` : 'Other';
      });
    }

    btnBack.style.visibility = 'visible';
    btnNext.disabled = !saved;
    const isLast = index === total - 1;
    btnNext.textContent = isLast ? 'Submit ✓' : 'Next →';
    return;
  }

  btnBack.style.visibility = 'visible';
  const hasAnswer = !!surveyState.answers[q.id];
  btnNext.disabled = !hasAnswer;
  const isLast = index === total - 1;
  btnNext.textContent = isLast ? 'Submit ✓' : 'Next →';
}

// Star rating helpers
function highlightStars(upToIndex) {
  const btns = optionsContainer.querySelectorAll('.star-btn');
  btns.forEach((b, i) => b.classList.toggle('hovered', i <= upToIndex));
}
function restoreStars(qId, options) {
  const saved = surveyState.answers[qId];
  const btns = optionsContainer.querySelectorAll('.star-btn');
  btns.forEach(b => {
    b.classList.remove('hovered');
    b.classList.toggle('selected', saved === b.dataset.value);
  });
}
function selectStar(value, options) {
  const btns = optionsContainer.querySelectorAll('.star-btn');
  const idx = options.findIndex(o => o.value === value);
  btns.forEach((b, i) => {
    b.classList.toggle('selected', i <= idx);
  });
}

function selectOption(questionId, value, qIndex) {
  surveyState.answers[questionId] = value;

  // Update visual state of all options
  const allOptions = optionsContainer.querySelectorAll('.survey-option');
  allOptions.forEach((opt) => {
    const input = opt.querySelector('input');
    const isThis = input && input.value === value;
    opt.classList.toggle('selected', isThis);
    opt.setAttribute('aria-checked', isThis ? 'true' : 'false');
    if (isThis) input.checked = true;
  });

  // Enable next button
  btnNext.disabled = false;
}

function nextQuestion() {
  // Preview screen -> go to Demographics
  if (surveyState.screen === 'preview') {
    renderDemographics();
    return;
  }

  // Demographics screen → go to Q1
  if (surveyState.screen === 'demo') {
    if (!surveyState.name || !surveyState.age) return;
    surveyState.currentQ = 0;
    renderQuestion(0);
    return;
  }

  // Question screens
  const q = SURVEY_QUESTIONS[surveyState.currentQ];
  if (!surveyState.answers[q.id]) return;

  const isLast = surveyState.currentQ === SURVEY_QUESTIONS.length - 1;
  if (isLast) {
    submitSurvey();
  } else {
    surveyState.currentQ++;
    renderQuestion(surveyState.currentQ);
  }
}

function prevQuestion() {
  // On demo → go back to preview
  if (surveyState.screen === 'demo') {
    renderPreview();
    return;
  }

  // On Q1 → go back to demographics
  if (surveyState.screen === 'questions' && surveyState.currentQ === 0) {
    renderDemographics();
    return;
  }
  if (surveyState.currentQ > 0) {
    surveyState.currentQ--;
    renderQuestion(surveyState.currentQ);
  }
}

async function submitSurvey() {
  btnNext.disabled = true;
  btnNext.textContent = 'Submitting…';

  const { answers, productData } = surveyState;
  const payload = {
    name: surveyState.name,
    age: surveyState.age,
    product: `${productData.brand} — ${productData.name}`,
    q1: answers.q1 || '',
    q2: answers.q2 || '',
    q3: answers.q3 || '',
    q4: answers.q4 || '',
    q5: answers.q5 || '',
    q6: answers.q6 || '',
  };

  try {
    await fetch(SCRIPT_URL, {
      method: 'POST',
      // Apps Script requires text/plain to skip CORS preflight on static sites
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload),
    });
  } catch (_err) {
    // Cross-origin responses are opaque — submission still lands in the Sheet.
  }

  showThankYou();
}

function showThankYou() {
  // Update progress to 100%
  progressFill.style.width = '100%';
  progressLabel.textContent = 'Complete ✓';

  // Transition screens
  questionArea.hidden = true;
  thankyouScreen.hidden = false;

  const p = surveyState.productData;
  thankyouProduct.textContent = `Selected: ${p.brand} — ${p.name} · ₹${p.price}`;
}

function closeModal() {
  modal.classList.remove('visible');
  document.body.style.overflow = '';

  // Wait for fade-out animation before hiding
  setTimeout(() => {
    modal.hidden = true;
    // Full reset for next open
    questionArea.hidden = false;
    thankyouScreen.hidden = true;
    progressFill.style.width = '0%';
    surveyState.screen = 'demo';
    surveyState.name = '';
    surveyState.age = '';
    surveyState.answers = {};
    surveyState.currentQ = 0;
  }, 320);
}

// ── EVENT LISTENERS ──────────────────────────────────────────
closeBtn.addEventListener('click', closeModal);
btnDone.addEventListener('click', closeModal);
btnNext.addEventListener('click', nextQuestion);
btnBack.addEventListener('click', prevQuestion);

// Close on overlay click (not panel)
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

// Close on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modal.hidden) closeModal();
});

// ── UTILITY ──────────────────────────────────────────────────
function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
