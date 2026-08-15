// jsSyntaxTree - A syntax tree graph generator
// (c)2019 Andre Eisenbach <andre@ironcreek.net>

"use strict";

const VERSION = "v1.4";

import Tree from "./tree.js";
import rotateTip from "./tip.js";

import * as Highlight from "./highlight.js";
import * as Parser from "./parser.js";
import * as Tokenizer from "./tokenizer.js";

const tree = new Tree();

window.addEventListener("load", () => {
  registerServiceWorker();

  e("version").innerText = VERSION;
  tree.setCanvas(e("canvas"));
  registerCallbacks();

  const search = window.location.search;
  if (search.length > 1) {
    const query = decodeURIComponent(search.substring(1));
    if (query.length > 2) e("code").value = query;
  }

  update();

  rotateTip();
  setInterval(rotateTip, 30 * 1000);

  Highlight.setup(e("code"), e("highlight"));
});

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
  e("code").addEventListener("input", update);

  e("font").addEventListener("change", (ev) => {
    tree.setFont(ev.target.value);
    update();
  });

  e("fontsize").addEventListener("change", (ev) => {
    tree.setFontsize(ev.target.value);
    update();
  });

  e("triangles").addEventListener("change", (ev) => {
    tree.setTriangles(ev.target.checked);
    update();
  });

  e("terminal_lines").addEventListener("change", (ev) => {
    tree.setLines(ev.target.checked);
    update();
  });

  e("nodecolor").addEventListener("change", (ev) => {
    tree.setColor(ev.target.checked);
    update();
  });

  e("autosub").addEventListener("change", (ev) => {
    tree.setSubscript(ev.target.checked);
    update();
  });

  e("align_top").addEventListener("change", (ev) => {
    if (ev.target.checked) updateAlignment(Tree.ALIGN_TOP);
  });

  e("align_leaves").addEventListener("change", (ev) => {
    if (ev.target.checked) updateAlignment(Tree.ALIGN_LEAVES);
  });

  e("align_bottom").addEventListener("change", (ev) => {
    if (ev.target.checked) updateAlignment(Tree.ALIGN_BOTTOM);
  });

  e("highlighting").addEventListener("change", (ev) => {
    Highlight.enable(e("code"), e("highlight"), ev.target.checked);
  });

  e("spacing").addEventListener("input", (ev) => {
    tree.setSpacing(parseFloat(ev.target.value / 100));
    update();
  });

  e("canvas").addEventListener("click", () => tree.download());
  e("download_png").addEventListener("click", () => tree.download());
  e("download_svg").addEventListener("click", () => tree.downloadSvg());
}

function update() {
  const phrase = e("code").value;
  e("parse-error").innerText = "";

  try {
    const tokens = Tokenizer.tokenize(phrase);
    validateTokens(tokens);

    const syntax_tree = Parser.parse(tokens);
    tree.draw(syntax_tree);
  } catch (err) {
    e("parse-error").innerText = err.message || err;
  }
}

function updateAlignment(align) {
  tree.setAlignment(align);
  update();
}

function validateTokens(tokens) {
  if (tokens.length < 3) throw new Error("Phrase too short");
  if (
    tokens[0].type !== Tokenizer.TokenType.BRACKET_OPEN ||
    tokens[tokens.length - 1].type !== Tokenizer.TokenType.BRACKET_CLOSE
  )
    throw new Error("Phrase must start with [ and end with ]");
  const brackets = countOpenBrackets(tokens);
  if (brackets > 0) throw new Error(brackets + " bracket(s) open [");
  if (brackets < 0)
    throw new Error(Math.abs(brackets) + " too many closed bracket(s) ]");
  return null;
}

function countOpenBrackets(tokens) {
  let o = 0;
  for (const token of tokens) {
    if (token.type === Tokenizer.TokenType.BRACKET_OPEN) ++o;
    if (token.type === Tokenizer.TokenType.BRACKET_CLOSE) --o;
  }
  return o;
}
