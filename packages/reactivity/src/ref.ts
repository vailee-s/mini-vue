import { activeEffect, trackEffect, triggerEffects } from './effect';
import { toReactive } from './reactive';
import { createDep } from './reactiveEffect';

// ref  shallowRef
export function ref(value) {
  return createRef(value);
}

function createRef(value) {
  return new RefImpl(value);
}

class RefImpl {
  public __v_isRef = true; // 标识当前值是否是一个ref
  public _value; // 存储当前值
  public dep; //  依赖收集effect
  constructor(public rawValue) {
    this._value = toReactive(rawValue);
  }

  get value() {
    trackRefValue(this);
    return this._value;
  }
  set value(newValue) {
    if (newValue !== this.rawValue) {
      this.rawValue = newValue;
      this._value = newValue;
      triggerRefValue(this);
    }
  }
}
function trackRefValue(ref) {
  if (activeEffect) {
    trackEffect(
      activeEffect,
      (ref.dep = createDep(() => (ref.dep = undefined), 'value'))
    );
  }
}
function triggerRefValue(ref) {
  let dep = ref.dep;
  if (dep) {
    triggerEffects(dep);
  }
}
class ObjectRefImpl {
  public __v_isRef = true;
  constructor(private _object, private _key) {}
  get value() {
    return this._object[this._key];
  }
  set value(newValue) {
    this._object[this._key] = newValue;
  }
}
export function toRef(object, key) {
  return new ObjectRefImpl(object, key);
}

export function toRefs(object) {
  const ret = {};
  for (let key in object) {
    ret[key] = toRef(object, key);
  }
  return ret;
}

export function proxyRefs(object) {
  return new Proxy(object, {
    get(target, key, recevier) {
      const value = Reflect.get(target, key, recevier);
      return value.__v_isRef ? value.value : value;
    },
    set(target, key, value, recevier) {
      const oldValue = target[key];
      if (oldValue.__v_isRef) {
        oldValue.value = value;
        return true;
      } else {
        return Reflect.set(target, key, value, recevier);
      }
    },
  });
}
