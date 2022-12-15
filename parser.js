// jsSyntaxTree - A syntax tree graph generator
// (c)2020 Andre Eisenbach <andre@ironcreek.net>

'use strict';

import * as Tokenizer from './tokenizer.js';

export const NodeType = {
  ROOT: 'ROOT',
  NODE: 'NODE',
  VALUE: 'VALUE'
};

export function parse(tokens) {
  const root = {type: NodeType.ROOT, label: '__ROOT__', values: []};
  let node = null
  let current = 0;
  while (current < tokens.length) {
    [current, node] = parseToken(tokens, current);
    root.values.push(node);
  }
  return root;
}

function parseNode(tokens, current) {
  const node = {type: NodeType.NODE, label: null, subscript: null, superscript: null, values: []};

  // Get label
  if (current > tokens.length - 2) throw 'Missing label after [';
  const label_token = tokens[++current];
  if (label_token.type != Tokenizer.TokenType.STRING &&
      label_token.type != Tokenizer.TokenType.QUOTED_STRING)
    throw 'Expected label string after [';
  node.label = tokens[current++].value;

  // Check for subscript
  if (current < tokens.length - 1 &&
      (tokens[current].type == Tokenizer.TokenType.SUBSCRIPT_PREFIX ||
      tokens[current].type == Tokenizer.TokenType.SUPERSCRIPT_PREFIX)) {
    let is_super = tokens[current].type == Tokenizer.TokenType.SUPERSCRIPT_PREFIX;
    const subscript_token = tokens[++current];
    if (subscript_token.type != Tokenizer.TokenType.STRING &&
        subscript_token.type != Tokenizer.TokenType.QUOTED_STRING)
      throw current + ': Expected subscript string after _';
    if (is_super)
      node.superscript = tokens[current++].value;
    else
      node.subscript = tokens[current++].value;
  }

  // Parse children
  while (current < tokens.length &&
         tokens[current].type != Tokenizer.TokenType.BRACKET_CLOSE) {
    let value = null;
    [current, value] = parseToken(tokens, current);
    if (value) node.values.push(value);
  }

  if (current >= tokens.length)
    throw (current - 1) + ': Missing closing bracket ] ...';

  return [current + 1, node];
}

function parseValue(tokens, current) {
  // Assemble multi string or quoted string label
  let label = null;
  if (tokens[current].type == Tokenizer.TokenType.STRING) {
    const values = [];
    while (current < tokens.length &&
           tokens[current].type == Tokenizer.TokenType.STRING)
      values.push(tokens[current++].value);
    label = values.join(' ');
  } else {
    label = tokens[current++].value;
  }

  // Check for sub/superscript
  let subscript = null;
  let superscript = null;
  if (current < tokens.length - 1 &&
      (tokens[current].type == Tokenizer.TokenType.SUBSCRIPT_PREFIX ||
      tokens[current].type == Tokenizer.TokenType.SUPERSCRIPT_PREFIX)) {
    let is_super = tokens[current].type == Tokenizer.TokenType.SUPERSCRIPT_PREFIX;
    const subscript_token = tokens[++current];
    if (subscript_token.type != Tokenizer.TokenType.STRING &&
        subscript_token.type != Tokenizer.TokenType.QUOTED_STRING)
      throw current + ': Expected subscript string after _/^';
    if (is_super)
      superscript = tokens[current++].value;
    else
      subscript = tokens[current++].value;
  }

  // Check for arrow
  let arrow = null;
  if (current < tokens.length - 1 &&
      (tokens[current].type == Tokenizer.TokenType.ARROW_TO ||
       tokens[current].type == Tokenizer.TokenType.ARROW_FROM ||
       tokens[current].type == Tokenizer.TokenType.ARROW_BOTH)) {
    const ends = {
      to: tokens[current].type == Tokenizer.TokenType.ARROW_TO ||
          tokens[current].type == Tokenizer.TokenType.ARROW_BOTH,
      from: tokens[current].type == Tokenizer.TokenType.ARROW_FROM ||
          tokens[current].type == Tokenizer.TokenType.ARROW_BOTH
    };
    tokens[current].type == Tokenizer.TokenType.ARROW_BOTH;

    const target_token = tokens[++current];
    if (target_token.type != Tokenizer.TokenType.NUMBER)
      throw current + ': Expected column number after -> or <>';
    arrow = {ends: ends, target: tokens[current++].value};
  }

  return [
    current,
    {type: NodeType.VALUE, label: label, subscript: subscript, superscript: superscript, arrow: arrow}
  ];
}

function parseToken(tokens, current) {
  switch (tokens[current].type) {
    case Tokenizer.TokenType.BRACKET_OPEN:
      return parseNode(tokens, current);
    case Tokenizer.TokenType.STRING:
    case Tokenizer.TokenType.QUOTED_STRING:
      return parseValue(tokens, current);
    default:
      throw 'Unexpected ' + tokens[current].type + ' at idx ' + current;
  }
}
