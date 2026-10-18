// Optional browser acceptance test. See README for installing Playwright.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { rounds } from '../src/data/rounds.js';

let chromium;
try { ({ chromium } = await import(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright')); }
catch { throw new Error('Install the optional browser test tools: npm install --no-save playwright && npx playwright install chromium'); }

const root = fileURLToPath(new URL('..', import.meta.url));
const server = spawn(process.execPath, ['scripts/serve.mjs'], { cwd: root, env: { ...process.env, PORT: '4175', HOST: '127.0.0.1' }, stdio: ['ignore', 'pipe', 'pipe'] });
let browser;
try {
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Test server did not start.')), 10000);
    server.once('exit', code => { clearTimeout(timeout); reject(new Error(`Test server exited: ${code}`)); });
    server.stdout.on('data', data => { if (String(data).includes('Matching Headings:')) { clearTimeout(timeout); resolve(); } });
    server.stderr.on('data', data => process.stderr.write(data));
  });
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1080 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.clock.install({ time: new Date('2026-10-18T12:00:00Z') });
  await page.clock.pauseAt(new Date('2026-10-18T12:00:01Z'));
  await page.goto('http://127.0.0.1:4175');
  await page.waitForSelector('#round-title');
  assert.equal(await page.locator('[data-round]').count(), 3);
  assert.equal(await page.locator('select:disabled').count(), 5);
  await mkdir(new URL('../test-results/', import.meta.url), { recursive: true });
  await page.screenshot({ path: `${root}/test-results/desktop.png`, fullPage: true });

  const selectText = async (startKey, start, endKey, end) => {
    await page.evaluate(({ startKey, start, endKey, end }) => {
      const startElement = document.querySelector(`[data-mark-key="${startKey}"]`);
      const endElement = document.querySelector(`[data-mark-key="${endKey}"]`);
      const boundary = (element, offset) => {
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
          if (offset <= node.length) return [node, offset];
          offset -= node.length;
        }
        throw new Error('Selection offset is outside the text.');
      };
      const range = document.createRange();
      range.setStart(...boundary(startElement, start));
      range.setEnd(...boundary(endElement, end));
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      document.dispatchEvent(new Event('selectionchange'));
    }, { startKey, start, endKey, end });
  };
  const mark = async (key, start, end) => {
    await selectText(key, start, key, end);
    await page.locator('[data-action="highlight"]').click();
  };
  await mark('passage:A', 0, 14);
  await mark('heading:i', 0, 10);
  await mark('question:q1', 0, 10);
  assert.equal(await page.locator('[data-mark-key="passage:A"] mark').textContent(), 'For many years');
  assert.equal(await page.locator('[data-mark-key="heading:i"] mark').count(), 1);
  assert.equal(await page.locator('[data-mark-key="question:q1"] mark').count(), 1);
  await selectText('passage:A', 4, 'passage:A', 8);
  await page.locator('[data-action="erase"]').click();
  assert.equal(await page.locator('[data-mark-key="passage:A"] mark').count(), 2);
  await selectText('passage:A', 15, 'passage:B', 12);
  await page.locator('[data-action="highlight"]').click();
  assert.equal(await page.locator('[data-mark-key="passage:B"] mark').textContent(), 'On a sunny d');

  await page.locator('[data-action="start"]').click();
  await page.locator('#answer-q1').selectOption('iii');
  await page.clock.fastForward(65000);
  assert.equal(await page.locator('#timer').textContent(), '01:05');
  await page.locator('[data-round="round-2"]').click();
  await page.locator('[data-action="start"]').click();
  await page.locator('#answer-q1').selectOption('iv');
  await page.clock.fastForward(30000);
  await page.locator('[data-round="round-1"]').click();
  assert.equal(await page.locator('#timer').textContent(), '01:05');
  assert.equal(await page.locator('#answer-q1').inputValue(), 'iii');
  assert.equal(await page.locator('[data-action="start"]').textContent(), 'Resume round →');
  await page.reload();
  await page.waitForSelector('#round-title');
  assert.equal(await page.locator('#timer').textContent(), '01:05');
  assert.equal(await page.locator('#answer-q1').inputValue(), 'iii');
  assert.equal(await page.locator('[data-mark-key="question:q1"] mark').count(), 1);
  await page.locator('[data-action="start"]').click();
  for (const q of rounds[0].questions) await page.locator(`#answer-${q.id}`).selectOption(q.correctHeadingId);
  await page.locator('[data-action="submit"]').click();
  assert.equal(await page.locator('#latest-result').count(), 1);
  assert.equal(await page.locator('[data-result-score]').textContent(), '5 / 5');
  assert.equal(await page.locator('[data-result-time]').textContent(), '01:05');
  assert.equal(await page.locator('.answer-review').count(), 5);
  await page.locator('[data-action="retry"]').click();
  assert.equal(await page.locator('#latest-result').count(), 0);
  assert.equal(await page.locator('#timer').textContent(), '00:00');
  assert.equal(await page.locator('#answer-q1').inputValue(), '');
  assert.equal(await page.locator('[data-mark-key="question:q1"] mark').count(), 1);
  await page.locator('[data-action="start"]').click();
  for (const q of rounds[0].questions) await page.locator(`#answer-${q.id}`).selectOption('vii');
  await page.clock.fastForward(12000);
  await page.locator('[data-action="submit"]').click();
  assert.equal(await page.locator('#latest-result').count(), 1);
  assert.equal(await page.locator('[data-result-score]').textContent(), '0 / 5');
  assert.equal(await page.locator('[data-result-time]').textContent(), '00:12');
  await page.reload();
  await page.waitForSelector('#latest-result');
  assert.equal(await page.locator('[data-result-score]').textContent(), '0 / 5');
  assert.equal(await page.locator('[data-result-time]').textContent(), '00:12');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('matching-headings:session:v1')));
  assert.equal(Object.keys(saved.latestResults).length, 1);
  assert.equal(saved.latestResults['round-1'].score, 0);
  assert.equal(saved.attempts['round-2'].answers.q1, 'iv');

  await page.locator('[data-action="clear-passage"]').click();
  assert.equal(await page.locator('.passage-panel mark').count(), 0);
  assert.equal(await page.locator('.questions-panel mark').count(), 2);
  await page.locator('[data-action="clear-questions"]').click();
  assert.equal(await page.locator('.questions-panel mark').count(), 0);
  await page.locator('[data-round="round-3"]').click();
  await page.locator('[data-action="start"]').click();
  for (const q of rounds[2].questions) await page.locator(`#answer-${q.id}`).selectOption(q.correctHeadingId);
  await page.locator('[data-action="submit"]').click();
  assert.equal(await page.locator('[data-result-score]').textContent(), '5 / 5');
  await page.screenshot({ path: `${root}/test-results/review.png`, fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: `${root}/test-results/mobile.png`, fullPage: true });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
  assert.deepEqual(errors, []);

  const blocked = await browser.newPage();
  await blocked.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage blocked'); } }));
  await blocked.goto('http://127.0.0.1:4175');
  await blocked.waitForSelector('#round-title');
  assert.equal(await blocked.locator('#storage-warning').isVisible(), true);
  await blocked.locator('[data-action="start"]').click();
  await blocked.locator('#answer-q1').selectOption('iii');
  assert.equal(await blocked.locator('#answer-count').textContent(), '1 of 5');
  console.log('PASS: desktop/mobile layout; passage, heading and question marking; multi-paragraph selection; erase; pause/resume; round isolation; reload; latest-only result replacement; Round 3; blocked storage; no browser errors.');
} finally {
  await browser?.close();
  server.kill();
}
