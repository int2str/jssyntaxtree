// jsSyntaxTree - A syntax tree graph generator
// (c)2026 Andre Eisenbach <andre@ironcreek.net>

'use strict';

const SVG_NS = 'http://www.w3.org/2000/svg';

export default class SvgCanvas {
  constructor(canvas) {
    // Re-use the Canvas wrapper for text measurement — identical to what Tree uses
    // during layout, so geometry is pixel-perfect.
    this.canvas = canvas;
    this.font = canvas.font;
    this.fontsize = canvas.fontsize;

    this.fill_style = 'black';
    this.stroke_style = 'black';
    this.line_width = 1;
    this.translate_x = 0;
    this.translate_y = 0;

    this.svg = document.createElementNS(SVG_NS, 'svg');
    this.svg.setAttribute('xmlns', SVG_NS);
    this.group = null;
  }

  resize(w, h) {
    // Clear previous content
    while (this.svg.firstChild) this.svg.removeChild(this.svg.firstChild);

    this.svg.setAttribute('width', w);
    this.svg.setAttribute('height', h);
    this.svg.setAttribute('viewBox', `0 0 ${w} ${h}`);

    // Reset translate state
    this.translate_x = 0;
    this.translate_y = 0;

    // Root group — translate applied here
    this.group = document.createElementNS(SVG_NS, 'g');
    this.svg.appendChild(this.group);
  }

  translate(x, y) {
    this.translate_x += x;
    this.translate_y += y;
    this.group.setAttribute('transform', `translate(${this.translate_x}, ${this.translate_y})`);
  }

  // Delegate text measurement to the real canvas for pixel-identical layout.
  textWidth(t) {
    return this.canvas.textWidth(t);
  }

  text(t, x, y) {
    const el = document.createElementNS(SVG_NS, 'text');
    el.setAttribute('x', x);
    el.setAttribute('y', y);
    el.setAttribute('font-family', this.font);
    el.setAttribute('font-size', this.fontsize);
    el.setAttribute('text-anchor', 'middle');
    el.setAttribute('dominant-baseline', 'hanging');
    el.setAttribute('fill', this.fill_style);
    el.textContent = t;
    this.group.appendChild(el);
  }

  line(x1, y1, x2, y2) {
    const el = document.createElementNS(SVG_NS, 'line');
    el.setAttribute('x1', x1);
    el.setAttribute('y1', y1);
    el.setAttribute('x2', x2);
    el.setAttribute('y2', y2);
    el.setAttribute('stroke', this.stroke_style);
    el.setAttribute('stroke-width', this.line_width);
    this.group.appendChild(el);
  }

  triangle(x1, y1, x2, y2, x3, y3, fill = false) {
    const el = document.createElementNS(SVG_NS, 'polygon');
    el.setAttribute('points', `${x1},${y1} ${x2},${y2} ${x3},${y3}`);
    el.setAttribute('stroke', this.stroke_style);
    el.setAttribute('stroke-width', this.line_width);
    el.setAttribute('fill', fill ? this.fill_style : 'none');
    this.group.appendChild(el);
  }

  rect(x, y, w, h) {
    const el = document.createElementNS(SVG_NS, 'rect');
    el.setAttribute('x', x);
    el.setAttribute('y', y);
    el.setAttribute('width', w);
    el.setAttribute('height', h);
    el.setAttribute('stroke', this.stroke_style);
    el.setAttribute('stroke-width', this.line_width);
    el.setAttribute('fill', 'none');
    this.group.appendChild(el);
  }

  curve(x1, y1, x2, y2, cx1, cy1, cx2, cy2) {
    const el = document.createElementNS(SVG_NS, 'path');
    el.setAttribute('d', `M ${x1},${y1} C ${cx1},${cy1} ${cx2},${cy2} ${x2},${y2}`);
    el.setAttribute('stroke', this.stroke_style);
    el.setAttribute('stroke-width', this.line_width);
    el.setAttribute('fill', 'none');
    this.group.appendChild(el);
  }

  setFont(f) {
    this.font = f;
  }

  setFontSize(s) {
    this.fontsize = s;
  }

  setFillStyle(s) {
    this.fill_style = s;
  }

  setStrokeStyle(s) {
    this.stroke_style = s;
  }

  setLineWidth(w) {
    this.line_width = w;
  }

  download(fn) {
    const serializer = new XMLSerializer();
    const svg_str = serializer.serializeToString(this.svg);
    const blob = new Blob([svg_str], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fn);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }
}
