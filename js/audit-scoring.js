// Shared scoring engine for the Lead Flow Audit questionnaire and chatbot.
// Loaded via <script src="/js/audit-scoring.js"> in the browser (attaches to
// window.AuditScoring) and via require() in tests / n8n Code nodes (module.exports).
(function (global) {
  'use strict';

  var CATEGORY_ORDER = ['lead_response', 'reviews', 'after_hours'];
  var CATEGORY_LABELS = { lead_response: 'Lead Response', reviews: 'Reviews', after_hours: 'After-Hours' };
  var TIER_LABELS = { solid: 'Solid', gap: 'Gap', biggest_gap: 'Biggest Gap' };

  // Every value is ordinal: 0 = best, 3 = worst. current_system and
  // bottleneck are categorical fields with no self-evident order, so their
  // weights are an explicit severity judgment (which problem costs more
  // revenue), not a mechanical read of option order. See the design spec's
  // Scoring section for the full reasoning.
  var FIELD_WEIGHTS = {
    lead_volume: { '0-2': 0, '3-5': 1, '6-10': 2, '10+': 3 },
    response_time: { 'under-1hr': 0, '1-2hr': 1, '4-8hr': 2, 'next-day': 3, 'dont-know': 3 },
    current_system: {
      'website-form': 0, 'text': 0,
      'referrals': 1,
      'google-reviews': 2, 'facebook': 2, 'manual-mix': 2,
      'phone-voicemail': 3, 'no-system': 3
    },
    bottleneck: {
      'no-qualification': 1,
      'poor-followup': 2, 'inconsistent': 2,
      'missing-leads': 3, 'slow-response': 3
    },
    review_count: { '0-10': 3, '11-25': 2, '26-50': 1, '51-100': 0, '100+': 0 },
    review_ask_process: { 'none': 3, 'verbal': 2, 'card': 2, 'occasional-text-email': 1, 'automatic-system': 0 },
    after_hours_handling: { 'voicemail-unanswered': 3, 'forwards-to-cell': 2, 'answer-personally': 1, 'has-system': 0 },
    after_hours_share: { 'under-10': 0, '10-25': 1, '25-50': 2, 'over-50': 3 }
  };

  function flattenQuestions(kb) {
    var list = [];
    CATEGORY_ORDER.forEach(function (cat) {
      var category = kb.categories && kb.categories[cat];
      if (!category || !category.questions) return;
      category.questions.forEach(function (q) {
        var withCategory = {};
        Object.keys(q).forEach(function (k) { withCategory[k] = q[k]; });
        withCategory._category = cat;
        list.push(withCategory);
      });
    });
    return list;
  }

  function scoreCategory(fieldNames, answers) {
    var raw = 0;
    var max = 0;
    fieldNames.forEach(function (fieldName) {
      var table = FIELD_WEIGHTS[fieldName];
      if (!table) throw new Error('No weight table for field: ' + fieldName);
      var values = Object.keys(table).map(function (k) { return table[k]; });
      max += Math.max.apply(null, values);
      var value = answers[fieldName];
      raw += (value !== undefined && table[value] !== undefined) ? table[value] : 0;
    });
    var pct = max === 0 ? 0 : Math.round((raw / max) * 100);
    var tier = pct >= 67 ? 'biggest_gap' : (pct >= 34 ? 'gap' : 'solid');
    return { pct: pct, tier: tier };
  }

  function scoreAudit(kb, answers) {
    var results = {};
    CATEGORY_ORDER.forEach(function (cat) {
      var category = kb.categories && kb.categories[cat];
      // Only fields with a weight table actually count toward severity.
      // revenue_range and urgency are asked (they appear in flattenQuestions,
      // driving the visible question flow) but stay qualification-only by
      // simply having no entry in FIELD_WEIGHTS, so they are excluded here
      // rather than requiring a separate hardcoded exclusion list.
      var fieldNames = (category && category.questions)
        ? category.questions
            .map(function (q) { return q.fieldName; })
            .filter(function (fieldName) { return Object.prototype.hasOwnProperty.call(FIELD_WEIGHTS, fieldName); })
        : [];
      results[cat] = scoreCategory(fieldNames, answers);
    });

    var TIE_BREAK = ['lead_response', 'after_hours', 'reviews'];
    var biggest = TIE_BREAK[0];
    var biggestPct = -1;
    TIE_BREAK.forEach(function (cat) {
      if (results[cat] && results[cat].pct > biggestPct) {
        biggestPct = results[cat].pct;
        biggest = cat;
      }
    });
    results.biggestGap = biggest;
    return results;
  }

  function composeScorecardText(kb, scored) {
    var parts = [];
    CATEGORY_ORDER.forEach(function (cat) {
      var category = kb.categories[cat];
      var tier = scored[cat].tier;
      var text = category.diagnosisTiers[tier];
      parts.push(CATEGORY_LABELS[cat].toUpperCase() + ': ' + TIER_LABELS[tier] + '\n' + text);
    });
    parts.push('YOUR BIGGEST GAP: ' + CATEGORY_LABELS[scored.biggestGap]);
    return parts.join('\n\n');
  }

  var api = {
    CATEGORY_ORDER: CATEGORY_ORDER,
    CATEGORY_LABELS: CATEGORY_LABELS,
    TIER_LABELS: TIER_LABELS,
    flattenQuestions: flattenQuestions,
    scoreCategory: scoreCategory,
    scoreAudit: scoreAudit,
    composeScorecardText: composeScorecardText
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    global.AuditScoring = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
