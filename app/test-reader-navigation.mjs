import assert from 'node:assert/strict';
import test from 'node:test';
import { revealSection } from './src/readerNavigation.ts';

test('section jumps move only the reading pane and focus without moving the window', () => {
  const calls = [];
  const pane = { scrollTop: 230, getBoundingClientRect: () => ({ top: 200 }), scrollTo: (value) => calls.push(value) };
  const target = {
    closest: (selector) => {
      assert.equal(selector, '.workspace-content');
      return pane;
    },
    getBoundingClientRect: () => ({ top: 400 }),
    focus: (value) => calls.push(value),
  };
  revealSection(target);
  assert.equal(target.tabIndex, -1);
  assert.deepEqual(calls, [{ preventScroll: true }, { top: 430, behavior: 'instant' }]);
});
