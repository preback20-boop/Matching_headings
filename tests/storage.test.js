import test from 'node:test';
import assert from 'node:assert/strict';
import { rounds } from '../src/data/rounds.js';
import { createInitialState, reduceSession } from '../src/domain/session.js';
import { STORAGE_KEY, loadState, restoreState, saveState, snapshotState } from '../src/infrastructure/storage.js';

test('reload restores answers and marks with a paused timer', () => {
  let state = reduceSession(createInitialState(rounds), { type: 'START', now: 1000 }, rounds);
  state = reduceSession(state, { type: 'ANSWER', questionId: 'q1', headingId: 'iii' }, rounds);
  state = reduceSession(state, { type: 'MARK', key: 'question:q1', selection: { start: 1, end: 7 } }, rounds);
  const restored = restoreState(snapshotState(state, rounds, 8000), rounds);
  assert.equal(restored.attempts['round-1'].status, 'paused');
  assert.equal(restored.attempts['round-1'].elapsedMs, 7000);
  assert.equal(restored.attempts['round-1'].startedAt, null);
  assert.equal(restored.attempts['round-1'].answers.q1, 'iii');
  assert.deepEqual(restored.marks, state.marks);
  assert.equal(state.attempts['round-1'].status, 'running');
});

test('stored results are recalculated from valid answers rather than trusted scores', () => {
  let state = reduceSession(createInitialState(rounds), { type: 'START', now: 0 }, rounds);
  for (const q of rounds[0].questions) state = reduceSession(state, { type: 'ANSWER', questionId: q.id, headingId: q.correctHeadingId }, rounds);
  state = reduceSession(state, { type: 'SUBMIT', now: 12000 }, rounds);
  const saved = JSON.parse(JSON.stringify(snapshotState(state, rounds, 12000)));
  saved.latestResults['round-1'].score = 999;
  const restored = restoreState(saved, rounds);
  assert.equal(restored.latestResults['round-1'].score, 5);
  assert.equal(restored.latestResults['round-1'].elapsedMs, 12000);
  assert.equal(restored.attempts['round-1'].status, 'completed');
});

test('a changed content revision resets only the affected round', () => {
  let state = reduceSession(createInitialState(rounds), { type: 'START', now: 0 }, rounds);
  state = reduceSession(state, { type: 'ANSWER', questionId: 'q1', headingId: 'iii' }, rounds);
  state = reduceSession(state, { type: 'SELECT_ROUND', roundId: 'round-2', now: 2000 }, rounds);
  state = reduceSession(state, { type: 'START', now: 2000 }, rounds);
  state = reduceSession(state, { type: 'ANSWER', questionId: 'q1', headingId: 'iv' }, rounds);
  const changed = rounds.map((r, i) => i === 0 ? { ...r, revision: r.revision + 1 } : r);
  const restored = restoreState(snapshotState(state, rounds, 5000), changed);
  assert.equal(restored.attempts['round-1'].status, 'ready');
  assert.equal(restored.attempts['round-2'].answers.q1, 'iv');
});

test('corrupt data, unknown versions and failed storage are handled safely', () => {
  assert.deepEqual(restoreState(null, rounds), createInitialState(rounds));
  assert.deepEqual(restoreState({ version: 999 }, rounds), createInitialState(rounds));
  assert.deepEqual(loadState({ getItem: () => '{bad json' }, rounds).state, createInitialState(rounds));
  const failing = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('full'); } };
  assert.equal(loadState(failing, rounds).available, false);
  assert.equal(saveState(failing, createInitialState(rounds), rounds, 0), false);
  assert.equal(saveState(null, createInitialState(rounds), rounds, 0), false);
});

test('saved progress survives a storage round-trip with only one result slot per round', () => {
  const map = new Map();
  const storage = { getItem: key => map.get(key), setItem: (key, value) => map.set(key, value) };
  assert.equal(saveState(storage, createInitialState(rounds), rounds, 10), true);
  assert.ok(map.has(STORAGE_KEY));
  assert.deepEqual(loadState(storage, rounds).state, createInitialState(rounds));
});

test('malformed answers, statuses, results and mark keys cannot enter restored state', () => {
  const saved = snapshotState(createInitialState(rounds), rounds, 0);
  saved.attempts['round-1'] = { status: 'paused', elapsedMs: 1000, answers: { q1: 'bad', q2: 'v', q99: 'i' } };
  saved.attempts['round-2'] = { status: 'completed', elapsedMs: Infinity, answers: {} };
  saved.marks['round-1'] = { unknown: [{ start: 0, end: 10 }], 'passage:A': [{ start: 0, end: 999999 }] };
  const restored = restoreState(saved, rounds);
  assert.deepEqual(restored.attempts['round-1'].answers, { q2: 'v' });
  assert.equal(restored.attempts['round-2'].status, 'ready');
  assert.equal(restored.marks['round-1'].unknown, undefined);
  assert.equal(restored.marks['round-1']['passage:A'][0].end, rounds[0].paragraphs[0].text.length);
});
