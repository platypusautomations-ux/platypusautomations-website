// Lead Audit Chatbot
let currentVertical = null;
let currentQuestionIndex = 0;
let answers = {};
let verticalKBs = {};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  loadKnowledgeBases();
  renderQuestion();
});

// Load all KB files
async function loadKnowledgeBases() {
  try {
    const hvacRes = await fetch('/chatbots/knowledge-bases/hvac.json');
    const hvac = await hvacRes.json();
    verticalKBs['hvac'] = hvac;

    const plumbingRes = await fetch('/chatbots/knowledge-bases/plumbing.json');
    const plumbing = await plumbingRes.json();
    verticalKBs['plumbing'] = plumbing;

    console.log('Knowledge bases loaded:', Object.keys(verticalKBs));
  } catch (error) {
    console.error('Error loading KBs:', error);
  }
}

// Render the current question
function renderQuestion() {
  const container = document.getElementById('chatbotContainer');
  const progressFill = document.getElementById('progressFill');

  // Q1: Decision maker gate
  if (currentQuestionIndex === 0) {
    const html = `
      <div class="question-block active" id="q0">
        <div class="question-text">Are you an owner or decision maker for your business?</div>
        <div class="option-group">
          <button class="option-btn" onclick="answerQuestion('q1_decision_maker', true, 'Yes')">Yes, I own/manage this</button>
          <button class="option-btn" onclick="answerQuestion('q1_decision_maker', false, 'No')">No, I'm an employee</button>
        </div>
      </div>
    `;
    container.innerHTML = html;
    progressFill.style.width = '15%';
  }

  // Q2: Vertical selector
  else if (currentQuestionIndex === 1) {
    const html = `
      <div class="question-block active" id="q1">
        <div class="question-text">What's your primary service?</div>
        <div class="option-group">
          <button class="option-btn" onclick="selectVertical('hvac', 'HVAC')">HVAC</button>
          <button class="option-btn" onclick="selectVertical('plumbing', 'Plumbing')">Plumbing</button>
          <button class="option-btn" onclick="selectVertical('roofing', 'Roofing')">Roofing</button>
          <button class="option-btn" onclick="selectVertical('junk-removal', 'Junk Removal')">Junk Removal</button>
          <button class="option-btn" onclick="selectVertical('other', 'Other')">Other</button>
        </div>
      </div>
    `;
    container.innerHTML = html;
    progressFill.style.width = '25%';
  }

  // Q3-Q8: Vertical-specific questions from KB
  else if (currentVertical && currentQuestionIndex >= 2) {
    const kb = verticalKBs[currentVertical];
    const kbQuestionIndex = currentQuestionIndex - 2; // Q3 is index 0 in KB questions array

    if (kbQuestionIndex < kb.questions.length) {
      const q = kb.questions[kbQuestionIndex];
      const totalQuestions = 8; // Q1 through Q8
      const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

      let optionsHtml = '';
      q.options.forEach(opt => {
        optionsHtml += `
          <button class="option-btn" onclick="answerQuestion('${q.fieldName}', '${opt.value}', '${opt.label}')">
            ${opt.label}
          </button>
        `;
      });

      const html = `
        <div class="question-block active" id="${q.id}">
          <div class="question-text">${q.text}</div>
          <div class="option-group">
            ${optionsHtml}
          </div>
        </div>
      `;
      container.innerHTML = html;
      progressFill.style.width = progress + '%';
    }

    // After Q8, show results
    else if (kbQuestionIndex >= kb.questions.length) {
      showResults();
    }
  }
}

// Answer a question and move to next
function answerQuestion(fieldName, value, label) {
  answers[fieldName] = value;
  console.log(`${fieldName}: ${label}`);

  // If Q1 was "No", show not-a-fit message and exit
  if (fieldName === 'q1_decision_maker' && value === false) {
    const container = document.getElementById('chatbotContainer');
    container.innerHTML = `
      <div class="question-block active">
        <div class="question-text" style="color: rgba(255, 255, 255, 0.8);">
          Thanks for being honest! This is really for business owners/decision makers.
        </div>
        <div style="margin-top: 20px; padding: 16px; background: rgba(255, 255, 255, 0.05); border-radius: 8px;">
          <p style="font-size: 14px; line-height: 1.6;">
            Have your boss take the audit, or share it with them. It takes 2 minutes.
          </p>
        </div>
        <div class="button-group" style="margin-top: 24px;">
          <button class="btn btn-secondary" onclick="location.reload()">Start Over</button>
        </div>
      </div>
    `;
    return;
  }

  currentQuestionIndex++;
  renderQuestion();
}

// Select a vertical and move on
function selectVertical(vertical, label) {
  answers['q2_vertical'] = vertical;
  currentVertical = vertical;
  console.log(`Vertical selected: ${label}`);

  // If vertical not in our KBs yet, show "coming soon"
  if (!verticalKBs[vertical]) {
    const container = document.getElementById('chatbotContainer');
    container.innerHTML = `
      <div class="question-block active">
        <div class="question-text">Coming Soon</div>
        <div style="margin-top: 20px; padding: 16px; background: rgba(255, 255, 255, 0.05); border-radius: 8px;">
          <p style="font-size: 14px; line-height: 1.6;">
            We're building the ${label} audit. Drop your email and we'll let you know when it's ready.
          </p>
          <input type="email" class="email-input" id="earlyAccessEmail" placeholder="your@email.com" style="margin-top: 12px;">
        </div>
        <div class="button-group" style="margin-top: 24px;">
          <button class="btn btn-primary" onclick="sendEarlyAccess('${vertical}', '${label}')">Notify Me</button>
          <button class="btn btn-secondary" onclick="location.reload()">Back</button>
        </div>
      </div>
    `;
    return;
  }

  currentQuestionIndex++;
  renderQuestion();
}

// Show results / diagnosis
function showResults() {
  const kb = verticalKBs[currentVertical];
  const chatbotContainer = document.getElementById('chatbotContainer');

  // Show email/phone collection form before diagnosis
  const html = `
    <div class="question-block active">
      <div class="question-text">Before we show your diagnosis...</div>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <input type="text" id="businessName" class="email-input" placeholder="Business name" />
        <input type="email" id="auditEmail" class="email-input" placeholder="Your email" required />
        <input type="tel" id="auditPhone" class="email-input" placeholder="Your phone (optional)" />
      </div>
      <div class="button-group" style="margin-top: 20px;">
        <button class="btn btn-primary" onclick="submitAudit()">See My Diagnosis</button>
      </div>
    </div>
  `;

  chatbotContainer.innerHTML = html;
}

// Submit audit and show diagnosis
async function submitAudit() {
  const email = document.getElementById('auditEmail').value;
  const phone = document.getElementById('auditPhone').value;
  const businessName = document.getElementById('businessName').value;

  if (!email) {
    alert('Email is required');
    return;
  }

  // Prepare payload
  const payload = {
    answers: answers,
    email: email,
    phone: phone,
    business_name: businessName,
    timestamp: new Date().toISOString()
  };

  // Submit to n8n webhook
  try {
    const response = await fetch('https://brooklynn-mistaken-deliriously.ngrok-free.dev/webhook/lead-audit-submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      showDiagnosis(businessName);
    } else {
      console.error('Submission failed:', response.statusText);
      showDiagnosis(businessName); // Show anyway, fallback
    }
  } catch (error) {
    console.error('Error submitting audit:', error);
    showDiagnosis(businessName); // Show anyway, fallback
  }
}

// Show diagnosis after form submission
function showDiagnosis(businessName) {
  const kb = verticalKBs[currentVertical];
  const diagnosisText = document.getElementById('diagnosisText');
  const resultContainer = document.getElementById('resultContainer');
  const chatbotContainer = document.getElementById('chatbotContainer');

  // Personalize diagnosis
  const personalized = `${businessName}, here's what we found:\n\n${kb.diagnosis}`;
  diagnosisText.textContent = personalized;

  chatbotContainer.style.display = 'none';
  resultContainer.classList.add('active');
}

// Open Calendly (placeholder)
function openCalendly() {
  alert('Calendly integration coming. Contact: platypusautomations@gmail.com');
}

// Show trial option (placeholder)
function showTrialOption(e) {
  e.preventDefault();
  alert('Trial signup coming. Email: platypusautomations@gmail.com');
}

// Send early access email (Week 2)
function sendEarlyAccess(vertical, label) {
  const email = document.getElementById('earlyAccessEmail').value;
  if (!email) {
    alert('Please enter your email');
    return;
  }
  alert(`Thanks! We'll email ${email} when ${label} audit is ready.`);
}
