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
  _trackId = 0; // 用于记录当前effect执行了几次
  deps = [];
  _depsLength = 0;

  public active = true;
  constructor(public fn, public scheduler) {}
  run() {
    if (!this.active) {
      return this.fn(); // 不是激活状态，执行后什么都不用做
    }
    let lastEffect = activeEffect;
    try {
      activeEffect = this;
      return this.fn(); // 收集依赖
    } finally {
      activeEffect = lastEffect;
    }
  }
}

export function trackEffect(effect, dep) {
  // 将effect放到dep中
  dep.set(effect, effect._trackId);
  effect.deps[effect._depsLength++] = dep; // effect和dep关联起来
  console.log('---', effect.deps);
}

export function triggerEffects(dep) {
  for (let effect of dep.keys()) {
    // effect.run();
    if (effect.scheduler) {
      effect.scheduler();
    }
  }
}
