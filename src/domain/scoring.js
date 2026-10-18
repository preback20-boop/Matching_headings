// Pure scoring: no DOM, browser storage, or clock reads.
export function scoreRound(round, answers, elapsedMs, completedAt) {
  const items = round.questions.map(question => ({
    questionId: question.id,
    answer: answers[question.id] ?? null,
    correctAnswer: question.correctHeadingId,
    correct: answers[question.id] === question.correctHeadingId,
  }));
  return {
    score: items.filter(item => item.correct).length,
    total: items.length,
    elapsedMs: Math.max(0, Number.isFinite(elapsedMs) ? elapsedMs : 0),
    completedAt,
    answers: Object.fromEntries(items.filter(item => item.answer !== null).map(item => [item.questionId, item.answer])),
    items,
  };
}

export function answeredCount(round, answers) {
  return round.questions.filter(q => round.headings.some(h => h.id === answers[q.id])).length;
}
