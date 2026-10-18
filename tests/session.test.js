import test from 'node:test';
import assert from 'node:assert/strict';
import { rounds, validateRounds } from '../src/data/rounds.js';
import { answeredCount, scoreRound } from '../src/domain/scoring.js';
import { createInitialState, elapsedTime, reduceSession } from '../src/domain/session.js';

const dispatch = (state, type, fields = {}) => reduceSession(state, { type, now: 1000, ...fields }, rounds);
const answerAll = (state, correct = true) => rounds.find(r => r.id === state.activeRoundId).questions.reduce((next, q) =>
  dispatch(next, 'ANSWER', { questionId: q.id, headingId: correct ? q.correctHeadingId : 'vii' }), state);

test('all three rounds have valid IDs and keys with five distinct questions', () => {
  validateRounds(rounds);
  assert.deepEqual(rounds.map(r => r.label), ['Round 1', 'Round 2', 'Round 3']);
  for (const round of rounds) {
    assert.equal(round.questions.length, 5);
    assert.equal(scoreRound(round, Object.fromEntries(round.questions.map(q => [q.id, q.correctHeadingId])), 1234, 10).score, 5);
  }
});

test('scoring handles wrong and missing answers without mutating input', () => {
  const answers = Object.freeze({ q1: 'iii', q2: 'i', unknown: 'v' });
  const result = scoreRound(rounds[0], answers, 123456, 500000);
  assert.equal(result.score, 1);
  assert.equal(result.total, 5);
  assert.equal(result.items[2].answer, null);
  assert.equal(result.elapsedMs, 123456);
  assert.equal(answeredCount(rounds[0], answers), 2);
  assert.equal(result.answers.unknown, undefined);
});

test('a paused timer excludes all time between pause and resume', () => {
  let state = dispatch(createInitialState(rounds), 'START', { now: 0 });
  assert.equal(elapsedTime(state.attempts['round-1'], 4000), 4000);
  state = dispatch(state, 'PAUSE', { now: 4000 });
  assert.equal(elapsedTime(state.attempts['round-1'], 90000), 4000);
  state = dispatch(state, 'START', { now: 90000 });
  assert.equal(elapsedTime(state.attempts['round-1'], 93000), 7000);
});

test('switching rounds pauses the old timer and isolates answers', () => {
  let state = dispatch(createInitialState(rounds), 'START');
  state = dispatch(state, 'ANSWER', { questionId: 'q1', headingId: 'iii' });
  state = dispatch(state, 'SELECT_ROUND', { roundId: 'round-3', now: 6000 });
  assert.equal(state.attempts['round-1'].status, 'paused');
  assert.equal(state.attempts['round-1'].elapsedMs, 5000);
  assert.deepEqual(state.attempts['round-3'].answers, {});
  state = dispatch(state, 'START', { now: 8000 });
  state = dispatch(state, 'ANSWER', { questionId: 'q1', headingId: 'iv' });
  state = dispatch(state, 'SELECT_ROUND', { roundId: 'round-1', now: 12000 });
  assert.equal(state.attempts['round-1'].answers.q1, 'iii');
  assert.equal(state.attempts['round-3'].answers.q1, 'iv');
  assert.equal(state.attempts['round-3'].elapsedMs, 4000);
  assert.equal(state.attempts['round-1'].status, 'paused');
});

test('ready, paused and completed attempts reject answer changes', () => {
  let state = createInitialState(rounds);
  const action = { questionId: 'q1', headingId: 'iii' };
  assert.strictEqual(dispatch(state, 'ANSWER', action), state);
  state = dispatch(state, 'START');
  state = dispatch(state, 'PAUSE');
  assert.strictEqual(dispatch(state, 'ANSWER', action), state);
  state = answerAll(dispatch(state, 'START'));
  state = dispatch(state, 'SUBMIT');
  assert.strictEqual(dispatch(state, 'ANSWER', { questionId: 'q1', headingId: 'i' }), state);
});

test('unknown IDs are ignored and blanking a selection removes the answer', () => {
  let state = dispatch(createInitialState(rounds), 'START');
  assert.strictEqual(dispatch(state, 'SELECT_ROUND', { roundId: 'missing' }), state);
  assert.strictEqual(dispatch(state, 'ANSWER', { questionId: 'bad', headingId: 'i' }), state);
  assert.strictEqual(dispatch(state, 'ANSWER', { questionId: 'q1', headingId: 'bad' }), state);
  state = dispatch(state, 'ANSWER', { questionId: 'q1', headingId: 'i' });
  state = dispatch(state, 'ANSWER', { questionId: 'q1', headingId: '' });
  assert.deepEqual(state.attempts['round-1'].answers, {});
});

test('incomplete submission is ignored, completed submission is idempotent', () => {
  let state = dispatch(createInitialState(rounds), 'START');
  assert.strictEqual(dispatch(state, 'SUBMIT'), state);
  state = answerAll(state);
  state = dispatch(state, 'SUBMIT', { now: 5000 });
  assert.equal(state.latestResults['round-1'].score, 5);
  assert.equal(state.latestResults['round-1'].elapsedMs, 4000);
  assert.strictEqual(dispatch(state, 'SUBMIT', { now: 99999 }), state);
});

test('three attempts retain only the latest result and time, including a worse result', () => {
  let state = createInitialState(rounds);
  for (let index = 0; index < 3; index++) {
    state = answerAll(dispatch(state, 'START', { now: 10000 }), index < 2);
    state = dispatch(state, 'SUBMIT', { now: 11000 + index * 500 });
    assert.equal(Object.keys(state.latestResults).length, 1);
    assert.equal(state.latestResults['round-1'].elapsedMs, 1000 + index * 500);
    assert.equal(state.latestResults['round-1'].score, index < 2 ? 5 : 0);
    if (index < 2) {
      state = dispatch(state, 'RETRY');
      assert.equal(state.latestResults['round-1'], undefined);
      assert.equal(state.attempts['round-1'].elapsedMs, 0);
      assert.deepEqual(state.attempts['round-1'].answers, {});
    }
  }
});

test('retrying one round leaves another round’s result intact', () => {
  let state = dispatch(answerAll(dispatch(createInitialState(rounds), 'START')), 'SUBMIT');
  const firstResult = state.latestResults['round-1'];
  state = dispatch(state, 'SELECT_ROUND', { roundId: 'round-2' });
  state = dispatch(answerAll(dispatch(state, 'START')), 'SUBMIT');
  state = dispatch(state, 'RETRY');
  assert.strictEqual(state.latestResults['round-1'], firstResult);
  assert.equal(state.latestResults['round-2'], undefined);
});

test('state transitions do not mutate earlier states', () => {
  const original = createInitialState(rounds);
  const originalJson = JSON.stringify(original);
  let state = dispatch(original, 'START');
  state = answerAll(state);
  state = dispatch(state, 'MARK', { key: 'passage:A', selection: { start: 0, end: 10 } });
  state = dispatch(state, 'SUBMIT', { now: 5000 });
  assert.equal(JSON.stringify(original), originalJson);
  assert.equal(state.latestResults['round-1'].score, 5);
});
