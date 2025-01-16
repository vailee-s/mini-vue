import { isObject } from '@vue/shared';
const reactiveMap = new WeakMap(); // 用来存储对象和代理对象的映射关系
enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
}
const mutavleHandlers: ProxyHandler<any> = {
  get(target, key, recevier) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true;
    }
  },
  set(target, key, value, recevier) {
    return true;
  },
};
function createReactiveObject(target) {
  // 统一做判断，响应式对象必须是对象才可以
  if (!isObject(target)) {
    return target;
  }

  if (target[ReactiveFlags.IS_REACTIVE]) {
    return target;
  }

  if (reactiveMap.has(target)) {
    return reactiveMap.get(target);
  }
  const proxy = new Proxy(target, mutavleHandlers);
  reactiveMap.set(target, proxy); // 把对象和代理对象进行映射
  return proxy;
}

export function reactive(target) {
  return createReactiveObject(target);
}
