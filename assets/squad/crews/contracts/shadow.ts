/**
 * 影子契约
 *
 * 定义影子伙伴的情报管理接口：潜伏、报信、抽身。
 */

/**
 * 收到消息后的应对方案
 */
export interface Reaction {
  (...args: unknown[]): void;
}

/**
 * 线人
 *
 * 记录潜伏者的应对方案和上下文。
 */
export interface Listener {
  /** 应对方案 */
  reaction: Reaction;
  /** 上下文标识 */
  context?: unknown;
}

/**
 * 影子分身接口
 *
 * 定义分身（影子仆从）的情报管理能力。
 */
export interface IShadowServant {
  /**
   * 潜伏
   *
   * 在指定位置潜伏，监听相关消息。
   *
   * @param news - 消息代号
   * @param reaction - 消息应对方案
   * @param context - 上下文标识（可选，用于批量管理同一上下文的监听）
   */
  lurk(news: string, reaction: Reaction, context?: unknown): void;

  /**
   * 报信
   *
   * 收到情报后，通知所有潜伏在该位置的伙伴。
   *
   * @param news - 消息代号
   * @param args - 情报内容
   */
  report(news: string, ...args: unknown[]): void;

  /**
   * 抽身
   *
   * 从潜伏位置撤离。根据参数不同有不同的行为：
   * - 指定 news、reaction 和 context：移除指定消息中指定上下文的监听
   * - 指定 news 和 reaction：移除特定线人
   * - 指定 news 和 context：移除指定消息中指定上下文的所有监听
   * - 仅指定 news：撤走该消息的所有线人
   * - 仅指定 context：移除指定上下文的所有监听（跨消息）
   * - 不指定参数：撤走所有线人
   *
   * @param news - 消息代号（可选）
   * @param reaction - 要移除的消息应对方案（可选）
   * @param context - 上下文标识（可选）
   */
  slip(news?: string, reaction?: Reaction, context?: unknown): void;
}

/**
 * 影子接口
 *
 * 影子是分身容器，负责管理所有影子仆从（分身）。
 *
 * @description 技术实现：分身容器模式
 */
export interface IShadow {
  /**
   * 召唤分身
   *
   * 获取或创建指定名字的分身。
   *
   * @param name - 分身名字
   * @returns 分身实例
   *
   * @example
   * ```typescript
   * const battleShadow = shadow.acquire('battle');
   * const uiShadow = shadow.acquire('ui');
   * ```
   */
  acquire(name: string): IShadowServant;

  /**
   * 移除分身
   *
   * 移除指定的分身及其所有监听器。
   *
   * @param name - 分身名字
   *
   * @example
   * ```typescript
   * shadow.remove('battle');
   * ```
   */
  remove(name: string): void;

  /**
   * 清空所有分身
   *
   * 移除所有分身及其监听器。
   *
   * @example
   * ```typescript
   * shadow.clear();
   * ```
   */
  clear(): void;

  /**
   * 检查分身是否存在
   *
   * @param name - 分身名字
   * @returns 是否存在
   *
   * @example
   * ```typescript
   * if (shadow.has('battle')) {
   *   // ...
   * }
   * ```
   */
  has(name: string): boolean;
}
