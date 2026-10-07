import { WORKLOAD_PROPERTIES } from '/properties.mjs';
import { ENGINE_CLASSES, LEVELS } from '/classes.mjs';
import { matchTask, evaluatePick } from '/matcher.mjs';
import { EXAMPLE_TASKS } from '/examples.mjs';

const $ = id => document.getElementById(id);
const MARK = { native: '✓', partial: '~', missing: '✗' };

// --- populate controls ----------------------------------------------------
for (const t of EXAMPLE_TASKS) {
  const option = document.createElement('option');
  option.value = t.id;
  option.textContent = t.title;
  $('task').append(option);
}
for (const p of WORKLOAD_PROPERTIES) {
  const label = document.createElement('label');
  label.className = 'prop';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.id = `prop-${p.id}`;
  const text = document.createElement('span');
  text.innerHTML = `<strong>${p.label}</strong><br><small>${p.hint}</small>`;
  label.append(box, text);
  box.addEventListener('change', runAll);
  $('props').append(label);
}
for (const c of ENGINE_CLASSES) {
  const option = document.createElement('option');
  option.value = c.id;
  option.textContent = c.name;
  $('route').append(option);
}

// --- state -----------------------------------------------------------------
function currentProps() {
  return WORKLOAD_PROPERTIES.filter(p => $(`prop-${p.id}`).checked).map(p => p.id);
}
function setProps(reqs) {
  for (const p of WORKLOAD_PROPERTIES) $(`prop-${p.id}`).checked = reqs.includes(p.id);
}
function loadTask() {
  const t = EXAMPLE_TASKS.find(x => x.id === $('task').value);
  $('task-blurb').textContent = t.blurb;
  setProps(t.requires);
  history.replaceState(null, '', `/?task=${t.id}`);
  runAll();
}
$('task').addEventListener('change', loadTask);
$('route').addEventListener('change', paintAudit);

// --- paint: ranked classes --------------------------------------------------
function paintRanked(props) {
  const { ranked, recommendation, note } = matchTask(props);
  $('verdict').textContent = recommendation
    ? `recommendation: ${recommendation.className}`
    : 'no class survives';
  $('verdict').className = `badge ${recommendation ? (recommendation.verdict === 'fit' ? 'success' : 'warn') : 'danger'}`;
  $('note').textContent = note;
  $('ranked').replaceChildren(...ranked.map(r => {
    const cls = ENGINE_CLASSES.find(c => c.id === r.classId);
    const li = document.createElement('li');
    li.className = `result ${r.verdict === 'fit' ? 'pass' : r.verdict === 'stretch' ? 'warn' : 'fail'}`;
    const head = document.createElement('div');
    head.className = 'result-head';
    const badge = document.createElement('span');
    badge.className = `badge ${r.verdict === 'fit' ? 'pass' : r.verdict === 'stretch' ? 'warn' : 'fail'}`;
    badge.textContent = r.verdict.toUpperCase();
    const title = document.createElement('strong');
    title.textContent = cls.name;
    head.append(badge, title);
    const tag = document.createElement('p');
    tag.className = 'muted';
    tag.textContent = cls.tagline;
    const detail = document.createElement('p');
    detail.textContent = r.summary;
    const inst = document.createElement('p');
    inst.className = 'fix';
    inst.textContent = `Instances (post claims): ${cls.instances.map(i => `${i.name} — ${i.postClaim}`).join(' · ')}`;
    li.append(head, tag, detail, inst);
    return li;
  }));
}

// --- paint: manual routing audit -------------------------------------------
function paintAudit() {
  const props = currentProps();
  const r = evaluatePick($('route').value, props);
  const cls = ENGINE_CLASSES.find(c => c.id === r.classId);
  $('route-instances').textContent = `${cls.tagline}. Instances (post claims): ${cls.instances.map(i => i.name).join(', ')}.`;
  $('audit-verdict').textContent = r.verdict.toUpperCase();
  $('audit-verdict').className = `badge ${r.verdict === 'fit' ? 'pass' : r.verdict === 'stretch' ? 'warn' : 'fail'}`;
  $('audit').replaceChildren(...(props.length ? r.audit.map(a => {
    const li = document.createElement('li');
    li.className = `audit-row ${a.mark}`;
    const mark = document.createElement('span');
    mark.className = 'audit-mark';
    mark.textContent = MARK[a.mark];
    const text = document.createElement('span');
    text.innerHTML = `<strong>${a.label}</strong> — ${a.mark === 'native' ? 'native to this engine' : a.mark === 'partial' ? 'bolt-on or engineering effort' : 'this class does not deliver it'}`;
    li.append(mark, text);
    return li;
  }) : [(() => { const li = document.createElement('li'); li.className = 'audit-row'; li.textContent = 'No properties selected — toggle some above.'; return li; })()]));
  $('audit-summary').textContent = r.summary;
}

// --- wire ------------------------------------------------------------------
function runAll() {
  const props = currentProps();
  paintRanked(props);
  paintAudit();
}

const requested = new URLSearchParams(location.search).get('task');
if (EXAMPLE_TASKS.some(t => t.id === requested)) $('task').value = requested;
else $('task').value = 'friend-graph';
$('route').value = 'document'; // default: the document-store trap
loadTask();
