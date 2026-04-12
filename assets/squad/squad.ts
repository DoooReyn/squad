/**
 * 冒险团
 *
 * 伙伴们的家，管理所有 crew（伙伴）的召集与召唤。
 */

import { Journal } from './assistants/journal';
import { ICrew } from './crews/contracts/crew';
import { SquadViolationError } from './exceptions/squad-violation-error';

/**
 * 冒险团
 *
 * 管理所有伙伴的召集流程：建立羁绊、编入队伍、召唤伙伴、与伙伴分别。
 */
class Squad {
  /**
   * 伙伴花名册
   * @description 存储所有入队伙伴的登记簿，key 为伙伴名字，value 为伙伴实例
   */
  private static Crews: Map<string, ICrew> = new Map();

  /**
   * 建立羁绊
   *
   * 创建伙伴实例，登记花名册。
   * 此时伙伴已创建但尚未激活，不可被召唤。
   *
   * @param roster 伙伴名字（来自花名册）
   * @param Constructor 伙伴构造函数
   * @returns 伙伴实例
   */
  public static Bind<C extends ICrew>(roster: string, Constructor: new () => C): C {
    // 检查是否已建立羁绊
    if (this.Crews.has(roster)) {
      throw new SquadViolationError(`伙伴 ${roster} 已建立羁绊！请勿重复调用 Bind。`, 'SQUAD_DUPLICATE_BIND', {
        roster,
      });
    }

    // 创建伙伴实例
    const crew = new Constructor();
    this.Crews.set(roster, crew);

    // 为伙伴注入花名
    Object.defineProperty(crew, 'roster', {
      value: roster,
      configurable: false,
      enumerable: true,
      writable: false,
    });

    // 与伙伴建立羁绊
    crew.onBind();

    Journal.Info(`伙伴 ${roster} 建立羁绊！`);

    return crew;
  }

  /**
   * 编入队伍
   *
   * 激活伙伴，传递依赖。
   *
   * @param roster 伙伴名字（来自花名册）
   * @param deps 依赖参数列表
   */
  public static async Link(roster: string, ...deps: unknown[]): Promise<void> {
    const crew = this.Crews.get(roster);
    if (!crew) {
      throw new SquadViolationError(`伙伴 ${roster} 尚未建立羁绊！请先调用 Bind。`, 'SQUAD_NOT_BOUND', {
        name: roster,
      });
    }

    // 伙伴入列
    await crew.onLink.apply(crew, deps);

    Journal.Info(`伙伴 ${roster} 编入队伍！`);
  }

  /**
   * 召唤伙伴
   *
   * 根据名字召唤（解析）一个服务伙伴。
   *
   * @param roster 伙伴名字（来自花名册）
   * @returns 伙伴实例
   */
  public static Summon<T>(roster: string): T {
    const crew = this.Crews.get(roster);
    if (!crew) {
      throw new SquadViolationError(`伙伴 ${roster} 不在队中！请检查是否已建立羁绊并编入队伍。`, 'SQUAD_NOT_FOUND', {
        name: roster,
      });
    }
    return crew as T;
  }

  /**
   * 与伙伴分别
   *
   * 销毁伙伴，清理资源。
   *
   * @param roster 伙伴名字（来自花名册）
   */
  public static async Unlink(roster: string): Promise<void> {
    const crew = this.Crews.get(roster);
    if (!crew) {
      Journal.Warn(`伙伴 ${roster} 不在队中，无需分别。`);
      return;
    }

    // 与伙伴分别
    crew.onUnlink();

    this.Crews.delete(roster);

    Journal.Info(`与伙伴 ${roster} 分别！`);
  }

  /**
   * 检查伙伴是否在队中
   * @param name 伙伴名字
   * @returns 是否在队中
   */
  public static Has(name: string): boolean {
    return this.Crews.has(name);
  }

  /**
   * 获取当前伙伴数量
   * @returns 伙伴数量
   */
  public static Size(): number {
    return this.Crews.size;
  }
}

/**
 * 导出冒险团
 */
export { Squad };
