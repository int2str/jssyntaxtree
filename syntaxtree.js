// jsSyntaxTree - A syntax tree graph generator
// (c)2019 Andre Eisenbach <andre@ironcreek.net>

'use strict';

const VERSION = 'v1.06';

import Tree from './tree.js';
import rotateTip from './tip.js';

const tree = new Tree();

window.onload = () => {
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

  e('font').onchange = () => {
    tree.setFont(e('font').value);
    parse();
  };

  e('fontsize').onchange = () => {
    tree.setFontsize(e('fontsize').value);
    parse();
  };

  e('triangles').onchange = () => {
    tree.setTriangles(e('triangles').checked);
    parse();
  };

  e('nodecolor').onchange = () => {
    tree.setColor(e('nodecolor').checked);
    parse();
  };

  e('autosub').onchange = () => {
    tree.setSubscript(e('autosub').checked);
    parse();
  };

  e('bottom').onchange = () => {
    tree.setAlignBottom(e('bottom').checked);
    parse();
  };

  e('canvas').onclick = () => tree.download();
}

function parse() {
  const phrase =
      e('code').value.replace(/\s+/g, ' ').replace(/ *([\[\]]) */g, '$1');
  const validation_error = validatePhrase(phrase);
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
  const brackets = bracketsOpen(p);
  if (brackets > 0) return brackets + ' bracket(s) open [';
  if (brackets < 0) return Math.abs(brackets) + ' too many closed bracket(s) ]';
  return null;
}

function bracketsOpen(p) {
  let o = 0;
  for (const c of p) {
    if (c === '[') ++o;
    if (c === ']') --o;
  }
  return o;
}
