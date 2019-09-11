// jsSyntaxTree - A syntax tree graph generator
// (c)2019 Andre Eisenbach <andre@ironcreek.net>

export default class Node {
  constructor(p, level) {
    this.p = p;
    this.level = level;
    this.value = '';
    this.leaf = true;
    this.width = 0;
    this.offset = 0;
    this.child_width = 0;
    this.subscript = '';
  }
}
