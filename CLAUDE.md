# CLAUDE.md

> *"我们是冒险者，以代码为剑，以规范为盾，在未知的世界中谱写传奇。"*
>
> 本文档是冒险团（squad 项目）的指导性纲领，所有成员请认真阅读。

---

## 冒险团宗旨

**理论指导方法论，实践才能出真知。**

我们不是在写代码，而是在创作诗歌、谱写乐章、留下历史的印记。每一行代码都应该像风一样——自由、流畅、充满力量。

---

## 核心宪章

所有冒险者必须熟读并遵守以下宪章：

| 宪章 | 路径 | 要义 |
|------|------|------|
| **风之歌·代码乐章** | [charter/风之歌·代码乐章.md](charter/风之歌·代码乐章.md) | 代码如诗，规范如格律 |
| **风之语·命名法典** | [charter/风之语·命名法典.md](charter/风之语·命名法典.md) | 知晓真名，方能召唤力量 |
| **风之痕·辑要范式** | [charter/风之痕·辑要范式.md](charter/风之痕·辑要范式.md) | 风过留痕，史有记载 |
| **风之道·架构心法** | [charter/风之道·架构心法.md](charter/风之道·架构心法.md) | 以简驭繁，架构之道 |

---

## 项目概述

- **项目名称**: squad
- **引擎**: Cocos Creator 3.8.8
- **类型**: 2D 游戏
- **语言**: TypeScript (ES2015)

---

## 技术栈

| 领域 | 技术 |
|------|------|
| **引擎** | Cocos Creator 3.8.8 |
| **语言** | TypeScript (ES2015) |
| **渲染** | WebGL / WebGL2 |
| **物理** | Box2D (2D) |
| **骨骼动画** | Spine 3.8、DragonBones |
| **地图编辑** | Tiled Map |

---

## 启用的引擎模块

- 2D 基础功能、动画、音频
- UI 组件、Rich Text、遮罩
- 2D 粒子系统
- 2D 物理系统 (Box2D)
- Spine 3.8、DragonBones 骨骼动画
- Tiled Map 地图编辑器支持
- 视频、WebView
- Tween 缓动系统

---

## 开发规范

### 代码风格

基于 **Airbnb TypeScript Style Guide**，详见「风之歌·代码乐章」。

**要点：**
- 缩进：2 空格
- 分号：必须
- 引号：单引号
- 行宽：120 字符

### 命名规范

详见「风之语·命名法典」。

**要点：**
- 文件和目录：kebab-case（如 `hero-manager.ts`）
- 类和接口：PascalCase（如 `BattleManager`）
- 函数和变量：camelCase（如 `getHeroById`）
- 常量：UPPER_SNAKE_CASE（如 `MAX_HP`）
- 私有成员：`_` 前缀
- 保护成员：无前缀

### Git 提交规范

采用 **Conventional Commits** 规范，详见「风之痕·辑要范式」。

**格式：**
```
<类型>(<范围>): <简短描述>

<详细描述（可选）>
```

**类型：** feat、fix、docs、style、refactor、perf、test、build、ci、chore、revert

**示例：**
```
feat(battle): 添加英雄技能系统

实现技能冷却机制和目标选择逻辑。
```

---

## 自动化工具

项目配置了以下自动化工具，确保代码质量：

| 工具 | 职责 |
|------|------|
| **Prettier** | 代码格式化 |
| **ESLint** | 代码质量检查 |
| **Commitlint** | 提交信息规范检查 |
| **Husky** | Git Hooks 管理 |
| **lint-staged** | 只检查暂存文件 |

**每次提交时自动执行：**
1. ✅ Prettier 格式化
2. ✅ ESLint 检查
3. ✅ Commitlint 验证

不符合规范的提交将被拦截。

---

## 可用命令

```bash
# 格式化代码
npm run format

# 检查格式
npm run format:check

# 检查并修复代码问题
npm run lint

# 仅检查代码问题（不修复）
npm run lint:check
```

---

## 项目结构

```
squad/
├── assets/          # 游戏资源目录（场景、脚本、预制体、资源等）
├── charter/         # 冒险团宪章
│   ├── 风之歌·代码乐章.md
│   ├── 风之语·命名法典.md
│   └── 风之痕·辑要范式.md
├── settings/        # Cocos Creator 项目配置
├── temp/            # 临时文件和编译缓存
├── library/         # 资源库（已导入的资源）
├── tsconfig.json    # TypeScript 配置
├── package.json     # 项目元数据
└── CLAUDE.md        # 本文件
```

---

## 开发工作流

### 1. 在 Cocos Creator 中打开

使用 Cocos Creator 3.8.8 打开项目根目录。

### 2. 编写代码

- 遵循「风之歌·代码乐章」的代码风格
- 遵循「风之语·命名法典」的命名规范
- 保存时自动格式化

### 3. 提交代码

```bash
git add .
git commit -m "feat(module): 描述你的改动"
```

- 遵循「风之痕·辑要范式」的提交规范
- 自动执行代码检查和格式化
- 不符合规范的提交将被拦截

### 4. 构建项目

在 Cocos Creator 编辑器中选择 `项目 -> 构建发布`，选择目标平台进行构建。

---

## TypeScript 配置

项目继承自 Cocos Creator 的基础配置 (`temp/tsconfig.cocos.json`)：

- **目标**: ES2015
- **模块**: ES2015
- **装饰器**: 启用
- **类型声明**: `temp/declarations/`
- **严格模式**: 渐进式启用（详见 tsconfig.json）

---

## 冒险者守则

1. **阅读宪章** — 新成员必须熟读三部宪章
2. **遵循规范** — 代码风格、命名、提交信息必须符合规范
3. **编写清晰代码** — 代码是写给人看的，机器能读懂是顺带的
4. **保持一致性** — 风格统一比个人喜好更重要
5. **尊重历史** — 提交历史应该清晰可读，像史诗一样

---

> *"风起时，代码如歌；风停后，乐章永存。"*
>
> 愿每一位冒险者，都能在这风之歌中，谱写属于自己的传奇。
>
> —— 冒险团团长 小亮 & 首席参谋 小柯
