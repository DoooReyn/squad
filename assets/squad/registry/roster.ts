/**
 * 花名册
 *
 * 冒险团所有伙伴（服务）的登记名册。
 * 每个伙伴都有唯一的名字，方便查找和召唤。
 */

/**
 * 伙伴花名册
 *
 * 所有服务伙伴的标识常量，全大写格式。
 */
export const ROSTER = {
  /**
   * 影子
   * @description 斥候伙伴，负责情报的收集与传递
   */
  SHADOW: 'Shadow',

  /**
   * 风纪官
   * @description 纪律维护者，负责全局异常的捕获与分发
   */
  DISCIPLINE: 'Discipline',

  /**
   * 信标
   * @description 数据上报专家，负责收集关键数据并上传服务器
   */
  BEACON: 'Beacon',

  /**
   * 管家
   * @description 存储管理专家，负责游戏数据的持久化存储
   */
  STEWARD: 'Steward',
} as const;
