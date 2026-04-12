/**
 * 伙伴契约
 *
 * 定义所有伙伴必须实现的基础生命周期接口。
 */

/**
 * 伙伴基础接口
 *
 * 所有伙伴（Crew）必须实现此接口，定义完整的生命周期。
 */
export interface ICrew {
  /**
   * 建立羁绊后调用
   *
   * 在构造函数完成后立即调用，用于初始化准备工作。
   * 此阶段伙伴已创建但尚未激活，不可被召唤使用。
   *
   * @remarks
   * - 可选方法，使用可选链实现
   * - 同步方法
   * - 此时伙伴尚未接收依赖，不应与其他伙伴交互
   *
   * @example
   * ```typescript
   * onBind(): void {
   *   // 初始化数据结构
   *   this.events = new Map();
   * }
   * ```
   */
  onBind(): void;

  /**
   * 编入队伍时调用
   *
   * 伙伴被激活，可以接收依赖并与其他伙伴建立连接。
   * 此阶段完成后伙伴方可被召唤使用。
   *
   * @remarks
   * - 可选方法，使用可选链实现
   * - 异步方法
   * - 接收依赖参数，建立伙伴间连接
   *
   * @param deps - 依赖参数列表，由 Link() 方法传入
   *
   * @example
   * ```typescript
   * async onLink(journal: Journal, eventManager: EventManager): Promise<void> {
   *   this.journal = journal;
   *   this.eventManager = eventManager;
   *   await this.eventManager.on('battle-start', this.onBattleStart);
   * }
   * ```
   */
  onLink(...deps: unknown[]): Promise<void>;

  /**
   * 与伙伴分别时调用
   *
   * 伙伴即将销毁，需要分离依赖、清理资源。
   *
   * @remarks
   * - 可选方法，使用可选链实现
   * - 同步方法
   * - 应该在此释放所有资源、取消事件监听、断开依赖连接
   *
   * @example
   * ```typescript
   * onUnlink(): void {
   *   this.eventManager.off('battle-start', this.onBattleStart);
   *   this.journal = null;
   *   this.eventManager = null;
   * }
   * ```
   */
  onUnlink(): void;
}
