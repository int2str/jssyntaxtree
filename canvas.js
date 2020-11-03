// jsSyntaxTree - A syntax tree graph generator
// (c)2019 Andre Eisenbach <andre@ironcreek.net>

'use strict';

export default class Canvas {
  constructor(c) {
    this.canvas = c;
    this.font = 'sans-serif';
    this.fontsize = 16;
    this.context = c.getContext('2d');
  }

  resize(w, h) {
    this.canvas.width = w;
    this.canvas.height = h;
    this.clear();
  }

  textWidth(t) {
    this.context.font = this.fontsize + 'px ' + this.font;
    return this.context.measureText(t).width;
  }

  clear() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.textAlign = 'center';
    this.context.textBaseline = 'top';
  }

  translate(x, y) {
    this.context.translate(x, y);
  }

  text(t, x, y) {
    this.context.font = this.fontsize + 'px ' + this.font;
    this.context.fillText(t, x, y);
  }

  setFont(f) {
    this.font = f;
  }

  setFontSize(s) {
    this.fontsize = s;
  }

  setFillStyle(s) {
    this.context.fillStyle = s;
  }

  setStrokeStyle(s) {
    this.context.strokeStyle = s;
  }

  setLineWidth(w) {
    this.context.lineWidth = w;
  }

  line(x1, y1, x2, y2) {
    const ctx = this.context;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  triangle(x1, y1, x2, y2, x3, y3, fill = false) {
    const ctx = this.context;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.lineTo(x1, y1);
    if (fill) ctx.fill();
    ctx.stroke();
  }

  rect(x, y, w, h) {
    const ctx = this.context;
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.stroke();
  }

  curve(x1, y1, x2, y2, cx1, cy1, cx2, cy2) {
    const ctx = this.context;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
    ctx.stroke();
  }

  download(fn) {
    const image = this.canvas.toDataURL('image/png')
                      .replace('image/png', 'image/octet-stream');
    const link = document.createElement('a');
    link.setAttribute('href', image);
    link.setAttribute('download', fn);
    link.click();
    link.remove();
  }
}
