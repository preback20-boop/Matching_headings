import { getMarkableContent, rounds, validateRounds } from './data/rounds.js';
import { answeredCount } from './domain/scoring.js';
import { elapsedTime, reduceSession } from './domain/session.js';
import { loadState, saveState } from './infrastructure/storage.js';
import { paintMarks, readSelection } from './ui/marking.js';
import { formatTime, renderNav, renderRound } from './ui/view.js';

validateRounds(rounds);
document.querySelector('#round-total').textContent = `${rounds.length} rounds`;
const questionCounts = new Set(rounds.map(round => round.questions.length));
document.querySelector('#question-summary').textContent = questionCounts.size === 1
  ? `${rounds[0].questions.length} questions each · at your pace`
  : `${rounds.reduce((total, round) => total + round.questions.length, 0)} questions · at your pace`;
const practice = document.querySelector('#practice');
const navigation = document.querySelector('#round-nav');
let storage;
try { storage = window.localStorage; } catch { storage = null; }
const loaded = loadState(storage, rounds);
let state = loaded.state;
let pendingSelections = [];
const currentRound = () => rounds.find(r => r.id === state.activeRoundId);
const announce = message => { document.querySelector('#announcement').textContent = message; };

function storageStatus(available) {
  document.querySelector('#storage-warning').hidden = available;
  document.querySelector('#save-status').textContent = available ? 'Progress saved in this browser' : 'Progress is available for this visit only';
}

function persist() { storageStatus(saveState(storage, state, rounds, Date.now())); }

function dispatch(action) {
  state = reduceSession(state, { now: Date.now(), ...action }, rounds);
  persist();
}

function paintAllMarks() {
  const content = getMarkableContent(currentRound());
  for (const element of practice.querySelectorAll('[data-mark-key]')) {
    paintMarks(element, content[element.dataset.markKey], state.marks[state.activeRoundId][element.dataset.markKey] ?? []);
  }
  const marks = Object.keys(state.marks[state.activeRoundId]);
  practice.querySelector('[data-action="clear-passage"]').disabled = !marks.some(key => key.startsWith('passage:'));
  practice.querySelector('[data-action="clear-questions"]').disabled = !marks.some(key => !key.startsWith('passage:'));
}

function selectionTools() {
  for (const action of ['highlight', 'erase']) practice.querySelector(`[data-action="${action}"]`).disabled = pendingSelections.length === 0;
}

function render({ preserveScroll = true } = {}) {
  const scrollPositions = Object.fromEntries([...practice.querySelectorAll('.panel-scroll')].map(el => [el.id, el.scrollTop]));
  pendingSelections = [];
  navigation.innerHTML = renderNav(rounds, state);
  practice.innerHTML = renderRound(currentRound(), state, Date.now());
  paintAllMarks();
  if (preserveScroll) for (const [id, top] of Object.entries(scrollPositions)) document.getElementById(id).scrollTop = top;
}

navigation.addEventListener('click', event => {
  const button = event.target.closest('[data-round]');
  if (!button || button.dataset.round === state.activeRoundId) return;
  dispatch({ type: 'SELECT_ROUND', roundId: button.dataset.round });
  render({ preserveScroll: false });
  [...navigation.querySelectorAll('[data-round]')].find(el => el.dataset.round === state.activeRoundId).focus({ preventScroll: true });
  announce(`${currentRound().label} selected. Any previous timer is paused.`);
});

practice.addEventListener('change', event => {
  if (!event.target.matches('select[data-question]')) return;
  dispatch({ type: 'ANSWER', questionId: event.target.dataset.question, headingId: event.target.value });
  const round = currentRound();
  const count = answeredCount(round, state.attempts[round.id].answers);
  document.querySelector('#answer-count').textContent = `${count} of ${round.questions.length}`;
  document.querySelector('#answer-progress').value = count;
  document.querySelector('#submit-round').disabled = count !== round.questions.length;
});

// Keep the native text selection when a pointer presses a marking button.
practice.addEventListener('pointerdown', event => {
  if (event.target.closest('[data-action="highlight"], [data-action="erase"]')) event.preventDefault();
});

document.addEventListener('selectionchange', () => {
  pendingSelections = readSelection(practice);
  selectionTools();
});

practice.addEventListener('click', event => {
  const button = event.target.closest('button[data-action]');
  if (!button || button.disabled) return;
  const action = button.dataset.action;
  if (action === 'highlight' || action === 'erase') {
    const selections = [...pendingSelections];
    for (const selection of selections) dispatch({ type: action === 'highlight' ? 'MARK' : 'ERASE_MARK', ...selection });
    window.getSelection()?.removeAllRanges();
    pendingSelections = [];
    paintAllMarks();
    selectionTools();
    announce(action === 'highlight' ? 'Selected text highlighted.' : 'Selected highlighting removed.');
    return;
  }
  if (action.startsWith('clear-')) {
    dispatch({ type: 'CLEAR_MARKS', section: action === 'clear-passage' ? 'passage' : 'questions' });
    paintAllMarks();
    announce('Highlights cleared in this panel.');
    return;
  }
  const actions = { start: 'START', pause: 'PAUSE', submit: 'SUBMIT', retry: 'RETRY' };
  if (!actions[action]) return;
  dispatch({ type: actions[action] });
  render();
  if (action === 'submit') {
    const result = state.latestResults[state.activeRoundId];
    document.querySelector('#latest-result')?.focus({ preventScroll: false });
    announce(`Round complete. ${result.score} out of ${result.total} correct in ${formatTime(result.elapsedMs)}.`);
  } else {
    document.querySelector('#session-control').focus({ preventScroll: true });
    announce(action === 'retry' ? 'Fresh attempt ready. Previous score and time cleared; highlights kept.' : action === 'pause' ? 'Timer paused.' : 'Timer started. You can now choose your answers.');
  }
});

setInterval(() => {
  const attempt = state.attempts[state.activeRoundId];
  if (attempt.status !== 'running') return;
  document.querySelector('#timer').textContent = formatTime(elapsedTime(attempt, Date.now()));
  persist();
}, 1000);

window.addEventListener('pagehide', persist);
render();
storageStatus(loaded.available);
