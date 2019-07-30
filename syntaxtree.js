// jsSyntaxTree - A syntax tree graph generator
// (c)2019 Andre Eisenbach <andre@ironcreek.net>

const VERSION = "v1.00";

let tree = new Tree();
let phrase_valid = false;

function setup() {
  let canvas = createCanvas(500, 500);
  canvas.parent("tree");
  textAlign(CENTER, TOP);

  registerOptionCallbacks();
  registerEditCallback();
  onEdit(); // Trigger initial render

  select('#version').html(VERSION);
}

function draw() {
  background(255);
  if (!phrase_valid)
    return;
  tree.draw();
}

function mouseClicked() {
  if (mouseX < 0 || mouseY < 0) return;
  if (mouseX >= width || mouseY >= height) return;
  saveCanvas("syntax_tree", "png");
}

function registerEditCallback() {
  let text_edit = select('#code');
  text_edit.input(onEdit);
}

function registerOptionCallbacks() {
  select('#font').changed(onFontChanged);
  select('#fontsize').changed(onFontsizeChanged);
  select('#triangles').changed(onTrianglesChanged);
  select('#nodecolor').changed(onColorChanged);
  select('#autosub').changed(onSubscriptChanged);
}

function onTrianglesChanged() {
  let option = select('#triangles');
  tree.setTriangles(option.checked());
}

function onColorChanged() {
  let option = select('#nodecolor');
  tree.setColor(option.checked());
}

function onSubscriptChanged() {
  let option = select('#autosub');
  tree.setSubscript(option.checked());
  parse(); // Force subscript calculation
}

function onFontChanged() {
  let option = select('#font');
  tree.setFont(option.value());
  parse(); // Force canvas resize
}

function onFontsizeChanged() {
  let option = select('#fontsize');
  tree.setFontsize(option.value());
  parse(); // Force canvas resize
}

function onEdit() {
  parse();

  let text_edit = select('#code');
  text_edit.style("color", phrase_valid ? "#000" : "#A00");
}

function getPhrase() {
  let text_edit = select('#code');
  let text = text_edit.value().replace(/\s+/g, " ").trim();
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
