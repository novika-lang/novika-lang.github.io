import { hoveredEffectIndex } from "./storage";

/**
 * Updates the hovered effect store with the new effect index
 * when the mouse moves over an effect-ref span.
 */
export function trackEffect(e: MouseEvent) {
  const target = e.target as HTMLElement | null;
  const effectIndex = target?.dataset.index;

  if (
    target === null ||
    effectIndex === undefined ||
    !target.classList.contains("effect-ref")
  ) {
    untrackEffect();
    return;
  }

  hoveredEffectIndex.set(parseInt(effectIndex));
}

/**
 * Resets the hovered effect store when the mouse leaves some
 * effect-ref span.
 */
export function untrackEffect() {
  hoveredEffectIndex.set(undefined);
}

/**
 * Highlights effect-refs with matching *index* in *container*.
 */
export function highlightIndex(container: HTMLElement, index: number) {
  container
    .querySelectorAll(`.effect-ref[data-index="${index}"]`)
    .forEach((ref) => ref.classList.add("target"));
}

/**
 * Removes highlighting from all effect-refs in *container*.
 */
export function unhighlightAll(container: HTMLElement) {
  container
    .querySelectorAll(".effect-ref[data-index]")
    .forEach((ref) => ref.classList.remove("target"));
}
