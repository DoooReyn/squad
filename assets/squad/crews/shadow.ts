/**
 * 影子
 *
 * 冒险团的斥候伙伴，负责管理所有影子仆从（分身）。
 * 沉稳低调，遁入尘烟，却在暗处连接各方，传递第一手情报。
 *
 * **技能：分身管理**
 * - 召唤：获取或创建分身
 * - 移除：销毁指定分身
 * - 清空：销毁所有分身
 * - 查询：检查分身是否存在
 *
 * **性格：**
 * - 沉稳低调，如影随形
 * - 不动声色，洞察一切
 * - 默默守护，不可或缺
 */

import { Journal } from '../assistants/journal';
import { ICrew } from './contracts/crew';
import { IShadow } from './contracts/shadow';
import { ShadowServant } from './shadow-servant';

/**
 * 影子
 *
 * 冒险团的第一位伙伴，斥候情报专员。
 * 管理所有影子仆从（分身），每个分身独立处理一类消息。
 *
 * @description 技术实现：分身容器模式
 */
class Shadow implements ICrew, IShadow {
  private _active: boolean;

  /**
   * 分身花名册
   * @description 存储所有分身，key 为分身名字，value 为分身实例
   */
  private _servants: Map<string, ShadowServant>;

  declare public readonly roster: string;

  /**
   * 构造函数
   *
   * 影子诞生，准备建立分身网络。
   */
  public constructor() {
    this._active = false;
    this._servants = new Map();
  }

  public get isActive(): boolean {
    return this._active;
  }

  /**
   * 建立羁绊时调用
   *
   * 影子悄然出现，准备建立分身网络。
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
   * 与记录官认识，开始情报工作。
   */
  public async onLink(): Promise<void> {
    Journal.Info(`${this.roster} 悄然加入队伍`);
  }

  /**
   * 召唤分身
   *
   * 获取或创建指定名字的分身。
   *
   * @param name - 分身名字
   * @returns 分身实例
   */
  public acquire(name: string): ShadowServant {
    if (!this._servants.has(name)) {
      this._servants.set(name, new ShadowServant(this.roster, name));
      Journal.Debug(`[${this.roster}] 分身 ${name} 诞生`);
    }
    return this._servants.get(name)!;
  }

  /**
   * 移除分身
   *
   * 移除指定的分身及其所有监听器。
   *
   * @param name - 分身名字
   */
  public remove(name: string): void {
    if (this._servants.delete(name)) {
      Journal.Debug(`[${this.roster}] 分身 ${name} 消散`);
    }
  }

  /**
   * 清空所有分身
   *
   * 移除所有分身及其监听器。
   */
  public clear(): void {
    const count = this._servants.size;
    this._servants.clear();
    Journal.Debug(`[${this.roster}] 清空所有分身 (共 ${count} 个)`);
  }

  /**
   * 检查分身是否存在
   *
   * @param name - 分身名字
   * @returns 是否存在
   */
  public has(name: string): boolean {
    return this._servants.has(name);
  }

  /**
   * 与伙伴分别时调用
   *
   * 影子悄然离开，清理所有分身网络。
   */
  public onUnlink(): void {
    this.clear();
    this._active = false;
  }
}

/**
 * 导出影子伙伴
 */
export { Shadow };
