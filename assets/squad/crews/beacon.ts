/**
 * 信标
 *
 * 冒险团的数据上报专家，默默在后台收集关键数据并上传给服务器。
 * 他可以配合风纪官上报异常，确保不影响冒险的正常进行。
 *
 * **技能：数据上报**
 * - 静默收集：数据入队，立即返回
 * - 批量上报：合并多次上报，减少请求
 * - 失败重试：自动重试失败的请求
 * - 永不喧宾夺主：不阻塞主流程
 *
 * **性格：**
 * - 沉默高效，专注本职
 * - 可靠稳重，永不丢失数据
 * - 默默奉献，不可或缺
 */

import { sys } from 'cc';

import { IBeacon, ReportData } from './contracts/beacon';
import { ICrew } from './contracts/crew';

/**
 * 信标配置
 */
interface BeaconConfigInternal {
  endpoint: string;
  batchSize: number;
  interval: number;
  retries: number;
  enabled: boolean;
}

interface ReportDataExtra extends ReportData {
  platform: string;
  os: string;
}

/**
 * 信标
 *
 * 冒险团的数据上报专家，负责静默收集数据并批量上报。
 * 上报过程不阻塞主流程，确保不影响用户体验。
 *
 * @description 技术实现：队列缓存 + 定时上报 + fetch keepalive
 */
class Beacon implements ICrew, IBeacon {
  private _active: boolean;

  /**
   * 数据队列
   */
  private _queue: ReportData[];

  /**
   * 定时器 ID
   */
  private _timer: number | null;

  /**
   * 是否正在上报
   */
  private _isReporting: boolean;

  /**
   * 配置
   */
  private _config: BeaconConfigInternal;

  declare public readonly roster: string;

  /**
   * 构造函数
   *
   * 信标诞生，准备收集数据。
   */
  public constructor() {
    this._active = false;
    this._queue = [];
    this._timer = null;
    this._isReporting = false;
    this._config = {
      endpoint: '',
      batchSize: 10,
      interval: 5000,
      retries: 3,
      enabled: true,
    };
  }

  public get isActive(): boolean {
    return this._active;
  }

  /**
   * 建立羁绊时调用
   *
   * 信标悄然出现，准备收集数据。
   */
  public onBind(): void {
    if (this._active) {
      return;
    }

    this._active = true;
  }

  /**
   * 编入队伍时调用
   *
   * 信标开始工作，启动定时上报。
   */
  public async onLink(): Promise<void> {
    // 启动定时上报
    this._startTimer();
  }

  /**
   * 与伙伴分别时调用
   *
   * 信标悄然离开，确保数据上报完成。
   */
  public onUnlink(): void {
    // 停止定时器
    this._stopTimer();

    // 尝试上报剩余数据
    this.flush();

    this._active = false;
  }

  /**
   * 上报数据
   *
   * @param data - 上报数据
   */
  public report(data: ReportData): void {
    if (!this._config.enabled || !this._config.endpoint) {
      return;
    }

    // 添加时间戳
    const reportData: ReportDataExtra = {
      ...data,
      timestamp: data.timestamp || Date.now(),
      platform: sys.platform,
      os: sys.os,
    };

    // 入队
    this._queue.push(reportData);

    // 检查是否达到批量大小
    if (this._queue.length >= this._config.batchSize) {
      this._scheduleReport();
    }
  }

  /**
   * 立即上报
   */
  public flush(): void {
    this._scheduleReport();
  }

  /**
   * 配置信标
   *
   * @param config - 配置参数
   */
  public configure(config: Partial<BeaconConfigInternal>): void {
    this._config = { ...this._config, ...config };

    // 重启定时器（如果配置了 interval）
    if (config.interval !== undefined && this._active) {
      this._stopTimer();
      this._startTimer();
    }
  }

  /**
   * 获取队列大小
   */
  public getQueueSize(): number {
    return this._queue.length;
  }

  /**
   * 启动定时器
   */
  private _startTimer(): void {
    if (this._timer !== null) {
      return;
    }

    this._timer = window.setTimeout(() => {
      this._scheduleReport();
      // 循环定时
      this._timer = null;
      this._startTimer();
    }, this._config.interval);
  }

  /**
   * 停止定时器
   */
  private _stopTimer(): void {
    if (this._timer !== null) {
      clearTimeout(this._timer);
      this._timer = null;
    }
  }

  /**
   * 调度上报
   */
  private _scheduleReport(): void {
    // 如果正在上报，跳过
    if (this._isReporting) {
      return;
    }

    // 使用 requestIdleCallback 或 setTimeout 延迟上报
    if (typeof window.requestIdleCallback !== 'undefined') {
      window.requestIdleCallback(() => this._report());
    } else {
      window.setTimeout(() => this._report(), 0);
    }
  }

  /**
   * 执行上报
   */
  private async _report(): Promise<void> {
    if (this._isReporting || this._queue.length === 0 || !this._config.endpoint) {
      return;
    }

    this._isReporting = true;

    // 取出队列中的所有数据
    const data = this._queue.splice(0, this._queue.length);

    try {
      await this._sendWithRetry(data);
    } catch (error) {
      // 上报失败，数据放回队列
      this._queue.unshift(...data);
    } finally {
      this._isReporting = false;
    }
  }

  /**
   * 带重试的发送
   */
  private async _sendWithRetry(data: ReportData[], attempt = 1): Promise<void> {
    try {
      await this._send(data);
    } catch (error) {
      if (attempt < this._config.retries) {
        // 指数退避
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this._sendWithRetry(data, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * 发送数据
   */
  private async _send(data: ReportData[]): Promise<void> {
    const response = await fetch(this._config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      // keepalive 确保页面关闭也能发送
      keepalive: true,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }
}

/**
 * 导出信标伙伴
 */
export { Beacon };
