// jsSyntaxTree - A syntax tree graph generator
// (c)2019 Andre Eisenbach <andre@ironcreek.net>

let last_tip_idx = 0;

function rotateTip(){
  let label = '<strong>Tip:</strong> '
  let tips = [
    'Click on the syntax tree image to download a copy.',
    'Add manual subscripts to nodes using an underscore, &quot;_&quot;.<br /><strong>Example:</strong> [N_s Dogs]',
    'jsSyntaxTree works offline, instantly updates and handles unicode fonts.',
  ];

  let i = last_tip_idx;
  while (i == last_tip_idx) {
    i = Math.floor(Math.random() * tips.length);
  }
  last_tip_idx = i;

  document.getElementById('tip').innerHTML = label + tips[i];
}
