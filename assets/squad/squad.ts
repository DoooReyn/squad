/**
 * 冒险团
 *
 * 伙伴们的家，管理所有 crew（服务伙伴）的注册与召唤。
 */

import { Journal } from './assistants/journal';

/**
 * 冒险团容器
 *
 * 管理所有服务伙伴的注册与解析。
 */
class Squad {
  /**
   * 队员花名册
   * @description 存储所有入队伙伴的登记簿，key 为伙伴名字，value 为伙伴实例
   */
  private static Crew: Map<string, unknown> = new Map();

  /**
   * 伙伴入队
   *
   * 注册一个服务伙伴到冒险团。
   * @param name 伙伴名字（来自花名册）
   * @param member 伙伴实例
   */
  public static Enlist(name: string, member: unknown): void {
    if (this.Crew.has(name)) {
      Journal.Warn(`伙伴 ${name} 已经在队中，将被替换。`);
    }
    this.Crew.set(name, member);
    Journal.Info(`伙伴 ${name} 入队！`);
  }

  /**
   * 召唤伙伴
   *
   * 根据名字召唤（解析）一个服务伙伴。
   * @param name 伙伴名字（来自花名册）
   * @returns 伙伴实例
   */
  public static Summon<T>(name: string): T {
    const member = this.Crew.get(name);
    if (!member) {
      Journal.Error(`伙伴 ${name} 不在队中！请检查是否已入队。`);
      throw new Error(`[Squad] 伙伴 ${name} 不在队中！请检查是否已入队。`);
    }
    return member as T;
  }

  /**
   * 检查伙伴是否在队中
   * @param name 伙伴名字
   * @returns 是否在队中
   */
  public static Has(name: string): boolean {
    return this.Crew.has(name);
  }

  /**
   * 获取当前队员数量
   * @returns 队员数量
   */
  public static Size(): number {
    return this.Crew.size;
  }
}

/**
 * 导出冒险团
 */
export { Squad };
