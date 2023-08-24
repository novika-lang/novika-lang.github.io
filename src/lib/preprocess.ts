import _ from "lodash";

import "$lib/syntax";
import MarkdownIt from "markdown-it";
import markdownItPrism from "markdown-it-prism";
import type { EffectReference, PayloadWord } from "../types";
import { effectSource, wordSourceMap } from "$lib/storage";
import { wordURI } from "$lib/util";
import { grammar } from "$lib/grammar";
import "$lib/syntax";

export interface PreprocessedWord extends PayloadWord {
  index: number;
  searchtext: string;
  effectMarkup: string;
  primerMarkup: string;
  markdownMarkup: string;
}

function createLongEffectReplacer(erefs: EffectReference[]) {
  const longEffectsAlt = erefs
    .map(([effectId]) => [effectId, effectSource[effectId].long])
    .map(([effectId, long]) => [effectId, long.split(/\s+/).join("\\s+")]) // Byteslice form ==> Byteslice\s+Form
    .map(([effectId, pattern]) => `(?<_${effectId}>${pattern})`) // Byteslice\s+Form ==> (?<_1234>Byteslice\s+Form)
    .join("|");

  const longEffectsPattern = new RegExp(`\\b(?:${longEffectsAlt})\\b`, "g");
  const longEffectsReplacer = (...args) => {
    const groups = args.at(-1); // We know there are named groups.
    const string = args.at(-2);

    let effectIndex, effectMatch;

    for (const effectIdGroup in groups) {
      effectMatch = groups[effectIdGroup];
      if (effectMatch === undefined) continue;

      // Break on first effect id that we matched.
      effectIndex = parseInt(effectIdGroup.slice(1));

      break;
    }

    if (effectMatch === undefined) return string;

    return `<span class="effect-ref effect-long" data-index=${effectIndex}>${effectMatch}</span>`;
  };

  return (content: string) =>
    content.replace(longEffectsPattern, longEffectsReplacer);
}

function createShortEffectReplacer(erefs: EffectReference[]) {
  const shortEffectsAlt = erefs
    .map(([effectId, _]) => [effectId, effectSource[effectId].short])
    .map(([effectId, pattern]) => `(?<_${effectId}>${pattern})`) // Svf => (?<_1234>Svf)
    .join("|");

  const shortEffectsPattern = new RegExp(`\\b(?:${shortEffectsAlt})\\b`, "g");
  const shortEffectsReplacer = (...args) => {
    const groups = args.at(-1);
    const string = args.at(-2);

    let effectIndex, effectMatch;

    for (const effectIdGroup in groups) {
      effectMatch = groups[effectIdGroup];
      if (effectMatch === undefined) continue;

      // Break on first effect id that we matched.
      effectIndex = parseInt(effectIdGroup.slice(1));

      break;
    }

    if (effectMatch === undefined) return string;

    return `<span class="effect-ref effect-short" data-index=${effectIndex}>${effectMatch}</span>`;
  };

  return (content: string) =>
    content.replace(shortEffectsPattern, shortEffectsReplacer);
}

export function preprocessWords(wordSource: PayloadWord[]): PreprocessedWord[] {
  const markdownIt = new MarkdownIt("default", {
    linkify: true,
    html: true,
    breaks: false,
  });

  Prism.languages.novika = grammar;

  markdownIt.use(markdownItPrism, { defaultLanguage: "novika" });

  const defaultTextRender = markdownIt.renderer.rules.text;
  const defaultCodeInlineRender = markdownIt.renderer.rules.code_inline;

  // Replace inline code references to existing words with .word-ref links
  //to the documentation page about the referred word.
  markdownIt.renderer.rules.code_inline = (tokens, tokenIndex, ...rest) => {
    const token = tokens[tokenIndex];

    if (!wordSourceMap.has(token.content))
      return defaultCodeInlineRender(tokens, tokenIndex, ...rest);

    return `<a href="${wordURI(token.content)}" class="word-ref code">${
      token.content
    }</a>`;
  };

  const preprocessedWords: PreprocessedWord[] = [];

  for (
    let payloadWordIndex = 0;
    payloadWordIndex < wordSource.length;
    payloadWordIndex++
  ) {
    const payloadWord = wordSource[payloadWordIndex];
    const draft = { ...payloadWord } as PreprocessedWord;

    // We're going to mutate the draft so we can push it right away.
    preprocessedWords.push(draft);

    draft.index = payloadWordIndex;
    draft.searchtext = draft.markdown.toLowerCase();
    draft.effectMarkup = draft.effect;

    draft.primer = draft.primer[0].toLocaleUpperCase() + draft.primer.slice(1);
    draft.markdown =
      draft.markdown[0].toLocaleUpperCase() + draft.markdown.slice(1);

    if (draft.erefs.length > 0) {
      // Replace long effects such as Byteslice form with the following markup:
      //
      // <span class="effect-ref effect-long" data-index={index of effect}>Byteslice form</span>
      const replaceLongEffects = createLongEffectReplacer(draft.erefs);
      markdownIt.renderer.rules.text = (tokens, tokenIndex) =>
        replaceLongEffects(tokens[tokenIndex].content);

      // Replace short effects such as Bf with the following markup:
      //
      // <span class="effect-ref effect-short" data-index={index of effect}>Bf</span>
      const replaceShortEffects = createShortEffectReplacer(draft.erefs);
      draft.effectMarkup = replaceShortEffects(draft.effectMarkup);
    } else {
      markdownIt.renderer.rules.text = defaultTextRender;
    }

    // Render primer and markdown markdown as HTML.
    draft.primerMarkup = markdownIt.render(draft.primer);
    draft.markdownMarkup = markdownIt.render(draft.markdown);
  }

  return preprocessedWords;
}
