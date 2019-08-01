// jsSyntaxTree - A syntax tree graph generator
// (c)2019 Andre Eisenbach <andre@ironcreek.net>

const VERSION = "v1.01";

let tree = new Tree();
let phrase_valid = false;

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
};

function registerCallbacks() {
  e('code').onkeyup = parse;

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

function getPhrase() {
  let text = e('code').value.replace(/\s+/g, " ").trim();
  return text.replace(/ *([\[\]]) */g, "$1");
}

function parse() {
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
