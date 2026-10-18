import { normalizeRanges } from '../domain/marks.js';

export function paintMarks(element, text, ranges) {
  const fragment = document.createDocumentFragment();
  let offset = 0;
  for (const range of normalizeRanges(ranges, text.length)) {
    fragment.append(document.createTextNode(text.slice(offset, range.start)));
    const mark = document.createElement('mark');
    mark.textContent = text.slice(range.start, range.end);
    fragment.append(mark);
    offset = range.end;
  }
  fragment.append(document.createTextNode(text.slice(offset)));
  element.replaceChildren(fragment);
}

// One selection may cross multiple paragraphs or include already marked text.
export function readSelection(root, selection = window.getSelection()) {
  if (!selection || selection.isCollapsed || !selection.rangeCount) return [];
  const selected = selection.getRangeAt(0);
  const selections = [];
  for (const element of root.querySelectorAll('[data-mark-key]')) {
    if (!selected.intersectsNode(element)) continue;
    const local = document.createRange();
    local.selectNodeContents(element);
    if (selected.compareBoundaryPoints(Range.START_TO_START, local) > 0) local.setStart(selected.startContainer, selected.startOffset);
    if (selected.compareBoundaryPoints(Range.END_TO_END, local) < 0) local.setEnd(selected.endContainer, selected.endOffset);
    if (!local.toString().length) continue;
    const prefix = document.createRange();
    prefix.selectNodeContents(element);
    prefix.setEnd(local.startContainer, local.startOffset);
    const start = prefix.toString().length;
    selections.push({ key: element.dataset.markKey, selection: { start, end: start + local.toString().length } });
  }
  return selections;
}
