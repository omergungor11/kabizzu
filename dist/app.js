(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const hero = $('.hero');
  const heroFrame = $('.hero-frame');
  const heroTitle = $('.hero h1');
  const composition = $('.composition');
  const floating = $$('.floating-image');
  const interlude = $('.interlude');
  let framePending = false;
  function renderScroll() {
    framePending = false;
    if (reducedMotion.matches) return;
    const vh = window.innerHeight;
    const width = window.innerWidth;
    const heroRect = hero.getBoundingClientRect();
    const compositionRect = composition.getBoundingClientRect();
    const interludeRect = interlude.getBoundingClientRect();
    const p = clamp(-heroRect.top / (heroRect.height - vh));
    const eased = p * p * (3 - 2 * p);
    const mobile = width <= 600;
    const tablet = width <= 900;
    const top = mobile ? 25 : tablet ? 24 : width >= 1600 ? 21 : 23;
    const left = mobile ? 9 : tablet ? 14 : 23;
    const height = mobile ? 42 : tablet ? 47 : 51;
    heroFrame.style.top = lerp(top, 0, eased) + '%';
    heroFrame.style.left = lerp(left, 0, eased) + '%';
    heroFrame.style.width = lerp(100 - 2 * left, 100, eased) + '%';
    heroFrame.style.height = lerp(height, 100, eased) + '%';
    $('.hero-shade').style.opacity = lerp(.08, .38, eased);
    heroTitle.style.transform = `translateY(${-eased * (mobile ? 80 : 115)}px)`;
    heroTitle.style.color = `rgb(${Math.round(lerp(40, 244, eased))},${Math.round(lerp(41, 243, eased))},${Math.round(lerp(31, 233, eased))})`;
    $('.hero-bottom').style.color = heroTitle.style.color;
    $('.hero-caption').style.opacity = 1 - clamp(p * 4);
    const c = clamp(-compositionRect.top / (compositionRect.height - vh));
    floating.forEach((image, i) => {
      const travel = [122, 163, 164, 176][i];
      image.style.transform = `translate3d(0,${-c * vh * travel / 100}px,0) rotate(${lerp([1.5,-2,2,-1][i],[0,1,-1,1][i],c)}deg)`;
    });
    if (interludeRect.top < vh && interludeRect.bottom > 0) {
      const progress = (vh - interludeRect.top) / (vh + interludeRect.height);
      $('.interlude-image').style.transform = `translate3d(0,${lerp(-6,6,progress)}%,0)`;
    }
  }
  function requestFrame() { if (!framePending) { framePending = true; requestAnimationFrame(renderScroll); } }
  window.addEventListener('scroll', requestFrame, { passive: true });
  window.addEventListener('resize', requestFrame, { passive: true });
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) {
      [heroFrame, heroTitle, $('.hero-shade'), $('.hero-bottom'), $('.hero-caption'), $('.interlude-image'), ...floating].forEach(el => el.removeAttribute('style'));
    } else requestFrame();
  });
  renderScroll();
  if ('IntersectionObserver' in window) {
    document.body.classList.add('motion-ready');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if(entry.isIntersecting) {entry.target.classList.add('is-visible'); observer.unobserve(entry.target);} });
    }, {threshold:.12});
    $$('.reveal').forEach(el => observer.observe(el));
  }

  const menu = $('#menu-dialog');
  const detail = $('#project-dialog');
  const openDialog = (dialog) => { dialog.showModal(); document.body.classList.add('modal-open'); };
  [menu,detail].forEach(dialog => {
    dialog.addEventListener('close', () => {document.body.classList.remove('modal-open');requestFrame();});
    dialog.addEventListener('click', event => {if(event.target === dialog) {const r=dialog.getBoundingClientRect();if(event.clientX<r.left || event.clientX>r.right || event.clientY<r.top || event.clientY>r.bottom) dialog.close();}});
  });
  $('.menu-toggle').addEventListener('click', () => openDialog(menu));
  $('.close-menu').addEventListener('click', () => menu.close());
  $$('.menu-dialog nav a').forEach(link => link.addEventListener('click', () => menu.close()));
  $('.close-project').addEventListener('click', () => detail.close());

  const projects = [
    { name:'Işık Dairesi.', lines:['Işık','Dairesi.'], type:'KONUT / KONSEPT', image:'/assets/living.webp', alt:'Işık Dairesi konseptinin doğal ışık alan salonu', short:'Günün ışığıyla<br>değişen bir hikâye.', materials:'Doğal taş · Ceviz · Keten', materialLabel:'DOĞAL TAŞ<br>CEVİZ · KETEN', color:'#70764f', description:'Yumuşak hatların doğal dokularla buluştuğu bir yaşam alanı. Gün boyunca değişen ışık; taşın, ahşabın ve kumaşın farklı yüzlerini ortaya çıkarıyor. Sade bir yerleşim, birlikte geçirilen anlara yer açıyor.' },
    { name:'Avlu Evi.', lines:['Avlu','Evi.'], type:'KONUT / KONSEPT', image:'/assets/residence.webp', alt:'Avlu Evi konseptinde avluya açılan yemek alanı', short:'İçerisi ile dışarısı<br>arasında bir nefes.', materials:'Traverten · Meşe · Kireç sıva', materialLabel:'TRAVERTEN<br>MEŞE · KİREÇ SIVA', color:'#82725c', description:'Bir avlunun etrafında şekillenen dingin bir ev. İç ve dış mekân arasındaki eşik incelirken, ışık ortak yaşam alanlarının doğal bir parçasına dönüşüyor. Ham dokular ve dengeli oranlar, yapının sakin karakterini belirliyor.' },
    { name:'Sakin Kahve.', lines:['Sakin','Kahve.'], type:'HOSPITALITY / KONSEPT', image:'/assets/coffee.webp', alt:'Sakin Kahve konseptinin ahşap ve mermer tezgâhı', short:'Küçük bir mola.<br>Kalıcı bir his.', materials:'Yeşil mermer · Ceviz · Krom', materialLabel:'YEŞİL MERMER<br>CEVİZ · KROM', color:'#686b58', description:'Şehrin içinde, kendi ritmini bulan bir buluşma noktası. Kavisli tezgâh mekânın akışını tarif ederken; koyu ahşap, yeşil mermer ve sıcak ışık tanıdık bir atmosfer kuruyor. Bir kahveden biraz daha uzun kalmak için.' }
  ];
  let active = 0;
  let transitionId = 0;
  async function selectProject(index) {
    active = (index + projects.length) % projects.length;
    const project = projects[active];
    const request = ++transitionId;
    const img = $('#project-image');
    const preload = new Image();
    preload.src = project.image;
    try { await preload.decode(); } catch { return; }
    if (request !== transitionId) return;
    img.src = project.image;
    img.alt = project.alt;
    if (!reducedMotion.matches) img.animate([{opacity:.25,transform:'scale(1.035)'},{opacity:1,transform:'scale(1)'}],{duration:650,easing:'ease-out'});
    $('#project-name').innerHTML = `${project.lines[0]}<br><em>${project.lines[1]}</em>`;
    $('#project-description').innerHTML = project.short;
    $('.project-type').textContent = project.type;
    $('.project-material').innerHTML = project.materialLabel;
    $('.projects').style.backgroundColor = project.color;
    $('.project-image-button').setAttribute('aria-label', `${project.name} projesini incele`);
    $('#project-index').textContent = String(active + 1).padStart(2,'0');
    $('.section-top>span').textContent = `KABİZZU KOLEKSİYONU — 0${active+1} / 03`;
    $$('.project-dot').forEach((button,i) => {button.classList.toggle('active',i===active);button.setAttribute('aria-pressed',String(i===active));});
  }
  $('#previous-project').addEventListener('click',()=>selectProject(active-1));
  $('#next-project').addEventListener('click',()=>selectProject(active+1));
  $$('.project-dot').forEach(button => button.addEventListener('click',()=>selectProject(Number(button.dataset.project))));
  $('.project-image-button').addEventListener('click',()=>{
    const project=projects[active];
    $('#detail-title').textContent=project.name;
    $('#detail-image').src=project.image;
    $('#detail-image').alt=project.alt;
    $('#detail-type').textContent=`${project.type} 0${active+1}`;
    $('#detail-description').textContent=project.description;
    $('#detail-materials').textContent=project.materials;
    openDialog(detail);
    detail.scrollTop=0;
  });
  $('.project-selector').addEventListener('keydown',event=>{
    if(event.key==='ArrowRight'||event.key==='ArrowLeft') {event.preventDefault();const next=(active+(event.key==='ArrowRight'?1:-1)+3)%3;selectProject(next);$$('.project-dot')[next].focus();}
  });
})();
