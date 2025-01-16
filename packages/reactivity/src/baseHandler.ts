import { activeEffect } from './effect';
import { track } from './reactiveEffect';

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
    return Reflect.get(target, key, recevier);
  },
  set(target, key, value, recevier) {
    return Reflect.set(target, key, value, recevier);
  },
};
