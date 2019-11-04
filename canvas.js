// jsSyntaxTree - A syntax tree graph generator
// (c)2019 Andre Eisenbach <andre@ironcreek.net>

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

  line(x1, y1, x2, y2) {
    let ctx = this.context;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  download(fn) {
    let image = this.canvas.toDataURL('image/png')
                    .replace('image/png', 'image/octet-stream');
    let link = document.getElementById('link');
    link.setAttribute('href', image);
    link.setAttribute('download', fn);
    link.click();
  }
}
