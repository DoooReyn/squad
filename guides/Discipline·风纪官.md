# Discipline · 风纪官

> *"他如沉默的卫士，站在所有团员的身后。目光如炬，洞察一切异常，为冒险团的正常运转保驾护航。"*
> —— 冒险团团长 小亮

---

## 概述

**Discipline（风纪官）** 是冒险团的纪律维护者，负责全局异常的捕获与统一格式化。沉默寡言，却不可或缺。

### 核心特性

- **全平台支持** — Web、Android、iOS 统一接口
- **自动捕获** — 无需手动注册，自动监听全局错误
- **统一格式** — 将各类错误包装成标准格式
- **职责单一** — 只负责发现异常，不负责记录或上报

---

## 设计理念

### 1. 默默守护

风纪官在后台默默工作，无需显式调用：

```typescript
// 召集风纪官后，自动开始监听
Squad.Bind(ROSTER.DISCIPLINE, Discipline);
await Squad.Link(ROSTER.DISCIPLINE);

// 风纪官已经就位，自动捕获所有未处理的异常
```

### 2. 职责分离

风纪官只负责"发现异常"，不负责处理：

```
风纪官 → 捕获异常 + 统一格式化
         ↓
    （保留 _notify 接口）
         ↓
   上报专员 → 错误上报（未来）
```

### 3. 全平台覆盖

不同平台使用不同的捕获机制：

| 平台 | 捕获方式 |
|------|----------|
| **Web** | `window.onerror` + `onunhandledrejection` |
| **Native** | `(window as any).__errorHandler` |

### 4. 拟人化命名

遵循冒险团主题：
- **Discipline（风纪官）** — 纪律维护者
- **DisciplinaryError** — 违纪记录（统一的错误格式）

---

## 核心概念

### DisciplinaryError — 统一的错误信息

所有错误都被包装成统一格式：

```typescript
interface DisciplinaryError {
  /** 错误类型 */
  type: 'error' | 'unhandledRejection' | 'native-error';

  /** 错误消息 */
  message: string;

  /** 错误堆栈 */
  stack?: string;

  /** 文件名 */
  filename?: string;

  /** 行号 */
  lineno?: number;

  /** 列号 */
  colno?: number;

  /** 原始错误对象 */
  original: Error | null;
}
```

### 错误类型

| 类型 | 触发场景 | 平台 |
|------|----------|------|
| `error` | 同步代码错误 | Web |
| `unhandledRejection` | 未处理的 Promise rejection | Web |
| `native-error` | 原生平台错误 | Native |

---

## 基本使用

### 自动监听

风纪官召集后自动工作，无需额外配置：

```typescript
import { Squad } from './squad/squad';
import { ROSTER } from './squad/registry/roster';
import { Discipline } from './squad/crews/discipline';

// 召集风纪官
Squad.Bind(ROSTER.DISCIPLINE, Discipline);
await Squad.Link(ROSTER.DISCIPLINE);

// 风纪官已就位，自动捕获所有未处理的异常
```

### 错误示例

```typescript
// 同步错误 → type: 'error'
throw new Error('Something went wrong');

// Promise rejection → type: 'unhandledRejection'
Promise.reject('Intentional rejection');

// 原生错误 → type: 'native-error'
// （在原生平台上发生错误时）
```

---

## 架构设计

### 职责划分

```
┌─────────────┐
│  应用代码    │
└──────┬──────┘
       │ 发生错误
       ↓
┌─────────────┐
│  风纪官     │ ← 捕获 + 格式化
│  Discipline │
└──────┬──────┘
       │ _notify(error)
       ↓
┌─────────────┐
│ 上报专员    │ ← 错误上报（未来）
│  Reporter   │
└─────────────┘
```

### 扩展点

风纪官保留了 `_notify` 私有方法，未来可以接入上报专员：

```typescript
// 风纪官内部
private _notify(error: DisciplinaryError): void {
  // TODO: 接入上报专员，负责错误上报
  // 例如：reporter.report(error);
}
```

---

## 技术实现

### Web 平台

```typescript
// 捕获同步错误
window.onerror = (message, filename, lineno, colno, error) => {
  // 包装成 DisciplinaryError
  // type: 'error'
};

// 捕获 Promise rejection
window.onunhandledrejection = (event) => {
  // 包装成 DisciplinaryError
  // type: 'unhandledRejection'
};
```

### 原生平台

```typescript
// 捕获原生错误（待验证）
if (sys.isNative) {
  (window as any).__errorHandler = (name, line, msg, stack) => {
    // 包装成 DisciplinaryError
    // type: 'native-error'
  };
}
```

---

## 最佳实践

### 1. 不要 try-catch 所有代码

风纪官会捕获未处理的异常，过度使用 try-catch 会掩盖问题：

```typescript
// ❌ 不推荐：过度捕获
try {
  everything();
} catch (error) {
  // 风纪官本来会捕获这个错误
}

// ✅ 推荐：只捕获需要特殊处理的错误
try {
  criticalOperation();
} catch (error) {
  // 特殊处理，然后重新抛出让风纪官记录
  handleSpecially(error);
  throw error;
}
```

### 2. 在关键位置添加日志

虽然风纪官会捕获错误，但在关键位置添加日志有助于定位：

```typescript
Journal.Info('开始处理用户输入');
// 处理逻辑...
Journal.Info('处理完成');
```

### 3. Promise 使用 .catch()

避免未处理的 Promise rejection：

```typescript
// ❌ 不推荐：没有 .catch()
somePromise().then((result) => {
  process(result);
});

// ✅ 推荐：添加 .catch()
somePromise()
  .then((result) => {
    process(result);
  })
  .catch((error) => {
    Journal.Error('Promise 失败', error);
    // 或者重新抛出让风纪官捕获
    throw error;
  });
```

---

## 限制与注意事项

### 1. 原生平台待验证

原生平台的错误捕获方式 `(window as any).__errorHandler` 有待实际设备验证。

### 2. 无法捕获已处理的错误

风纪官只捕获未处理的异常：

```typescript
try {
  throw new Error('Handled');
} catch (error) {
  // 风纪官不会捕获这个错误
}
```

### 3. 异步错误的时机

某些异步错误可能在风纪官召集前发生，确保风纪官尽早召集：

```typescript
// 第一时间召集风纪官
await Squad.Link(ROSTER.DISCIPLINE);
```

---

## 附录

### 完整 API 参考

详见源码：
- [assets/squad/crews/discipline.ts](../assets/squad/crews/discipline.ts) — 风纪官实现
- [assets/squad/crews/contracts/discipline.ts](../assets/squad/crews/contracts/discipline.ts) — 风纪官契约

### 相关宪章

- [风之语·命名法典](../charter/风之语·命名法典.md) — 命名规范
- [风之歌·代码乐章](../charter/风之歌·代码乐章.md) — 代码风格
- [风之域·坤舆万国](../charter/风之域·坤舆万国.md) — 目录组织

---

> *"风纪官无声，却让冒险团更加强大。每一次异常的捕获，都是对冒险者的保护。"*
>
> 愿每一位冒险者，都能在风纪官的守护下，勇敢前行。
>
> —— **冒险团参谋 小柯**
