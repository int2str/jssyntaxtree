// jsSyntaxTree - A syntax tree graph generator
// (c)2019 Andre Eisenbach <andre@ironcreek.net>

'use strict';

const PADDING = 20;

import Canvas from './canvas.js';

export default class Tree {
  constructor() {
    this.nodes = [];
    this.nodecolor = true;
    this.fontsize = 16;
    this.triangles = true;
    this.subscript = true;
    this.align_bottom = false;
    this.canvas = null;
  }

  draw() {
    this.canvas.clear();
    this.canvas.translate(0, this.fontsize / 2);

    for (const node of this.nodes) {
      // Draw node label in the appropriate color
      if (this.nodecolor) {
        this.canvas.setFillStyle(node.leaf ? '#CC0000' : '#0000CC');
      } else {
        this.canvas.setFillStyle('black');
      }

      const level = node.leaf && this.align_bottom ? getLowestNode(this.nodes) :
                                                     node.level;
      this.canvas.text(
          node.value, node.offset + node.width / 2, this.getNodeTop(level));

      // Draw subscript (if any)
      if (node.subscript != '') {
        let offset = node.offset + node.width / 2 +
            this.canvas.textWidth(node.value) / 2;
        this.canvas.setFontSize(this.fontsize * 3 / 4);
        offset += this.canvas.textWidth(node.subscript) / 2;
        this.canvas.text(
            node.subscript, offset, this.getNodeTop(level) + this.fontsize / 2);
        this.canvas.setFontSize(this.fontsize);  // Reset font
      }

      if (node.p === -1) continue;

      // Draw line (or triangle) to parent
      const p = this.nodes[node.p];
      const text_width = this.canvas.textWidth(node.value);
      const node_center = (node.offset + node.width / 2);
      const parent_center = p.offset + p.width / 2;

      if (this.triangles && node.leaf && node.value.indexOf(' ') != -1) {
        this.canvas.line(
            parent_center, this.getNodeTop(p.level) + this.fontsize,
            node_center + text_width / 2, this.getNodeTop(level) - 5);
        this.canvas.line(
            parent_center, this.getNodeTop(p.level) + this.fontsize,
            node_center - text_width / 2, this.getNodeTop(level) - 5);
        this.canvas.line(
            node_center - text_width / 2, this.getNodeTop(level) - 5,
            node_center + text_width / 2, this.getNodeTop(level) - 5);
      } else {
        this.canvas.line(
            parent_center, this.getNodeTop(p.level) + this.fontsize,
            node_center, this.getNodeTop(level) - 5);
      }
    }
  }

  setCanvas(c) {
    this.canvas = new Canvas(c);
  }

  setColor(e) {
    this.nodecolor = e;
  }

  setFont(f) {
    this.canvas.setFont(f);
  }

  setFontsize(s) {
    this.fontsize = parseInt(s, 10);
    this.canvas.setFontSize(this.fontsize);
  }

  setTriangles(t) {
    this.triangles = t;
  }

  setSubscript(s) {
    this.subscript = s;
  }

  setAlignBottom(a) {
    this.align_bottom = a;
  }

  parseString(s) {
    const State = {
      IDLE: 0,
      LABEL: 1,
      VALUE: 2,
      APPENDING: 3,
      SUBSCRIPT: 4,
      QUOTES: 5,
      SUB_QUOTES: 6
    };

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

        case '_':
          state = State.SUBSCRIPT;
          break;

        case '"':
          if (state == State.SUBSCRIPT) {
            state = State.SUB_QUOTES;
          } else if (state == State.SUB_QUOTES) {
            state = State.LABEL;
          } else if (state == State.LABEL) {
            state = State.QUOTES;
          } else if (state == State.QUOTES) {
            state = State.LABEL;
          }
          break;

        case ' ':
          if (state != State.APPENDING && state != State.QUOTES &&
              state != State.SUB_QUOTES) {
            state = State.APPENDING;
            this.nodes.push(new Node(back(parents), parents.length));
            ++idx;
            break;
          }
          // Fallthrough
        default:
          if (state === State.VALUE) {
            state = State.APPENDING;
            this.nodes.push(new Node(back(parents), parents.length));
            ++idx;
          }
          if (state === State.SUBSCRIPT || state === State.SUB_QUOTES) {
            back(this.nodes).subscript += c;
          } else {
            back(this.nodes).value += c;
          }
          break;
      }
    }
  }

  calculateSubscript() {
    const map = new Map();

    // Count all labels
    for (const node of this.nodes) {
      if (node.leaf || node.subscript != '') continue;
      map.set(node.value, map.get(node.value) + 1 || 1);
    }

    // Remove non-duped labels
    map.forEach((value, key, map) => {
      if (value === 1) map.delete(key);
    });

    // Add subscript (iterates backwards)
    for (let j = this.nodes.length - 1; j != -1; --j) {
      let node = this.nodes[j];
      if (node.leaf || node.subscript != '') continue;
      if (!map.get(node.value)) continue;
      node.subscript = map.get(node.value);
      map.set(node.value, map.get(node.value) - 1);
    }
  }

  calculateWidth() {
    this.resetNodeWidthToTextSize();
    let change_made = false;
    this.calculateChildWidth();
    do {
      change_made = this.adjustChildNodeSizing();
    } while (change_made);
    this.calculateNodeOffsets()
  }

  getChildren(p) {
    let children = [];
    for (let i = 0; i != this.nodes.length; ++i) {
      if (this.nodes[i].p === p) children.push(i);
    }
    return children;
  }

  resizeCanvas() {
    const max_width = this.nodes.reduce(
        (acc, node) => (node.level === 0 ? acc + node.width : acc), 0);
    const max_level =
        this.nodes.reduce((acc, node) => Math.max(acc, node.level), 0);
    this.canvas.resize(
        max_width, (max_level + 1) * this.fontsize * 3 - this.fontsize);
  }

  getNodeTop(level) {
    return this.fontsize * 3 * level;
  }

  resetNodeWidthToTextSize() {
    for (const node of this.nodes) {
      this.canvas.setFontSize(this.fontsize);
      node.width = this.canvas.textWidth(node.value);

      this.canvas.setFontSize(this.fontsize * 3 / 4);
      node.width += this.canvas.textWidth(node.subscript) * 2;
      node.width += PADDING;

      node.child_width = 0;
    }
    this.canvas.setFontSize(this.fontsize);
  }

  calculateChildWidth() {
    for (let j = this.nodes.length - 1; j != -1; --j) {
      if (this.nodes[j].child_width > this.nodes[j].width) {
        this.nodes[j].width = this.nodes[j].child_width;
      }

      if (this.nodes[j].p != -1) {
        this.nodes[this.nodes[j].p].child_width += this.nodes[j].width;
        this.nodes[this.nodes[j].p].leaf = false;
      }
    }
  }

  adjustChildNodeSizing() {
    let change_made = false;
    // Fix node sizing if parent node is bigger than sum
    // of children (iterates backwards)
    for (let i = this.nodes.length - 1; i != -1; --i) {
      const node = this.nodes[i];
      if (node.leaf || (node.width - node.child_width) < 3) continue;
      console.log(node.value + ' ' + node.child_width + ' -> ' + node.width);
      for (const child of this.getChildren(i)) {
        this.nodes[child].width *= (node.width / node.child_width);
        change_made = true;
      }
      this.nodes[i].child_width *= (node.width / node.child_width);
    }
    return change_made;
  }

  calculateNodeOffsets() {
    let level_offset = [];
    for (const node of this.nodes) {
      if (level_offset.length < (node.level + 1)) level_offset.push(0);
      if (node.p != -1) {
        node.offset =
            Math.max(level_offset[node.level], this.nodes[node.p].offset);
      } else {
        node.offset = level_offset[node.level];
      }
      level_offset[node.level] = node.offset + node.width;
    }
  }

  parse(s) {
    this.parseString(s);
    this.calculateWidth();
    if (this.subscript) this.calculateSubscript();
    this.resizeCanvas();
    this.draw();
  }

  download() {
    this.canvas.download('syntax_tree.png');
  }
}

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
}

function back(a) {
  return a.length === 0 ? -1 : a[a.length - 1];
}

function getLowestNode(nodes) {
  return nodes.reduce((acc, n) => n.level > acc ? n.level : acc, 0);
}
