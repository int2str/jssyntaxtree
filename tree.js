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
    this.alignment = 0;
    this.canvas = null;
    this.vscaler = 1;
  }

  resizeCanvas(w, h) {
    this.canvas.resize(w, h);
    this.canvas.translate(0, canvas.fontsize / 2);
  }

  draw(syntax_tree) {
    if (this.canvas == null)
      throw 'Canvas must be set first.';

    const drawables = drawableFromNode(this.canvas, syntax_tree);
    const max_depth = getMaxDepth(drawables);
    if (this.alignment > 0)
      moveLeafsToBottom(drawables, max_depth);
    if (this.alignment > 1)
      moveParentsDown(drawables);
    if (this.subscript)
      calculateAutoSubscript(drawables);
    const has_arrow =
        calculateDrawablePositions(this.canvas, drawables, this.vscaler);
    const arrowSet = makeArrowSet(drawables, this.fontsize);
    const arrowScaler =
        Math.pow((Math.sqrt(arrowSet.maxBottom) / arrowSet.maxBottom), 1 / 50);

    this.resizeCanvas(
        drawables.width + 1,
        Math.max((max_depth + 1) * (this.fontsize * this.vscaler * 3),
                 has_arrow ? arrowSet.maxBottom * arrowScaler : 0));
    drawables.children.forEach(child => this.drawNode(child));
    this.drawArrows(arrowSet.arrows);
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
    this.canvas.text(drawable.label, getDrawableCenter(drawable),
                     drawable.top + 2);
  }

  drawSubscript(drawable) {
    if (!drawable.subscript && !drawable.superscript)
      return;
    let offset = 1 + getDrawableCenter(drawable) +
                 this.canvas.textWidth(drawable.label) / 2;
    this.canvas.setFontSize(this.fontsize * 3 / 4);
    if (drawable.subscript) {
      offset += this.canvas.textWidth(drawable.subscript) / 2;
      this.canvas.text(drawable.subscript, offset,
                       drawable.top + this.fontsize / 2);
    } else {
      offset += this.canvas.textWidth(drawable.superscript) / 2;
      this.canvas.text(drawable.superscript, offset, drawable.top);
    }
    this.canvas.setFontSize(this.fontsize); // Reset font
  }

  drawConnector(parent, child) {
    if (this.triangles && child.is_leaf && child.label.includes(' ')) {
      const text_width = this.canvas.textWidth(child.label);
      this.canvas.triangle(
          getDrawableCenter(parent), parent.top + this.fontsize + 2,
          getDrawableCenter(child) + (text_width / 2) - 4, child.top - 3,
          getDrawableCenter(child) - (text_width / 2) + 4, child.top - 3);
    } else {
      this.canvas.line(getDrawableCenter(parent),
                       parent.top + this.fontsize + 2, getDrawableCenter(child),
                       child.top - 3);
    }
  }

  drawArrows(arrows) {
    const arrow_color = this.nodecolor ? '#909' : '#999';
    this.canvas.setFillStyle(arrow_color);
    this.canvas.setStrokeStyle(arrow_color);
    this.canvas.setLineWidth(2);
    for (const arrow of arrows) {
      this.canvas.curve(arrow.from_x, arrow.from_y, arrow.to_x, arrow.to_y,
                        arrow.from_x, arrow.bottom, arrow.to_x, arrow.bottom);
      if (arrow.ends_to)
        this.drawArrowHead(arrow.to_x, arrow.to_y);
      if (arrow.ends_from)
        this.drawArrowHead(arrow.from_x, arrow.from_y);
    }
  }

  drawArrowHead(x, y) {
    const cx = this.fontsize / 4;
    const cy = this.fontsize / 2;
    this.canvas.triangle(x, y, x - cx, y + cy, x + cx, y + cy, true);
  }

  setCanvas(c) { this.canvas = new Canvas(c); }

  setColor(e) { this.nodecolor = e; }

  setFont(f) { this.canvas.setFont(f); }

  setFontsize(s) {
    this.fontsize = parseInt(s, 10);
    this.canvas.setFontSize(this.fontsize);
  }

  setTriangles(t) { this.triangles = t; }

  setSubscript(s) { this.subscript = s; }

  setAlignment(a) { this.alignment = a; }

  setSpacing(s) { this.vscaler = s; }

  download() { this.canvas.download('syntax_tree.png'); }
}

class Arrow {
  constructor(from_x, from_y, to_x, to_y, bottom, ends_to, ends_from) {
    this.from_x = from_x;
    this.from_y = from_y;
    this.to_x = to_x;
    this.to_y = to_y;
    this.bottom = bottom;
    this.ends_to = ends_to;
    this.ends_from = ends_from;
  }
}

class ArrowSet {
  constructor() {
    this.arrows = [];
    this.maxBottom = 0;
  }

  add(arrow) {
    this.arrows.push(arrow);
    this.maxBottom = Math.max(this.maxBottom, arrow.bottom);
  }

  concatenate(arrowSet) {
    this.arrows = this.arrows.concat(arrowSet.arrows);
    this.maxBottom = Math.max(this.maxBottom, arrowSet.maxBottom);
  }
}

function drawableFromNode(canvas, node, depth = -1) {
  const drawable = {
    label : node.label,
    subscript : node.subscript,
    superscript : node.superscript,
    width : getNodeWidth(canvas, node),
    depth : depth,
    is_leaf : node.type == Parser.NodeType.VALUE,
    arrow : 'arrow' in node ? node.arrow : null,
    children : []
  };

  if (node.type != Parser.NodeType.VALUE) {
    node.values.forEach(child => {
      drawable.children.push(drawableFromNode(canvas, child, depth + 1));
    });
  }

  return drawable;
}

function getNodeWidth(canvas, node) {
  let label_width = node.type != Parser.NodeType.ROOT
                        ? canvas.textWidth(node.label) + NODE_PADDING
                        : 0;
  if (node.subscript)
    label_width += canvas.textWidth(node.subscript) * 3 / 4 * 2;
  else if (node.superscript)
    label_width += canvas.textWidth(node.superscript) * 3 / 4 * 2;

  if (node.type != Parser.NodeType.VALUE) {
    return Math.max(label_width, getChildWidth(canvas, node));
  } else {
    return label_width;
  }
}

function calculateDrawablePositions(canvas, drawable, vscaler,
                                    parent_offset = 0) {
  let offset = 0;
  let scale = 1;
  let hasArrow = drawable.arrow;

  if (drawable.depth >= 0) {
    const child_width = getDrawableChildWidth(canvas, drawable);
    if (drawable.width > child_width)
      scale = drawable.width / child_width;
  }

  drawable.children.forEach(child => {
    child.top =
        child.depth * (canvas.fontsize * 3 * vscaler) + NODE_PADDING / 2;
    child.left = offset + parent_offset;
    child.width *= scale;
    const child_has_arrow =
        calculateDrawablePositions(canvas, child, vscaler, child.left);
    if (child_has_arrow)
      hasArrow = true;
    offset += child.width;
  });

  return hasArrow;
}

function getChildWidth(canvas, node) {
  if (node.type == Parser.NodeType.VALUE)
    return 0;
  let child_width = 0;
  node.values.forEach(child => { child_width += getNodeWidth(canvas, child); });
  return child_width;
}

function getDrawableChildWidth(canvas, drawable) {
  if (drawable.children.length == 0)
    return drawable.width;
  let child_width = 0;
  drawable.children.forEach(child => { child_width += child.width; });
  return child_width;
}

function getMaxDepth(drawable) {
  let max_depth = drawable.depth;
  drawable.children.forEach(child => {
    const child_depth = getMaxDepth(child);
    if (child_depth > max_depth)
      max_depth = child_depth;
  });
  return max_depth;
}

function moveLeafsToBottom(drawable, bottom) {
  if (drawable.is_leaf)
    drawable.depth = bottom;
  drawable.children.forEach(child => moveLeafsToBottom(child, bottom));
}

function moveParentsDown(drawable) {
  if (drawable.is_leaf)
    return;

  drawable.children.forEach(child => moveParentsDown(child));

  if (drawable.depth != 0) {
    let depth = 999999;
    for (let child of drawable.children) {
      if (child.depth - 1 < depth)
        depth = child.depth - 1;
    }
    drawable.depth = depth;
  }
}

function calculateAutoSubscript(drawables) {
  const map = countNodes(drawables);
  map.forEach((value, key, map) => {
    if (value === 1)
      map.delete(key);
  });
  assignSubscripts(drawables, Array.from(map.keys()), new Map());
}

function assignSubscripts(drawable, keys, tally) {
  if (!drawable.is_leaf && !drawable.subscript && !drawable.superscript &&
      keys.includes(drawable.label)) {
    mapInc(tally, drawable.label);
    drawable.subscript = '' + tally.get(drawable.label);
  }
  drawable.children.forEach(child => assignSubscripts(child, keys, tally));
}

function countNodes(drawable) {
  let map = new Map();
  if (drawable.is_leaf)
    return map;
  if (!drawable.subscript)
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
  if (drawable.is_leaf && (++count == arrow_idx))
    return [ count, drawable ];
  for (const child of drawable.children) {
    let target = null;
    [count, target] = findTargetLeaf(child, arrow_idx, count);
    if (target != null)
      return [ count, target ];
  }
  return [ count, null ];
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

function findMaxDepthBetween(drawable, left, right, max_y = 0) {
  drawable.children.forEach(child => {
    const child_low = findMaxDepthBetween(child, left, right, max_y);
    max_y = Math.max(child_low, max_y);
  });

  if (drawable.is_leaf && drawable.left >= left && drawable.left <= right) {
    max_y = Math.max(drawable.top, max_y);
  }

  return max_y;
}

function makeArrowSet(root, fontsize) {
  return makeArrowSetOn(root, root, fontsize);
}

function makeArrowSetOn(root, drawable, fontsize) {
  const arrowSet = new ArrowSet();
  drawable.children.forEach(child => {
    arrowSet.concatenate(makeArrowSetOn(root, child, fontsize));
  });

  if (!drawable.is_leaf || !drawable.arrow)
    return arrowSet;

  const target = findTarget(root, drawable.arrow.target);
  if (!target)
    return arrowSet;

  const from = {
    x : getDrawableCenter(drawable),
    y : drawable.top + (fontsize * 1.2)
  };
  const to = {x : getDrawableCenter(target), y : target.top + (fontsize * 1.2)};

  const bottom =
      1.4 * findMaxDepthBetween(root, Math.min(drawable.left, target.left),
                                Math.max(drawable.left, target.left));

  const ends_to = drawable.arrow.ends.to;
  const ends_from = drawable.arrow.ends.from;

  arrowSet.add(
      new Arrow(from.x, from.y, to.x, to.y, bottom, ends_to, ends_from));
  return arrowSet;
}
