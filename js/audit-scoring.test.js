const assert = require('node:assert');
const { flattenQuestions, scoreCategory, scoreAudit, composeScorecardText } = require('./audit-scoring.js');

// ── fixtures ────────────────────────────────────────
var kbFixture = {
  categories: {
    lead_response: {
      // Includes revenue_range and urgency, matching the real KB shape
      // (all 6 original questions), specifically to catch scoreAudit
      // treating them as scored fields when they must stay qualification-only.
      questions: [
        { fieldName: 'lead_volume' },
        { fieldName: 'response_time' },
        { fieldName: 'current_system' },
        { fieldName: 'bottleneck' },
        { fieldName: 'revenue_range' },
        { fieldName: 'urgency' }
      ],
      diagnosisTiers: { solid: 'LR solid text', gap: 'LR gap text', biggest_gap: 'LR biggest_gap text' }
    },
    reviews: {
      questions: [
        { fieldName: 'review_count' },
        { fieldName: 'review_ask_process' }
      ],
      diagnosisTiers: { solid: 'RV solid text', gap: 'RV gap text', biggest_gap: 'RV biggest_gap text' }
    },
    after_hours: {
      questions: [
        { fieldName: 'after_hours_handling' },
        { fieldName: 'after_hours_share' }
      ],
      diagnosisTiers: { solid: 'AH solid text', gap: 'AH gap text', biggest_gap: 'AH biggest_gap text' }
    }
  }
};

// ── flattenQuestions ────────────────────────────────
{
  var flat = flattenQuestions(kbFixture);
  assert.strictEqual(flat.length, 10, 'flattenQuestions should return all 10 questions across 3 categories');
  assert.strictEqual(flat[0]._category, 'lead_response');
  assert.strictEqual(flat[0].fieldName, 'lead_volume');
  assert.strictEqual(flat[5]._category, 'lead_response');
  assert.strictEqual(flat[5].fieldName, 'urgency');
  assert.strictEqual(flat[6]._category, 'reviews');
  assert.strictEqual(flat[8]._category, 'after_hours');
  assert.strictEqual(flat[9].fieldName, 'after_hours_share');
}

// ── flattenQuestions: legacy KB fallback (no categories) ──
// Legacy KBs (13 of 14 verticals, e.g. plumbing.json) still use the old
// flat `questions[]` shape with no `categories` key. flattenQuestions must
// fall back to reading kb.questions directly instead of silently returning [].
{
  var legacyKbFixture = {
    questions: [
      { id: 'q1', fieldName: 'lead_volume' },
      { id: 'q2', fieldName: 'response_time' },
      { id: 'q3', fieldName: 'current_system' }
    ]
  };
  var legacyFlat = flattenQuestions(legacyKbFixture);
  assert.strictEqual(legacyFlat.length, 3, 'flattenQuestions should return all legacy questions when kb.categories is absent');
  assert.strictEqual(legacyFlat[0]._category, null, 'legacy questions should carry _category: null');
  assert.strictEqual(legacyFlat[1]._category, null);
  assert.strictEqual(legacyFlat[2]._category, null);
  assert.strictEqual(legacyFlat[0].fieldName, 'lead_volume');
  assert.strictEqual(legacyFlat[2].fieldName, 'current_system');
}

// ── scoreCategory: lead_response ───────────────────
{
  var solid = scoreCategory(['lead_volume', 'response_time', 'current_system', 'bottleneck'], {
    lead_volume: '0-2', response_time: 'under-1hr', current_system: 'website-form', bottleneck: 'no-qualification'
  });
  assert.strictEqual(solid.pct, 8, 'best-case lead_response answers should score 8%');
  assert.strictEqual(solid.tier, 'solid');

  var gap = scoreCategory(['lead_volume', 'response_time', 'current_system', 'bottleneck'], {
    lead_volume: '3-5', response_time: '4-8hr', current_system: 'referrals', bottleneck: 'no-qualification'
  });
  assert.strictEqual(gap.pct, 42, 'mid-case lead_response answers should score 42%');
  assert.strictEqual(gap.tier, 'gap');

  var worst = scoreCategory(['lead_volume', 'response_time', 'current_system', 'bottleneck'], {
    lead_volume: '10+', response_time: 'next-day', current_system: 'no-system', bottleneck: 'missing-leads'
  });
  assert.strictEqual(worst.pct, 100, 'worst-case lead_response answers should score 100%');
  assert.strictEqual(worst.tier, 'biggest_gap');
}

// ── scoreCategory: reviews ──────────────────────────
{
  var solid = scoreCategory(['review_count', 'review_ask_process'], { review_count: '100+', review_ask_process: 'automatic-system' });
  assert.strictEqual(solid.pct, 0);
  assert.strictEqual(solid.tier, 'solid');

  var gap = scoreCategory(['review_count', 'review_ask_process'], { review_count: '26-50', review_ask_process: 'verbal' });
  assert.strictEqual(gap.pct, 50);
  assert.strictEqual(gap.tier, 'gap');

  var worst = scoreCategory(['review_count', 'review_ask_process'], { review_count: '0-10', review_ask_process: 'none' });
  assert.strictEqual(worst.pct, 100);
  assert.strictEqual(worst.tier, 'biggest_gap');
}

// ── scoreCategory: after_hours ──────────────────────
{
  var solid = scoreCategory(['after_hours_handling', 'after_hours_share'], { after_hours_handling: 'has-system', after_hours_share: 'under-10' });
  assert.strictEqual(solid.pct, 0);
  assert.strictEqual(solid.tier, 'solid');

  var gap = scoreCategory(['after_hours_handling', 'after_hours_share'], { after_hours_handling: 'forwards-to-cell', after_hours_share: '10-25' });
  assert.strictEqual(gap.pct, 50);
  assert.strictEqual(gap.tier, 'gap');

  var worst = scoreCategory(['after_hours_handling', 'after_hours_share'], { after_hours_handling: 'voicemail-unanswered', after_hours_share: 'over-50' });
  assert.strictEqual(worst.pct, 100);
  assert.strictEqual(worst.tier, 'biggest_gap');
}

// ── scoreAudit: tie-break order ─────────────────────
{
  // lead_response and after_hours both worst-case, reviews best-case:
  // lead_response should win the tie (first in TIE_BREAK order).
  var answers1 = {
    lead_volume: '10+', response_time: 'next-day', current_system: 'no-system', bottleneck: 'missing-leads',
    review_count: '100+', review_ask_process: 'automatic-system',
    after_hours_handling: 'voicemail-unanswered', after_hours_share: 'over-50'
  };
  var scored1 = scoreAudit(kbFixture, answers1);
  assert.strictEqual(scored1.lead_response.tier, 'biggest_gap');
  assert.strictEqual(scored1.after_hours.tier, 'biggest_gap');
  assert.strictEqual(scored1.reviews.tier, 'solid');
  assert.strictEqual(scored1.biggestGap, 'lead_response', 'lead_response should win a tie over after_hours');

  // lead_response best-case, after_hours and reviews both worst-case:
  // after_hours should win the tie (second in TIE_BREAK order, ahead of reviews).
  var answers2 = {
    lead_volume: '0-2', response_time: 'under-1hr', current_system: 'website-form', bottleneck: 'no-qualification',
    review_count: '0-10', review_ask_process: 'none',
    after_hours_handling: 'voicemail-unanswered', after_hours_share: 'over-50'
  };
  var scored2 = scoreAudit(kbFixture, answers2);
  assert.strictEqual(scored2.lead_response.tier, 'solid');
  assert.strictEqual(scored2.after_hours.tier, 'biggest_gap');
  assert.strictEqual(scored2.reviews.tier, 'biggest_gap');
  assert.strictEqual(scored2.biggestGap, 'after_hours', 'after_hours should win a tie over reviews');
}

// ── scoreAudit: revenue_range and urgency must not affect scoring ──
// kbFixture's lead_response category carries all 6 real questions
// (including revenue_range and urgency, which have no FIELD_WEIGHTS entry).
// scoreAudit must silently exclude them rather than throwing or scoring them.
{
  var base = {
    lead_volume: '0-2', response_time: 'under-1hr', current_system: 'website-form', bottleneck: 'no-qualification',
    review_count: '100+', review_ask_process: 'automatic-system',
    after_hours_handling: 'has-system', after_hours_share: 'under-10'
  };
  var withQualificationA = Object.assign({}, base, { revenue_range: 'under-100k', urgency: 'exploring' });
  var withQualificationB = Object.assign({}, base, { revenue_range: 'over-1m', urgency: 'asap' });
  var scoredA = scoreAudit(kbFixture, withQualificationA);
  var scoredB = scoreAudit(kbFixture, withQualificationB);
  assert.strictEqual(scoredA.lead_response.pct, scoredB.lead_response.pct,
    'lead_response score must not change when only revenue_range/urgency differ');
  assert.strictEqual(scoredA.lead_response.tier, 'solid');
}

// ── composeScorecardText ─────────────────────────────
{
  var scored = {
    lead_response: { pct: 42, tier: 'gap' },
    reviews: { pct: 0, tier: 'solid' },
    after_hours: { pct: 100, tier: 'biggest_gap' },
    biggestGap: 'after_hours'
  };
  var text = composeScorecardText(kbFixture, scored);
  assert.ok(text.indexOf('LEAD RESPONSE: Gap') !== -1, 'should label the lead_response section with its tier');
  assert.ok(text.indexOf('LR gap text') !== -1, 'should include the gap-tier diagnosis text for lead_response');
  assert.ok(text.indexOf('REVIEWS: Solid') !== -1);
  assert.ok(text.indexOf('RV solid text') !== -1);
  assert.ok(text.indexOf('AFTER-HOURS: Biggest Gap') !== -1);
  assert.ok(text.indexOf('AH biggest_gap text') !== -1);
  assert.ok(text.indexOf('YOUR BIGGEST GAP: After-Hours') !== -1);
  assert.ok(text.indexOf('—') === -1, 'no em dashes in composed output');
}

console.log('All audit-scoring tests passed.');
