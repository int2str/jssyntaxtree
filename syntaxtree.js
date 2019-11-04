// jsSyntaxTree - A syntax tree graph generator
// (c)2019 Andre Eisenbach <andre@ironcreek.net>

const VERSION = "v1.03";

import Tree from './tree.js';
import rotateTip from './tip.js';

let tree = new Tree();

window.onload = function() {
  e('version').innerHTML = VERSION;
  tree.setCanvas(e('canvas'));
  registerCallbacks();

  const query = decodeURI(window.location.search).replace('?', '');
  if (validatePhrase(query)) {
    e('code').value = query;
  }

  parse();

  rotateTip();
  setInterval(rotateTip, 30 * 1000);
};

function e(id) { return document.getElementById(id); }

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
  let brackets = bracketsOpen(phrase);
  if (validatePhrase(phrase)) {
    tree.parse(phrase);
    e('parse-error').innerHTML = "";
  } else {
    if (brackets > 0) {
      e('parse-error').innerHTML = brackets + " bracket(s) open [";
    } else {
      e('parse-error').innerHTML = Math.abs(brackets) + " too many closed bracket(s) ]";
    }
  }
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
    if (c === '[')
      ++o;
    if (c === ']')
      --o;
  }
  return o;
}
