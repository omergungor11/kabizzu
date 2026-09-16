/* Shared scroll geometry; no DOM dependencies. */
(function (root) {
  'use strict';
  const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
  const progress = (top, height, viewport) => clamp(-top / Math.max(1, height - viewport));
  const gallery = (p, count = 4) => {
    const travel = clamp((p - .12) / .88);
    return {travel, index: Math.round(travel * (count - 1)), scale: 1 + clamp(p / .12) * .52};
  };
  const galleryPosition = (index, count = 4) => .12 + .88 * clamp(index / (count - 1));
  const storyTravel = (p, width) => clamp((p - .44) / .56) * width * (width <= 600 ? 1.76 : 1);
  const storyEntrance = (p, width, height) => {
    const t = clamp((p - .06) / .32);
    const growth = t * t * (3 - 2 * t);
    const edge = Math.min(width, height);
    const tile = Math.min(90, edge * .2);
    return {
      scale: tile / edge + (1 - tile / edge) * growth,
      insetTop: (height - edge) * (1 - growth),
      insetLeft: (width - edge) * (1 - growth),
      offset: 24 * (growth - 1)
    };
  };
  const statIndex = p => Math.min(3, Math.floor(clamp(p) * 4));
  root.KabizzuMotion = {clamp, progress, gallery, galleryPosition, storyTravel, storyEntrance, statIndex};
})(globalThis);
