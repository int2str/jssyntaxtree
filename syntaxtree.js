// jsSyntaxTree - A syntax tree graph generator
// (c)2019 Andre Eisenbach <andre@ironcreek.net>

"use strict";

const VERSION = "v1.21";

import Tree from "./tree.js";
import rotateTip from "./tip.js";

import * as Highlight from "./highlight.js";
import * as Parser from "./parser.js";
import * as Tokenizer from "./tokenizer.js";

const tree = new Tree();

window.onload = () => {
  registerServiceWorker();

  e("version").innerHTML = VERSION;
  tree.setCanvas(e("canvas"));
  registerCallbacks();

  const query = decodeURI(window.location.search).replace("?", "");
  if (query != null && query.length > 2) e("code").value = query;

  update();

  rotateTip();
  setInterval(rotateTip, 30 * 1000);

  Highlight.setup(e("code"), e("highlight"));
};

function e(id) {
  return document.getElementById(id);
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("syntaxtree_worker.js").then(
      (registration) => {
        console.info("Service worker registered.");
      },
      (error) => {
        console.warn("Unable to register service worker.");
      },
    );
  } else {
    console.info("Service workers not supported.");
  }
}

function registerCallbacks() {
  e("code").oninput = update;

  e("font").onchange = (ev) => {
    tree.setFont(ev.target.value);
    update();
  };

  e("fontsize").onchange = (ev) => {
    tree.setFontsize(ev.target.value);
    update();
  };

  e("triangles").onchange = (ev) => {
    tree.setTriangles(ev.target.checked);
    update();
  };

  e("nodecolor").onchange = (ev) => {
    tree.setColor(ev.target.checked);
    update();
  };

  e("autosub").onchange = (ev) => {
    tree.setSubscript(ev.target.checked);
    update();
  };

  e("align_top").onchange = (ev) => {
    if (ev.target.checked) updateAlignment(tree.ALIGN_TOP);
  };

  e("align_leaves").onchange = (ev) => {
    if (ev.target.checked) updateAlignment(tree.ALIGN_LEAVES);
  };

  e("align_bottom").onchange = (ev) => {
    if (ev.target.checked) updateAlignment(tree.ALIGN_BOTTOM);
  };

  e("highlighting").onchange = (ev) => {
    Highlight.enable(e("code"), e("highlight"), ev.target.checked);
  };

  e("spacing").oninput = (ev) => {
    tree.setSpacing(parseFloat(ev.target.value / 100));
    update();
  };

  e("canvas").onclick = () => tree.download();
}

function update() {
  const phrase = e("code").value;
  e("parse-error").innerHTML = "";

  try {
    const tokens = Tokenizer.tokenize(phrase);
    validateTokens(tokens);

    const syntax_tree = Parser.parse(tokens);
    tree.draw(syntax_tree);
  } catch (err) {
    e("parse-error").innerHTML = err;
  }
}

function updateAlignment(align) {
  tree.setAlignment(align);
  update();
}

function validateTokens(tokens) {
  if (tokens.length < 3) throw "Phrase too short";
  if (
    tokens[0].type != Tokenizer.TokenType.BRACKET_OPEN ||
    tokens[tokens.length - 1].type != Tokenizer.TokenType.BRACKET_CLOSE
  )
    throw "Phrase must start with [ and end with ]";
  const brackets = countOpenBrackets(tokens);
  if (brackets > 0) throw brackets + " bracket(s) open [";
  if (brackets < 0) throw Math.abs(brackets) + " too many closed bracket(s) ]";
  return null;
}

function countOpenBrackets(tokens) {
  let o = 0;
  for (const token of tokens) {
    if (token.type == Tokenizer.TokenType.BRACKET_OPEN) ++o;
    if (token.type == Tokenizer.TokenType.BRACKET_CLOSE) --o;
  }
  return o;
}
