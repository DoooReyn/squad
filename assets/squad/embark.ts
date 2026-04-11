/**
 * 启程
 *
 * 冒险团的出发点，所有伙伴（服务）的统一入队地点。
 * 在这里，我们按顺序召集伙伴，为冒险之旅做好准备。
 */

import { sys } from 'cc';

import { Journal } from './assistants/journal';
import { ROSTER } from './registry/roster';
import { Squad } from './squad';

/**
 * 启程！
 *
 * 召集所有伙伴，准备冒险。
 * 注意：召集顺序很重要，被依赖的伙伴必须先召集！
 */
export function embark(): void {
  Journal.ColorOutputEnabled = sys.isBrowser;
  Journal.Info('冒险启程，开始召集伙伴...');

  // 第一阶段：基础伙伴
  // TODO: 召集 EventManager
  // Squad.Enlist(ROSTER.EVENT_MANAGER, new EventManager());

  // 第二阶段：依赖基础伙伴的其他成员
  // TODO: 召集更多伙伴

  Journal.Info(`伙伴召集完毕！当前队员：${Squad.Size()} 人`);
  Journal.Info('冒险开始！');
}

/**
 * 导出供外部使用
 */
export { Squad };
export { ROSTER };
export { Journal };

window['embark'] = embark;

window['Journal'] = Journal;
