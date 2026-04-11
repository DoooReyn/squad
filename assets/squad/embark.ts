/**
 * 启程
 *
 * 冒险团的出发点，所有伙伴（服务）的统一入队地点。
 * 在这里，我们按顺序召集伙伴，为冒险之旅做好准备。
 */

import { Squad } from './squad';
import { ROSTER } from './registry/roster';

/**
 * 启程！
 *
 * 召集所有伙伴，准备冒险。
 * 注意：召集顺序很重要，被依赖的伙伴必须先召集！
 */
export function embark(): void {
  console.log('[Squad] 冒险启程，开始召集伙伴...');

  // 第一阶段：基础伙伴
  // TODO: 召集 EventManager
  // Squad.enlist(ROSTER.EVENT_MANAGER, new EventManager());

  // 第二阶段：依赖基础伙伴的其他成员
  // TODO: 召集更多伙伴

  console.log(`[Squad] 伙伴召集完毕！当前队员：${Squad.size()} 人`);
  console.log('[Squad] 冒险开始！');
}

/**
 * 导出 Squad 和花名册，供外部使用
 */
export { Squad };
export { ROSTER };
