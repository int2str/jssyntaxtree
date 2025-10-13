// jsSyntaxTree - A syntax tree graph generator
// highlighting to aid those with a visual impairment
// Enrique Lopez, Oct 12 2025 

export function setupBracketHighlighting(textareaId = "code", highlightId = "highlight") {
  const editor = document.getElementById(textareaId);
  const highlight = document.getElementById(highlightId);
  if (!editor || !highlight) return;


document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('code');
    const highlight = document.getElementById('highlight');

});

  function escapeHTML(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function updateHighlight(cursorPos = null) {
    const text = editor.value;
    let openStack = [];
    let highlightStart = null;
    let highlightEnd = null;

    for (let i = 0; i < text.length; i++) {
      if (text[i] === '[') openStack.push(i);
      else if (text[i] === ']') {
        const start = openStack.pop();
        if (start !== undefined && cursorPos >= start && cursorPos <= i) {
          highlightStart = start;
          highlightEnd = i;
          break;
        }
      }
    }

    let html = '';
    for (let i = 0; i < text.length; i++) {
      if (i === highlightStart) html += '<mark>';
      html += escapeHTML(text[i]);
      if (i === highlightEnd) html += '</mark>';
    }

    highlight.innerHTML = html;
    highlight.scrollTop = editor.scrollTop;
    highlight.scrollLeft = editor.scrollLeft;
  }

  editor.addEventListener('input', () => updateHighlight());
  editor.addEventListener('click', () => updateHighlight(editor.selectionStart));
  editor.addEventListener('keyup', () => updateHighlight(editor.selectionStart));
  editor.addEventListener('scroll', () => {
    highlight.scrollTop = editor.scrollTop;
    highlight.scrollLeft = editor.scrollLeft;
  });

  updateHighlight();
}
