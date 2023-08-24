/**
 * A word record from the payload JSON.
 */
export interface PayloadWord {
  name: string;
  effect: string;
  markdown: string;
  primer: string;
  takes: EffectDeck;
  leaves: EffectDeck;
  erefs: EffectReference[];
  outbound: number[];
}

/**
 * An effect record from the payload JSON.
 */
export interface PayloadEffect {
  short: string;
  long: string;
  words: number[];
}

/**
 * Pointer to an effect reference found in effect decks. The first
 * number is the index into erefs. The second number is the occurence
 * no. (0-th, 1-st, 2-nd etc.) in the same deck.
 */
export type EffectDeckEffectReference = [number, number];

/**
 * A collection of effect references.
 */
export type EffectDeck = EffectDeckEffectReference[];

/**
 * Pointer to an effect from the effect source. The first number
 * is the index into effects. The second specifies the index of
 * the word that owns the reference. This allows to determine
 * whether the reference was *inferred* from neighboring words
 * or is actually found in the word's description.
 */
export type EffectReference = [number, number];

/**
 * Annoated effect reference from the payload.
 */
export interface AnnEffectReference {
  effectIndex: number;
  inferred: boolean;
}

/**
 * Effect reference pointer from one of the decks ("takes" or "leaves").
 */
export interface DeckEffectReference extends AnnEffectReference {
  deckId: "takes" | "leaves";
  indexInDeck: number;
  ordinal: number;
  recurring: boolean;
}

/**
 * Type for effect tags used in effect filter inputs.
 */
export interface EffectTag {
  /**
   * Qualified name of the tag. It is shown to the user.
   */
  qualname: string;

  /**
   * Ordinal number of this tag (e.g. 1st form, 2nd form, 3rd form,
   * 1, 2, 3 are the ordinals). Or a function to retrieve it.
   */
  ordinal: number;

  /**
   * Index of the effect. Can be undefined, in this case all effects will
   * match and only ordinal will matter (if it is defined; otherwise all
   * effects will match).
   */
  effectIndex?: number;
}
