// jsSyntaxTree - A syntax tree graph generator
// (c)2019 Andre Eisenbach <andre@ironcreek.net>

window.onload = function() {
  let code = document.getElementById('code');
  let params = (new URL(document.location)).searchParams;
  let query = decodeURI(window.location.search).replace('?', '');

  if (validatePhrase(query)) {
    code.value = query;
    onEdit();
  }
}
