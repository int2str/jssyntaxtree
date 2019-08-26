// jsSyntaxTree - A syntax tree graph generator
// (c)2019 Andre Eisenbach <andre@ironcreek.net>

const VERSION = "v1.03";

let tree = new Tree();

function e(id) { return document.getElementById(id); }

window.onload = function() {
  e('version').innerHTML = VERSION;
  tree.setCanvas(e('canvas'));
  registerCallbacks();

  let params = (new URL(document.location)).searchParams;
  let query = decodeURI(window.location.search).replace('?', '');
  if (validatePhrase(query)) {
    e('code').value = query;
  }

  parse();

  rotateTip();
  setInterval(rotateTip, 30 * 1000)
};

function registerCallbacks() {
  e('code').oninput = parse;

  e('font').onchange = function() {
    tree.setFont(e('font').value);
    parse();
  };

  e('fontsize').onchange = function() {
    tree.setFontsize(e('fontsize').value);
    parse();
  };

  e('triangles').onchange = function() {
    tree.setTriangles(e('triangles').checked);
    parse();
  };

  e('nodecolor').onchange = function() {
    tree.setColor(e('nodecolor').checked);
    parse();
  };

  e('autosub').onchange = function() {
    tree.setSubscript(e('autosub').checked);
    parse();
  };

  e('canvas').onclick = function() { tree.download(); };
}

function parse() {
  let phrase = e('code').value.replace(
      /\s+/g, " "); // Replace all whitespace with spaces
  phrase = phrase.replace(/ *([\[\]]) */g, "$1"); // Remove duplicate spaces
  if (validatePhrase(phrase))
    tree.parse(phrase);
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
