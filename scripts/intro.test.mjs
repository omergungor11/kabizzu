import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../dist/intro.js', import.meta.url),'utf8');
const bootstrap = readFileSync(new URL('../dist/index.html', import.meta.url),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];

// Virtual time exercises the loading gate and cleanup without a browser.
function setup({reduced=false,hash='',asset='ready',animateFailure=false}={}) {
  let now=0, sequence=0;
  const timers=new Map();
  const setTimer=(callback,delay=0)=>{const id=++sequence;timers.set(id,{at:now+delay,callback});return id;};
  const clearTimer=id=>timers.delete(id);
  class Target {
    constructor(){this.events=new Map();}
    addEventListener(name,fn){if(!this.events.has(name))this.events.set(name,new Set());this.events.get(name).add(fn);}
    removeEventListener(name,fn){this.events.get(name)?.delete(fn);}
    dispatchEvent(event){for(const fn of [...(this.events.get(event.type)||[])])fn(event);}
  }
  const root={classList:{values:new Set(),add(value){this.values.add(value);},remove(value){this.values.delete(value);},contains(value){return this.values.has(value);}}};
  let document;
  class Element extends Target {
    constructor(){super();this.children=[];this.style={};this.attributes=new Map();this.textContent='';this.inert=false;this.removed=false;}
    append(child){this.children.push(child);}
    replaceChildren(...children){this.children=children;}
    setAttribute(key,value){this.attributes.set(key,value);}
    removeAttribute(key){this.attributes.delete(key);}
    contains(element){return element===this||this.children.some(child=>child.contains(element));}
    remove(){this.removed=true;}
    focus(){document.activeElement=this;}
    decode(){return asset==='pending'?new Promise(()=>{}):asset==='failed'?Promise.reject(new Error('Image unavailable')):Promise.resolve();}
    animate(_frames,options){
      if(animateFailure)throw new Error('Animation unavailable');
      let reject;
      let id;
      const finished=new Promise((resolve,rejectFn)=>{reject=rejectFn;id=setTimer(resolve,(options.delay||0)+options.duration);});
      return {finished,cancel(){clearTimer(id);reject(new Error('Animation cancelled'));}};
    }
  }
  const selectors=['.site-intro','.intro-skip','.intro-gallery','.intro-title','.intro-signature','.intro-subtitle','.intro-curtain','.intro-brand','.intro-photo','.intro-photo-shade','.hero-caption','.site-header','.hero-bottom','.menu-toggle'];
  const elements=new Map(selectors.map(selector=>[selector,new Element()]));
  const page=[elements.get('.site-header'),new Element(),new Element(),new Element()];
  const lines=[new Element(),new Element()];
  const intro=elements.get('.site-intro');
  intro.append(elements.get('.intro-skip'));
  elements.get('.intro-title').textContent='Bir bütün olarak yaşam.';
  const image=new Element();
  intro.querySelector=selector=>elements.get(selector);
  intro.querySelectorAll=selector=>selector==='img'?[image,...elements.get('.intro-gallery').children.flatMap(tile=>tile.children)]:[];
  document={
    documentElement:root,activeElement:null,
    fonts:{ready:Promise.resolve()},
    querySelector:selector=>elements.get(selector),
    querySelectorAll:selector=>selector==='[data-intro-inert]'?page.filter(el=>el.attributes.has('data-intro-inert')):selector==='.hero-line-text'?lines:page,
    createElement:()=>new Element()
  };
  const motion=new Target();motion.matches=reduced;
  const window=new Target();window.location={hash};window.scrollY=0;window.matchMedia=()=>motion;
  const context=vm.createContext({window,document,location:window.location,setTimeout:setTimer,clearTimeout:clearTimer,Event:class{constructor(type){this.type=type;}}});
  vm.runInContext(bootstrap,context);
  const start=()=>vm.runInContext(source,context);
  const flush=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};
  async function advance(duration){
    const end=now+duration;
    await flush();
    while(true){
      const next=[...timers].filter(([,timer])=>timer.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];
      if(!next)break;
      const [id,timer]=next;now=timer.at;timers.delete(id);timer.callback();await flush();
    }
    now=end;await flush();
  }
  const unlocked=()=>{assert.equal(root.classList.contains('intro-pending'),false);assert.ok(page.every(el=>!el.inert));assert.ok(page.every(el=>!el.attributes.has('data-intro-inert')));};
  return {start,advance,unlocked,root,page,intro,window,document,elements,timers,motion};
}

test('full intro completes and releases every interaction lock',async()=>{
  const scene=setup();scene.start();
  assert.ok(scene.page.every(el=>el.inert));
  await scene.advance(5400);scene.unlocked();
  assert.ok(scene.intro.removed);assert.equal(scene.timers.size,0);
});
test('failed images cannot trap the visitor behind the loading screen',async()=>{
  const scene=setup({asset:'failed'});scene.start();await scene.advance(5400);scene.unlocked();
});
test('assets that never settle have a bounded loading wait',async()=>{
  const scene=setup({asset:'pending'});scene.start();await scene.advance(7300);scene.unlocked();assert.ok(scene.intro.removed);
});
test('skip is immediate, cancels pending motion and returns keyboard focus',async()=>{
  const scene=setup();scene.start();await scene.advance(200);
  const skip=scene.elements.get('.intro-skip');scene.document.activeElement=skip;
  skip.dispatchEvent({type:'click'});scene.unlocked();
  assert.equal(scene.document.activeElement,scene.elements.get('.menu-toggle'));
  assert.equal(scene.timers.size,0);
});
test('Escape and an updated reduced-motion preference immediately release the page',async()=>{
  for(const action of ['escape','motion']){
    const scene=setup();scene.start();await scene.advance(200);
    if(action==='escape')scene.window.dispatchEvent({type:'keydown',key:'Escape'});
    else {scene.motion.matches=true;scene.motion.dispatchEvent({type:'change'});}
    scene.unlocked();assert.ok(scene.intro.removed);
  }
});
test('deep links and reduced-motion visitors bypass the intro',()=>{
  for(const options of [{hash:'#projects'},{reduced:true}]){const scene=setup(options);scene.start();scene.unlocked();assert.ok(scene.intro.removed);}
});
test('a missing intro script is released by the independent watchdog',async()=>{
  const scene=setup();await scene.advance(9100);scene.unlocked();
});
test('animation errors and page navigation leave no interaction locks behind',async()=>{
  const broken=setup({animateFailure:true});broken.start();await broken.advance(50);broken.unlocked();
  const navigating=setup();navigating.start();await navigating.advance(200);navigating.window.dispatchEvent({type:'pagehide'});navigating.unlocked();
});
