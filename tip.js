// jsSyntaxTree - A syntax tree graph generator
// (c)2019 Andre Eisenbach <andre@ironcreek.net>

const tips = [
  'Click on the syntax tree image to download a copy.',
  'Add manual subscripts to nodes using an underscore, &quot;_&quot;.<br /><strong>Example:</strong> [N_s Dogs]',
  'jsSyntaxTree works offline, instantly updates and handles unicode fonts.',
];

let tip_idx = Math.floor(Math.random() * tips.length);

function rotateTip(){
  document.getElementById('tip').innerHTML = '<strong>Tip:</strong> ' +
    tips[tip_idx++ % tips.length];
}
