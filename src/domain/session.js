import { getMarkableContent } from '../data/rounds.js';
import { addMark, eraseMark } from './marks.js';
import { answeredCount, scoreRound } from './scoring.js';

export const emptyAttempt = () => ({ status: 'ready', answers: {}, elapsedMs: 0, startedAt: null });

export function createInitialState(rounds) {
  return {
    activeRoundId: rounds[0].id,
    attempts: Object.fromEntries(rounds.map(r => [r.id, emptyAttempt()])),
    latestResults: {},
    marks: Object.fromEntries(rounds.map(r => [r.id, {}])),
  };
}

export function elapsedTime(attempt, now) {
  return attempt.elapsedMs + (attempt.status === 'running' ? Math.max(0, now - attempt.startedAt) : 0);
}

export function pauseAttempt(attempt, now) {
  return attempt.status === 'running'
    ? { ...attempt, status: 'paused', elapsedMs: elapsedTime(attempt, now), startedAt: null }
    : attempt;
}

// All time-dependent actions receive their timestamp from the caller.
// A result is a single value keyed by round ID; there is no attempt-history list.
export function reduceSession(state, action, rounds) {
  const round = rounds.find(r => r.id === state.activeRoundId);
  const attempt = state.attempts[round.id];
  const withAttempt = next => ({ ...state, attempts: { ...state.attempts, [round.id]: next } });
  switch (action.type) {
    case 'SELECT_ROUND': {
      if (!rounds.some(r => r.id === action.roundId) || action.roundId === round.id) return state;
      return { ...withAttempt(pauseAttempt(attempt, action.now)), activeRoundId: action.roundId };
    }
    case 'START':
      if (!['ready', 'paused'].includes(attempt.status)) return state;
      return withAttempt({ ...attempt, status: 'running', startedAt: action.now });
    case 'PAUSE':
      return withAttempt(pauseAttempt(attempt, action.now));
    case 'ANSWER': {
      if (attempt.status !== 'running' || !round.questions.some(q => q.id === action.questionId) ||
          (action.headingId !== '' && !round.headings.some(h => h.id === action.headingId))) return state;
      const answers = { ...attempt.answers };
      if (action.headingId) answers[action.questionId] = action.headingId;
      else delete answers[action.questionId];
      return withAttempt({ ...attempt, answers });
    }
    case 'SUBMIT': {
      if (!['running', 'paused'].includes(attempt.status) || answeredCount(round, attempt.answers) !== round.questions.length) return state;
      const elapsedMs = elapsedTime(attempt, action.now);
      const result = scoreRound(round, attempt.answers, elapsedMs, action.now);
      return {
        ...withAttempt({ ...attempt, status: 'completed', elapsedMs, startedAt: null }),
        latestResults: { ...state.latestResults, [round.id]: result },
      };
    }
    case 'RETRY': {
      if (attempt.status !== 'completed') return state;
      const latestResults = { ...state.latestResults };
      delete latestResults[round.id];
      return { ...withAttempt(emptyAttempt()), latestResults };
    }
    case 'MARK':
    case 'ERASE_MARK': {
      const text = getMarkableContent(round)[action.key];
      if (typeof text !== 'string') return state;
      const change = action.type === 'MARK' ? addMark : eraseMark;
      const marks = { ...state.marks[round.id] };
      const ranges = change(marks[action.key] ?? [], action.selection, text.length);
      if (ranges.length) marks[action.key] = ranges;
      else delete marks[action.key];
      return { ...state, marks: { ...state.marks, [round.id]: marks } };
    }
    case 'CLEAR_MARKS': {
      if (!['passage', 'questions'].includes(action.section)) return state;
      const marks = Object.fromEntries(Object.entries(state.marks[round.id]).filter(([key]) =>
        action.section === 'passage' ? !key.startsWith('passage:') : key.startsWith('passage:')));
      return { ...state, marks: { ...state.marks, [round.id]: marks } };
    }
    default:
      return state;
  }
}
