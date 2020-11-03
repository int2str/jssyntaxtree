// jsSyntaxTree - A syntax tree graph generator
// (c)2019 Andre Eisenbach <andre@ironcreek.net>

'use strict';

const NODE_PADDING = 20;

import Canvas from './canvas.js';
import * as Parser from './parser.js';

export default class Tree {
  constructor(canvas) {
    this.nodecolor = true;
    this.fontsize = 16;
    this.triangles = true;
    this.subscript = true;
    this.align_bottom = false;
    this.canvas = null;
  }

  resizeCanvas(w, h) {
    this.canvas.resize(w, h);
    this.canvas.translate(0, canvas.fontsize / 2);
  }

  draw(syntax_tree) {
    if (this.canvas == null) throw 'Canvas must be set first.';

    const drawables = drawableFromNode(this.canvas, syntax_tree);
    const max_depth = getMaxDepth(drawables);
    if (this.align_bottom) moveLeafsToBottom(drawables, max_depth);
    if (this.subscript) calculateAutoSubscript(drawables);
    const has_arrow = calculateDrawablePositions(this.canvas, drawables);

    this.resizeCanvas(
        drawables.width + 1,
        (max_depth + 1) * this.fontsize * 3 - this.fontsize +
            (has_arrow ? this.fontsize * 3.1 : 0));
    drawables.children.forEach(child => this.drawNode(child));
    this.drawArrows(drawables);
  }

  drawNode(drawable) {
    this.drawLabel(drawable);
    this.drawSubscript(drawable);

    drawable.children.forEach(child => {
      this.drawNode(child);
      this.drawConnector(drawable, child);
    });
  }

  drawLabel(drawable) {
    this.canvas.setFontSize(this.fontsize);
    if (this.nodecolor) {
      this.canvas.setFillStyle(drawable.is_leaf ? '#CC0000' : '#0000CC');
    } else {
      this.canvas.setFillStyle('black');
    }
    this.canvas.text(
        drawable.label, getDrawableCenter(drawable), drawable.top + 2);
  }

  drawSubscript(drawable) {
    if (drawable.subscript == null || drawable.subscript == '') return;
    let offset =
        getDrawableCenter(drawable) + this.canvas.textWidth(drawable.label) / 2;
    this.canvas.setFontSize(this.fontsize * 3 / 4);
    offset += this.canvas.textWidth(drawable.subscript) / 2;
    this.canvas.text(
        drawable.subscript, offset, drawable.top + this.fontsize / 2);
    this.canvas.setFontSize(this.fontsize);  // Reset font
  }

  drawConnector(parent, child) {
    if (this.triangles && child.is_leaf && child.label.includes(' ')) {
      const text_width = this.canvas.textWidth(child.label);
      this.canvas.triangle(
          getDrawableCenter(parent), parent.top + this.fontsize + 2,
          getDrawableCenter(child) + (text_width / 2) - 4, child.top - 3,
          getDrawableCenter(child) - (text_width / 2) + 4, child.top - 3);
    } else {
      this.canvas.line(
          getDrawableCenter(parent), parent.top + this.fontsize + 2,
          getDrawableCenter(child), child.top - 3);
    }
  }

  drawArrows(root) {
    this.drawArrow(root, root);
  }

  drawArrow(root, drawable) {
    drawable.children.forEach(child => {
      this.drawArrow(root, child);
    });

    if (!drawable.is_leaf || !drawable.arrow) return;

    const target = findTarget(root, drawable.arrow.target);
    if (!target) return;

    const from = {
      x: getDrawableCenter(drawable),
      y: drawable.top + (this.fontsize * 1.2)
    };
    const to = {
      x: getDrawableCenter(target),
      y: target.top + (this.fontsize * 1.2)
    };

    const arrow_color = this.nodecolor ? '#909' : '#999';
    this.canvas.setFillStyle(arrow_color);
    this.canvas.setStrokeStyle(arrow_color);
    this.canvas.setLineWidth(2);

    const bottom = Math.max(from.y, to.y) + (this.fontsize * 4);
    this.canvas.curve(from.x, from.y, to.x, to.y, from.x, bottom, to.x, bottom);

    if (drawable.arrow.ends.to) this.drawArrowHead(to.x, to.y);
    if (drawable.arrow.ends.from) this.drawArrowHead(from.x, from.y);
  }

  drawArrowHead(x, y) {
    const cx = this.fontsize / 4;
    const cy = this.fontsize / 2;
    this.canvas.triangle(x, y, x - cx, y + cy, x + cx, y + cy, true);
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

  download() {
    this.canvas.download('syntax_tree.png');
  }
}

function drawableFromNode(canvas, node, depth = -1) {
  const drawable = {
    label: node.label,
    subscript: node.type == Parser.NodeType.NODE ? node.subscript : null,
    width: getNodeWidth(canvas, node),
    depth: depth,
    is_leaf: node.type == Parser.NodeType.VALUE,
    arrow: 'arrow' in node ? node.arrow : null,
    children: []
  };

  if (node.type != Parser.NodeType.VALUE) {
    node.values.forEach(child => {
      drawable.children.push(drawableFromNode(canvas, child, depth + 1));
    });
  }

  return drawable;
}

function getNodeWidth(canvas, node) {
  let label_width = node.type != Parser.NodeType.ROOT ?
      canvas.textWidth(node.label) + NODE_PADDING :
      0;
  if (node.subscript)
    label_width += canvas.textWidth(node.subscript) * 3 / 4 * 2;
  if (node.type != Parser.NodeType.VALUE) {
    return Math.max(label_width, getChildWidth(canvas, node));
  } else {
    return label_width;
  }
}

function calculateDrawablePositions(canvas, drawable, parent_offset = 0) {
  let offset = 0;
  let scale = 1;
  let hasArrow = drawable.arrow;

  if (drawable.depth >= 0) {
    const child_width = getDrawableChildWidth(canvas, drawable);
    if (drawable.width > child_width) scale = drawable.width / child_width;
  }

  drawable.children.forEach(child => {
    child.top = child.depth * canvas.fontsize * 3 + NODE_PADDING / 2;
    child.left = offset + parent_offset;
    child.width *= scale;
    const child_has_arrow =
        calculateDrawablePositions(canvas, child, child.left);
    if (child_has_arrow) hasArrow = true;
    offset += child.width;
  });

  return hasArrow;
}

function getChildWidth(canvas, node) {
  if (node.type == Parser.NodeType.VALUE) return 0;
  let child_width = 0;
  node.values.forEach(child => {
    child_width += getNodeWidth(canvas, child);
  });
  return child_width;
}

function getDrawableChildWidth(canvas, drawable) {
  if (drawable.children.length == 0) return drawable.width;
  let child_width = 0;
  drawable.children.forEach(child => {
    child_width += child.width;
  });
  return child_width;
}

function getMaxDepth(drawable) {
  let max_depth = drawable.depth;
  drawable.children.forEach(child => {
    const child_depth = getMaxDepth(child);
    if (child_depth > max_depth) max_depth = child_depth;
  });
  return max_depth;
}

function moveLeafsToBottom(drawable, bottom) {
  if (drawable.is_leaf) drawable.depth = bottom;
  drawable.children.forEach(child => moveLeafsToBottom(child, bottom));
}

function calculateAutoSubscript(drawables) {
  const map = countNodes(drawables);
  map.forEach((value, key, map) => {
    if (value === 1) map.delete(key);
  });
  assignSubscripts(drawables, Array.from(map.keys()), new Map());
}

function assignSubscripts(drawable, keys, tally) {
  if (!drawable.is_leaf &&
      (drawable.subscript == null || drawable.subscript == '') &&
      keys.includes(drawable.label)) {
    mapInc(tally, drawable.label);
    drawable.subscript = '' + tally.get(drawable.label);
  }
  drawable.children.forEach(child => assignSubscripts(child, keys, tally));
}

function countNodes(drawable) {
  let map = new Map();
  if (drawable.is_leaf) return map;
  if (drawable.subscript == null || drawable.subscript == '')
    mapInc(map, drawable.label);

  drawable.children.forEach(child => {
    const child_map = countNodes(child);
    map = mapMerge(map, child_map);
  });

  return map;
}

function findTarget(drawable, arrow_idx) {
  const [count, target] = findTargetLeaf(drawable, arrow_idx, 0);
  return target;
}

function findTargetLeaf(drawable, arrow_idx, count) {
  if (drawable.is_leaf && (++count == arrow_idx)) return [count, drawable];
  for (const child of drawable.children) {
    let target = null;
    [count, target] = findTargetLeaf(child, arrow_idx, count);
    if (target != null) return [count, target];
  }
  return [count, null];
}

function mapInc(map, key) {
  if (!map.has(key))
    map.set(key, 1);
  else
    map.set(key, map.get(key) + 1);
}

function mapMerge(one, two) {
  two.forEach((value, key) => {
    if (one.has(key))
      one.set(key, one.get(key) + value);
    else
      one.set(key, value);
  });
  return one;
}

function getDrawableCenter(drawable) {
  return drawable.left + drawable.width / 2;
}
