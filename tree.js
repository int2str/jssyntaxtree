// jsSyntaxTree - A syntax tree graph generator
// (c)2019 Andre Eisenbach <andre@ironcreek.net>

const PADDING = 20;

function back(a) {
  if (a.length == 0)
    return -1;
  return a[a.length - 1];
}

class Tree {
  constructor() {
    this.nodes = [];
    this.nodecolor = true;
    this.font = "sans-serif";
    this.fontsize = 16;
    this.triangles = true;
    this.subscript = true;
  }

  draw() {
    background(255);
    translate(0, this.fontsize / 2);

    for (let node of this.nodes) {
      //
      // Draw node label in the appropriate color
      //
      if (this.nodecolor) {
        if (node.leaf)
          fill(240, 0, 0);
        if (!node.leaf)
          fill(0, 0, 200);
      } else {
        fill(0);
      }

      noStroke();
      text(node.value, node.offset + node.width / 2,
           node.level * this.fontsize * 3);

      //
      // Draw subscript (if any)
      //
      if (node.subscript != "") {
        let offset = node.offset + node.width / 2 + textWidth(node.value) / 2;
        textFont(this.font, this.fontsize * 3 / 4);
        offset += textWidth(node.subscript) / 2;
        text(node.subscript, offset,
             node.level * this.fontsize * 3 + this.fontsize / 2);
        textFont(this.font, this.fontsize); // Reset font
      }

      if (node.p == -1)
        continue;

      //
      // Draw line (or Triangle) to paren
      //
      smooth();
      stroke(80);
      let p = this.nodes[node.p];
      if (this.triangles && node.value.indexOf(" ") != -1) {
        line(p.offset + p.width / 2,
             p.level * this.fontsize * 3 + this.fontsize, node.offset + PADDING,
             node.level * this.fontsize * 3 - 5);
        line(p.offset + p.width / 2,
             p.level * this.fontsize * 3 + this.fontsize,
             node.offset + node.width - PADDING,
             node.level * this.fontsize * 3 - 5);
        line(node.offset + PADDING, node.level * this.fontsize * 3 - 5,
             node.offset + node.width - PADDING,
             node.level * this.fontsize * 3 - 5);
      } else {
        line(p.offset + p.width / 2,
             p.level * this.fontsize * 3 + this.fontsize,
             node.offset + node.width / 2, node.level * this.fontsize * 3 - 5);
      }
    }
  }

  setColor(e) { this.nodecolor = e; }

  setFont(f) { this.font = f; }

  setFontsize(s) { this.fontsize = parseInt(s, 10); }

  setTriangles(t) { this.triangles = t; }

  setSubscript(s) { this.subscript = s; }

  parseString(s) {
    const State = {
      IDLE : 0,
      LABEL : 1,
      VALUE : 2,
      APPENDING : 3,
    }

    let state = State.IDLE;
    let idx = 0;
    let parents = [];
    this.nodes = [];

    for (let c of s) {
      switch (c) {
      case '[':
        this.nodes.push(new Node(back(parents), parents.length));
        parents.push(idx++);
        state = State.LABEL;
        break;

      case ']':
        state = State.VALUE;
        parents.pop();
        break;

      case ' ':
        if (state != State.APPENDING) {
          state = State.APPENDING;
          this.nodes.push(new Node(back(parents), parents.length));
          ++idx;
          break;
        }
        // Fallthrough
      default:
        if (state == State.VALUE) {
          state = State.APPENDING;
          this.nodes.push(new Node(back(parents), parents.length));
          ++idx;
        }
        back(this.nodes).value += c;
        break;
      }
    }
  }

  calculateSubscript() {
    let map = new Map();

    // Count all labels
    for (let node of this.nodes) {
      if (node.leaf)
        continue;
      if (map.has(node.value)) {
        map.set(node.value, map.get(node.value) + 1);
      } else {
        map.set(node.value, 1);
      }
    }

    // Remove non-duped labels
    map.forEach((value, key, map) => {
      if (value == 1)
        map.delete(key);
    });

    // Add subscript (iterates backwards)
    for (let j = this.nodes.length - 1; j != -1; --j) {
      let node = this.nodes[j];
      if (node.leaf)
        continue;
      if (!map.get(node.value))
        continue;
      if (map.get(node.value) < 1)
        continue;
      node.subscript = "" + map.get(node.value);
      map.set(node.value, map.get(node.value) - 1);
    }
  }

  calculateWidth() {
    // Reset child width and calculate text width
    for (let node of this.nodes) {
      node.width = textWidth(node.value) + PADDING;
      node.child_width = 0;
    }

    // Calculate child width (iterates backwards)
    for (let j = this.nodes.length - 1; j != -1; --j) {
      if (this.nodes[j].child_width > this.nodes[j].width) {
        this.nodes[j].width = this.nodes[j].child_width;
      }

      if (this.nodes[j].p == -1)
        continue;
      this.nodes[this.nodes[j].p].child_width += this.nodes[j].width;
      this.nodes[this.nodes[j].p].leaf = false;
    }

    // Fix node sizing if parent node is bigger than sum
    // of children (iterates backwards)
    for (let i = this.nodes.length - 1; i != -1; --i) {
      let node = this.nodes[i];
      if (node.leaf || node.width <= node.child_width)
        continue;
      for (let child of this.getChildren(i)) {
        this.nodes[child].width *= (node.width / node.child_width);
      }
    }

    // Calculate offsets
    let level_offset = [];
    for (let node of this.nodes) {
      if (level_offset.length < (node.level + 1))
        level_offset.push(0);
      if (node.p != -1) {
        node.offset =
            Math.max(level_offset[node.level], this.nodes[node.p].offset);
      } else {
        node.offset = level_offset[node.level];
      }
      level_offset[node.level] = node.offset + node.width;
    }
  }

  getChildren(p) {
    let children = [];
    for (let i = 0; i != this.nodes.length; ++i) {
      if (this.nodes[i].p == p)
        children.push(i);
    }
    return children;
  }

  getMaxWidth() {
    return this.nodes.reduce((acc, node) => Math.max(acc, node.width), 0);
  }

  getMaxLevel() {
    return this.nodes.reduce((acc, node) => Math.max(acc, node.level), 0);
  }

  dumpNodes() {
    console.log("Nodes: " + this.nodes.length);
    console.log("===========================");
    for (let node of this.nodes)
      node.dump();
  }

  parse(s) {
    textFont(this.font, this.fontsize);
    this.parseString(s);
    this.calculateWidth();
    if (this.subscript)
      this.calculateSubscript();
    resizeCanvas(this.getMaxWidth(),
                 (this.getMaxLevel() + 1) * this.fontsize * 3 - this.fontsize);
  }
}
