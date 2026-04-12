/**
 * 冒险启程
 *
 * 冒险游戏的启动入口，负责初始化框架和启动游戏逻辑。
 *
 * **职责：**
 * - 引入冒险团框架
 * - 启动冒险团（召集伙伴）
 * - 初始化游戏逻辑
 * - 作为游戏的统一入口点
 *
 * **使用方式：**
 * ```typescript
 * import './adventure/bootstrap';
 * ```
 * 导入即自动注册到 `cc.game.EVENT_GAME_INITED` 事件。
 */

import { game, Game } from 'cc';
import { EDITOR } from 'cc/env';

import { embark } from '../squad/embark';

if (!EDITOR) {
  /**
   * 游戏初始化完成时启动冒险团
   */
  game.once(Game.EVENT_GAME_INITED, async (): Promise<void> => {
    // 第一步：启动冒险团，召集所有伙伴
    await embark();

    // 第二步：初始化游戏逻辑
    // TODO: 初始化游戏系统（战斗、UI、资源管理等）
  });
}
