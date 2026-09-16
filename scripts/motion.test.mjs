import test from 'node:test';
import assert from 'node:assert/strict';
import '../dist/motion.js';
const {progress,gallery,galleryPosition,storyTravel,statIndex}=globalThis.KabizzuMotion;

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
    assert.ok(storyTravel(1,width)>width);
  }
  assert.equal(storyTravel(1,1280),1920);
  assert.equal(storyTravel(1,390),1053);
});
test('photo counters activate sequentially, including the exact final scroll position',()=>{
  assert.deepEqual([-.1,0,.24,.25,.5,.75,1,2].map(statIndex),[0,0,0,1,2,3,3,3]);
  assert.equal(progress(0,720,720),0);
  assert.equal(progress(-10,720,720),1);
});
