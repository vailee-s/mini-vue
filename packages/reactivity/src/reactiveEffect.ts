import { activeEffect } from './effect';

export function track(target, key) {
  // activeEffect // 有这个属性表示在effect中使用的
  if (activeEffect) {
    console.log('track', target, key);
  }
}
