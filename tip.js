// jsSyntaxTree - A syntax tree graph generator
// (c)2019 Andre Eisenbach <andre@ironcreek.net>

const tips = [
  'Click on the syntax tree image to download a copy.',
  'Add manual subscripts to nodes using an underscore character.<br />Example: [N_s Dogs]',
  'jsSyntaxTree works offline, instantly updates and handles unicode fonts.',
  'You can right-click the image and copy &amp; paste the graph into your document editor.',
  'The graph will updarte automatically once a matching number of brackets is detected.',
  'You can add spaces to nodes by putting them inside double quotes.<br />Example: [&quot;Main clause&quot; [S][V][O]]',
];

let tip_idx = Math.floor(Math.random() * tips.length);

export default function rotateTip() {
  document.getElementById('tip').innerHTML =
      '<strong>Tip:</strong> ' + tips[tip_idx++ % tips.length];
}
