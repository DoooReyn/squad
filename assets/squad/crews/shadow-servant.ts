/**
 * 影子仆从
 *
 * 影子的分身，负责管理某一类消息的监听与分发。
 * 每个分身独立工作，互不干扰。
 */

import { Journal } from '../assistants/journal';
import { Navigator } from '../assistants/navigator';
import { IShadowServant, Listener, Reaction } from './contracts/shadow';

/**
 * 影子仆从
 *
 * 影子分身，实际处理消息的监听与分发。
 */
class ShadowServant implements IShadowServant {
  /**
   * 主分身名字
   */
  private readonly _masterName: string;

  /**
   * 分身名字
   */
  private readonly _name: string;

  /**
   * 潜伏网络
   * @description 存储所有消息监听关系
   * - key: 消息代号
   * - value: 线人集合
   */
  private _news: Map<string, Set<Listener>>;

  /**
   * 构造函数
   * @param masterName 主分身名字
   * @param name 分身名字
   */
  public constructor(masterName: string, name: string) {
    this._masterName = masterName;
    this._name = name;
    this._news = new Map();
  }

  /**
   * 获取分身名字
   */
  public get name(): string {
    return this._name;
  }

  /**
   * 获取监听器总数
   */
  public get size(): number {
    let total = 0;
    for (const handlers of this._news.values()) {
      total += handlers.size;
    }
    return total;
  }

  /**
   * 潜伏
   *
   * 在指定位置潜伏，监听相关消息。
   *
   * @param news - 消息代号
   * @param reaction - 消息应对方案
   * @param context - 上下文标识（可选，用于批量管理同一上下文的监听）
   */
  public lurk(news: string, reaction: Reaction, context?: unknown): void {
    if (!this._news.has(news)) {
      this._news.set(news, new Set());
    }
    this._news.get(news)!.add({ reaction, context });

    Journal.Debug(`[${this._masterName}·${this._name}] 潜伏监听: ${news}`);
  }

  /**
   * 报信
   *
   * 收到情报后，立刻通知所有潜伏者。
   * 如有接收者处理失败，影子会记录下来，但不影响其他接收者。
   *
   * @param news - 消息代号
   * @param args - 情报内容
   */
  public report(news: string, ...args: unknown[]): void {
    const handlers = this._news.get(news);
    if (handlers) {
      handlers.forEach((listener) => {
        Navigator.Try(listener.reaction, undefined, ...args).match({
          ok: () => {},
          err: (error) =>
            Journal.Error(`[${this._masterName}·${this._name}] 情报传递失败: ${news}`, error),
        });
      });
    }

    Journal.Debug(`[${this._masterName}·${this._name}] 报信传递: ${news}`, ...args);
  }

  /**
   * 抽身
   *
   * 从潜伏位置撤离。根据参数不同有不同的行为。
   *
   * @param news - 消息代号（可选）
   * @param reaction - 要移除的消息应对方案（可选）
   * @param context - 上下文标识（可选）
   */
  public slip(news?: string, reaction?: Reaction, context?: unknown): void {
    // 情况1: 指定全部参数 (news + reaction + context)
    // 移除指定消息中指定上下文的指定监听器
    if (news && reaction && context !== undefined) {
      const listeners = this._news.get(news);
      if (listeners) {
        for (const listener of listeners) {
          if (listener.context === context && listener.reaction === reaction) {
            listeners.delete(listener);
            if (listeners.size === 0) {
              this._news.delete(news);
            }
            break;
          }
        }
      }
      Journal.Debug(`[${this._masterName}·${this._name}] 抽身离开: ${news} (上下文: ${context})`);
      return;
    }

    // 情况2: 指定 news 和 context
    // 移除指定消息中指定上下文的所有监听器
    if (news && context !== undefined) {
      const listeners = this._news.get(news);
      if (listeners) {
        for (const listener of listeners) {
          if (listener.context === context) {
            listeners.delete(listener);
          }
        }
        if (listeners.size === 0) {
          this._news.delete(news);
        }
      }
      Journal.Debug(`[${this._masterName}·${this._name}] 抽身离开: ${news} (上下文: ${context})`);
      return;
    }

    // 情况3: 仅指定 context
    // 移除指定上下文的所有监听器（跨消息）
    if (context !== undefined) {
      for (const [newsName, listeners] of this._news.entries()) {
        for (const listener of listeners) {
          if (listener.context === context) {
            listeners.delete(listener);
          }
        }
        if (listeners.size === 0) {
          this._news.delete(newsName);
        }
      }
      Journal.Debug(`[${this._masterName}·${this._name}] 抽身离开所有潜伏点 (上下文: ${context})`);
      return;
    }

    // 情况4: 指定 news 和 reaction
    // 移除指定消息的指定监听器
    if (news && reaction) {
      const listeners = this._news.get(news);
      if (listeners) {
        for (const listener of listeners) {
          if (listener.reaction === reaction) {
            listeners.delete(listener);
            if (listeners.size === 0) {
              this._news.delete(news);
            }
            break;
          }
        }
      }
      Journal.Debug(`[${this._masterName}·${this._name}] 抽身离开: ${news}`);
      return;
    }

    // 情况5: 仅指定 news
    // 移除指定消息的所有监听器
    if (news) {
      this._news.delete(news);
      Journal.Debug(`[${this._masterName}·${this._name}] 撤走潜伏点: ${news}`);
      return;
    }

    // 情况6: 不指定参数
    // 清空所有监听器
    this._news.clear();
    Journal.Debug(`[${this._masterName}·${this._name}] 撤走所有潜伏点`);
  }
}

/**
 * 导出影子仆从
 */
export { ShadowServant };
