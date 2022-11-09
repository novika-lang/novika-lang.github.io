const { words } = require("./_data/words.res.json");

const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

Prism.languages.novika = {
  leaves: {
    pattern: /(?<=\.|\s|\[|\]|^)(leaves:)(?=\.|\s+|\[|\]|$)/,
    alias: "word",
  },
  boolean: {
    pattern: /(?<=\.|\s|\[|\]|^)(true|false)(?=\.|\s+|\[|\]|$)/,
    lookbehind: true,
    greedy: true,
  },
  magnitudal: {
    pattern: /(?<=\.|\s|\[|\]|^)(\*\*|\<=|\>=|[-+*/<>]|mod)(?=\.|\s+|\[|\]|$)/,
    lookbehind: true,
    greedy: true,
  },
  stackworks: {
    pattern:
      /(?<=\.|\s|\[|\]|^)(stack|dup|drop|swap|nip|over|rot)(?=\.|\s+|\[|\]|$)/,
    lookbehind: true,
    greedy: true,
  },
  control: {
    pattern:
      /(?<=\.|\s|\[|\]|^)(\^|=>|die|conts|cont|ahead|resume|hydrate!?|open|there|do|sel|br|and|or|neither\?)(?=\.|\s+|\[|\]|$)/,
    lookbehind: true,
    greedy: true,
  },
  this: {
    pattern: /(?<=\.|\s|\[|\]|^)(this)(?=\.|\s+|\[|\]|$)/,
    lookbehind: true,
    greedy: true,
  },
  entryworks: {
    pattern: /(?<=\.|\s|\[|\]|^)(pushes|opens|entry:submit)(?=\.|\s+|\[|\]|$)/,
    lookbehind: true,
    greedy: true,
  },
  blockworks: {
    pattern:
      /(?<=\.|\s|\[|\]|^)(prototype|parent|new|shallowCopy|fromLeft|fromRight|count|<\||\|>|\|(at|to|slice|[-+])|cherry|shove|eject|inject|thru|top|effect|ls|reparent|befriend|unfriend|friends|slurp|orphan)(?=\.|\s+|\[|\]|$)/,
    lookbehind: true,
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

Prism.hooks.add("after-tokenize", function (env) {
  env.tokens.forEach((token) => {
    const isWord =
      token.type === "word" ||
      token.alias === "word" ||
      (Array.isArray(token.alias) && token.alias.includes("word"));

    if (isWord && token.content in words) {
      if (Array.isArray(token.alias)) token.alias.push("doc-word");
      else if (token.alias) token.alias = [token.alias, "doc-word"];
      else token.alias = "doc-word";
    }
  });
});

const prism = require("markdown-it-prism");

const md = require("markdown-it")({
  html: true,
});

function fn(state) {
  state.tokens
    .filter((token) => token.type === "inline")
    .flatMap((token) => [token, ...token.children])
    .filter((token) => token.type === "code_inline")
    .forEach((token) => {
      if (token.content in words) {
        token.attrPush(["class", "inline-word-ref"]);
      }
    });
}

md.use(prism, { defaultLanguage: "novika" });

md.core.ruler.push("f", fn);

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("res");
  eleventyConfig.addPlugin(syntaxHighlight);

  eleventyConfig.addPairedShortcode("markdown", (content) =>
    md.render(content)
  );

  return {
    passthroughFileCopy: true,
  };
};
