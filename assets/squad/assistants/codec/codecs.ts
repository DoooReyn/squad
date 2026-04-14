/**
 * 破译官
 *
 * 冒险团的数据转换专家，负责各种数据格式的编码和解码。
 * 他精通各种编码方式，为数据的存储和传输提供保障。
 *
 * **技能：数据转换**
 * - JSON 编解码
 * - Base64 编解码
 * - XOR 编解码
 * - 链式编解码：支持多个编解码器串联
 *
 * **性格：**
 * - 精通变换，形式多样
 * - 可靠高效，绝不丢失数据
 * - 链式组合，灵活多变
 */

import { Base64Codec } from './base64-codec';
import { JsonCodec } from './json-codec';
import { XorCodec } from './xor-codec';

/**
 * 编解码器接口
 *
 * 定义数据的编码和解码方式。
 */
export interface DataCodec<T> {
  /** 将数据编码为字符串 */
  encode(data: T): string;
  /** 将字符串解码为数据 */
  decode(raw: string): T;
}

/**
 * 链式编解码器
 *
 * 支持多个编解码器串联使用，编码时按顺序执行，解码时按逆序执行。
 *
 * @example
 * ```typescript
 * // 混合使用对象编解码器和类编解码器
 * const codec = chainCodecs<PlayerData>(
 *   JsonCodec,           // 对象编解码器
 *   Base64Codec,         // 对象编解码器
 *   new XorCodec('secret')  // 类编解码器
 * );
 * // 编码: PlayerData -> JSON -> Base64 -> XOR
 * // 解码: XOR -> Base64 -> JSON -> PlayerData
 * ```
 */
export class ChainedCodec<T> implements DataCodec<T> {
  /** 编解码器链 */
  private readonly codecs: DataCodec<any>[];

  /**
   * 构造函数
   *
   * @param codecs - 编解码器数组，编码时按顺序执行
   */
  public constructor(...codecs: DataCodec<any>[]) {
    this.codecs = codecs;
  }

  public encode(data: T): string {
    let result: any = data;
    for (const codec of this.codecs) {
      result = codec.encode(result);
    }
    return result;
  }

  public decode(raw: string): T {
    let result: any = raw;
    for (let i = this.codecs.length - 1; i >= 0; i--) {
      result = this.codecs[i].decode(result);
    }
    return result;
  }
}

/**
 * 创建链式编解码器
 *
 * 工厂函数，方便快速创建链式编解码器。
 *
 * @param codecs - 编解码器数组
 * @returns 链式编解码器
 *
 * @example
 * ```typescript
 * // 混合使用对象编解码器和类编解码器
 * const codec = chainCodecs<PlayerData>(
 *   JsonCodec,           // 对象编解码器
 *   Base64Codec,         // 对象编解码器
 *   new XorCodec('secret')  // 类编解码器（需要实例化）
 * );
 * ```
 */
export function chainCodecs<T>(...codecs: DataCodec<any>[]): DataCodec<T> {
  return new ChainedCodec<T>(...codecs);
}

export { JsonCodec, Base64Codec, XorCodec };
