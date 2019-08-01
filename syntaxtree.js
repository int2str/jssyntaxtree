// jsSyntaxTree - A syntax tree graph generator
// (c)2019 Andre Eisenbach <andre@ironcreek.net>

const VERSION = "v1.01";

let tree = new Tree();
let phrase_valid = false;

function e(id) { return document.getElementById(id); }

window.onload =
    function() {
  e('version').innerHTML = VERSION;
  tree.setCanvas(e('canvas'));
  registerOptionCallbacks();
  registerEditCallback();
  registerDownloadCallback();

  let params = (new URL(document.location)).searchParams;
  let query = decodeURI(window.location.search).replace('?', '');
  if (validatePhrase(query)) {
    e('code').value = query;
  }

  onEdit(); // Trigger initial render
}

function
registerEditCallback() { e('code').onkeyup = onEdit; }

function
registerOptionCallbacks() {
  e('font').onchange = onFontChanged;
  e('fontsize').onchange = onFontsizeChanged;
  e('triangles').onchange = onTrianglesChanged;
  e('nodecolor').onchange = onColorChanged;
  e('autosub').onchange = onSubscriptChanged;
}

function
registerDownloadCallback() { e('canvas').onclick = onCanvasClicked; }

function
onCanvasClicked() { tree.download(); }

function
onTrianglesChanged() {
  tree.setTriangles(e('triangles').checked);
  parse();
}

function
onColorChanged() {
  tree.setColor(e('nodecolor').checked);
  parse();
}

function
onSubscriptChanged() {
  tree.setSubscript(e('autosub').checked);
  parse();
}

function
onFontChanged() {
  tree.setFont(e('font').value);
  parse();
}

function
onFontsizeChanged() {
  tree.setFontsize(e('fontsize').value);
  parse();
}

function
onEdit() { parse(); }

function
getPhrase() {
  let text = e('code').value.replace(/\s+/g, " ").trim();
  return text.replace(/ *([\[\]]) */g, "$1");
}

function
parse() {
  let text = getPhrase();
  phrase_valid = validatePhrase(text);
  if (phrase_valid)
    tree.parse(text);
}

function validatePhrase(p) {
  if (p.length < 3)
    return false;
  if (p[0] != '[' || p[p.length - 1] != ']')
    return false;
  if (bracketsOpen(p) != 0)
    return false;
  return true;
}

function bracketsOpen(p) {
  let o = 0;
  for (let c of p) {
    if (c == '[')
      ++o;
    if (c == ']')
      --o;
  }
  return o;
}
