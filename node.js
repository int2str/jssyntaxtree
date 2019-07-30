// jsSyntaxTree - A syntax tree graph generator
// (c)2019 Andre Eisenbach <andre@ironcreek.net>

class Node {
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

  dump() {
    console.log("Value: '" + this.value + "'");
    console.log("Subscript: '" + this.subscript + "'");
    console.log("Parent: " + this.p);
    console.log("Level: " + this.level);
    console.log("Width: " + this.width);
    console.log("Child width: " + this.child_width);
    console.log("Offset: " + this.offset);
    console.log("---------------------------");
  }
}
