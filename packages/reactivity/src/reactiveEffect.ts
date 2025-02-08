import { activeEffect, trackEffect, triggerEffects } from './effect';

const targetMap = new WeakMap(); // 保存最外层的对象和属性的关系

export const createDep = (cleanup, key) => {
  const dep = new Map() as any;
  dep.cleanup = cleanup;
  dep.name = key;
  return dep;
};
export function track(target, key) {
  // activeEffect // 有这个属性表示在effect中使用的
  if (activeEffect) {
    console.log('track', target, key);

    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, (depsMap = new Map()));
    }
    console.log(depsMap);
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, (dep = createDep(() => depsMap.delete(key), key)));
    }
    trackEffect(activeEffect, dep); // 将当前的effect放入到dep中，后续可以根据值的变化
    console.log(targetMap);
  }
}

export function trigger(target, key, value, oldValue) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }
  const dep = depsMap.get(key);
  if (dep) {
    triggerEffects(dep);
  }
}
