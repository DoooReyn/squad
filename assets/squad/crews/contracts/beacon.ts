/**
 * 信标契约
 *
 * 定义信标伙伴的数据上报接口。
 */

/**
 * 上报数据
 */
export interface ReportData {
  /** 数据类型 */
  type: string;
  /** 数据内容 */
  data: unknown;
  /** 时间戳 */
  timestamp?: number;
}

/**
 * 信标配置
 */
export interface BeaconConfig {
  /** 上报端点 */
  endpoint: string;
  /** 批量大小（多少条数据后自动上报） */
  batchSize?: number;
  /** 上报间隔（毫秒） */
  interval?: number;
  /** 重试次数 */
  retries?: number;
  /** 是否启用 */
  enabled?: boolean;
}

/**
 * 信标接口
 *
 * 负责静默收集数据并批量上报到服务器。
 * 上报过程不阻塞主流程，确保不影响用户体验。
 *
 * @description 技术实现：队列缓存 + 定时上报
 */
export interface IBeacon {
  /**
   * 上报数据
   *
   * 将数据加入队列，立即返回，不阻塞主流程。
   *
   * @param data - 上报数据
   *
   * @example
   * ```typescript
   * beacon.report({ type: 'user-action', data: { action: 'click' } });
   * ```
   */
  report(data: ReportData): void;

  /**
   * 立即上报
   *
   * 立即发送队列中的所有数据到服务器。
   *
   * @example
   * ```typescript
   * // 页面卸载前确保数据上报
   * beacon.flush();
   * ```
   */
  flush(): void;

  /**
   * 配置信标
   *
   * 更新信标的配置参数。
   *
   * @param config - 配置参数
   *
   * @example
   * ```typescript
   * beacon.configure({
   *   endpoint: 'https://api.example.com/report',
   *   batchSize: 10,
   *   interval: 5000,
   *   retries: 3,
   * });
   * ```
   */
  configure(config: Partial<BeaconConfig>): void;

  /**
   * 获取队列大小
   *
   * @returns 当前队列中的数据条数
   */
  getQueueSize(): number;
}
