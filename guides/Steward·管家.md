# Steward · 管家

> *"他细心周到，默默守护着所有重要的数据。无论是玩家进度、游戏配置，还是临时缓存，他都能井井有条地管理。"*
> —— 吟游诗人 小柯

---

## 概述

**Steward（管家）** 是冒险团的存储管理专家，负责游戏数据的持久化存储。他通过数据模板注册提供类型安全，使用 Proxy 实现数据变动自动保存。

### 核心特性

- **数据模板** — 定义存储结构、默认值、版本号
- **自动保存** — 使用 Proxy 拦截数据变化，100ms 防抖保存
- **编解码器** — 默认 JSON 序列化，支持自定义
- **版本迁移** — 健壮的渐进式迁移机制（只新增，不删除，不修改）

---

## 设计理念

### 1. 数据模板驱动

```typescript
// 定义数据模板
interface PlayerProgress {
  level: number;
  exp: number;
  coins: number;
  achievements: string[];
  lastLogin: number;
}

const schema: DataSchema<PlayerProgress> = {
  key: 'player-progress',
  version: 3,
  defaults: () => ({ level: 1, exp: 0, coins: 0, achievements: [], lastLogin: Date.now() }),
  migrations: {
    1: (old) => ({ ...old, achievements: [] }),
    2: (old) => ({ ...old, lastLogin: Date.now() }),
  },
};

// 注册后即可使用
steward.register(schema);
```

### 2. 自动保存

```typescript
const progress = steward.get<PlayerProgress>('player-progress');

// 直接修改，自动保存！
progress.level = 5;
progress.coins += 100;
```

### 3. 版本迁移

```typescript
// v1 数据：{ level: 1, exp: 0 }
// 升级到 v3，自动执行 v1->v2 和 v2->v3 的迁移
// 结果：{ level: 1, exp: 0, coins: 0, achievements: [], lastLogin: xxx }
```

---

## 基本使用

### 快速开始

```typescript
import { Squad } from '../squad';
import { ROSTER } from '../registry/roster';
import type { ISteward, DataSchema } from '../crews/contracts/steward';

// 1. 召唤管家
const steward = Squad.Summon<ISteward>(ROSTER.STEWARD);

// 2. 定义数据模板
interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  language: string;
}

const settingsSchema: DataSchema<GameSettings> = {
  key: 'game-settings',
  version: 1,
  defaults: () => ({
    musicVolume: 0.8,
    sfxVolume: 0.8,
    language: 'zh-CN',
  }),
};

// 3. 注册数据模板
steward.register(settingsSchema);

// 4. 获取数据（自动代理）
const settings = steward.get<GameSettings>('game-settings');

// 5. 直接修改，自动保存
settings.musicVolume = 0.5;  // 自动保存到 localStorage
```

---

## 高级使用

### 版本迁移

```typescript
interface PlayerData {
  name: string;
  level: number;
  coins: number;
  inventory: string[];  // v2 新增
  lastLogin: number;    // v3 新增
}

const playerSchema: DataSchema<PlayerData> = {
  key: 'player-data',
  version: 3,
  defaults: () => ({
    name: 'Player',
    level: 1,
    coins: 0,
    inventory: [],
    lastLogin: Date.now(),
  }),
  migrations: {
    // v1 -> v2: 新增 inventory 字段
    1: (old: any) => ({
      ...old,
      inventory: [],
    }),
    // v2 -> v3: 新增 lastLogin 字段
    2: (old: any) => ({
      ...old,
      lastLogin: Date.now(),
    }),
  },
};

steward.register(playerSchema);

// 首次加载旧数据时，会自动执行迁移
const player = steward.get<PlayerData>('player-data');
```

### 自定义编解码器

```typescript
// Base64 编解码器
class Base64Codec<T> implements DataCodec<T> {
  encode(data: T): string {
    const json = JSON.stringify(data);
    return btoa(json);
  }

  decode(raw: string): T {
    const json = atob(raw);
    return JSON.parse(json) as T;
  }
}

// 为特定数据设置编解码器
steward.setCodec('sensitive-data', new Base64Codec());

// 或设置全局默认编解码器
steward.setDefaultCodec(new Base64Codec());
```

### 手动保存

```typescript
// 通常不需要手动保存，但某些情况下可以强制保存
await steward.save('player-data');

// 保存所有数据
await steward.saveAll();
```

### 数据管理

```typescript
// 检查数据是否存在
if (steward.has('player-data')) {
  // ...
}

// 删除指定数据
steward.delete('player-data');

// 清空所有数据
steward.clear();
```

---

## 最佳实践

### 1. 迁移函数只新增字段

```typescript
// ✅ 推荐：只新增字段
migrations: {
  1: (old) => ({ ...old, newField: defaultValue }),
}

// ❌ 不推荐：删除或修改旧字段
migrations: {
  1: (old) => {
    const { oldField, ...rest } = old;  // 删除字段
    return rest;
  },
}
```

### 2. 迁移函数使用 Navigator.Try

```typescript
import { Navigator } from '../assistants/navigator';

migrations: {
  1: (old: any) => {
    const result = Navigator.Try(() => {
      // 可能出错的迁移逻辑
      return { ...old, newField: complexTransform(old) };
    });

    return result.match({
      ok: (data) => data,
      err: () => old,  // 迁移失败时返回原数据
    });
  },
}
```

### 3. 数据集中管理

```typescript
// 创建一个专门的数据注册文件
// data-schemas.ts

export const PLAYER_PROGRESS: DataSchema<PlayerProgress> = {
  key: 'player-progress',
  version: 1,
  defaults: () => ({ /* ... */ }),
};

export const GAME_SETTINGS: DataSchema<GameSettings> = {
  key: 'game-settings',
  version: 1,
  defaults: () => ({ /* ... */ }),
};

// 在游戏启动时统一注册
steward.register(PLAYER_PROGRESS);
steward.register(GAME_SETTINGS);
```

### 4. 版本号规范

```typescript
// 版本号从 1 开始，单调递增
version: 1  // 初始版本
version: 2  // 第一次新增字段
version: 3  // 第二次新增字段
// ...
```

---

## 技术细节

### Proxy 自动保存机制

管家使用 ES6 Proxy 拦截对象的 `set` 和 `deleteProperty` 操作：

```typescript
const proxy = new Proxy(data, {
  set(obj, prop, value) {
    obj[prop] = value;
    steward._scheduleAutoSave(key);  // 100ms 防抖
    return true;
  },
});
```

**限制：**
- 只能拦截顶层属性操作
- 深层嵌套修改（如 `data.items[0] = x`）不会触发自动保存
- Map、Set 等需要特殊处理

**解决方案：** 深层修改后手动调用 `save()`

### 存储格式

数据在 localStorage 中的存储格式：

```json
{
  "level": 5,
  "coins": 100,
  "achievements": [],
  "_version": 3
}
```

`_version` 字段由管家自动管理，用于识别数据版本和触发迁移。

### 性能考虑

- **Proxy 开销**：轻微，但存储操作不频繁，影响可忽略
- **防抖保存**：100ms 防抖，避免频繁写入
- **内存缓存**：数据加载后缓存在内存中，get() 返回代理对象

### 存储容量

`sys.localStorage` 通常限制为 5MB。建议：
- 避免存储大量数据
- 使用分片存储（多个 key）
- 定期清理过期数据

---

## 附录

### API 参考

| 方法 | 说明 |
|------|------|
| `register(schema)` | 注册数据模板 |
| `get<T>(key)` | 获取数据（返回代理对象） |
| `save(key)` | 手动保存指定数据 |
| `saveAll()` | 保存所有数据 |
| `setCodec(key, codec)` | 设置编解码器 |
| `setDefaultCodec(codec)` | 设置默认编解码器 |
| `has(key)` | 检查数据是否存在 |
| `delete(key)` | 删除指定数据 |
| `clear()` | 清空所有数据 |

### 相关文件

- 契约：[assets/squad/crews/contracts/steward.ts](../assets/squad/crews/contracts/steward.ts)
- 实现：[assets/squad/crews/steward.ts](../assets/squad/crews/steward.ts)
- 注册：[assets/squad/registry/roster.ts](../assets/squad/registry/roster.ts)

### 相关宪章

- [风之语·命名法典](../charter/风之语·命名法典.md) — 命名规范
- [风之歌·代码乐章](../charter/风之歌·代码乐章.md) — 代码风格
- [风之域·坤舆万国](../charter/风之域·坤舆万国.md) — 目录组织

---

> *"管家不说话，只是默默守护着每一份数据。每一次自动保存，都是对玩家努力的尊重。"*
>
> 愿每一位冒险者，都能在管家的守护下，安心踏上冒险之旅。
>
> —— **冒险团参谋 小柯**
