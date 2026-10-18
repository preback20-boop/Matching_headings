import { answeredCount } from '../domain/scoring.js';
import { elapsedTime } from '../domain/session.js';

export const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function formatTime(ms) {
  const seconds = Math.floor(Math.max(0, ms) / 1000);
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
}

const statusText = { ready: 'Ready when you are', running: 'In progress', paused: 'Paused', completed: 'Completed' };

export function renderNav(rounds, state) {
  return rounds.map((round, index) => `<button type="button" class="round-tab ${state.activeRoundId === round.id ? 'active' : ''}"
    data-round="${escapeHTML(round.id)}" aria-current="${state.activeRoundId === round.id ? 'step' : 'false'}">
    <span class="round-number">${String(index + 1).padStart(2, '0')}</span><span><strong>${escapeHTML(round.label)}</strong>
    <span class="round-status">${statusText[state.attempts[round.id].status]}</span></span><span class="round-arrow" aria-hidden="true">↗</span></button>`).join('');
}

export function renderRound(round, state, now) {
  const attempt = state.attempts[round.id];
  const result = state.latestResults[round.id];
  const count = answeredCount(round, attempt.answers);
  const running = attempt.status === 'running';
  const completed = attempt.status === 'completed';
  const controlAction = running ? 'pause' : completed ? 'retry' : 'start';
  const controlLabel = running ? 'Pause' : completed ? 'Try again' : attempt.status === 'paused' ? 'Resume round' : 'Start round';
  const extras = round.headings.length - round.questions.length;
  const extraInstructions = extras > 0 ? ` There ${extras === 1 ? 'is' : 'are'} ${extras} extra heading${extras === 1 ? '' : 's'}.` : '';
  const questionStatus = completed ? 'Review your answers and the main idea behind each heading.'
    : running ? `Choose one heading for each paragraph.${extraInstructions}`
    : attempt.status === 'paused' ? 'Your timer is paused. Resume the round to continue answering.' : 'Start the round to begin the timer and choose your answers.';
  return `<section class="round-heading" aria-labelledby="round-title">
    <div><p class="eyebrow">${escapeHTML(round.topic)}</p><h2 id="round-title" tabindex="-1">${escapeHTML(round.title)}</h2><p>${escapeHTML(round.description)}</p></div>
    <div class="session-controls"><div class="timer"><span class="timer-label">${completed ? 'FINISHED' : running ? 'TIME ELAPSED' : attempt.status === 'paused' ? 'TIMER PAUSED' : 'YOUR TIMER'}</span><span id="timer" role="timer" aria-label="Elapsed time">${formatTime(elapsedTime(attempt, now))}</span></div>
    <button type="button" id="session-control" class="button ${running ? 'secondary' : 'primary'}" data-action="${controlAction}">${controlLabel}${running ? '' : '<span aria-hidden="true"> →</span>'}</button></div>
  </section>
  ${result ? `<section id="latest-result" class="result-card" tabindex="-1" aria-labelledby="result-title"><div><p class="eyebrow" id="result-title">LATEST RESULT · ${escapeHTML(round.label)}</p><p class="result-caption">${result.score === result.total ? 'Every main idea, matched.' : 'Good practice. Now look at the reasoning.'}</p></div><div class="result-values"><div><strong data-result-score>${result.score}<span> / ${result.total}</span></strong><span>correct answers</span></div><div><strong data-result-time>${formatTime(result.elapsedMs)}</strong><span>time taken</span></div></div><p class="retry-note">Try again for a fresh score and timer. Your highlights stay.</p></section>` : ''}
  <div class="mark-toolbar" role="group" aria-label="Text marking tools">
    <div class="mark-help"><span class="marker-icon" aria-hidden="true">✎</span><span><strong>Make it yours.</strong> Select text in either panel to mark the key idea.</span></div>
    <div class="mark-actions"><button type="button" class="button highlight-button" data-action="highlight" disabled>Highlight</button><button type="button" class="button quiet" data-action="erase" disabled>Remove mark</button></div>
  </div>
  <div class="practice-grid">
    <section class="panel passage-panel" aria-labelledby="passage-title"><header class="panel-heading"><div><span class="panel-index">01</span><h3 id="passage-title">The passage</h3></div><button type="button" class="text-button" data-action="clear-passage" aria-label="Clear passage highlights">Clear marks</button></header>
    <div class="panel-scroll" id="passage-scroll"><div class="reading-note"><span class="eyebrow">READ FOR THE MAIN IDEA</span><span>Suggested pace: ${round.suggestedMinutes} min</span></div>
      ${round.paragraphs.map(p => `<article class="paragraph" aria-labelledby="paragraph-${escapeHTML(p.id)}"><h4 id="paragraph-${escapeHTML(p.id)}" class="paragraph-label">${escapeHTML(p.id)}</h4><p data-mark-key="passage:${escapeHTML(p.id)}">${escapeHTML(p.text)}</p></article>`).join('')}
      <aside class="reading-tip"><span aria-hidden="true">↳</span><p><strong>A small reminder</strong><br />A heading should cover the whole paragraph, not just a familiar word.</p></aside>
    </div></section>
    <section class="panel questions-panel" aria-labelledby="questions-title"><header class="panel-heading"><div><span class="panel-index">02</span><h3 id="questions-title">Your headings</h3></div><button type="button" class="text-button" data-action="clear-questions" aria-label="Clear question and heading highlights">Clear marks</button></header>
    <div class="panel-scroll" id="questions-scroll"><p class="question-instructions" id="question-instructions">${questionStatus}</p>
    <div class="heading-list"><p class="eyebrow">LIST OF HEADINGS</p><ol>${round.headings.map(h => `<li><span class="roman">${escapeHTML(h.id)}</span><span data-mark-key="heading:${escapeHTML(h.id)}">${escapeHTML(h.text)}</span></li>`).join('')}</ol></div>
    <div class="answer-heading"><h4>Match the paragraphs</h4><span id="answer-count">${count} of ${round.questions.length}</span></div><progress id="answer-progress" value="${count}" max="${round.questions.length}" aria-label="Questions answered"></progress>
    <div class="question-list">${round.questions.map((q, index) => {
      const item = result?.items.find(item => item.questionId === q.id);
      const correctHeading = round.headings.find(h => h.id === q.correctHeadingId);
      return `<div class="question ${item ? item.correct ? 'is-correct' : 'is-incorrect' : ''}"><label for="answer-${escapeHTML(q.id)}"><span class="question-number">${index + 1}</span><span data-mark-key="question:${escapeHTML(q.id)}">${escapeHTML(q.text)}</span></label>
        <select id="answer-${escapeHTML(q.id)}" data-question="${escapeHTML(q.id)}" aria-describedby="question-instructions${item ? ` review-${escapeHTML(q.id)}` : ''}" ${running ? '' : 'disabled'}><option value="">Choose a heading…</option>${round.headings.map(h => `<option value="${escapeHTML(h.id)}" ${attempt.answers[q.id] === h.id ? 'selected' : ''}>${escapeHTML(h.id)} — ${escapeHTML(h.text)}</option>`).join('')}</select>
        ${item ? `<div class="answer-review" id="review-${escapeHTML(q.id)}"><strong>${item.correct ? '✓ Correct' : `↳ Correct heading: ${escapeHTML(correctHeading.id)} — ${escapeHTML(correctHeading.text)}`}</strong><p>${escapeHTML(q.explanation)}</p></div>` : ''}</div>`;
    }).join('')}</div>
    ${completed ? '<p class="completion-note">Your latest score is saved. Use “Try again” for another attempt.</p>' : `<button type="button" class="button primary submit-button" id="submit-round" data-action="submit" ${count === round.questions.length && ['running', 'paused'].includes(attempt.status) ? '' : 'disabled'}>Check my answers <span aria-hidden="true">→</span></button><p class="submit-help">Answer all ${round.questions.length} questions to check your result.</p>`}
    </div></section>
  </div>`;
}
