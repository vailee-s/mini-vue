export function effect(fn, options?) {
  // 创建一个响应式effect，数据变化后重新执行

  // 只要依赖的属性值发生变化，就重新执行effect
  const _effect = new ReactiveEffect(fn, () => {
    _effect.run();
  });
  _effect.run();

  if (options) {
    Object.assign(_effect, options); // 使用options中的属性覆盖_effect中的属性
  }
  const runner = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}

function preCleanUpEffect(effect) {
  effect._depsLength = 0;
  effect.trackId++; // 每次执行都会自增,如果当前同一个effect执行，id就是相同的
}

function postCleanUpEffect(effect) {
  if (effect.deps.length > effect._depsLength) {
    for (let i = effect._depsLength; i < effect.deps.length; i++) {
      cleanDepEffect(effect.deps[i], effect);
    }
    effect.deps.length = effect._depsLength;
  }
}

export let activeEffect;
class ReactiveEffect {
  _trackId = 0; // 用于记录当前effect执行了几次
  deps = [];
  _depsLength = 0;
  _isRunning = 0;

  public active = true;
  constructor(public fn, public scheduler) {}
  run() {
    if (!this.active) {
      return this.fn(); // 不是激活状态的话，执行后什么都不用做
    }
    let lastEffect = activeEffect;
    try {
      activeEffect = this;

      // 预先清理一下依赖
      preCleanUpEffect(this);
      this._isRunning++;
      return this.fn(); // 收集依赖
    } finally {
      postCleanUpEffect(this);
      this._isRunning--;
      activeEffect = lastEffect;
    }
  }
}

function cleanDepEffect(dep, effect) {
  dep.delete(effect);
  if (dep.size === 0) {
    dep.cleanup();
  }
}
export function trackEffect(effect, dep) {
  // 将effect放到dep中
  // dep.set(effect, effect._trackId);
  // effect.deps[effect._depsLength++] = dep; // effect和dep关联起来
  // console.log('---', effect.deps);

  // 需要重新的去收集依赖，将不需要的移除

  if (dep.get(effect) !== effect._trackId) {
    dep.set(effect, effect._trackId);
  }
  let oldDep = effect.deps[effect._depsLength];
  if (oldDep !== dep) {
    if (oldDep) {
      cleanDepEffect(oldDep, effect);
    }
    effect.deps[effect._depsLength++] = dep;
  } else {
    effect._depsLength++;
  }
}

export function triggerEffects(dep) {
  for (let effect of dep.keys()) {
    // effect.run();
    if (effect.scheduler) {
      if (!effect._isRunning) {
        effect.scheduler();
      }
    }
  }
}
