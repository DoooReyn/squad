/**
 * 启程
 *
 * 冒险团的出发点，所有伙伴（服务）的统一召集地点。
 * 在这里，我们按顺序召集伙伴，为冒险之旅做好准备。
 */

import { sys } from 'cc';

import { Journal } from './assistants/journal';
import { Beacon } from './crews/beacon';
import { IBeacon } from './crews/contracts/beacon';
import { IDiscipline } from './crews/contracts/discipline';
import { Discipline } from './crews/discipline';
import { Shadow } from './crews/shadow';
import { Steward } from './crews/steward';
import { ROSTER } from './registry/roster';
import { Squad } from './squad';

/**
 * 启程！
 *
 * 召集所有伙伴，准备冒险。
 * 注意：召集顺序很重要，被依赖的伙伴必须先召集！
 */
export async function embark(): Promise<void> {
  Journal.ColorOutputEnabled = sys.isBrowser;
  Journal.Info('冒险启程，开始召集伙伴...');

  // 第一阶段：基础伙伴
  // 1. 建立羁绊
  Squad.Bind(ROSTER.SHADOW, Shadow);
  Squad.Bind(ROSTER.DISCIPLINE, Discipline);
  Squad.Bind(ROSTER.BEACON, Beacon);
  Squad.Bind(ROSTER.STEWARD, Steward);

  // 2. 编入队伍
  await Squad.Link(ROSTER.SHADOW);
  await Squad.Link(ROSTER.DISCIPLINE);
  await Squad.Link(ROSTER.BEACON);
  await Squad.Link(ROSTER.STEWARD);

  // 3. 伙伴协作
  // 3.1 风纪官与信标连接，风纪官捕获的错误交给信标上报
  const discipline = Squad.Summon<IDiscipline>(ROSTER.DISCIPLINE);
  const beacon = Squad.Summon<IBeacon>(ROSTER.BEACON);
  discipline.setErrorHandler((error) => {
    beacon.report({ type: 'error', data: error });
  });

  Journal.Info(`伙伴召集完毕！当前伙伴：${Squad.Size()} 人`);
  Journal.Info('冒险开始！');
}

/**
 * 导出供外部使用
 */
export { Squad };
export { ROSTER };
export { Journal };
