# Shadow · 影子

> *"他如影随形，遁入尘烟；他在暗处洞察，在关键时刻传递第一手情报。"*
> —— 冒险团团长 小亮

---

## 概述

**Shadow（影子）** 是冒险团的斥候伙伴，负责情报的收集与传递。采用分身架构，每个分身独立管理一类消息，互不干扰。

### 核心特性

- **分身架构** — 按需创建分身，每个分身独立处理一类消息
- **自动清理** — 分身无监听器时可自动销毁
- **上下文管理** — 支持按上下文批量管理监听器
- **异常隔离** — 某个监听器报错不影响其他监听器
- **类型安全** — 完整的 TypeScript 类型支持

---

## 设计理念

### 1. 分而治之

影子采用分身架构，将消息按类别分散到不同分身：

```typescript
// 获取战斗分身
const battleShadow = shadow.acquire('battle');

// 获取 UI 分身
const uiShadow = shadow.acquire('ui');

// 分身独立工作，互不干扰
battleShadow.report('start');      // 只通知战斗监听器
uiShadow.report('click');          // 只通知 UI 监听器
```

### 2. 按需创建，自动清理

分身仅在需要时创建，当不再有监听器时可以自动清理：

```typescript
// 首次调用 acquire 时创建分身
const battleShadow = shadow.acquire('battle');

// 当分身无监听器时，可以手动清理
shadow.remove('battle');

// 或者清理所有分身
shadow.clear();
```

### 3. 上下文管理

支持按上下文批量管理监听器，方便模块化开发：

```typescript
// UI 模块注册多个监听
uiShadow.lurk('click', onClick, 'ui-module');
uiShadow.lurk('hover', onHover, 'ui-module');

// UI 模块销毁时，一次性移除所有监听
uiShadow.slip(undefined, undefined, 'ui-module');
```

### 4. 拟人化命名

遵循冒险团主题，采用拟人化命名：
- **Shadow（影子）** — 分身容器，管理所有分身
- **ShadowServant（影子仆从）** — 分身，实际处理消息
- **lurk（潜伏）** — 监听消息
- **report（报信）** — 发送消息
- **slip（抽身）** — 移除监听

---

## 核心概念

### Shadow — 分身容器

影子本身是分身容器，负责管理所有分身：

```typescript
interface IShadow {
  // 召唤分身
  acquire(name: string): ShadowServant;

  // 移除分身
  remove(name: string): void;

  // 清空所有分身
  clear(): void;

  // 检查分身是否存在
  has(name: string): boolean;
}
```

### ShadowServant — 分身

分身实际处理消息的监听与分发：

```typescript
interface IShadowServant {
  // 潜伏：监听消息
  lurk(news: string, reaction: Reaction, context?: unknown): void;

  // 报信：发送消息
  report(news: string, ...args: unknown[]): void;

  // 抽身：移除监听
  slip(news?: string, reaction?: Reaction, context?: unknown): void;
}
```

### Reaction — 应对方案

收到消息后的处理函数：

```typescript
interface Reaction {
  (...args: unknown[]): void;
}
```

### Listener — 线人

记录监听器的反应函数和上下文：

```typescript
interface Listener {
  reaction: Reaction;    // 应对方案
  context?: unknown;     // 上下文标识
}
```

---

## 基本使用

### 快速开始

首先获取影子伙伴，然后召唤分身：

```typescript
import { Squad } from './squad/squad';
import { ROSTER } from './squad/registry/roster';

// 获取影子伙伴
const shadow = Squad.Summon<IShadow>(ROSTER.SHADOW);

// 召唤分身
const battleShadow = shadow.acquire('battle');
```

### 监听消息

使用 `lurk` 方法监听消息：

```typescript
// 监听战斗开始消息
battleShadow.lurk('start', (data) => {
  console.log('战斗开始！', data);
});

// 带上下文的监听
battleShadow.lurk('end', onBattleEnd, 'battle-module');
```

### 发送消息

使用 `report` 方法发送消息：

```typescript
// 发送战斗开始消息
battleShadow.report('start', { heroId: 'hero-001' });

// 发送战斗结束消息
battleShadow.report('end', { winner: 'hero-001' });
```

### 移除监听

使用 `slip` 方法移除监听：

```typescript
// 移除特定监听器
battleShadow.slip('start', onBattleStart);

// 移除该消息的所有监听器
battleShadow.slip('start');

// 移除指定上下文的所有监听器
battleShadow.slip(undefined, undefined, 'battle-module');
```

---

## 高级使用

### 分身管理

```typescript
// 检查分身是否存在
if (shadow.has('battle')) {
  // ...
}

// 移除指定分身
shadow.remove('battle');

// 清空所有分身
shadow.clear();
```

### 跨模块通信

不同模块可以使用同一个分身进行通信：

```typescript
// battle.ts - 战斗模块
const battleShadow = shadow.acquire('battle');
battleShadow.lurk('hero-die', (data) => {
  // 处理英雄死亡
});

// ui.ts - UI 模块
const battleShadow = shadow.acquire('battle');
battleShadow.report('hero-die', { heroId: 'hero-001' });
```

### 上下文批量管理

```typescript
// UI 模块初始化
const uiShadow = shadow.acquire('ui');
const context = 'main-menu';

uiShadow.lurk('click-start', onStartClick, context);
uiShadow.lurk('click-settings', onSettingsClick, context);
uiShadow.lurk('click-exit', onExitClick, context);

// UI 模块销毁时，一次性清理
uiShadow.slip(undefined, undefined, context);
```

---

## 最佳实践

### 1. 分身命名规范

使用清晰的命名，表达分身的职责：

```typescript
// ✅ 好的：清晰的命名
const battleShadow = shadow.acquire('battle');
const uiShadow = shadow.acquire('ui');
const networkShadow = shadow.acquire('network');

// ❌ 坏的：模糊的命名
const s1 = shadow.acquire('s1');
const temp = shadow.acquire('temp');
```

### 2. 消息命名规范

使用简洁、描述性的消息名称：

```typescript
// ✅ 好的：清晰的命名
battleShadow.lurk('start', ...);
battleShadow.lurk('end', ...);
battleShadow.lurk('hero-die', ...);

// ❌ 坏的：模糊的命名
battleShadow.lurk('msg1', ...);
battleShadow.lurk('data', ...);
```

### 3. 及时清理监听器

模块销毁时，及时清理监听器：

```typescript
class BattleModule {
  private readonly _shadow: ShadowServant;

  public constructor() {
    this._shadow = shadow.acquire('battle');
    this._shadow.lurk('start', this.onStart, this);
  }

  public destroy(): void {
    // 清理本模块的所有监听器
    this._shadow.slip(undefined, undefined, this);
  }
}
```

### 4. 错误隔离

监听器中应该捕获异常，避免影响其他监听器：

```typescript
// 影子已内置错误隔离，单个监听器报错不会影响其他监听器
// 但在监听器中仍建议做好错误处理
shadow.lurk('event', (data) => {
  try {
    // 可能出错的代码
  } catch (error) {
    // 处理错误
  }
});
```

---

## 分身生命周期

```
acquire(name) → 创建/获取分身
                ↓
            lurk() → 添加监听器
                ↓
           report() → 发送消息
                ↓
            slip() → 移除监听器
                ↓
   无监听器时 → 可选择调用 remove() 清理分身
```

---

## 附录

### 完整 API 参考

详见源码：
- [assets/squad/crews/shadow.ts](../assets/squad/crews/shadow.ts) — 影子（分身容器）
- [assets/squad/crews/shadow-servant.ts](../assets/squad/crews/shadow-servant.ts) — 影子仆从（分身）
- [assets/squad/crews/contracts/shadow.ts](../assets/squad/crews/contracts/shadow.ts) — 影子契约

### 相关宪章

- [风之语·命名法典](../charter/风之语·命名法典.md) — 命名规范
- [风之歌·代码乐章](../charter/风之歌·代码乐章.md) — 代码风格
- [风之域·坤舆万国](../charter/风之域·坤舆万国.md) — 目录组织

---

> *"影子无声，却有千眼；影子无形，却能连接四方。每一位冒险者，都是影子眼中的星辰。"*
>
> 愿每一位冒险者，都能善用影子，让消息如风般流畅传递。
>
> —— **冒险团参谋 小柯**
