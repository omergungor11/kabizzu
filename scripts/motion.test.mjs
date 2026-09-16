import test from 'node:test';
import assert from 'node:assert/strict';
import '../dist/motion.js';
const {progress,gallery,galleryPosition,storyTravel,storyEntrance,statIndex}=globalThis.KabizzuMotion;

test('gallery reaches all four rooms, stays bounded, and reverses without dead zones',()=>{
  assert.equal(gallery(progress(500,3168,720)).travel,0);
  assert.equal(gallery(progress(-2448,3168,720)).travel,1);
  let previous=-1;
  for(let scroll=0;scroll<=2448;scroll+=8){const p=gallery(progress(-scroll,3168,720));assert.ok(p.travel>=previous);assert.ok(p.index>=0&&p.index<=3);previous=p.travel;}
  for(let room=0;room<4;room++){const p=gallery(galleryPosition(room));assert.ok(Math.abs(p.travel*3-room)<1e-8);assert.equal(p.index,room);}
  assert.equal(gallery(0).scale,1);assert.equal(gallery(.12).scale,1.52);
});
test('both horizontal stages have stable endpoints across desktop and mobile widths',()=>{
  for(const width of [390,600,1280,1920]){
    assert.equal(storyTravel(0,width),0);
    assert.equal(storyTravel(-1,width),0);
    assert.equal(storyTravel(2,width),storyTravel(1,width));
    assert.ok(storyTravel(1,width)>=width);
  }
  assert.equal(storyTravel(1,1280),1280);
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
    assert.equal(storyTravel(.38,1280),0);
    assert.ok(storyTravel(.6,1280)>0);
    let last=0;
    for(let p=0;p<=.4;p+=.01){const frame=storyEntrance(p,width,height);assert.ok(frame.scale>=last);last=frame.scale;}
    assert.deepEqual(storyEntrance(-1,width,height),start);
  }
});
