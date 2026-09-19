/* ============================================================
   survey.js — Survey state machine + Google Forms integration
   ============================================================

   SETUP: Replace the TODO constants below with your Google Form values.
   See SETUP.md for step-by-step instructions.
   ============================================================ */

// ── CONFIGURATION ────────────────────────────────────────────
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwfRRnUvp-7tFdd5UNJw1g1wFIb392oUEZ1OoBDNGTHxNexZS-8mgENlcZTldHijzAXVQ/exec';

// ── SURVEY QUESTIONS DATA ────────────────────────────────────
const SURVEY_QUESTIONS = [
  {
    id: 'q1',
    text: 'What primarily drove your choice to select this cleanser today?',
    options: [
      'The complete transparency of the ingredients',
      'It was perfectly matched to my skin type & problem',
      'The brand attitude and aesthetic',
      "I'm looking for something better than my current routine",
    ],
  },
  {
    id: 'q2',
    text: "What's your biggest frustration with your current acne/oil-control products?",
    options: [
      "They're too harsh and strip my skin",
      "I don't understand half the chemicals in them",
      'They overpromise and underdeliver',
      'The routines are too complicated',
    ],
  },
  {
    id: 'q3',
    text: 'If you described this product to a friend based on what you saw today, what would you say?',
    options: [
      '"It\'s super honest about exactly what\'s inside"',
      '"It makes figuring out skincare incredibly easy"',
      '"It looks like a premium, science-backed brand"',
      '"It\'s a cool new brand I want to try"',
    ],
  },
  {
    id: 'q4',
    text: 'How do you prefer to learn about the science behind your skincare?',
    options: [
      'Reading the ingredient label / website details',
      'Scanning a QR code for a short video breakdown',
      "Trusting a derm or influencer's recommendation",
      "I don't care, as long as it works",
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
  answers: {},         // { q1, q2, q3, q4 }
};

// ── DOM REFS ─────────────────────────────────────────────────
const modal            = document.getElementById('checkout-modal');
const modalPanel       = modal.querySelector('.modal-panel');
const closeBtn         = document.getElementById('modal-close-btn');
const modalThumb       = document.getElementById('modal-thumb');
const modalBrand       = document.getElementById('modal-brand');
const modalProductName = document.getElementById('modal-product-name');
const modalPriceEl     = document.getElementById('modal-price');
const progressFill     = document.getElementById('modal-progress-fill');
const progressLabel    = document.getElementById('modal-progress-label');
const questionText     = document.getElementById('modal-question-text');
const optionsContainer = document.getElementById('modal-options');
const btnBack          = document.getElementById('btn-back');
const btnNext          = document.getElementById('btn-next');
const questionArea     = document.getElementById('modal-question-area');
const thankyouScreen   = document.getElementById('modal-thankyou');
const thankyouProduct  = document.getElementById('thankyou-product');
const btnDone          = document.getElementById('btn-done');
const preamble         = document.getElementById('modal-preamble');

// ── PUBLIC API ───────────────────────────────────────────────

/**
 * Open the survey modal for a given product.
 * Called by app.js when "Buy Now" is clicked.
 * @param {string} productId - 'veritas' | 'skn'
 * @param {Object} product   - product data object
 */
function openModal(productId, product) {
  // Reset state
  surveyState.product     = productId;
  surveyState.productData = product;
  surveyState.currentQ    = 0;
  surveyState.answers     = {};

  // Populate product summary header
  modalThumb.src          = product.image;
  modalThumb.alt          = product.name;
  modalBrand.textContent  = product.brand;
  modalProductName.textContent = product.name;
  modalPriceEl.textContent = '₹' + product.price;

  // Update preamble with selected product name highlighted
  preamble.innerHTML = `
    <span class="selected-product-tag">
      ✓ You selected: <strong>${escHtml(product.brand)} — ${escHtml(product.name)}</strong>
    </span>
    <span class="preamble-sub">Help us understand your choice — 4 quick questions.</span>
  `;
  preamble.hidden = false;

  // Show question area, hide thank you
  questionArea.hidden    = false;
  thankyouScreen.hidden  = true;

  // Show modal
  modal.hidden = false;
  document.body.style.overflow = 'hidden';

  requestAnimationFrame(() => {
    modal.classList.add('visible');
  });

  renderDemographics();
}

// ── INTERNAL FUNCTIONS ───────────────────────────────────────

// SCREEN 0: Demographics (Name + Age Range)
function renderDemographics() {
  surveyState.screen = 'demo';

  // Progress: step 0 of total (4 questions + 1 demo screen = 5 total steps)
  progressFill.style.width = '0%';
  progressLabel.textContent = 'Step 1 of 6 — About you';

  questionText.textContent = 'Quick intro before we start ✦';
  preamble.hidden = false;

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

  btnBack.style.visibility = 'hidden';
  validateDemo();
  btnNext.textContent = 'Next →';
}

function validateDemo() {
  // Name required (at least 1 char) + age required
  const nameOk = surveyState.name.length > 0;
  const ageOk  = surveyState.age.length > 0;
  btnNext.disabled = !(nameOk && ageOk);
}

// SCREENS 1-4: Survey questions
function renderQuestion(index) {
  surveyState.screen = 'questions';
  const q = SURVEY_QUESTIONS[index];
  const total = SURVEY_QUESTIONS.length;

  // Progress: demo was step 1, questions are steps 2-5, submit is step 6
  const pct = Math.round(((index + 1) / (total + 1)) * 100);
  progressFill.style.width = pct + '%';
  progressLabel.textContent = `Step ${index + 2} of 6 — Question ${index + 1} of ${total}`;

  questionText.textContent = q.text;
  questionText.focus();

  // Hide preamble once questions start
  preamble.hidden = true;

  // Render options
  optionsContainer.innerHTML = '';
  q.options.forEach((optText, i) => {
    const optId = `opt-${index}-${i}`;
    const div = document.createElement('label');
    div.className = 'survey-option';
    div.setAttribute('for', optId);
    div.setAttribute('role', 'radio');
    div.setAttribute('aria-checked', 'false');
    div.setAttribute('tabindex', '0');

    const alreadySelected = surveyState.answers[q.id] === optText;
    if (alreadySelected) {
      div.classList.add('selected');
      div.setAttribute('aria-checked', 'true');
    }

    div.innerHTML = `
      <input type="radio" id="${optId}" name="survey-q${index}" value="${escHtml(optText)}" ${alreadySelected ? 'checked' : ''} />
      <span class="option-dot"></span>
      <span class="option-label">${escHtml(optText)}</span>
    `;

    div.addEventListener('click', () => selectOption(q.id, optText, index));
    div.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectOption(q.id, optText, index);
      }
    });

    optionsContainer.appendChild(div);
  });

  btnBack.style.visibility = 'visible';

  const hasAnswer = !!surveyState.answers[q.id];
  btnNext.disabled = !hasAnswer;

  const isLast = index === total - 1;
  btnNext.textContent = isLast ? 'Submit ✓' : 'Next →';
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
    name:    surveyState.name,
    age:     surveyState.age,
    product: `${productData.brand} — ${productData.name}`,
    q1:      answers.q1 || '',
    q2:      answers.q2 || '',
    q3:      answers.q3 || '',
    q4:      answers.q4 || '',
  };

  try {
    await fetch(SCRIPT_URL, {
      method:  'POST',
      // Apps Script requires text/plain to skip CORS preflight on static sites
      headers: { 'Content-Type': 'text/plain' },
      body:    JSON.stringify(payload),
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
  questionArea.hidden   = true;
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
    questionArea.hidden   = false;
    thankyouScreen.hidden = true;
    progressFill.style.width = '0%';
    surveyState.screen  = 'demo';
    surveyState.name    = '';
    surveyState.age     = '';
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
