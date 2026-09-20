/* Shared scroll geometry; no DOM dependencies. */
(function (root) {
  'use strict';
  const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
  const smooth = value => {const t = clamp(value);return t * t * (3 - 2 * t);};
  const progress = (top, height, viewport) => clamp(-top / Math.max(1, height - viewport));
  const gallery = (p, count = 4) => {
    const position = clamp(p) * count;
    const room = Math.min(count - 1, Math.floor(position));
    const phase = position - room;
    // Each room grows, holds, then shrinks before the track can move again.
    const zoom = smooth((phase - .05) / .29) * (1 - smooth((phase - .47) / .29));
    const slide = room < count - 1 ? smooth((phase - .82) / .18) : 0;
    const travel = (room + slide) / Math.max(1, count - 1);
    return {travel, index:Math.min(count - 1, room + Math.round(slide)), scale:1 + zoom * .52};
  };
  const galleryPosition = (index, count = 4) => clamp(index, 0, count - 1) / count;
  // Finish horizontal travel before the next section covers the pinned scene.
  const storyTravel = (p, width) => clamp((p - .34) / .50) * (width <= 600 ? width * 1.76 : width - 24);
  const storyEntrance = (p, width, height) => {
    const t = clamp((p - .035) / .30);
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
  const storyCover = p => clamp((p - 6 / 7) * 7);
  const deliveryActivation = (top, height, viewport) => {
    const distance = Math.max(1, Math.min(height * .65, viewport * .35));
    return clamp((viewport * .72 - top) / distance) * clamp((top + height - viewport * .1) / distance);
  };
  const statIndex = p => Math.min(3, Math.floor(clamp(p) * 4));
  root.KabizzuMotion = {clamp, progress, gallery, galleryPosition, storyTravel, storyEntrance, storyCover, deliveryActivation, statIndex};
})(globalThis);
