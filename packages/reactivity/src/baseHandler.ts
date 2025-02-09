import { activeEffect } from './effect';
import { reactive } from './reactive';
import { track, trigger } from './reactiveEffect';

export enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
}
export const mutavleHandlers: ProxyHandler<any> = {
  get(target, key, recevier) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true;
    }
    console.log(activeEffect, key);
    track(target, key); // 收集这个对象的这个属性，和effect关联起来

    let result = Reflect.get(target, key, recevier);
    if (typeof result === 'object') {
      return reactive(result);
    }

    return result;
  },
  set(target, key, value, recevier) {
    // 触发更新
    let oldValue = target[key];
    let result = Reflect.set(target, key, value, recevier);
    if (oldValue !== value) {
      console.log('触发更新');
      trigger(target, key, value, oldValue);
    }
    return result;
  },
};
