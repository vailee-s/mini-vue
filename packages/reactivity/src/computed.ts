import { isFunction } from "@vue/shared";
import { ReactiveEffect } from "./effect";
import { trackRefValue, triggerRefValue } from "./ref";

export function computed(getterOrOption) {
  let onlyGetter = isFunction(getterOrOption);
  let getter, setter;
  if (onlyGetter) {
    getter = getterOrOption;
    setter = () => {};
  } else {
    getter = getterOrOption.get;
    setter = getterOrOption.set;
  }
  console.log(getter);

  return new ComputedImpl(getter, setter);
}

class ComputedImpl {
  public _value;
  public effect;
  public dep;
  constructor(public getter, public setter) {
    this.effect = new ReactiveEffect(
      () => getter(this._value),
      () => {
        triggerRefValue(this); // 计算属性依赖变化，应该触发渲染effect重新执行，此时需要将drity设置为true
      }
    );
  }
  get value() {
    if (this.effect.dirty) {
      this._value = this.effect.run();
      // 如果当前在effect中访问了计算属性，计算属性是可以收集这个effect的
      trackRefValue(this);
    }
    return this._value;
  }
  set value(value) {
    this.setter(value);
  }
}
