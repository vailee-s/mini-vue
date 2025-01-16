export function effect(fn, options?) {
  // 创建一个响应式effect，数据变化后重新执行

  // 只要依赖的属性值发生变化，就重新执行effect
  const _effect = new ReactiveEffect(fn, () => {
    _effect.run();
  });
  _effect.run();
  return _effect;
}
export let activeEffect;
class ReactiveEffect {
  public active = true;
  constructor(public fn, public scheduler) {}
  run() {
    if (!this.active) {
      return this.fn(); // 停止收集依赖
    }
    let lastEffect = activeEffect;
    try {
      activeEffect = this;
      return this.fn();
    } finally {
      activeEffect = lastEffect;
    }
  }
}
