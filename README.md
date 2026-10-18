# Matching Headings

A complete, dependency-free browser starter for IELTS-style matching-headings practice. Includes **Round 1, Round 2 and Round 3**, each with an original passage, five questions, seven headings and answer explanations. The content is practice material, not an official IELTS test or band-score predictor.

## Run locally

Use Node.js 22 or newer:

```sh
git clone https://github.com/preback20-boop/Matching_headings.git
cd Matching_headings
npm start
```

Open **http://127.0.0.1:4173**. There is no install or build step. Serve the app over HTTP; opening `index.html` directly via `file://` does not reliably support JavaScript modules.

`PORT=8080 npm start` changes the port. The included development server binds to localhost by default. To serve on your network, set `HOST=0.0.0.0`. For static hosting, upload `index.html` and `src/`; all assets use relative paths, including when hosted under a repository subdirectory. No hosting or deployment is automatically enabled.

## Practice behavior

- **Start / pause / resume:** the timer measures active attempt time. Switching rounds pauses the current attempt. The destination round stays ready or paused until explicitly started or resumed.
- **Independent rounds:** answers, elapsed time, highlights and the latest result belong to a stable round ID.
- **Latest result only:** submitting writes one result into `latestResults[roundId]`. A repeated submission is ignored. “Try again” clears that round’s previous score, time and answers, then waits for “Start round.” A later result replaces the previous one even if the new score is lower. No history or best-score list is kept.
- **Mark both sections:** select text in a passage, heading, or question prompt, then choose **Highlight**. Select marked text and choose **Remove mark** to erase just that range. Selection can span multiple paragraphs. Each panel also has its own **Clear marks** button. Native select-option text is not highlightable; the corresponding heading list is.
- **Review:** after all five questions have answers, “Check my answers” freezes the timer and shows the score, time, correct headings and explanations. Answers remain locked until retrying.
- **Retry keeps highlights:** marks survive retries for study. Clear them with the relevant panel’s button when you want a clean reading attempt.
- **Local persistence:** progress is saved in this browser after actions and approximately once per second while running. Reloads restore a paused timer; time spent away after closing the page is not added. A crash can lose up to roughly one second of active time. Storage errors show a notice but do not prevent practice. Data is not synced across browsers, devices or separate tabs; simultaneous tabs use last-write-wins storage.
- **Accessible controls:** labeled selects, visible keyboard focus, a skip link, status announcements, semantic sections and a responsive one-column mobile layout. Text marking uses the browser’s native selection support. On touch devices, long-press to select text before using the marking toolbar.

## Structure

```text
index.html                     App shell
src/
  data/rounds.js                Content, stable IDs and answer keys
  domain/scoring.js             Pure scoring and answered-count functions
  domain/session.js             Pure state transitions and timer calculations
  domain/marks.js               Pure highlight range merging and erasing
  infrastructure/storage.js    Validated, versioned browser persistence
  ui/view.js                    HTML rendering and display formatting
  ui/marking.js                 DOM selections and safe highlight rendering
  app.js                       Event wiring, clock and storage adapter
  styles.css                   Responsive presentation
scripts/serve.mjs              Small static development server
tests/                         Domain, persistence and browser acceptance checks
.github/workflows/test.yml      Node and browser tests on pushes and pull requests
```

The UI dispatches actions to `reduceSession(state, action, rounds)`. The reducer returns new state without accessing the DOM, reading storage or reading the clock. Timestamps are injected through actions. `scoreRound` independently derives a score from content and answers. A result is one object, not an array of attempts.

Highlights are character offsets into canonical text, stored separately from answers and scores. Rendering builds text nodes and `<mark>` elements; stored annotation data is never interpreted as HTML. Storage restoration filters unknown IDs, clamps offsets, rejects invalid timers, and recalculates results from valid answers.

## Add a round

Append an object to `rounds` in `src/data/rounds.js` with this shape:

```js
{
  id: 'round-4',
  revision: 1,
  label: 'Round 4',
  title: 'Your passage title',
  topic: 'YOUR TOPIC',
  suggestedMinutes: 8,
  description: 'A short description.',
  paragraphs: [{ id: 'A', text: 'Original paragraph text…' }],
  headings: [{ id: 'i', text: 'The main idea' }, { id: 'ii', text: 'A distractor' }],
  questions: [{
    id: 'q1', paragraphId: 'A',
    text: 'Choose the best heading for paragraph A.',
    correctHeadingId: 'i',
    explanation: 'Why this heading expresses the whole paragraph.'
  }]
}
```

Navigation, summary counts, instructions, answers, scoring and persistence derive from the data. No UI code changes are needed to add a round. Adjust content expectations in the tests if you change the existing three rounds. Keep IDs stable and unique within their lists. Increment a round’s `revision` when changing its text or answer key; this resets only that round’s saved progress and offsets. For a breaking storage-format change, increment the storage version and key in `storage.js` or add a migration.

## Tests

```sh
npm test
```

The built-in Node test runner checks all round keys, scoring, retries with a worse result, duplicate submissions, timer pausing, state isolation, immutable updates, overlapping/partial highlights, corrupted storage, revision changes and reload behavior. No dependencies are needed for these tests; GitHub Actions runs them automatically.

For the optional Chromium acceptance test:

```sh
npm install --no-save playwright@1.62.1
npx playwright install chromium
npm run test:ui
```

On a Linux machine missing browser system libraries, use `npx playwright install --with-deps chromium`. The script starts its own server on port 4175, checks real DOM selection/highlighting and the complete retry flow, and captures desktop, review and mobile screenshots in ignored `test-results/`. It also checks operation with browser storage blocked. GitHub Actions runs this check after the Node tests and uploads the screenshots. `PLAYWRIGHT_MODULE_PATH` may point to an existing Playwright module entry file.

## Scope

This is a static self-study app. Answer keys are shipped to the browser, so it is not a secure assessment system. There are no accounts, analytics, remote storage or runtime package dependencies. Add further question types as separate content/scoring modules, and add synchronization behind a storage adapter if needed.
