export const grammar = {
  leaves: {
    pattern: /(?<=\.|\s|\[|\]|^)(leaves:)(?=\.|\s+|\[|\]|$)/,
    alias: "word",
  },
  boolean: {
    pattern: /(?<=\.|\s|\[|\]|^)(true|false)(?=\.|\s+|\[|\]|$)/,
  },
  magnitudal: {
    pattern: /(?<=\.|\s|\[|\]|^)(\*\*|\<=|\>=|[-+*/<>]|mod)(?=\.|\s+|\[|\]|$)/,
    alias: "word",
    greedy: true,
  },
  stackworks: {
    pattern:
      /(?<=\.|\s|\[|\]|^)(stack|dup|drop|swap|nip|over|rot)(?=\.|\s+|\[|\]|$)/,
    alias: "word",
    greedy: true,
  },
  control: {
    pattern:
      /(?<=\.|\s|\[|\]|^)(\^|=>|die|conts|cont|ahead|resume|hydrate!?|open|there|do|sel|br|and|or|neither\?)(?=\.|\s+|\[|\]|$)/,
    alias: "word",
    greedy: true,
  },
  this: {
    pattern: /(?<=\.|\s|\[|\]|^)(this)(?=\.|\s+|\[|\]|$)/,
    alias: "word",
    greedy: true,
  },
  entryworks: {
    pattern: /(?<=\.|\s|\[|\]|^)(pushes|opens|entry:submit)(?=\.|\s+|\[|\]|$)/,
    alias: "word",
    greedy: true,
  },
  blockworks: {
    pattern:
      /(?<=\.|\s|\[|\]|^)(prototype|parent|new|shallowCopy|fromLeft|fromRight|count|<\||\|>|\|(at|to|slice|[-+])|cherry|shove|eject|inject|thru|top|effect|ls|reparent|befriend|unfriend|friends|slurp|orphan)(?=\.|\s+|\[|\]|$)/,
    alias: "word",
    greedy: true,
  },
  comment: {
    pattern: /"([^"\\]|\\['"])*"/,
    greedy: true,
  },
  quote: {
    pattern: /'(?:[^'\\]|\\[\\ntrve'])*'/,
    greedy: true,
  },
  decimal: {
    pattern:
      /(?<=\.|\s|\[|\]|^)(?:[-+]?\d(?:[\d_]*\d)?(?:\.\d(?:[\d_]*\d)?)?)(?=\.|\s+|\[|\]|$)/,
    greedy: true,
    lookbehind: true,
  },
  qword: {
    pattern: /\#[^\"'\s\[\]]+/,
  },
  word: {
    pattern: /(?:[^"'\s\.\[\]]+)|\./,
  },
};
