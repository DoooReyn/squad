# Navigator · 领航员

> *"他如谨慎的向导，在代码的迷雾中指引方向。让冒险者避开异常的陷阱，安全抵达目的地。"*
> —— 吟游诗人 小柯

---

## 概述

**Navigator（领航员）** 是冒险团的导航助手，提供 Rust 风格的错误处理工具。让代码更加类型安全，错误处理更加优雅。

### 核心特性

- **Result<T, E>** — 处理可能成功或失败的操作
- **Option<T>** — 处理可能为空或不存在的值
- **链式调用** — `map`、`andThen`、`orElse` 等
- **类型安全** — 编译期类型检查，零运行时开销
- **Try 包装器** — 将异常转换为 Result

---

## 设计理念

### 1. 类型安全

```typescript
// 函数签名明确表达可能失败
function parseHero(json: string): Result<Hero, ParseError> {
  // ...
}

// 调用方必须处理失败情况
const result = parseHero(jsonString);
if (result.isOk()) {
  const hero = result.unwrap();  // 类型收窄，hero 类型为 Hero
} else {
  const error = result.unwrapErr();  // error 类型为 ParseError
}
```

### 2. 链式调用

```typescript
// 优雅的链式操作，避免嵌套
const heroName = Navigator.Try(() => JSON.parse(json))
  .andThen(data => validateHero(data))
  .map(hero => hero.name)
  .unwrapOr('Unknown');
```

### 3. 模式匹配

```typescript
result.match({
  ok: (value) => console.log('成功:', value),
  err: (error) => console.log('失败:', error),
});
```

### 4. 拟人化命名

遵循冒险团主题：
- **Navigator（领航员）** — 导航助手
- **Ok/Err** — 成功/失败结果
- **Some/None** — 存在/不存在
- **Try** — 尝试执行

---

## 核心概念

### Result<T, E> — 结果类型

表示操作可能成功或失败：

| 方法 | 说明 |
|------|------|
| `Result.Ok(value)` | 创建成功结果 |
| `Result.Err(error)` | 创建失败结果 |
| `isOk()` | 是否成功 |
| `isErr()` | 是否失败 |
| `unwrap()` | 解包值（失败时抛出异常） |
| `unwrapOr(default)` | 解包值或返回默认值 |
| `map(fn)` | 映射值 |
| `mapErr(fn)` | 映射错误 |
| `andThen(fn)` | 链接另一个 Result 操作 |
| `orElse(fn)` | 失败时执行备用操作 |
| `match(pattern)` | 模式匹配 |

### Option<T> — 可选类型

表示值可能存在或不存在：

| 方法 | 说明 |
|------|------|
| `Option.Some(value)` | 创建包含值的选项 |
| `Option.None()` | 创建空选项 |
| `FromNullable(value)` | 从可能为 null 的值创建 |
| `isSome()` | 是否包含值 |
| `isNone()` | 是否为空 |
| `unwrap()` | 解包值（空时抛出异常） |
| `unwrapOr(default)` | 解包值或返回默认值 |
| `unwrapOrElse(fn)` | 解包值或执行函数 |
| `map(fn)` | 映射值 |
| `filter(predicate)` | 过滤值 |
| `andThen(fn)` | 链接另一个 Option 操作 |
| `toResult(error)` | 转换为 Result |

---

## 基本使用

### Result 快速开始

```typescript
import { Navigator, Result } from '../assistants/navigator';

// 包装可能抛出异常的函数
const result = Navigator.Try(() => {
  return JSON.parse(jsonString);
});

// 检查结果
if (result.isOk()) {
  const data = result.unwrap();
  console.log('解析成功:', data);
} else {
  const error = result.unwrapErr();
  console.error('解析失败:', error);
}

// 使用模式匹配
result.match({
  ok: (data) => console.log('成功:', data),
  err: (error) => console.error('失败:', error),
});

// 使用默认值
const data = result.unwrapOr(null);
```

### Option 快速开始

```typescript
import { Navigator, Option } from '../assistants/navigator';

// 创建选项
const maybeHero = Navigator.FromNullable(heroes.get(id));

// 检查是否有值
if (maybeHero.isSome()) {
  const hero = maybeHero.unwrap();
  console.log('英雄:', hero);
} else {
  console.log('英雄不存在');
}

// 链式调用
const heroName = maybeHero
  .map(hero => hero.name)
  .unwrapOr('Unknown');
```

---

## 高级使用

### 链式调用

```typescript
const result = Navigator.Try(() => JSON.parse(json))
  .andThen(data => validateHero(data))
  .map(hero => hero.name)
  .mapErr(error => new SquadViolationError('处理失败', 'PROCESS_FAILED', { original: error }));

result.match({
  ok: (name) => console.log('英雄名称:', name),
  err: (error) => console.error('错误:', error.code),
});
```

### 处理可选值

```typescript
function findHero(id: string): Option<Hero> {
  return Navigator.FromNullable(heroes.get(id));
}

function getHeroName(id: string): string {
  return findHero(id)
    .map(hero => hero.name)
    .unwrapOr('Unknown');
}

// 转换为 Result
function getHeroRequired(id: string): Result<Hero, SquadViolationError> {
  return findHero(id).toResult(
    new SquadViolationError(`英雄 ${id} 不存在`, 'HERO_NOT_FOUND', { id })
  );
}
```

### 与 SquadViolationError 集成

```typescript
import { SquadViolationError } from '../exceptions/squad-violation-error';

function summonHero(id: string): Result<Hero, SquadViolationError> {
  return Navigator.SquadTry(() => {
    const hero = heroes.get(id);
    if (!hero) {
      throw new SquadViolationError(
        `英雄 ${id} 不存在`,
        'HERO_NOT_FOUND',
        { id }
      );
    }
    return hero;
  });
}

// 使用
const result = summonHero('hero-001');
if (result.isErr()) {
  Journal.Error('召唤失败', result.unwrapErr());
}
```

### 异步操作

```typescript
const result = await Navigator.TryAsync(async () => {
  const response = await fetch(url);
  const data = await response.json();
  return data;
});

result.match({
  ok: (data) => console.log('获取成功:', data),
  err: (error) => console.error('获取失败:', error),
});
```

---

## 最佳实践

### 1. 优先使用 Result/Option 而非 try-catch

```typescript
// ✅ 推荐：使用 Result
function parseHero(json: string): Result<Hero, Error> {
  return Navigator.Try(() => JSON.parse(json));
}

// ❌ 不推荐：使用 try-catch
function parseHero(json: string): Hero | null {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}
```

### 2. 明确函数可能失败

```typescript
// ✅ 推荐：签名明确表示可能失败
function divide(a: number, b: number): Result<number, Error> {
  if (b === 0) {
    return Result.Err(new Error('除零'));
  }
  return Result.Ok(a / b);
}

// ❌ 不推荐：签名不表达错误
function divide(a: number, b: number): number {
  return a / b;  // 可能返回 NaN 或 Infinity
}
```

### 3. 使用 unwrapOr 提供默认值

```typescript
// ✅ 推荐：提供默认值
const heroName = findHero(id)
  .map(hero => hero.name)
  .unwrapOr('Unknown');

// ❌ 不推荐：手动检查
const maybeHero = findHero(id);
let heroName = 'Unknown';
if (maybeHero.isSome()) {
  heroName = maybeHero.unwrap().name;
}
```

### 4. 链式调用保持简洁

```typescript
// ✅ 推荐：链式调用
const result = Navigator.Try(() => parse(json))
  .andThen(validate)
  .map(transform)
  .unwrapOr(null);

// ❌ 不推荐：嵌套 if-else
let result;
try {
  const data = parse(json);
  const validated = validate(data);
  result = transform(validated);
} catch (error) {
  result = null;
}
```

---

## 迁移指南

### 从 try-catch 迁移到 Result

**之前：**
```typescript
try {
  const data = JSON.parse(jsonString);
  return processData(data);
} catch (error) {
  console.error('处理失败:', error);
  return null;
}
```

**之后：**
```typescript
const result = Navigator.Try(() => JSON.parse(jsonString))
  .andThen(data => Navigator.Try(() => processData(data)))
  .unwrapOr(null);

result.match({
  ok: (data) => console.log('处理成功:', data),
  err: (error) => console.error('处理失败:', error),
});
```

### 从 null 检查迁移到 Option

**之前：**
```typescript
const hero = heroes.get(id);
if (hero) {
  return hero.name;
}
return 'Unknown';
```

**之后：**
```typescript
return Navigator.FromNullable(heroes.get(id))
  .map(hero => hero.name)
  .unwrapOr('Unknown');
```

---

## 技术细节

### 类型收窄

```typescript
const result: Result<Hero, Error> = ...;

if (result.isOk()) {
  // TypeScript 知道这里是 Ok，value 类型为 Hero
  const hero: Hero = result.unwrap();
} else {
  // TypeScript 知道这里是 Err，error 类型为 Error
  const error: Error = result.unwrapErr();
}
```

### 性能考虑

Result 和 Option 只是轻量级包装器：
- 仅包含 3 个字段：`_value`、`_error`、`_isOk`
- 无额外运行时开销
- 编译期完全内联优化

### 与现有代码兼容

Result/Option 可以与现有 try-catch 代码共存：
- 新代码使用 Result/Option
- 旧代码保持不变
- 渐进式迁移

---

## 附录

### 完整 API 参考

详见源码：[assets/squad/assistants/navigator.ts](../assets/squad/assistants/navigator.ts)

### 相关宪章

- [风之语·命名法典](../charter/风之语·命名法典.md) — 命名规范
- [风之歌·代码乐章](../charter/风之歌·代码乐章.md) — 代码风格
- [风之域·坤舆万国](../charter/风之域·坤舆万国.md) — 目录组织

---

> *"领航员不说话，只用手中的罗盘指引方向。每一次类型安全的导航，都是对代码质量的守护。"*
>
> 愿每一位冒险者，都能在领航员的指引下，写出更加健壮的代码。
>
> —— **冒险团参谋 小柯**
