// bugs:
// lch

const uid = require("uid-safe");
const parse = require("@textlint/markdown-to-ast").parse;
const wordPOS = require("wordpos");
const execWithIndices = require("regexp-match-indices");
const { words } = require("./words.res.json");

const wordpos = new wordPOS();

/**
 * Parses effect out of word description.
 *
 *  Group 0: effect and ':', if found.
 *
 *  Group 1: effect, including '(' and ')'.
 */
const EFFECT_IN_DESC = /^(\(\s+(?:[^\(\)]*)\--(?:[^\(\)]*)\s+\))(?::|$)/;

/**
 * Parses the input part of effect.
 *
 * Group 1: all text after '(', but before '--'.
 */
const EFFECT_INPUT = /\(\s*(.*)\s+--/;

/**
 * Parses the output part of effect.
 *
 * Group 1: all text after '--', but before ')'.
 */
const EFFECT_OUTPUT = /--\s*(.*)\s+\)/;

/**
 * Parses short identifier.
 *
 * Group 0: the identifier.
 */
const EFFECT_SHORT_ID = /[A-Z][a-z0-9]*/g;

/**
 * Visits object with the filter function, which also
 * decides whether to go deeper.
 *
 * @param {object} obj Object to visit
 * @param {function} filter Filter callback, should return
 * true or false for whether or not to go deeper.
 * @returns null
 */
function visit(obj, filter) {
  if (typeof obj !== "object" || obj === null) return;

  for ([key, value] of Object.entries(obj))
    if (filter(key, value, obj)) visit(value, filter);
}

/**
 * Returns a standard bounary object.
 *
 * @param {number} b begin index of bound
 * @param {number} e end index of bound
 * @returns boundary object
 */
const createBound = (b, e) => ({ b, e });

/**
 * Returns a standard fragment object.
 *
 * @param {string} frag string content of fragment
 * @param {number} b begin index of fragment bound
 * @param {number} e end index of fragment bound
 * @param {string?} alias alias name for frag
 * @returns fragment object
 */
const createFrag = (frag, b, e, alias = null) => ({
  frag,
  alias,
  bound: createBound(b, e),
});

/**
 * Splits word description string in two fragments: the
 * stack effect fragment, and the text fragment (almost
 * everything else).
 *
 * @param {string} desc word description string
 * @returns primary description partition object
 */
function splitIntoEffectAndText(desc) {
  const effectMatch = execWithIndices(EFFECT_IN_DESC, desc);

  if (effectMatch === null) {
    return { text: createFrag(desc, 0, desc.length), effect: null };
  }

  const [, effect] = effectMatch;
  const [[, textBegin], [effectBegin, effectEnd]] = effectMatch.indices;
  const text = desc.slice(textBegin);

  return {
    text: createFrag(text, textBegin, textBegin + text.length),
    effect: createFrag(effect, effectBegin, effectEnd),
  };
}

/**
 * Splits stack effect fragment further into two fragments:
 * the input fragment (stack shape before the word), and the
 * output fragment (stack shape after the word).
 *
 *      X Y foos: Z -- A B
 *      ^^^^^^^^^^^    ^^^
 *          inp        out
 *
 * @param {object} frag effect fragment
 * @returns object with properties for `inp`, `out`
 */
function splitEffectIntoIO({ frag: effect, bound: { b: offset } }) {
  const {
    1: inp,
    indices: [, [inpBegin, inpEnd]],
  } = execWithIndices(EFFECT_INPUT, effect);

  const {
    1: out,
    indices: [, [outBegin, outEnd]],
  } = execWithIndices(EFFECT_OUTPUT, effect);

  return {
    inp: createFrag(inp, offset + inpBegin, offset + inpEnd),
    out: createFrag(out, offset + outBegin, offset + outEnd),
  };
}

/**
 * Parses Markdown in `frag` and returns an array of
 * fragments per paragraph or any other string object.
 *
 * E.g. given Gb, markdown `**Grouper block**` will match
 * but `**Grouper** block` won't, because in the second
 * case, `**Grouper**` and `block` are different text
 * fragments, and cross-fragment matching is unsupported.
 *
 * @param {object} frag text fragment
 * @returns array of string fragments in text
 */
function splitTextIntoFrags({ frag: text, bound: { b: offset } }) {
  const frags = [];

  visit(parse(text), (key, value, object) => {
    if (!(object.type == "Str" && key == "raw")) return true;

    const [begin, end] = object.range;

    frags.push(createFrag(value, offset + begin, offset + end));

    return false;
  });

  return frags;
}

/**
 * Fetches identifier fragments in input or output fragment.
 *
 *      X Y foos: Z  --  A B
 *      ^ ^       ^  or  ^ ^
 *      inp              out
 *
 * @param {object} frag fragment object for input or
 * output, most often from `splitEffectIntoIO`
 * @returns array of identifier fragments in input or output
 * fragment
 */
function findShortIdFragsInIO({ frag: side, bound: { b: offset } }) {
  const frags = [];

  for (const { 0: frag, index } of side.matchAll(EFFECT_SHORT_ID)) {
    frags.push(createFrag(frag, offset + index, offset + index + frag.length));
  }

  return frags;
}

/**
 * Returns joint regexp to match expanded ids.
 *
 * @param {string[]} shorthands array of shorthand ids
 * @returns {RegExp} joint regexp to match expanded ids
 */
function shortIdFragsToRegex(shorthands) {
  const pattern = shorthands
    .sort((a, b) => b.length - a.length)
    .map(
      (shorthand) =>
        `(?<${shorthand}>${shorthand
          .split("")
          .map((chr) => `${chr}[a-z0-9]*`)
          .join("\\b\\s+")})`
    )
    .join("|");

  return new RegExp(`\\b(?:${pattern})\\b`, "gm");
}

/**
 * Brings identifier fragment to the normalized form.
 * Namely removes excess whitespace.
 *
 * @param {string} idFrag identifier fragment
 * @returns normalized fragment
 */
function normalizeIdFrag(idFrag) {
  return idFrag.trim().replace(/\s+/, " ");
}

/**
 * Finds & links Ids recognized by pattern to their shorter
 * forms under the `alias` fragment field. Shorter forms are
 * taken to be the names of named groups pattern matches.
 *
 * @param {RegExp} re regexp to match long ids with
 * @param {object} frag fragment of text
 * @returns array of ids in the fragment of text, with
 * references to their shorthand ids
 */
function findExtIdFragsInTextFrag(
  re,
  { frag: textFrag, bound: { b: offset } }
) {
  const frags = [];

  for (const match of textFrag.matchAll(re)) {
    if (!match.groups) continue;

    const [[alias, frag]] = Object.entries(match.groups).filter(([, v]) => v);

    frags.push(
      createFrag(
        normalizeIdFrag(frag),
        offset + match.index,
        offset + match.index + frag.length,
        alias
      )
    );
  }

  return frags;
}

/**
 * Groups frags with the same content under a single field.
 * Extends frags with a common bounds array that stores
 * other same-content bounds.
 *
 * @param {object[]} frags array of fragments to collate
 * @returns object mapping string frag to frag group
 */
function groupBoundsByFrag(frags) {
  const store = {};

  frags.forEach(({ frag }, index) => {
    store[frag] = frag in store ? [...store[frag], index] : [index];
  });

  const result = {};

  Object.entries(store).forEach(([key, indices]) => {
    const bounds = [];
    const collation = {};

    // For each index under the same key (with same frag
    // content), remove `bound` field but add it to `bounds`
    // array. Copy the rest of the fields over `collation`.
    // Next index overwrites last index in `collation`.
    indices.forEach((index) => {
      const frag = frags[index];
      const copy = Object.assign({}, frag);
      bounds.push(copy.bound);

      delete copy.bound;

      Object.assign(collation, copy);
    });

    // Assign bounds of all objects under the same key to a
    // dedicated property.
    collation.bounds = bounds;

    // Create corresponding entry in result.
    result[key] = collation;
  });

  return result;
}

/**
 * Undoes the action of `collateBoundsByFrag` on a single
 * fragment: unfolds common bounds array into copies of
 * fragment with matching bound from it.
 *
 * @param {object} frag subject fragment
 * @returns {object[]} array of frag objects
 */
function undoCollateBoundsByFrag(frag) {
  return frag.bounds.map((bound) => {
    const copy = Object.assign({}, frag);
    copy.bound = bound;
    delete copy.bounds;
    return copy;
  });
}

/**
 * Returns only those phrases that pass as a possible
 * extended id candidate.
 *
 * @param {string[]} phrases object mapping candidates
 * @returns {string[]}
 */
async function getCandidatePhrases(phrases) {
  const matches = [];

  for (const phrase of phrases) {
    const words = phrase.split(/\s+/);

    // Get noun and adjective information.
    const { nouns, adjectives } = await wordpos.getPOS(words);

    // If either one is non-empty, the phrase is a
    // candidate.
    if (nouns.length + adjectives.length > 0) matches.push(phrase);
  }

  return matches;
}

async function getIdPool(desc) {
  const { effect, text } = splitIntoEffectAndText(desc);

  if (effect === null) return [null, text, {}];

  const { inp, out } = splitEffectIntoIO(effect);
  const idsFromEffectMap = groupBoundsByFrag([
    ...findShortIdFragsInIO(inp),
    ...findShortIdFragsInIO(out),
  ]);

  const effectPattern = shortIdFragsToRegex(Object.keys(idsFromEffectMap));
  const textFrags = splitTextIntoFrags(text);
  const dirtyIdPool = groupBoundsByFrag(
    textFrags.flatMap((textFrag) =>
      findExtIdFragsInTextFrag(effectPattern, textFrag)
    )
  );

  // Copy candidate extended ids from the extended id pool.
  //
  // Most incorrect extended id matches will be rejected by
  // `getCandidatePhrases`, but sometimes, ambiguity still
  // slips through.

  const idPool = {};
  const candidates = await getCandidatePhrases(Object.keys(dirtyIdPool));

  candidates.forEach(
    (candidateExtId) => (idPool[candidateExtId] = dirtyIdPool[candidateExtId])
  );

  // As a last resort, we reject conflicting/ambiguous
  // entries entirely. If both `Block` and `Body` is
  // said about `B`, show `B`.
  //
  // Todo: we could do better by introducing a scoring
  // system, and scoring matches based on e.g. their
  // position in text. But that would be too much investment
  // for too little functionality in turn.
  const aliases = new Set();
  const idsForRemoval = new Set();

  Object.entries(idPool).forEach(([extId, { alias }]) => {
    extId === alias || aliases.has(alias)
      ? idsForRemoval.add(extId)
      : aliases.add(alias);
  });

  idsForRemoval.forEach((id) => delete idPool[id]);

  // Unify extended id bounds and its shorthand alias
  // bounds (those from the stack effect).
  Object.values(idPool).forEach((candidate) => {
    candidate.bounds = [
      ...candidate.bounds,
      ...idsFromEffectMap[candidate.alias].bounds,
    ];
  });

  return [effect, text, idPool];
}

function poolToMarkup(pool, target, rApply, fromStart = 0) {
  const regions = Object.values(pool).flatMap(undoCollateBoundsByFrag);

  return rApply(
    target,
    // Translate our fragment format into rApply's. Note
    // that we generate HTML here. This is unsafe, but OK
    // since we're guaranteed to be in control, server-side.
    regions.map(({ frag, scope, bound: { b, e } }) => [
      b - fromStart,
      e - fromStart,
      `<span class="doc-eff-id" data-scope="${scope}">${frag}</span>`,
    ])
  ).trim();
}

function normalizeMarkup(markup) {
  // If markup ends with a Unicode lowercase letter but no
  // period, add period.
  //
  // Otherwise, we don't know whether period will be
  // appropriate, so don't add it.
  if (/\p{Lowercase_Letter}$/u.test(markup)) {
    markup += ".";
  }

  // If markup starts with a Unicode lowercase letter,
  // transform it to uppercase.
  if (/^\p{Ll}/u.test(markup)) {
    markup = markup[0].toUpperCase() + markup.slice(1);
  }

  return markup;
}

async function getWordDescMarkup(desc, rApply) {
  const [effect, text, idPool] = await getIdPool(desc);

  if (effect == null) {
    return { effectHTML: "", textMarkdown: normalizeMarkup(text.frag) };
  }

  // Assign scope to each id. Client-side JavaScript will be
  // aware of all elements in the same scope, mainly to
  // highlight all of them when any scope member is hovered
  // over.
  for (const id of Object.values(idPool)) {
    id.scope = await uid(8);
  }

  const fragsIncludedIn = (otherFrag) =>
    Object.values(idPool).map((id) => {
      const { bounds } = id;

      const boundsInEffect = bounds.filter(
        ({ b, e }) => otherFrag.bound.b <= b && otherFrag.bound.e >= e
      );

      if (boundsInEffect.length === 0) return;

      return Object.assign(Object.assign({}, id), { bounds: boundsInEffect });
    });

  const effectIds = fragsIncludedIn(effect);
  const textIds = fragsIncludedIn(text);

  return {
    effectHTML: poolToMarkup(effectIds, effect.frag, rApply),
    textMarkdown: normalizeMarkup(
      poolToMarkup(textIds, text.frag, rApply, effect.bound.e + 1)
    ),
  };
}

module.exports = async () => {
  const { rApply } = await import("ranges-apply");
  const preprocessed = [];

  for (const { name, desc } of Object.values(words)) {
    preprocessed.push({
      name,
      ...(await getWordDescMarkup(desc, rApply)),
    });
  }

  return preprocessed;
};
