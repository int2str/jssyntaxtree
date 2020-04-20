// jsSyntaxTree - A syntax tree graph generator
// (c)2019 Andre Eisenbach <andre@ironcreek.net>

const VERSION = 'v1.04';

import Tree from './tree.js';
import rotateTip from './tip.js';

let tree = new Tree();

window.onload = function() {
  e('version').innerHTML = VERSION;
  tree.setCanvas(e('canvas'));
  registerCallbacks();

  const query = decodeURI(window.location.search).replace('?', '');
  if (validatePhrase(query) == null) {
    e('code').value = query;
  }

  parse();

  rotateTip();
  setInterval(rotateTip, 30 * 1000);
};

function e(id) {
  return document.getElementById(id);
}

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

  e('bottom').onchange = function() {
    tree.setAlignBottom(e('bottom').checked);
    parse();
  }

  e('canvas').onclick = function() {
    tree.download();
  };
}

function parse() {
  let phrase = e('code').value.replace(
      /\s+/g, ' ');  // Replace all whitespace with spaces
  phrase = phrase.replace(/ *([\[\]]) */g, '$1');  // Remove duplicate spaces
  let validation_error = validatePhrase(phrase);
  if (validation_error == null) {
    tree.parse(phrase);
    e('parse-error').innerHTML = '';
  } else {
    e('parse-error').innerHTML = validation_error;
  }
}

function validatePhrase(p) {
  if (p.length < 3) return 'Phrase too short';
  if (p[0] != '[' || p[p.length - 1] != ']')
    return 'Phrase must start with [ and end with ]';
  let brackets = bracketsOpen(p);
  if (brackets > 0) return brackets + ' bracket(s) open [';
  if (brackets < 0) return Math.abs(brackets) + ' too many closed bracket(s) ]';
  return null;
}

function bracketsOpen(p) {
  let o = 0;
  for (let c of p) {
    if (c === '[') ++o;
    if (c === ']') --o;
  }
  return o;
}
