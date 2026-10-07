// Workload Matcher — the filter engine.
// Pure ES module: imported by the browser UI, the CLI, and node:test.
//
// Selection is a filter on workload properties, not a ranked list:
//   native (2)  → requirement met out of the box
//   partial (1) → met by bolt-on or engineering effort — a "stretch"
//                 (pgvector, JSONB, recursive CTEs, $graphLookup, read replicas)
//   missing (0) → requirement not delivered — a "mismatch"
//
// verdict: 'fit' (all native) < 'stretch' (some partial) < 'mismatch' (some missing)

import { ENGINE_CLASSES, LEVELS } from './classes.mjs';
import { PROPERTY_IDS, propertyById } from './properties.mjs';

const VERDICT_RANK = { fit: 0, stretch: 1, mismatch: 2 };

export function normalizeProps(props) {
  const list = Array.isArray(props) ? props : Object.keys(props || {});
  return [...new Set(list.filter(id => PROPERTY_IDS.includes(id)))];
}

export function evaluatePick(classId, props) {
  const cls = ENGINE_CLASSES.find(c => c.id === classId);
  if (!cls) throw new Error(`unknown engine class: ${classId}`);
  const reqs = normalizeProps(props);

  const audit = reqs.map(prop => ({
    prop,
    label: propertyById(prop).label,
    level: cls.capability[prop],
    mark: LEVELS[cls.capability[prop]],
  }));
  const missing = audit.filter(a => a.level === 0).map(a => a.prop);
  const degraded = audit.filter(a => a.level === 1).map(a => a.prop);
  // native capabilities the workload never asked for — paid for, unused
  const overkill = PROPERTY_IDS.filter(id => !reqs.includes(id) && cls.capability[id] === 2);

  const verdict = missing.length ? 'mismatch' : degraded.length ? 'stretch' : 'fit';
  return {
    classId, className: cls.name, verdict, audit, missing, degraded, overkill,
    summary: verdict === 'mismatch'
      ? `missing: ${missing.map(p => propertyById(p).label).join(', ')}`
      : verdict === 'stretch'
        ? `partial: ${degraded.map(p => propertyById(p).label).join(', ')}`
        : overkill.length
          ? `fits — with unused depth (${overkill.map(p => propertyById(p).label).join(', ')})`
          : 'fits — no wasted capability',
  };
}

export function matchTask(props) {
  const reqs = normalizeProps(props);
  const ranked = ENGINE_CLASSES
    .map(c => evaluatePick(c.id, reqs))
    .sort((a, b) =>
      VERDICT_RANK[a.verdict] - VERDICT_RANK[b.verdict]
      || a.degraded.length - b.degraded.length
      || a.overkill.length - b.overkill.length
      || ENGINE_CLASSES.findIndex(c => c.id === a.classId) - ENGINE_CLASSES.findIndex(c => c.id === b.classId));

  const viable = ranked.filter(r => r.verdict !== 'mismatch');
  const recommendation = viable[0] || null;
  let note;
  if (!recommendation) {
    note = 'No class survives the filter — split the workload or relax a requirement.';
  } else if (recommendation.verdict === 'stretch') {
    const tied = viable.filter(v =>
      v.degraded.length === recommendation.degraded.length && v.overkill.length === recommendation.overkill.length);
    note = tied.length > 1
      ? `No clean fit — ${tied.map(v => v.className).join(' and ')} each stretch on a different axis. The workload may want a hybrid route.`
      : `Closest fit is a stretch — ${recommendation.summary}. A bolt-on can cover it; say so out loud.`;
  } else if (recommendation.overkill.length) {
    note = `${recommendation.className} fits — the smallest class that does.`;
  } else {
    note = `${recommendation.className} is the fit — requirements land exactly on its strengths.`;
  }
  return { requirements: reqs, ranked, recommendation, note };
}
