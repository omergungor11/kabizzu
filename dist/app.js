(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const {clamp, progress, gallery, galleryPosition, storyTravel, statIndex} = window.KabizzuMotion;
  const hero = $('.hero');
  const composition = $('.composition');
  const projectsSection = $('.projects');
  const projectTrack = $('.project-track');
  const projectPin = $('.project-pin');
  const story = $('.story');
  const statsScene = $('.stats-scene');
  const cards = $$('.stat-card');
  const floating = $$('.floating-image');
  const projectButtons = $$('.project-image-button');
  let lenis;
  let rafPending = false;
  let lastGalleryIndex = -1;
  let activeStat = -1;
  const counters = new Map();

  function syncScrollLock() {
    const locked = document.documentElement.classList.contains('intro-pending') || !!$('dialog[open]');
    if (locked) lenis?.stop(); else lenis?.start();
  }
  function initializeScrolling() {
    lenis?.destroy();
    lenis = undefined;
    if (!motion.matches && window.Lenis) {
      lenis = new window.Lenis({lerp:.075, smoothWheel:true, syncTouch:false, anchors:true, autoRaf:true, prevent:node => node.hasAttribute('data-lenis-prevent')});
      lenis.on('scroll', requestFrame);
      syncScrollLock();
    }
  }
  function jumpTo(y) {
    if (lenis) lenis.scrollTo(y, {immediate:true});
    else window.scrollTo({top:y, behavior:'instant'});
    requestFrame();
  }
  function setCounter(card, time) {
    const el = $('.stat-number', card);
    if (el.dataset.counted) return;
    el.dataset.counted = 'true';
    counters.set(el, {start:time, target:Number(el.dataset.count)});
  }
  function renderScroll(time = performance.now()) {
    rafPending = false;
    if (motion.matches) return;
    const vh = window.innerHeight;
    const vw = projectPin.clientWidth;
    const heroRect = hero.getBoundingClientRect();
    const cRect = composition.getBoundingClientRect();
    const projectRect = projectsSection.getBoundingClientRect();
    const storyRect = story.getBoundingClientRect();
    const statsRect = statsScene.getBoundingClientRect();
    // Read all section geometry before writing transforms.
    const h = clamp(-heroRect.top / vh);
    $('.hero-frame img').style.transform = `scale(${1 + h * .08})`;
    $('.hero h1').style.transform = `translate3d(0,${-h * 70}px,0)`;
    const c = progress(cRect.top, cRect.height, vh);
    floating.forEach((image, i) => {
      const travel = [1.18,1.4,1.66,1.9][i];
      image.style.transform = `translate3d(0,${-c * vh * travel}px,0) rotate(${[1.5,-2,2,-1][i] * (1 - c)}deg)`;
    });
    const p = gallery(progress(projectRect.top, projectRect.height, vh));
    projectTrack.style.transform = `translate3d(${-p.travel * vw * 3}px,0,0)`;
    projectPin.style.setProperty('--project-scale', p.scale);
    $('.project-progress>span').style.transform = `scaleX(${.25 + p.travel * .75})`;
    if (lastGalleryIndex !== p.index) {
      lastGalleryIndex = p.index;
      $('#collection-index').textContent = $('#project-index').textContent = String(p.index + 1).padStart(2,'0');
    }
    const s = progress(storyRect.top, storyRect.height, vh);
    $('.story-track').style.transform = `translate3d(${-storyTravel(s, vw)}px,0,0)`;
    $('.story-opening').style.transform = `translate3d(${-s * vw * .15}px,${-s * 30}px,0)`;
    $('.sketch-one').style.transform = `translate3d(${-s * 100}px,${-s * 80}px,0) rotate(${-16 + s * 15}deg)`;
    $('.sketch-two').style.transform = `translate3d(${s * 100}px,${s * 90}px,0) rotate(${7 - s * 15}deg)`;
    $('.material-collage').style.setProperty('--collage-shift', `${(s - .5) * 50}px`);
    const stat = statIndex(progress(statsRect.top, statsRect.height, vh));
    if (statsRect.top < vh * .45 && statsRect.bottom > 0 && activeStat !== stat) {
      activeStat = stat;
      cards.forEach((card, i) => card.classList.toggle('is-active', i === stat));
      setCounter(cards[stat], time);
    }
    for (const [el, counter] of counters) {
      const fraction = clamp((time - counter.start) / 1100);
      el.textContent = String(Math.round(counter.target * (1 - (1 - fraction) ** 3))).padStart(2,'0');
      if (fraction === 1) counters.delete(el);
    }
    if (counters.size) requestFrame();
  }
  function requestFrame() {
    if (!rafPending) {rafPending = true; requestAnimationFrame(renderScroll);}
  }
  window.addEventListener('scroll', requestFrame, {passive:true});
  window.addEventListener('resize', requestFrame, {passive:true});
  window.addEventListener('kabizzu:intro-complete', syncScrollLock);
  window.addEventListener('kabizzu:intro-timeout', syncScrollLock);
  window.addEventListener('pageshow', () => {lenis?.resize();syncScrollLock();requestFrame();});
  motion.addEventListener('change', () => {
    initializeScrolling();
    if (motion.matches) {
      [$('.hero-frame img'), $('.hero h1'), projectTrack, $('.story-track'), $('.story-opening'), ...floating].forEach(el => el.removeAttribute('style'));
      counters.clear();
      cards.forEach(card => {card.classList.remove('is-active');const number=$('.stat-number',card);number.textContent=String(number.dataset.count).padStart(2,'0');});
      activeStat = -1;
    } else requestFrame();
  });
  initializeScrolling();
  requestFrame();

  if ('IntersectionObserver' in window) {
    document.body.classList.add('motion-ready');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {entry.target.classList.add('is-visible');observer.unobserve(entry.target);}
      });
    }, {threshold:.12});
    $$('.reveal').forEach(el => observer.observe(el));
  }

  // Keyboard focus follows the same vertical route as the horizontal collection.
  projectButtons.forEach((button, index) => button.addEventListener('focus', () => {
    if (motion.matches || index === lastGalleryIndex) return;
    const rect = projectsSection.getBoundingClientRect();
    jumpTo(window.scrollY + rect.top + galleryPosition(index) * (rect.height - window.innerHeight));
  }));

  const menu = $('#menu-panel');
  const menuToggle = $('.menu-toggle');
  function closeMenu(restoreFocus = false) {
    menu.hidden = true;
    menuToggle.setAttribute('aria-expanded','false');
    if (restoreFocus) menuToggle.focus({preventScroll:true});
  }
  menuToggle.addEventListener('click', () => {
    menu.hidden = !menu.hidden;
    menuToggle.setAttribute('aria-expanded', String(!menu.hidden));
  });
  document.addEventListener('click', event => {
    if (!menu.hidden && !menu.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
  });
  document.addEventListener('keydown', event => {if (event.key === 'Escape' && !menu.hidden) {event.preventDefault();closeMenu(true);}});
  $$('a', menu).forEach(link => link.addEventListener('click', () => closeMenu()));
  menu.addEventListener('focusout', () => queueMicrotask(() => {if (!menu.contains(document.activeElement) && document.activeElement !== menuToggle) closeMenu();}));

  function openDialog(dialog) {
    closeMenu();
    $$('dialog[open]').forEach(open => {if (open !== dialog) open.close();});
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    document.body.classList.add('modal-open');
    syncScrollLock();
  }
  $$('dialog').forEach(dialog => {
    dialog.addEventListener('close', () => {
      document.body.classList.toggle('modal-open', !!$('dialog[open]'));
      syncScrollLock();
      requestFrame();
    });
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const r = dialog.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
    });
    $('[data-close]',dialog).addEventListener('click', () => dialog.close());
  });

  const projects = [
    {name:'Işık Dairesi.', type:'KONUT', image:'/assets/living.webp', materials:'Doğal taş · Ceviz · Keten', description:'Yumuşak hatların doğal dokularla buluştuğu bir yaşam alanı. Gün boyunca değişen ışık; taşın, ahşabın ve kumaşın farklı yüzlerini ortaya çıkarıyor. Sade bir yerleşim, birlikte geçirilen anlara yer açıyor.'},
    {name:'Avlu Evi.', type:'KONUT', image:'/assets/residence.webp', materials:'Traverten · Meşe · Kireç sıva', description:'Bir avlunun etrafında şekillenen dingin bir ev. İç ve dış mekân arasındaki eşik incelirken, ışık ortak yaşam alanlarının doğal bir parçasına dönüşüyor. Ham dokular ve dengeli oranlar, yapının sakin karakterini belirliyor.'},
    {name:'Sakin Kahve.', type:'HOSPITALITY', image:'/assets/coffee.webp', materials:'Yeşil mermer · Ceviz · Krom', description:'Şehrin içinde, kendi ritmini bulan bir buluşma noktası. Kavisli tezgâh mekânın akışını tarif ederken; koyu ahşap, yeşil mermer ve sıcak ışık tanıdık bir atmosfer kuruyor. Bir kahveden biraz daha uzun kalmak için.'},
    {name:'Sessiz Süit.', type:'KONAKLAMA', image:'/assets/suite.webp', materials:'Keten · Ceviz · Traverten', description:'Günün ilk ışığını içeri davet eden, sakin bir sığınak. Kireç sıvanın yumuşak yüzeyi, ceviz başlığın sıcaklığı ve doğal ketenin dokusu aynı dingin dilde buluşuyor. Yalnızca dinlenmeye ayrılmış bir oda.'}
  ];
  projectButtons.forEach(button => button.addEventListener('click', () => {
    const index = Number(button.dataset.project);
    const p = projects[index];
    $('#detail-title').textContent = p.name;
    $('#detail-image').src = p.image;
    $('#detail-image').alt = `${p.name} konseptinin iç mekânı`;
    $('#detail-type').textContent = `${p.type} / KONSEPT — 0${index + 1}`;
    $('#detail-description').textContent = p.description;
    $('#detail-materials').textContent = p.materials;
    openDialog($('#project-dialog'));
  }));

  const articles = [
    {title:'Bir odayı ev yapan şey: ışık.', label:'IŞIK & YAŞAM', image:'/assets/living.webp', paragraphs:['Bir odaya ilk girdiğimizde çoğu zaman eşyaları gördüğümüzü düşünürüz. Oysa ilk hissettiğimiz şey ışıktır. Sabahın yumuşak gölgeleri ve akşamın sıcak tonları, aynı mekâna bambaşka bir karakter verir.','Bu yüzden tasarımın başlangıcında mobilyalardan önce günün hareketine bakarız. Pencerenin yönü, perdenin geçirgenliği ve duvarın dokusu birlikte düşünülür. Mat bir yüzey ışığı dağıtırken, taşın ince damarları onu başka bir ritimde yakalar.','İyi aydınlatılmış bir ev, her köşesi aynı parlaklıkta olan bir yer değildir. Aksine, ışık ve gölge arasında dinlenebileceğimiz alanlar bırakır. Bir okuma köşesi, sofranın üzerindeki sıcak bir çember, akşamları loş kalan bir koridor… Yaşam, bu küçük farkların içinde yerini bulur.']},
    {title:'Doğal malzemeler neden zamanla güzelleşir?', label:'MALZEME & DOKU', image:'/assets/residence.webp', paragraphs:['Ahşap koyulaşır. Taşın yüzeyi yumuşar. Keten, her yıkamada başka türlü kıvrılır. Doğal malzemeleri seçerken yalnızca ilk gün nasıl göründüklerini değil, bizimle birlikte nasıl değişeceklerini de düşünürüz.','Bir yüzeyin kusursuz olması ile iyi hissettirmesi aynı şey değildir. Cevizin damarları, travertenin gözenekleri ve el sıvasının hafif dalgaları, mekâna tekrarlanamayan bir derinlik katar. Işık, bu küçük farklılıkların üzerinde dolaşır.','Malzeme paletini sade tutmak, bütün yüzeyleri birbirine benzetmek anlamına gelmez. Sıcak ahşabın yanında serin bir taş, ağır bir kütlenin yanında ince bir kumaş kullanmak, dengeli bir karşılaşma yaratır. Kalıcı olan çoğu zaman bu dengedir.']},
    {title:'Yavaşlamak için tasarlanmış mekânlar.', label:'RİTİM & MEKÂN', image:'/assets/coffee.webp', paragraphs:['Bazı yerlerden geçeriz, bazı yerlerde kalmak isteriz. Aradaki fark her zaman ilk bakışta görünmez. Oturduğumuz koltuğun açısı, yanımızdaki masayla aramızdaki mesafe ve duyduğumuz sesler bu hissi birlikte oluşturur.','Bir kahve mekânını tasarlarken yalnızca kaç kişinin oturacağını hesaplamak yetmez. Birinin tek başına okuyabileceği, iki kişinin rahatça konuşabileceği ve bir grubun bir araya gelebileceği farklı ritimler düşünmek gerekir.','Küçük bir mola için tasarlanan yerler, günün geri kalanına da dokunur. Malzeme, ışık ve ölçek doğru bir araya geldiğinde mekân bizi acele ettirmez. Bir fincanın başında biraz daha kalmaya izin verir.']}
  ];
  function showArticle(index) {
    const article = articles[index];
    $('#editorial-label').textContent = `${article.label} — STÜDYO NOTLARI`;
    $('#editorial-title').textContent = article.title;
    const body = $('#editorial-body');
    body.replaceChildren();
    const image = document.createElement('img');
    Object.assign(image, {src:article.image, alt:article.title, width:1536, height:1024});
    body.append(image);
    article.paragraphs.forEach(text => {const p=document.createElement('p');p.textContent=text;body.append(p);});
    openDialog($('#editorial-dialog'));
  }
  $$('[data-article]').forEach(button => button.addEventListener('click', () => showArticle(Number(button.dataset.article))));
  $('[data-journal-all]').addEventListener('click', () => {
    $('#editorial-label').textContent = 'KABİZZU / NOT DEFTERİ';
    $('#editorial-title').textContent = 'Tüm stüdyo notları.';
    const body = $('#editorial-body');
    body.replaceChildren();
    articles.forEach((article, index) => {const button=document.createElement('button');button.className='article-list-button';button.textContent=`0${index+1} — ${article.title}`;button.addEventListener('click',()=>showArticle(index));body.append(button);});
    openDialog($('#editorial-dialog'));
  });

  const more = $('.faq-more');
  more.addEventListener('click', () => {
    const expanded = more.getAttribute('aria-expanded') !== 'true';
    more.setAttribute('aria-expanded', String(expanded));
    $$('.faq-extra').forEach(detail => {detail.hidden=!expanded;if (!expanded) detail.open=false;});
    more.innerHTML = expanded ? 'DAHA AZ SORU <span>−</span>' : 'DAHA FAZLA SORU <span>+</span>';
    lenis?.resize();
  });
  $$('.faq details').forEach(detail => detail.addEventListener('toggle', () => lenis?.resize()));

  const form = $('#inquiry-form');
  const booking = $('.booking-fields');
  const success = $('.form-success');
  let inquiryMode = 'project';
  let brief = '';
  function localDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  }
  function resetForm() {
    form.reset();
    form.hidden = false;
    success.hidden = true;
    brief = '';
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate()+1);
    $('input[name=date]').min = localDate(tomorrow);
  }
  $$('[data-inquiry]').forEach(button => button.addEventListener('click', () => {
    inquiryMode = button.dataset.inquiry;
    resetForm();
    booking.hidden = booking.disabled = inquiryMode !== 'call';
    $('#inquiry-title').textContent = inquiryMode === 'call' ? 'Tanışmak için bir zaman.' : 'Projenizi anlatın.';
    $('.form-intro').textContent = inquiryMode === 'call' ? 'Otuz dakikalık bir konuşma. Mekânınız ve hayaliniz üzerine.' : 'Bir fikri, bir mekânı ya da henüz adını koyamadığınız bir hissi.';
    openDialog($('#inquiry-dialog'));
  }));
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const name = String(data.get('name')).trim();
    const email = String(data.get('email')).trim();
    const message = String(data.get('message')).trim();
    if (!name || !message) return;
    const slot = inquiryMode === 'call' ? `\nÖrnek görüşme: ${data.get('date')} ${data.get('time')} (Türkiye saati)\n` : '';
    brief = `KABİZZU — ÖRNEK PROJE TALEBİ\n\nAd: ${name}\nE-posta: ${email}\n${slot}\nProje fikri:\n${message}\n\nBu belge bir portföy demosunda oluşturuldu. Gerçek bir talep veya randevu iletilmedi.\n`;
    $('#success-message').textContent = `${name}, örnek ${inquiryMode === 'call' ? 'görüşme isteğiniz' : 'proje talebiniz'} hazır. Bu bir demo; hiçbir bilgi gönderilmedi${inquiryMode === 'call' ? ' ve gerçek randevu oluşturulmadı' : ''}. Dilerseniz metni cihazınıza indirebilirsiniz.`;
    form.hidden = true;
    success.hidden = false;
    $('#download-brief').focus();
  });
  $('#download-brief').addEventListener('click', () => {
    if (!brief) return;
    const url = URL.createObjectURL(new Blob([brief], {type:'text/plain;charset=utf-8'}));
    const link = document.createElement('a');
    link.href = url;link.download = 'kabizzu-proje-talebi.txt';document.body.append(link);link.click();link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  $('#new-inquiry').addEventListener('click', () => {resetForm();$('input[name=name]').focus();});
  $('#inquiry-dialog').addEventListener('close', resetForm);

  const info = {
    instagram:['Instagram seçkisi.','Kabizzu bağımsız bir portföy konseptidir. Bu stüdyo için gerçek bir Instagram hesabı bulunmuyor. Mekânlarımızı ve tasarım dilimizi bu sitedeki koleksiyon bölümünde keşfedebilirsiniz.'],
    pinterest:['İlham panosu.','Doğal taş, sıcak ahşap, yumuşak ışık. Kabizzu’nun ilham panosu bu üç fikrin etrafında şekillenir. Bu konseptin gerçek bir Pinterest profili bulunmuyor; yaklaşım bölümünde malzeme seçkimizi görebilirsiniz.'],
    linkedin:['Kabizzu hakkında.','Kabizzu; mimarlık, iç mekân ve uygulama fikrini bir araya getiren kurgusal bir stüdyo portföyüdür. Deniz Arın dahil sitedeki kişi ve şirket bilgileri örnektir. Gerçek bir LinkedIn şirket profili bulunmuyor.'],
    privacy:['Gizlilik hakkında.','Bu portföy demosunda form alanlarına yazdığınız bilgiler bir sunucuya gönderilmez, tarayıcı depolamasına kaydedilmez ve üçüncü taraflarla paylaşılmaz. Form kapandığında içerik temizlenir. İndir düğmesi yalnızca sizin cihazınızda bir metin dosyası oluşturur.'],
    cookies:['Çerezler hakkında.','Kabizzu uygulaması analitik veya reklam çerezi kullanmaz. Fontlar, görseller ve kaydırma kitaplığı yerel dosyalardan yüklenir. Yayını sağlayan platformun erişim kontrolü ve teknik işlemleri kendi koşullarına tabidir.']
  };
  $$('[data-info]').forEach(button => button.addEventListener('click', () => {
    const [title, text] = info[button.dataset.info];
    $('#editorial-label').textContent = 'KABİZZU / KONSEPT STÜDYO';
    $('#editorial-title').textContent = title;
    const p = document.createElement('p');p.textContent=text;
    $('#editorial-body').replaceChildren(p);
    openDialog($('#editorial-dialog'));
  }));
})();
