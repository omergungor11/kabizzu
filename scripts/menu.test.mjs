import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

function setup() {
  const timers = new Map();
  let timerId = 0;
  const node = () => ({
    hidden:true, handlers:{}, attributes:{},
    addEventListener(type, listener) {(this.handlers[type] ??= []).push(listener);},
    emit(type, event = {}) {for (const listener of this.handlers[type] ?? []) listener(event);},
    setAttribute(name,value) {this.attributes[name] = value;},
    contains(target) {return target === this;},
    focus() {document.activeElement = this;}
  });
  const document = {...node(),activeElement:null};
  const menu = node(), toggle = node(), link = node();
  const source = readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
  const menuCode = source.slice(source.indexOf("  const menu = $('#menu-panel');"),source.indexOf('  function openDialog('));
  runInNewContext(menuCode, {
    document, $:selector=>selector==='#menu-panel'?menu:toggle, $$:()=>[link], queueMicrotask,
    setTimeout:callback=>{timers.set(++timerId,callback);return timerId;},
    clearTimeout:id=>timers.delete(id)
  });
  const leave = () => {for(const callback of [...timers.values()]) callback();timers.clear();};
  return {menu,toggle,link,document,leave};
}

test('hover opens the menu, bridges its gap and closes after leaving',()=>{
  const {menu,toggle,leave}=setup();
  toggle.emit('pointerenter',{pointerType:'mouse'});
  assert.equal(menu.hidden,false);assert.equal(toggle.attributes['aria-expanded'],'true');
  toggle.emit('pointerleave',{pointerType:'mouse'});
  menu.emit('pointerenter',{pointerType:'mouse'});leave();
  assert.equal(menu.hidden,false);
  menu.emit('pointerleave',{pointerType:'mouse'});leave();
  assert.equal(menu.hidden,true);assert.equal(toggle.attributes['aria-expanded'],'false');
});

test('touch, click, Escape and navigation retain usable menu controls',()=>{
  const {menu,toggle,link,document}=setup();
  toggle.emit('pointerenter',{pointerType:'touch'});assert.equal(menu.hidden,true);
  toggle.emit('click');assert.equal(menu.hidden,false);
  toggle.emit('click');assert.equal(menu.hidden,true);
  toggle.emit('pointerenter',{pointerType:'mouse'});toggle.emit('click');assert.equal(menu.hidden,false);
  document.emit('keydown',{key:'Escape',preventDefault(){}});
  assert.equal(menu.hidden,true);assert.equal(document.activeElement,toggle);
  toggle.emit('click');link.emit('click');assert.equal(menu.hidden,true);
  toggle.emit('click');document.emit('click',{target:{}});assert.equal(menu.hidden,true);
});
