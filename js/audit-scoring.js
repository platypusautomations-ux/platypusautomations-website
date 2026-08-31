// Shared scoring engine for the Lead Flow Audit questionnaire and chatbot.
// Loaded via <script src="/js/audit-scoring.js"> in the browser (attaches to
// window.AuditScoring) and via require() in tests / n8n Code nodes (module.exports).
(function (global) {
  'use strict';

  var CATEGORY_ORDER = ['lead_response', 'reviews', 'after_hours'];
  var CATEGORY_LABELS = { lead_response: 'Lead Response', reviews: 'Reviews', after_hours: 'After-Hours' };
  var TIER_LABELS = { solid: 'Solid', gap: 'Gap', biggest_gap: 'Biggest Gap' };

  function flattenQuestions(kb) {
    // Legacy fallback: verticals not yet migrated to the categories schema
    // still use the old flat kb.questions[] shape. This plan migrates one
    // vertical at a time with a commit after each, so at any point during
    // rollout some KBs have categories and some do not -- both must keep
    // working. Without this branch, an unmigrated vertical's question flow
    // breaks entirely (loadKB's flat.length check throws "KB has no
    // questions") the moment this file is deployed.
    if (!kb.categories && kb.questions) {
      return kb.questions.map(function (q) {
        var withCategory = {};
        Object.keys(q).forEach(function (k) { withCategory[k] = q[k]; });
        withCategory._category = null;
        return withCategory;
      });
    }
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

  // Severity weights (0 = best, 3 = worst) live directly on each question's
  // own options in the KB JSON, not in a shared cross-vertical table. Every
  // vertical writes its own question wording and option values, so a single
  // global table keyed by value string cannot work across 14 different
  // vocabularies. A question whose options carry no numeric `weight` at all
  // (revenue_range, urgency) is silently excluded from scoring, same
  // qualification-only behavior as before, just driven by the KB's own data
  // instead of a hardcoded field-name exclusion list.
  function scoreCategory(questions, answers) {
    var raw = 0;
    var max = 0;
    (questions || []).forEach(function (q) {
      var weights = {};
      var hasWeights = false;
      (q.options || []).forEach(function (o) {
        if (typeof o.weight === 'number') {
          weights[o.value] = o.weight;
          hasWeights = true;
        }
      });
      if (!hasWeights) return;
      var values = Object.keys(weights).map(function (k) { return weights[k]; });
      max += Math.max.apply(null, values);
      var value = answers[q.fieldName];
      raw += (value !== undefined && weights[value] !== undefined) ? weights[value] : 0;
    });
    var pct = max === 0 ? 0 : Math.round((raw / max) * 100);
    var tier = pct >= 67 ? 'biggest_gap' : (pct >= 34 ? 'gap' : 'solid');
    return { pct: pct, tier: tier };
  }

  function scoreAudit(kb, answers) {
    var results = {};
    CATEGORY_ORDER.forEach(function (cat) {
      var category = kb.categories && kb.categories[cat];
      var questions = (category && category.questions) || [];
      results[cat] = scoreCategory(questions, answers);
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
