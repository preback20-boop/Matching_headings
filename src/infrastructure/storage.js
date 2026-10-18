import { getMarkableContent } from '../data/rounds.js';
import { normalizeRanges } from '../domain/marks.js';
import { createInitialState, pauseAttempt } from '../domain/session.js';
import { answeredCount, scoreRound } from '../domain/scoring.js';

export const STORAGE_KEY = 'matching-headings:session:v1';
const VERSION = 1;
const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const validTime = value => typeof value === 'number' && Number.isFinite(value) && value >= 0;

export function snapshotState(state, rounds, now) {
  return {
    version: VERSION,
    revisions: Object.fromEntries(rounds.map(r => [r.id, r.revision])),
    activeRoundId: state.activeRoundId,
    attempts: Object.fromEntries(rounds.map(r => [r.id, pauseAttempt(state.attempts[r.id], now)])),
    latestResults: state.latestResults,
    marks: state.marks,
  };
}

export function restoreState(saved, rounds) {
  const state = createInitialState(rounds);
  if (!isRecord(saved) || saved.version !== VERSION) return state;
  if (rounds.some(r => r.id === saved.activeRoundId)) state.activeRoundId = saved.activeRoundId;
  for (const round of rounds) {
    if (saved.revisions?.[round.id] !== round.revision) continue;
    const sanitizeAnswers = input => Object.fromEntries(round.questions
      .filter(q => isRecord(input) && round.headings.some(h => h.id === input[q.id]))
      .map(q => [q.id, input[q.id]]));
    const attempt = saved.attempts?.[round.id];
    if (isRecord(attempt) && ['ready', 'running', 'paused', 'completed'].includes(attempt.status) && validTime(attempt.elapsedMs)) {
      if (attempt.status === 'running' || attempt.status === 'paused') {
        state.attempts[round.id] = { status: 'paused', answers: sanitizeAnswers(attempt.answers), elapsedMs: attempt.elapsedMs, startedAt: null };
      }
      const result = saved.latestResults?.[round.id];
      if (attempt.status === 'completed' && isRecord(result) && validTime(result.elapsedMs) && validTime(result.completedAt)) {
        const answers = sanitizeAnswers(result.answers);
        if (answeredCount(round, answers) === round.questions.length) {
          state.latestResults[round.id] = scoreRound(round, answers, result.elapsedMs, result.completedAt);
          state.attempts[round.id] = { status: 'completed', answers, elapsedMs: result.elapsedMs, startedAt: null };
        }
      }
    }
    const content = getMarkableContent(round);
    for (const [key, text] of Object.entries(content)) {
      const ranges = normalizeRanges(saved.marks?.[round.id]?.[key], text.length);
      if (ranges.length) state.marks[round.id][key] = ranges;
    }
  }
  return state;
}

export function loadState(storage, rounds) {
  try {
    if (!storage) return { state: createInitialState(rounds), available: false };
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return { state: createInitialState(rounds), available: true };
    try { return { state: restoreState(JSON.parse(raw), rounds), available: true }; }
    catch { return { state: createInitialState(rounds), available: true }; }
  } catch {
    return { state: createInitialState(rounds), available: false };
  }
}

export function saveState(storage, state, rounds, now) {
  try {
    if (!storage) return false;
    storage.setItem(STORAGE_KEY, JSON.stringify(snapshotState(state, rounds, now)));
    return true;
  } catch { return false; }
}
