import test from 'node:test';
import assert from 'node:assert/strict';
import { addMark, eraseMark, normalizeRanges } from '../src/domain/marks.js';
import { rounds } from '../src/data/rounds.js';
import { createInitialState, reduceSession } from '../src/domain/session.js';

test('overlapping and adjacent highlights merge without duplicates', () => {
  const ranges = [{ start: 3, end: 8 }, { start: 12, end: 18 }];
  assert.deepEqual(addMark(ranges, { start: 8, end: 14 }, 100), [{ start: 3, end: 18 }]);
  assert.deepEqual(ranges, [{ start: 3, end: 8 }, { start: 12, end: 18 }]);
});

test('erasing the middle of a mark preserves both remaining pieces', () => {
  assert.deepEqual(eraseMark([{ start: 2, end: 20 }], { start: 5, end: 10 }, 100), [{ start: 2, end: 5 }, { start: 10, end: 20 }]);
});

test('invalid or out-of-bounds stored offsets are discarded or clamped', () => {
  assert.deepEqual(normalizeRanges([null, { start: -10, end: 5 }, { start: 8, end: 999 }, { start: 4.5, end: 8 }, { start: 20, end: 10 }], 15), [{ start: 0, end: 5 }, { start: 8, end: 15 }]);
  assert.deepEqual(normalizeRanges({}, 15), []);
});

test('passage, heading and question marks are independent, including across rounds', () => {
  let state = createInitialState(rounds);
  for (const key of ['passage:A', 'heading:i', 'question:q1']) state = reduceSession(state, { type: 'MARK', key, selection: { start: 0, end: 8 } }, rounds);
  state = reduceSession(state, { type: 'SELECT_ROUND', roundId: 'round-3', now: 0 }, rounds);
  assert.deepEqual(state.marks['round-3'], {});
  state = reduceSession(state, { type: 'SELECT_ROUND', roundId: 'round-1', now: 0 }, rounds);
  state = reduceSession(state, { type: 'CLEAR_MARKS', section: 'passage' }, rounds);
  assert.equal(state.marks['round-1']['passage:A'], undefined);
  assert.deepEqual(Object.keys(state.marks['round-1']), ['heading:i', 'question:q1']);
  state = reduceSession(state, { type: 'CLEAR_MARKS', section: 'questions' }, rounds);
  assert.deepEqual(state.marks['round-1'], {});
});
