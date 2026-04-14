# Codecs · 破译官

> *"他精通变换，形式多样。数据在他的手中可以化身为 JSON、Base64、密文，又能完美还原。"*
> —— 吟游诗人 小柯

---

## 概述

**Codecs（破译官）** 是冒险团的数据转换专家，负责各种数据格式的编码和解码。他提供了一系列编解码器，支持模块化导入。

### 核心特性

- **JSON 编解码** — `JsonCodec` 对象，对象与 JSON 字符串互转
- **Base64 编解码** — `Base64Codec` 对象，完整实现，跨平台兼容
- **XOR 编解码** — `XorCodec` 类，简单加密/混淆（需实例化）
- **链式编解码** — `chainCodecs` 函数，串联多个编解码器
- **模块化** — 每个编解码器独立文件，按需导入

---

## 基本使用

### JSON 编解码

```typescript
import { JsonCodec } from '../squad/assistants/codec/codecs';

// 编码：对象 -> JSON 字符串
const data = { name: 'Player', level: 5 };
const json = JsonCodec.encode(data);  // '{"name":"Player","level":5}'

// 解码：JSON 字符串 -> 对象
const decoded = JsonCodec.decode<typeof data>(json);  // { name: 'Player', level: 5 }
```

**设计说明：** `JsonCodec` 是一个常量对象，导出 `encode` 和 `decode` 方法，无需实例化。

### Base64 编解码

```typescript
import { Base64Codec } from '../squad/assistants/codec/codecs';

// 编码：字符串 -> Base64
const text = 'Hello, 世界!';
const base64 = Base64Codec.encode(text);  // 'SGVsbG8sIOS4lueVjCE='

// 解码：Base64 -> 字符串
const decoded = Base64Codec.decode(base64);  // 'Hello, 世界!'
```

**设计说明：** `Base64Codec` 是一个常量对象，导出 `encode` 和 `decode` 方法，无需实例化。

**技术实现：**
- 完整的 Base64 算法实现，不依赖 `atob/btoa`
- 支持 UTF-8 编码，正确处理中文等多字节字符
- 跨平台兼容，支持所有 Cocos Creator 目标平台

### XOR 编解码

```typescript
import { XorCodec } from '../squad/assistants/codec/codecs';

// 创建 XOR 编解码器（需要密钥，需实例化）
const codec = new XorCodec('secret-key');

// 编码和解码是相同操作
const encoded = codec.encode('hello');
const decoded = codec.decode(encoded);  // 'hello'
```

**设计说明：** `XorCodec` 是一个类，需要实例化并传入密钥。

**应用场景：**
- 简单数据混淆（非加密）
- 轻量级数据保护
- 防止明文存储敏感信息

---

## 高级使用

### 链式编解码

```typescript
import { chainCodecs, JsonCodec, Base64Codec, XorCodec } from '../squad/assistants/codec/codecs';

// 组合多个编解码器：JSON -> Base64 -> XOR
const codec = chainCodecs<PlayerData>(
  JsonCodec,              // 1. 对象 -> JSON 字符串（对象编解码器，无需实例化）
  Base64Codec,            // 2. JSON -> Base64（对象编解码器，无需实例化）
  new XorCodec('secret-key')  // 3. Base64 -> XOR（类编解码器，需要实例化）
);

// 编码流程：PlayerData -> JSON -> Base64 -> XOR
const data = { name: 'Player', level: 5 };
const encoded = codec.encode(data);

// 解码流程：XOR -> Base64 -> JSON -> PlayerData
const decoded = codec.decode(encoded);
```

**设计说明：**
- 对象编解码器（如 `JsonCodec`、`Base64Codec`）直接传递即可
- 类编解码器（如 `XorCodec`）需要先 `new` 实例化

**应用场景：**

| 场景 | 编码链 |
|------|--------|
| 数据加密 | `JsonCodec -> Base64Codec -> XorCodec` |
| 数据压缩 | `JsonCodec -> GzipCodec -> Base64Codec` |
| 数据混淆 | `JsonCodec -> XorCodec -> Base64Codec` |
| 多重保护 | `JsonCodec -> AesCodec -> Base64Codec -> XorCodec` |

### 自定义编解码器

```typescript
import { DataCodec } from '../squad/assistants/codec/codecs';

// 实现编解码器接口
class Rot13Codec implements DataCodec<string> {
  encode(data: string): string {
    return data.replace(/[a-zA-Z]/g, (char) => {
      const base = char <= 'Z' ? 65 : 97;
      return String.fromCharCode(((char.charCodeAt(0) - base + 13) % 26) + base);
    });
  }

  decode(raw: string): string {
    // ROT13 编解码是相同的操作
    return this.encode(raw);
  }
}

// 用于链式编解码
const codec = chainCodecs(
  JsonCodec,
  Base64Codec,
  new Rot13Codec()
);
```

---

## 在 Steward 中使用

```typescript
import { Squad } from '../squad';
import { ROSTER } from '../squad/registry/roster';
import { Base64Codec, XorCodec } from '../squad/assistants/codec/codecs';

// 召唤管家
const steward = Squad.Summon<ISteward>(ROSTER.STEWARD);

// 添加编解码器到全局链
steward.addCodecs(Base64Codec, new XorCodec('my-secret-key'));

// 注册数据模板
steward.register({
  key: 'sensitive-data',
  version: 1,
  defaults: () => ({ /* ... */ }),
});

// 数据会自动经过：JSON -> Base64 -> XOR 存储到 localStorage
const data = steward.get('sensitive-data');
```

---

## API 参考

### JsonCodec（静态类）

| 方法 | 说明 |
|------|------|
| `encode<T>(data: T): string` | 将数据编码为 JSON 字符串 |
| `decode<T>(raw: string): T` | 将 JSON 字符串解码为数据 |

### Base64Codec（静态类）

| 方法 | 说明 |
|------|------|
| `encode(data: string): string` | 将字符串编码为 Base64 |
| `decode(raw: string): string` | 将 Base64 解码为字符串 |

### XorCodec（类）

| 方法 | 说明 |
|------|------|
| `constructor(key: string)` | 创建 XOR 编解码器，指定密钥 |
| `encode(data: string): string` | 编码数据 |
| `decode(raw: string): string` | 解码数据（与 encode 相同） |

### 工具函数

| 函数 | 说明 |
|------|------|
| `chainCodecs<T>(...codecs): DataCodec<T>` | 创建链式编解码器 |
| `DataCodec<T>` | 编解码器接口，用于实现自定义编解码器 |

---

## 技术细节

### Base64 完整实现

为了确保跨平台兼容性，`Base64Codec` 实现了完整的 Base64 算法：

1. **UTF-8 编码支持**：正确处理中文等多字节字符
2. **标准 Base64 字符表**：`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/`
3. **Padding 处理**：正确使用 `=` 填充
4. **错误处理**：解码时检测非法字符和 UTF-8 编码错误

**为什么不用 `atob/btoa`？**
- 某些原生平台（如部分小游戏平台）不支持这些 API
- 浏览器实现可能存在 UTF-8 编码问题
- 完整实现确保所有平台行为一致

### 静态类设计

`JsonCodec` 和 `Base64Codec` 设计为静态类的原因：

1. **无状态**：编解码逻辑不需要实例状态
2. **便捷性**：无需 `new JsonCodec()`，直接调用 `JsonCodec.encode()`
3. **性能**：避免不必要的实例化开销
4. **类型安全**：泛型方法提供完整的类型推断

---

## 相关文件

- 主入口：[assets/squad/assistants/codec/codecs.ts](../assets/squad/assistants/codec/codecs.ts)
- JSON 编解码器：[assets/squad/assistants/codec/json-codec.ts](../assets/squad/assistants/codec/json-codec.ts)
- Base64 编解码器：[assets/squad/assistants/codec/base64-codec.ts](../assets/squad/assistants/codec/base64-codec.ts)
- XOR 编解码器：[assets/squad/assistants/codec/xor-codec.ts](../assets/squad/assistants/codec/xor-codec.ts)
- 使用者：[assets/squad/crews/steward.ts](../assets/squad/crews/steward.ts)

### 相关宪章

- [风之语·命名法典](../charter/风之语·命名法典.md) — 命名规范
- [风之歌·代码乐章](../charter/风之歌·代码乐章.md) — 代码风格
- [风之域·坤舆万国](../charter/风之域·坤舆万国.md) — 目录组织

---

> *"数据如水，随器赋形。在破译官的手中，它可以是明文，可以是密文，但本质永不丢失。"*
>
> 愿每一位冒险者，都能在数据的变换中，找到最适合自己的形式。
>
> —— **冒险团参谋 小柯**
