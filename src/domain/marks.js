// Offsets refer to the original text, never to generated HTML.
export function normalizeRanges(ranges, textLength) {
  const sorted = (Array.isArray(ranges) ? ranges : [])
    .filter(r => r && Number.isInteger(r.start) && Number.isInteger(r.end))
    .map(r => ({ start: Math.max(0, r.start), end: Math.min(textLength, r.end) }))
    .filter(r => r.end > r.start)
    .sort((a, b) => a.start - b.start);
  return sorted.reduce((result, range) => {
    const previous = result.at(-1);
    if (previous && range.start <= previous.end) previous.end = Math.max(previous.end, range.end);
    else result.push({ ...range });
    return result;
  }, []);
}

export function addMark(ranges, selection, textLength) {
  return normalizeRanges([...ranges, selection], textLength);
}

export function eraseMark(ranges, selection, textLength) {
  const cut = normalizeRanges([selection], textLength)[0];
  if (!cut) return normalizeRanges(ranges, textLength);
  return normalizeRanges(ranges.flatMap(range => {
    if (cut.end <= range.start || cut.start >= range.end) return [range];
    const pieces = [];
    if (range.start < cut.start) pieces.push({ start: range.start, end: cut.start });
    if (range.end > cut.end) pieces.push({ start: cut.end, end: range.end });
    return pieces;
  }), textLength);
}
