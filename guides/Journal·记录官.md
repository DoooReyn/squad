# Journal · 记录官

> *"风过留痕，史有记载。记录官铭记冒险团的每一刻。"*
> —— 吟游诗人 小柯

---

## 概述

**Journal（记录官）** 是冒险团的日志管理系统，提供分类、分级、格式化的日志输出功能。

### 核心特性

- **分类管理** — 按功能模块划分日志（SYSTEM/BATTLE/UI/NETWORK/ASSET）
- **分级控制** — 按重要程度过滤日志（DEBUG/INFO/WARN/ERROR/FATAL）
- **格式化输出** — 统一的日志格式，包含分类、级别、时间戳
- **彩色支持** — 可选的彩色输出，提升可读性
- **可变参数** — 与 `console.log` 一致的行为，支持多个参数

---

## 设计理念

### 1. 分而治之

日志按功能模块分类，每个分类独立管理级别，互不干扰：

```typescript
// 战斗日志只显示 WARN 及以上
Journal.SetCategoryLevel(LogCategory.BATTLE, LogLevel.WARN);

// UI 日志显示 DEBUG 及以上
Journal.SetCategoryLevel(LogCategory.UI, LogLevel.DEBUG);
```

### 2. 层级过滤

两级过滤机制，精确控制输出：

1. **全局级别**（Journal.MainLevel）— 所有日志的最低输出级别
2. **实例级别**（Logger._level）— 单个分类的输出级别

```typescript
// 全局只显示 INFO 及以上
Journal.SetMainLevel(LogLevel.INFO);

// 单个分类可以更宽松，但仍受全局限制
Journal.SetCategoryLevel(LogCategory.BATTLE, LogLevel.DEBUG); // 不会生效，因为全局限制为 INFO
```

### 3. 服务定位器模式

Journal 采用服务定位器模式，通过 `Acquire()` 获取日志实例：

```typescript
// 获取 SYSTEM 分类日志实例
const systemLog = Journal.Acquire(LogCategory.SYSTEM);

// 每个分类对应一个独立实例，缓存复用
const sameLog = Journal.Acquire(LogCategory.SYSTEM); // 返回同一实例
```

### 4. 拟人化命名

遵循冒险团主题，采用拟人化命名：
- **Journal（记录官）** — 全局日志管理者
- **Logger（记录员）** — 单分类日志实例
- **LogCategory（记录册）** — 日志分类
- **LogLevel（重要度）** — 日志级别

---

## 核心概念

### LogCategory — 日志分类

按功能模块划分的日志类别：

```typescript
enum LogCategory {
  SYSTEM = 'SYSTEM',   // 系统日志
  BATTLE = 'BATTLE',   // 战斗日志
  UI = 'UI',           // UI 日志
  NETWORK = 'NETWORK', // 网络日志
  ASSET = 'ASSET',     // 资源日志
}
```

### LogLevel — 日志级别

按重要程度划分的日志级别：

```typescript
enum LogLevel {
  DEBUG = 'DEBUG',   // 调试信息：开发时使用
  INFO = 'INFO',     // 一般信息：常规操作记录
  WARN = 'WARN',     // 警告：潜在问题
  ERROR = 'ERROR',   // 错误：功能受影响
  FATAL = 'FATAL',   // 致命错误：可能崩溃
}
```

级别优先级：`DEBUG < INFO < WARN < ERROR < FATAL`

### Logger — 记录员

单分类日志实例，负责具体的日志输出：

```typescript
class Logger {
  private _level: LogLevel;           // 实例级别
  private readonly _category: LogCategory; // 所属分类

  public setLevel(level: LogLevel): void;
  public getLevel(): LogLevel;
  public log(level: LogLevel, title: string, ...data: unknown[]): void;

  // 便捷方法
  public debug(title: string, ...data: unknown[]): void;
  public info(title: string, ...data: unknown[]): void;
  public warn(title: string, ...data: unknown[]): void;
  public error(title: string, ...data: unknown[]): void;
  public fatal(title: string, ...data: unknown[]): void;
}
```

### Journal — 记录官

全局日志管理器，管理所有 Logger 实例：

```typescript
class Journal {
  private static MainLevel: LogLevel;                              // 全局级别
  private static Loggers: Map<LogCategory, Logger>;                 // 实例容器
  public static ColorOutputEnabled: boolean;                        // 彩色输出开关
  public static readonly LevelColors: Record<LogLevel, string>;     // 颜色映射

  // 全局级别控制
  public static SetMainLevel(level: LogLevel): void;
  public static GetMainLevel(): LogLevel;

  // 分类级别控制
  public static SetCategoryLevel(category: LogCategory, level: LogLevel): void;

  // 获取日志实例
  public static Acquire(category: LogCategory): Logger;

  // 通用快捷方法（使用 SYSTEM 分类）
  public static Debug(title: string, ...data: unknown[]): void;
  public static Info(title: string, ...data: unknown[]): void;
  public static Warn(title: string, ...data: unknown[]): void;
  public static Error(title: string, ...data: unknown[]): void;
  public static Fatal(title: string, ...data: unknown[]): void;
}
```

---

## 基本使用

### 快速开始

使用 Journal 的快捷方法（SYSTEM 分类）：

```typescript
import { Journal } from './squad/assistants/journal';

// 不同级别的日志
Journal.Debug('这是一条调试信息');
Journal.Info('冒险启程！');
Journal.Warn('检测到潜在问题');
Journal.Error('功能发生错误');
Journal.Fatal('致命错误！');
```

**控制台输出：**

```
[SYSTEM | INFO | 14:30:25] 冒险启程！
[SYSTEM | WARN | 14:30:26] 检测到潜在问题
[SYSTEM | ERROR | 14:30:27] 功能发生错误
```

### 使用可变参数

与 `console.log` 一致，支持多个参数：

```typescript
Journal.Info('英雄', heroName, '等级提升至', level);

// 输出：[SYSTEM | INFO | 14:30:25] 英雄 小柯 等级提升至 10
```

---

## 高级使用

### 使用自定义分类

为不同模块使用独立的日志实例：

```typescript
import { Journal, LogCategory } from './squad/assistants/journal';

// 获取战斗日志实例
const battleLog = Journal.Acquire(LogCategory.BATTLE);

// 获取 UI 日志实例
const uiLog = Journal.Acquire(LogCategory.UI);

// 输出到不同分类
battleLog.Info('战斗开始');
uiLog.Warn('按钮点击无效');
```

**控制台输出：**

```
[BATTLE | INFO | 14:30:25] 战斗开始
[UI | WARN | 14:30:26] 按钮点击无效
```

### 控制日志级别

设置全局级别，过滤低优先级日志：

```typescript
// 只显示 WARN 及以上
Journal.SetMainLevel(LogLevel.WARN);

Journal.Debug('不会输出');
Journal.Info('不会输出');
Journal.Warn('会输出');
Journal.Error('会输出');
```

设置单个分类的级别：

```typescript
// 战斗日志只显示 ERROR 及以上
Journal.SetCategoryLevel(LogCategory.BATTLE, LogLevel.ERROR);

const battleLog = Journal.Acquire(LogCategory.BATTLE);
battleLog.Info('不会输出');
battleLog.Error('会输出');
```

### 控制彩色输出

根据平台自动设置彩色输出：

```typescript
import { sys } from 'cc';

// 浏览器环境启用彩色
Journal.ColorOutputEnabled = sys.isBrowser;

// 或手动控制
Journal.ColorOutputEnabled = false; // 禁用彩色
```

---

## 最佳实践

### 1. 选择合适的日志级别

| 级别 | 使用场景 | 示例 |
|------|----------|------|
| DEBUG | 开发调试信息 | `'变量值:', value` |
| INFO | 常规操作记录 | `'用户登录成功'` |
| WARN | 潜在问题，不影响运行 | `'配置文件缺失，使用默认值'` |
| ERROR | 错误发生，功能受影响 | `'网络请求失败'` |
| FATAL | 严重错误，可能崩溃 | `'内存溢出'` |

### 2. 为模块分配独立分类

```typescript
// ✅ 好的：为每个模块分配分类
const battleLog = Journal.Acquire(LogCategory.BATTLE);
const uiLog = Journal.Acquire(LogCategory.UI);
const networkLog = Journal.Acquire(LogCategory.NETWORK);

// ❌ 坏的：所有日志都用 SYSTEM
Journal.Info('战斗开始');
Journal.Info('按钮点击');
Journal.Info('网络请求');
```

### 3. 使用描述性的日志标题

```typescript
// ✅ 好的：描述性标题
battleLog.Info('战斗开始', { heroId, enemyId });
networkLog.Error('网络请求失败', { url, error });

// ❌ 坏的：无意义标题
battleLog.Info('1');
networkLog.Error('err');
```

### 4. 生产环境调整日志级别

```typescript
// 开发环境
Journal.SetMainLevel(LogLevel.DEBUG);

// 生产环境
Journal.SetMainLevel(LogLevel.WARN);
```

---

## 输出格式

日志采用统一格式：

```
[分类 | 级别 | 时间戳] 标题 附加数据...
```

**示例：**

```
[BATTLE | INFO | 14:30:25] 战斗开始 { heroId: 'hero-001', enemyId: 'enemy-001' }
[NETWORK | ERROR | 14:30:26] 网络请求失败 { url: 'https://api.example.com', error: 'timeout' }
```

---

## 附录

### 完整 API 参考

详见源码：[assets/squad/assistants/journal.ts](../assets/squad/assistants/journal.ts)

### 相关宪章

- [风之语·命名法典](../charter/风之语·命名法典.md) — 静态成员命名规范
- [风之歌·代码乐章](../charter/风之歌·代码乐章.md) — 代码风格规范

---

> *"记录官的笔，写下的是历史。每一行日志，都是冒险的印记。"*
>
> 愿每一位冒险者，都能善用记录官，让代码之路清晰可循。
>
> —— **冒险团参谋 小柯**
