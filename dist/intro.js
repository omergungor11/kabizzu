(() => {
  'use strict';
  const root = document.documentElement;
  const intro = document.querySelector('.site-intro');
  if (!intro) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const animations = [];
  const timers = new Set();
  let finished = false;
  let locked = [];
  const wait = (milliseconds) => new Promise(resolve => {
    const id = setTimeout(() => { timers.delete(id); resolve(); }, milliseconds);
    timers.add(id);
  });
  function finish() {
    if (finished) return;
    finished = true;
    clearTimeout(window.kabizzuIntroWatchdog);
    timers.forEach(clearTimeout);
    timers.clear();
    root.classList.remove('intro-pending');
    animations.forEach(animation => animation.cancel());
    locked.forEach(element => { element.inert = false; element.removeAttribute('data-intro-inert'); });
    if (intro.contains(document.activeElement)) document.querySelector('.menu-toggle')?.focus({preventScroll:true});
    intro.remove();
    window.removeEventListener('keydown', onKeydown);
    window.removeEventListener('kabizzu:intro-timeout', finish);
    window.removeEventListener('pagehide', finish);
    motion.removeEventListener('change', onMotionChange);
    window.dispatchEvent(new Event('kabizzu:intro-complete'));
  }
  function onKeydown(event) { if (event.key === 'Escape') finish(); }
  function onMotionChange() { if (motion.matches) finish(); }
  if (!root.classList.contains('intro-pending') || motion.matches || window.location.hash || window.scrollY > 8 || typeof intro.animate !== 'function') {
    finish();
    return;
  }
  locked = [...document.querySelectorAll('.site-header, main, footer, .skip-link')].filter(element => !element.inert);
  locked.forEach(element => { element.inert = true; element.setAttribute('data-intro-inert',''); });
  intro.querySelector('.intro-skip').addEventListener('click', finish);
  window.addEventListener('keydown', onKeydown);
  window.addEventListener('kabizzu:intro-timeout', finish);
  window.addEventListener('pagehide', finish);
  motion.addEventListener('change', onMotionChange);

  function play(element, keyframes, options) {
    const animation = element.animate(keyframes, {fill:'both',easing:'cubic-bezier(.22,1,.36,1)',...options});
    animations.push(animation);
    return animation.finished.catch(() => {});
  }
  async function start() {
    const gallery = intro.querySelector('.intro-gallery');
    const sources = ['coffee','residence','living','residence','coffee','living','residence','living','coffee','residence','living','coffee','living','residence','coffee'];
    const tiles = sources.map((source,index) => {
      const tile = document.createElement('div');
      tile.className = 'intro-tile';
      tile.style.zIndex = String(15 - Math.abs(index - 7));
      const image = document.createElement('img');
      image.src = `/assets/${source}.webp`;
      image.alt = '';
      image.width = 1536;
      image.height = 1024;
      image.style.objectPosition = `${[25,50,75][index % 3]}% 50%`;
      tile.append(image);
      gallery.append(tile);
      return tile;
    });
    const sentence = intro.querySelector('.intro-title');
    const characters = Array.from(sentence.textContent).map(character => {
      const span = document.createElement('span');
      span.className = 'intro-character';
      span.textContent = character;
      return span;
    });
    sentence.replaceChildren(...characters);
    // Decode the real image/font assets, with a bounded wait for slow connections.
    const images = [...intro.querySelectorAll('img')];
    const ready = Promise.allSettled([
      ...images.map(image => typeof image.decode === 'function' ? image.decode() : Promise.resolve()),
      document.fonts?.ready ?? Promise.resolve()
    ]);
    await Promise.race([ready, wait(1800)]);
    if (finished) return;
    sentence.style.opacity = '1';

    play(intro.querySelector('.intro-signature'),[{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0% 0 0)'}],{duration:2100,delay:70});
    tiles.forEach((tile,index) => {
      const x = `calc(${index - 7} * var(--step))`;
      const y = `calc(${index % 2 ? 1 : -1} * var(--wave))`;
      play(tile,[{opacity:0,filter:'blur(9px)'},{opacity:1,filter:'blur(0px)'}],{duration:780,delay:index*23});
      play(tile,[
        {transform:`translate3d(${x},${y},0)`,offset:0},
        {transform:`translate3d(${x},0,0)`,offset:.30},
        {transform:`translate3d(${x},0,0)`,offset:.48},
        {transform:'translate3d(0,0,0)',offset:1}
      ],{duration:1850,delay:900+Math.abs(index-7)*13,easing:'cubic-bezier(.76,0,.24,1)'});
      play(tile,[{opacity:1},{opacity:0}],{duration:180,delay:2810,fill:'forwards'});
    });
    characters.forEach((character,index) => {
      play(character,[{opacity:0,filter:'blur(3px)',transform:'translateY(12px)'},{opacity:1,filter:'blur(0px)',transform:'translateY(0)'}],{duration:650,delay:220+index*29});
      play(character,[{opacity:1},{opacity:0}],{duration:450,delay:2770+(characters.length-index)*17,fill:'forwards'});
    });
    play(intro.querySelector('.intro-subtitle'),[{opacity:0},{opacity:1}],{duration:850,delay:660});
    play(intro.querySelector('.intro-subtitle'),[{opacity:1},{opacity:0}],{duration:380,delay:2820,fill:'forwards'});
    play(intro.querySelector('.intro-curtain'),[{opacity:1},{opacity:0}],{duration:600,delay:2750,fill:'forwards'});
    play(intro.querySelector('.intro-brand'),[{opacity:1},{opacity:0}],{duration:600,delay:3450,fill:'forwards'});
    play(intro.querySelector('.intro-skip'),[{opacity:1},{opacity:0}],{duration:300,delay:3650,fill:'forwards'});
    play(intro.querySelector('.intro-photo'),[
      {width:'var(--tile)',height:'var(--tile)',opacity:0,offset:0},
      {width:'var(--tile)',height:'var(--tile)',opacity:1,offset:.07},
      {width:'var(--photo-width)',height:'var(--photo-height)',opacity:1,offset:.42},
      {width:'var(--photo-width)',height:'var(--photo-height)',opacity:1,offset:.49},
      {width:'100vw',height:'100svh',opacity:1,offset:1}
    ],{duration:1730,delay:2740,easing:'cubic-bezier(.65,0,.2,1)'});
    play(intro.querySelector('.intro-photo-shade'),[{opacity:0},{opacity:.32}],{duration:900,delay:3520});
    document.querySelectorAll('.hero-line-text').forEach((line,index) => {
      play(line,[{opacity:0,clipPath:'inset(0 100% 0 0)',transform:'translateY(25%)'},{opacity:1,clipPath:'inset(0 0% 0 0)',transform:'translateY(0)'}],{duration:1100,delay:3990+index*120});
    });
    play(document.querySelector('.hero-caption'),[{opacity:0},{opacity:1}],{duration:800,delay:3970});
    play(document.querySelector('.site-header'),[{opacity:0,transform:'translateY(-8px)'},{opacity:1,transform:'translateY(0)'}],{duration:700,delay:4220});
    play(document.querySelector('.hero-bottom'),[{opacity:0},{opacity:1}],{duration:700,delay:4490});
    // Identical image framing above/below makes this handoff visually continuous.
    await play(intro,[{opacity:1},{opacity:0}],{duration:640,delay:4420,fill:'forwards'});
    if (!finished) await wait(150);
    finish();
  }
  start().catch(finish);
})();
