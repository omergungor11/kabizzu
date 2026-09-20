import test from 'node:test';
import assert from 'node:assert/strict';
import '../dist/motion.js';
const {progress,gallery,galleryPosition,storyTravel,storyEntrance,storyCover,deliveryActivation,statIndex}=globalThis.KabizzuMotion;

test('every room grows on its own, holds full size, and shrinks before moving',()=>{
  for(let room=0;room<4;room++){
    const frame=phase=>gallery((room+phase)/4);
    assert.equal(frame(0).scale,1);
    assert.ok(Math.abs(frame(.34).scale-1.52)<1e-9);
    assert.ok(Math.abs(frame(.45).scale-1.52)<1e-9);
    assert.equal(frame(.8).scale,1);
    let previous=1;
    for(let phase=.05;phase<=.34;phase+=.01){const p=frame(phase);assert.ok(p.scale>=previous-1e-9);assert.equal(p.travel,room/3);previous=p.scale;}
    previous=1.52;
    for(let phase=.47;phase<=.8;phase+=.01){const p=frame(phase);assert.ok(p.scale<=previous+1e-9);assert.equal(p.travel,room/3);previous=p.scale;}
    if(room<3){const transition=frame(.91);assert.equal(transition.scale,1);assert.ok(Math.abs(transition.travel-(room+.5)/3)<1e-9);}
  }
});

test('gallery stays continuous at every handoff and restores the green frame at both ends',()=>{
  assert.equal(gallery(progress(500,3168,720)).travel,0);
  assert.equal(gallery(progress(-2448,3168,720)).travel,1);
  assert.equal(gallery(0).scale,1);assert.equal(gallery(1).scale,1);
  let previous=-1;
  for(let step=0;step<=1000;step++){const p=gallery(step/1000);assert.ok(p.travel>=previous);assert.ok(p.index>=0&&p.index<=3);assert.ok(p.scale>=1&&p.scale<=1.52);previous=p.travel;}
  for(const boundary of [.25,.5,.75]){
    const before=gallery(boundary-1e-7),after=gallery(boundary+1e-7);
    assert.ok(Math.abs(before.travel-after.travel)<1e-6);
    assert.equal(before.scale,after.scale);
  }
  const positions=Array.from({length:201},(_,i)=>i/200);
  assert.deepEqual(positions.map(p=>gallery(p)).reverse(),positions.reverse().map(p=>gallery(p)));
  assert.deepEqual(gallery(-1),gallery(0));assert.deepEqual(gallery(2),gallery(1));
});

test('keyboard navigation lands on each room centered in its green frame',()=>{
  for(const count of [1,2,4,5]) for(let room=0;room<count;room++){
    const p=gallery(galleryPosition(room,count),count);
    assert.ok(Math.abs(p.travel*Math.max(1,count-1)-room)<1e-8);
    assert.equal(p.index,room);assert.equal(p.scale,1);
  }
});
test('both horizontal stages have stable endpoints across desktop and mobile widths',()=>{
  for(const width of [390,600,1280,1920]){
    assert.equal(storyTravel(0,width),0);
    assert.equal(storyTravel(-1,width),0);
    assert.equal(storyTravel(2,width),storyTravel(1,width));
    assert.ok(storyTravel(1,width)>0);
  }
  assert.equal(storyTravel(1,1280),1256);
  assert.equal(storyTravel(1,390),686.4);
});
test('photo counters activate sequentially, including the exact final scroll position',()=>{
  assert.deepEqual([-.1,0,.24,.25,.5,.75,1,2].map(statIndex),[0,0,0,1,2,3,3,3]);
  assert.equal(progress(0,720,720),0);
  assert.equal(progress(-10,720,720),1);
});

test('architecture opens as a true square, reaches full size before lateral travel and reverses',()=>{
  for(const [width,height] of [[640,720],[343,844],[960,600]]){
    const start=storyEntrance(0,width,height);
    assert.ok(Math.abs((width-start.insetLeft)*start.scale-(height-start.insetTop)*start.scale)<1e-8);
    assert.ok((width-start.insetLeft)*start.scale<=90);
    const end=storyEntrance(.38,width,height);
    assert.equal(end.scale,1);assert.equal(end.insetTop,0);assert.equal(end.insetLeft,0);assert.equal(end.offset,0);
    assert.equal(storyTravel(.335,1280),0);
    assert.ok(storyTravel(.6,1280)>0);
    let last=0;
    for(let p=0;p<=.4;p+=.01){const frame=storyEntrance(p,width,height);assert.ok(frame.scale>=last);last=frame.scale;}
    assert.deepEqual(storyEntrance(-1,width,height),start);
  }
});

test('next section covers a stationary final frame, with no blank gap on reversal',()=>{
  assert.equal(storyCover(6/7),0);
  assert.ok(Math.abs(storyCover(6.5/7)-.5)<1e-9);
  assert.equal(storyCover(1),1);
  assert.equal(storyCover(2),1);
  assert.equal(storyCover(-1),0);
  for(const p of [.86,.92,1]) assert.equal(storyTravel(p,1280),storyTravel(1,1280));
});

test('process imagery colors in the viewport and returns to monochrome on either side',()=>{
  for(const [height,viewport] of [[320,900],[650,720],[280,844]]){
    assert.equal(deliveryActivation(viewport,height,viewport),0);
    assert.equal(deliveryActivation(-height,height,viewport),0);
    assert.equal(deliveryActivation((viewport-height)/2,height,viewport),1);
    const positions=Array.from({length:40},(_,i)=>viewport-i*(viewport+height)/39);
    const forward=positions.map(top=>deliveryActivation(top,height,viewport));
    assert.ok(forward.some(value=>value>0&&value<1));
    assert.ok(forward.every(value=>value>=0&&value<=1));
    assert.deepEqual(positions.reverse().map(top=>deliveryActivation(top,height,viewport)),forward.reverse());
  }
});
