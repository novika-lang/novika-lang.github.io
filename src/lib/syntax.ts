import Prism from "prismjs";
import { wordSourceMap } from "$lib/storage";
import { grammar } from "$lib/grammar";

/**
 * Adds .seamless-ref class to words in pre code blocks with language=Novika.
 */
export function processPreTokens(
  tokens,
  wordSourceMap: Map<string, PayloadWord>
) {
  const wordTokens = tokens
    .filter(
      (token) =>
        token.type === "word" ||
        token.alias === "word" ||
        (Array.isArray(token) && token.alias.includes("word"))
    )
    .filter((token) => wordSourceMap.has(token.content));

  for (const token of wordTokens) {
    if (Array.isArray(token.alias)) {
      if (token.alias.includes("seamless-ref")) continue;
      token.alias.push("seamless-ref");
    } else if (token.alias !== "seamless-ref") {
      token.alias =
        token.alias === undefined
          ? "seamless-ref"
          : [token.alias, "seamless-ref"];
    } else {
      token.alias = "seamless-ref";
    }
  }
}

/**
 * Highlights a snippet of Novika code. Returns the resulting HTML markup.
 */
export function highlight(code: string): string {
  Prism.languages.novika = grammar;

  return Prism.highlight(code, Prism.languages.novika, "novika");
}

// Hook into Prism to process language=Novika tokens
Prism.hooks.add("after-tokenize", (env) =>
  processPreTokens(env.tokens, wordSourceMap)
);
