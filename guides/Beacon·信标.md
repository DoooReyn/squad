# Beacon · 信标

> *"他如沉默的信使，在后台默默收集数据并上传。永不喧宾夺主，确保冒险正常进行。"*
> —— 冒险团团长 小亮

---

## 概述

**Beacon（信标）** 是冒险团的数据上报专家，负责静默收集关键数据并批量上传到服务器。他可以配合风纪官上报异常，确保不影响用户体验。

### 核心特性

- **队列缓存** — 数据先入队，避免阻塞主流程
- **批量上报** — 合并多次上报，减少网络请求
- **失败重试** — 上报失败自动重试（指数退避）
- **静默运行** — 使用 `requestIdleCallback` 延迟上报
- **永不丢失** — `fetch keepalive` 确保页面关闭也能发送

---

## 设计理念

### 1. 永不喧宾夺主

信标的核心原则是**不影响主流程**：

```typescript
// 立即返回，不阻塞
beacon.report({ type: 'user-action', data: {...} });

// 主流程继续执行
doSomethingImportant();
```

### 2. 批量合并

多次上报合并成一次请求，减少网络开销：

```
report(data1) ─┐
report(data2) ─┼→ 队列 → 批量发送 → 服务器
report(data3) ─┘
```

### 3. 失败重试

网络失败时自动重试，使用指数退避避免雪崩：

```
发送失败 → 等待 2s → 重试
         → 等待 4s → 重试
         → 等待 8s → 重试
         → 放弃（数据放回队列）
```

### 4. 拟人化命名

遵循冒险团主题：
- **Beacon（信标）** — 传递信息的信号塔
- **report** — 上报数据
- **flush** — 立即发送（清空队列）

---

## 核心概念

### ReportData — 上报数据

```typescript
interface ReportData {
  type: string;       // 数据类型
  data: unknown;      // 数据内容
  timestamp?: number; // 时间戳（可选，默认自动添加）
}
```

### BeaconConfig — 信标配置

```typescript
interface BeaconConfig {
  endpoint: string;   // 上报端点
  batchSize?: number; // 批量大小（默认 10）
  interval?: number;  // 上报间隔毫秒（默认 5000）
  retries?: number;   // 重试次数（默认 3）
  enabled?: boolean;  // 是否启用（默认 true）
}
```

---

## 基本使用

### 快速开始

```typescript
import { Squad } from './squad/squad';
import { ROSTER } from './squad/registry/roster';

// 获取信标
const beacon = Squad.Summon<IBeacon>(ROSTER.BEACON);

// 配置端点
beacon.configure({
  endpoint: 'https://api.example.com/report',
});

// 上报数据（立即返回）
beacon.report({
  type: 'user-action',
  data: { action: 'click', target: 'button' },
});
```

### 配合风纪官

风纪官捕获的错误自动通过信标上报（在 embark.ts 中配置）：

```typescript
discipline.setErrorHandler((error) => {
  beacon.report({ type: 'error', data: error });
});
```

---

## 高级使用

### 批量上报控制

```typescript
// 配置批量大小和上报间隔
beacon.configure({
  endpoint: 'https://api.example.com/report',
  batchSize: 20,   // 20 条数据后自动上报
  interval: 10000, // 或每 10 秒上报一次
});
```

### 立即上报

```typescript
// 页面卸载前确保数据上报
window.addEventListener('beforeunload', () => {
  beacon.flush();
});
```

### 禁用/启用

```typescript
// 禁用上报（数据仍然入队，但不发送）
beacon.configure({ enabled: false });

// 重新启用
beacon.configure({ enabled: true });
```

### 查看队列状态

```typescript
const queueSize = beacon.getQueueSize();
console.log(`队列中有 ${queueSize} 条数据待上报`);
```

---

## 技术实现

### 上报流程

```
report(data)
    ↓
加入队列
    ↓
检查条件
    ↓
    ├─ 队列大小 ≥ batchSize?
    │   → 立即调度上报
    │
    └─ 定时器到期?
        → 调度上报
            ↓
    requestIdleCallback / setTimeout(0)
            ↓
        取出数据
            ↓
        fetch(keepalive: true)
            ↓
        成功?
        ├─ 是 → 完成
        └─ 否 → 重试（最多 retries 次）
```

### 关键技术

1. **requestIdleCallback** — 浏览器空闲时上报，不抢占资源
2. **fetch keepalive** — 页面关闭后仍能发送
3. **指数退避** — 失败重试间隔：2s, 4s, 8s...

### 数据格式

发送到服务器的数据格式：

```json
[
  {
    "type": "user-action",
    "data": { "action": "click" },
    "timestamp": 1680123456789
  },
  {
    "type": "error",
    "data": { "message": "Something failed" },
    "timestamp": 1680123456790
  }
]
```

---

## 最佳实践

### 1. 合理配置批量大小

```typescript
// ✅ 推荐：平衡性能与实时性
beacon.configure({ batchSize: 10, interval: 5000 });

// ❌ 不推荐：批量太大，数据延迟高
beacon.configure({ batchSize: 100, interval: 60000 });

// ❌ 不推荐：批量太小，请求频繁
beacon.configure({ batchSize: 1, interval: 1000 });
```

### 2. 重要数据立即上报

```typescript
// 支付成功等重要数据，立即上报
beacon.report({ type: 'payment-success', data: {...} });
beacon.flush();
```

### 3. 服务器端幂等处理

同一条数据可能因重试发送多次，服务器需要去重：

```typescript
// 服务器端
function handleReports(reports) {
  for (const report of reports) {
    const key = `${report.type}_${report.timestamp}`;
    if (!isProcessed(key)) {
      processReport(report);
      markProcessed(key);
    }
  }
}
```

### 4. 端点验证

确保配置了端点才上报：

```typescript
if (beaconEndpoint) {
  beacon.configure({ endpoint: beaconEndpoint });
}
```

---

## 限制与注意事项

### 1. keepalive 限制

`fetch keepalive` 有以下限制：
- 请求体大小限制（约 64KB）
- 无法读取响应
- 只能发送简单请求

### 2. 数据可能延迟

由于批量上报和定时上报，数据不是实时发送的：
- 最快：队列达到 batchSize
- 最慢：等待 interval 时间

### 3. 网络失败

网络完全失败时，数据会积累在队列中。可以考虑：
- 设置队列最大大小
- 超出时丢弃旧数据

### 4. 隐私注意

上报敏感数据前需要：
- 用户授权
- 数据脱敏
- 符合隐私法规

---

## 协作场景

### 与风纪官协作

```
异常发生 → 风纪官捕获 → 信标上报 → 服务器
```

### 自定义上报

```typescript
// 游戏事件
beacon.report({ type: 'level-complete', data: { level: 5 } });

// 用户行为
beacon.report({ type: 'tutorial-complete', data: { step: 'intro' } });

// 性能数据
beacon.report({ type: 'performance', data: { fps: 60 } });
```

---

## 附录

### 完整 API 参考

详见源码：[assets/squad/crews/beacon.ts](../assets/squad/crews/beacon.ts)

### 相关宪章

- [风之语·命名法典](../charter/风之语·命名法典.md) — 命名规范
- [风之歌·代码乐章](../charter/风之歌·代码乐章.md) — 代码风格
- [风之域·坤舆万国](../charter/风之域·坤舆万国.md) — 目录组织

---

> *"信标无声，却让冒险团更加透明。每一次数据上报，都是对冒险的记录。"*
>
> 愿每一位冒险者，都能在信标的守护下，留下珍贵的冒险足迹。
>
> —— **冒险团参谋 小柯**
