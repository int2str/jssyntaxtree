// jsSyntaxTree - A syntax tree graph generator
// Inner bracket text highlighting for accessibility
// Enrique Lopez, Oct 12th, 2025

let highlighting_enabled = true;

export function setup(code, highlight) {
  code.addEventListener("input", () => updateHighlight(code, highlight));
  code.addEventListener("click", () =>
    updateHighlight(code, highlight, code.selectionStart),
  );
  code.addEventListener("keyup", () =>
    updateHighlight(code, highlight, code.selectionStart),
  );
  code.addEventListener("scroll", () => {
    highlight.scrollTop = code.scrollTop;
    highlight.scrollLeft = code.scrollLeft;
  });
}

export function enable(code, highlight, enabled) {
  highlighting_enabled = enabled;
  updateHighlight(code, highlight, code.selectionStart);
}

function escapeHTML(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function innerBrackets(text, position) {
  const open = new Array();

  for (let i = 0; i < text.length; ++i) {
    if (text[i] === "[") open.push(i);

    if (text[i] === "]") {
      const start = open.pop();
      if (start !== undefined && position >= start && position <= i)
        return [start, i];
    }
  }

  return [undefined, undefined];
}

function applyMark(text, begin, end) {
  if (begin === undefined || end === undefined) return text;
  const prefix = escapeHTML(text.slice(0, begin));
  const to_mark = escapeHTML(text.slice(begin, end + 1));
  const postfix = escapeHTML(text.slice(end + 1));
  return `${prefix}<mark>${to_mark}</mark>${postfix}`;
}

function updateHighlight(code, highlight, position) {
  if (highlighting_enabled) {
    const [begin, end] = innerBrackets(code.value, position);
    highlight.innerHTML = applyMark(code.value, begin, end);
  } else {
    highlight.innerHTML = escapeHTML(code.value);
  }

  highlight.style.width = `${code.clientWidth}px`;
  highlight.style.height = `${code.clientHeight}px`;
  highlight.scrollTop = code.scrollTop;
  highlight.scrollLeft = code.scrollLeft;
}
