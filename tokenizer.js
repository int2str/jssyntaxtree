// jsSyntaxTree - A syntax tree graph generator
// (c)2020 Andre Eisenbach <andre@ironcreek.net>

'use strict';

export const TokenType = {
  BRACKET_OPEN: 'BRACKET_OPEN',
  BRACKET_CLOSE: 'BRACKET_CLOSE',
  STRING: 'STRING',
  NUMBER: 'NUMBER',
  QUOTED_STRING: 'QUOTED_STRING',
  SUBSCRIPT_PREFIX: 'SUBSCRIPT_PREFIX',
  SUPERSCRIPT_PREFIX: 'SUPERSCRIPT_PREFIX',
  ARROW_TO: 'ARROW_TO',
  ARROW_FROM: 'ARROW_FROM',
  ARROW_BOTH: 'ARROW_BOTH'
};

export class Token {
  constructor(type, value = null) {
    this.type = type;
    this.value = value;
  }
}

export function tokenize(input) {
  const parsers = [
    skipWhitespace, parseControlCharacters, parseArrows, parseNumber,
    parseString, parseQuotedString
  ];

  const tokens = [];
  let offset = 0;

  while (offset < input.length) {
    const now_serving = offset;

    for (const parse_fn of parsers) {
      const [token, consumed] = parse_fn(input.substring(offset));
      offset += consumed;
      if (token != null) tokens.push(token);
      if (offset >= input.length) break;
    }

    if (offset == now_serving)
      throw 'Unable to parse [' + s.substring(offset) + '] ...';
  }

  return tokens;
}

function isWhitespace(ch) {
  const whitespace = [' ', '\b', '\f', '\n', '\r', '\t', '\v'];
  return whitespace.includes(ch);
}

function isControlCharacter(ch) {
  const control_chars = ['[', ']', '^', '_', '"'];
  return control_chars.includes(ch);
}

function isNumber(ch) {
  return ch >= '0' && ch <= '9';
}

function skipWhitespace(input) {
  let consumed = 0;
  while (isWhitespace(input.charAt(consumed))) ++consumed;
  return [null, consumed];
}

function parseControlCharacters(input) {
  if (input.charAt(0) == '_') return [new Token(TokenType.SUBSCRIPT_PREFIX), 1];
  if (input.charAt(0) == '^') return [new Token(TokenType.SUPERSCRIPT_PREFIX), 1];
  if (input.charAt(0) == '[') return [new Token(TokenType.BRACKET_OPEN), 1];
  if (input.charAt(0) == ']') return [new Token(TokenType.BRACKET_CLOSE), 1];
  return [null, 0];
}

function parseArrows(input) {
  if (input.length > 1) {
    if (input.startsWith('->')) return [new Token(TokenType.ARROW_TO), 2];
    if (input.startsWith('<-')) return [new Token(TokenType.ARROW_FROM), 2];
    if (input.startsWith('<>')) return [new Token(TokenType.ARROW_BOTH), 2];
  }
  return [null, 0];
}

function parseNumber(input) {
  let consumed = 0;
  while (consumed < input.length && isNumber(input.charAt(consumed)))
    ++consumed;
  if (consumed > 0) {
    return [
      new Token(TokenType.NUMBER, parseInt(input.substring(0, consumed))),
      consumed
    ];
  } else {
    return [null, 0];
  }
}

function parseString(input) {
  let consumed = 0;
  while (consumed < input.length && !isWhitespace(input.charAt(consumed)) &&
         !isControlCharacter(input.charAt(consumed)))
    ++consumed;
  if (consumed > 0) {
    return [
      new Token(TokenType.STRING, input.substring(0, consumed)), consumed
    ];
  } else {
    return [null, 0];
  }
}

function parseQuotedString(input) {
  if (input.charAt(0) != '"') return [null, 0];
  let consumed = 1;
  while (consumed < input.length && input.charAt(consumed) != '"') ++consumed;
  if (input.charAt(consumed) != '"')
    throw 'Unterminated quoted string. Missing " after [' + input + ']';
  return [
    new Token(TokenType.QUOTED_STRING, input.substring(1, consumed)),
    consumed + 1
  ];
}
