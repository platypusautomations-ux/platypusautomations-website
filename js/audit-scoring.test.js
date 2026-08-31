const assert = require('node:assert');
const { flattenQuestions, scoreCategory, scoreAudit, composeScorecardText } = require('./audit-scoring.js');

// ── fixtures ────────────────────────────────────────
// Weights now live on each option, not in a shared global table. Trimmed to
// the option values these tests actually exercise (max-weight coverage is
// preserved per field so percentage math still matches Plan A's original
// assertions), plus unweighted revenue_range/urgency options to prove they
// stay excluded from scoring.
var kbFixture = {
  categories: {
    lead_response: {
      questions: [
        { fieldName: 'lead_volume', options: [
          { value: '0-2', weight: 0 }, { value: '3-5', weight: 1 }, { value: '6-10', weight: 2 }, { value: '10+', weight: 3 }
        ]},
        { fieldName: 'response_time', options: [
          { value: 'under-1hr', weight: 0 }, { value: '1-2hr', weight: 1 }, { value: '4-8hr', weight: 2 }, { value: 'next-day', weight: 3 }, { value: 'dont-know', weight: 3 }
        ]},
        { fieldName: 'current_system', options: [
          { value: 'website-form', weight: 0 }, { value: 'referrals', weight: 1 }, { value: 'facebook', weight: 2 }, { value: 'no-system', weight: 3 }
        ]},
        { fieldName: 'bottleneck', options: [
          { value: 'no-qualification', weight: 1 }, { value: 'poor-followup', weight: 2 }, { value: 'missing-leads', weight: 3 }
        ]},
        { fieldName: 'revenue_range', options: [
          { value: 'under-100k' }, { value: 'over-1m' }
        ]},
        { fieldName: 'urgency', options: [
          { value: 'exploring' }, { value: 'asap' }
        ]}
      ],
      diagnosisTiers: { solid: 'LR solid text', gap: 'LR gap text', biggest_gap: 'LR biggest_gap text' }
    },
    reviews: {
      questions: [
        { fieldName: 'review_count', options: [
          { value: '0-10', weight: 3 }, { value: '11-25', weight: 2 }, { value: '26-50', weight: 1 }, { value: '51-100', weight: 0 }, { value: '100+', weight: 0 }
        ]},
        { fieldName: 'review_ask_process', options: [
          { value: 'none', weight: 3 }, { value: 'verbal', weight: 2 }, { value: 'occasional-text-email', weight: 1 }, { value: 'automatic-system', weight: 0 }
        ]}
      ],
      diagnosisTiers: { solid: 'RV solid text', gap: 'RV gap text', biggest_gap: 'RV biggest_gap text' }
    },
    after_hours: {
      questions: [
        { fieldName: 'after_hours_handling', options: [
          { value: 'voicemail-unanswered', weight: 3 }, { value: 'forwards-to-cell', weight: 2 }, { value: 'answer-personally', weight: 1 }, { value: 'has-system', weight: 0 }
        ]},
        { fieldName: 'after_hours_share', options: [
          { value: 'under-10', weight: 0 }, { value: '10-25', weight: 1 }, { value: '25-50', weight: 2 }, { value: 'over-50', weight: 3 }
        ]}
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
// Verticals not yet migrated to the categories schema still use the old flat
// questions[] shape (this plan migrates one vertical at a time with a commit
// after each, so both shapes must work simultaneously mid-rollout).
// flattenQuestions must fall back to reading kb.questions directly instead
// of silently returning [].
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

// ── scoreCategory: lead_response (now takes question objects, not fieldNames) ──
{
  var lrQuestions = kbFixture.categories.lead_response.questions;

  var solid = scoreCategory(lrQuestions, {
    lead_volume: '0-2', response_time: 'under-1hr', current_system: 'website-form', bottleneck: 'no-qualification'
  });
  assert.strictEqual(solid.pct, 8, 'best-case lead_response answers should score 8%');
  assert.strictEqual(solid.tier, 'solid');

  var gap = scoreCategory(lrQuestions, {
    lead_volume: '3-5', response_time: '4-8hr', current_system: 'referrals', bottleneck: 'no-qualification'
  });
  assert.strictEqual(gap.pct, 42, 'mid-case lead_response answers should score 42%');
  assert.strictEqual(gap.tier, 'gap');

  var worst = scoreCategory(lrQuestions, {
    lead_volume: '10+', response_time: 'next-day', current_system: 'no-system', bottleneck: 'missing-leads'
  });
  assert.strictEqual(worst.pct, 100, 'worst-case lead_response answers should score 100%');
  assert.strictEqual(worst.tier, 'biggest_gap');
}

// ── scoreCategory: reviews ──────────────────────────
{
  var rvQuestions = kbFixture.categories.reviews.questions;

  var solid = scoreCategory(rvQuestions, { review_count: '100+', review_ask_process: 'automatic-system' });
  assert.strictEqual(solid.pct, 0);
  assert.strictEqual(solid.tier, 'solid');

  var gap = scoreCategory(rvQuestions, { review_count: '26-50', review_ask_process: 'verbal' });
  assert.strictEqual(gap.pct, 50);
  assert.strictEqual(gap.tier, 'gap');

  var worst = scoreCategory(rvQuestions, { review_count: '0-10', review_ask_process: 'none' });
  assert.strictEqual(worst.pct, 100);
  assert.strictEqual(worst.tier, 'biggest_gap');
}

// ── scoreCategory: after_hours ──────────────────────
{
  var ahQuestions = kbFixture.categories.after_hours.questions;

  var solid = scoreCategory(ahQuestions, { after_hours_handling: 'has-system', after_hours_share: 'under-10' });
  assert.strictEqual(solid.pct, 0);
  assert.strictEqual(solid.tier, 'solid');

  var gap = scoreCategory(ahQuestions, { after_hours_handling: 'forwards-to-cell', after_hours_share: '10-25' });
  assert.strictEqual(gap.pct, 50);
  assert.strictEqual(gap.tier, 'gap');

  var worst = scoreCategory(ahQuestions, { after_hours_handling: 'voicemail-unanswered', after_hours_share: 'over-50' });
  assert.strictEqual(worst.pct, 100);
  assert.strictEqual(worst.tier, 'biggest_gap');
}

// ── scoreAudit: tie-break order ─────────────────────
{
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
// Their options in the fixture carry no `weight` at all -- proves exclusion
// is now driven by the KB's own data, not a hardcoded field-name list.
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
