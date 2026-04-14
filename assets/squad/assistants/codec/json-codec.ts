import { Navigator } from '../navigator';

/**
 * JSON 编解码器
 *
 * 将 JavaScript 对象转换为 JSON 字符串，支持嵌套对象和数组。
 *
 * @example
 * ```typescript
 * const json = JsonCodec.encode({ name: 'Player', level: 5 });
 * const data = JsonCodec.decode<{ name: string; level: number }>(json);
 * ```
 */
const JsonCodec = {
  /**
   * 将数据编码为 JSON 字符串
   *
   * @param data - 要编码的数据
   * @returns JSON 字符串，编码失败返回 '{}'
   */
  encode<T>(data: T): string {
    return Navigator.Try(JSON.stringify, null, data).unwrapOr('{}');
  },

  /**
   * 将 JSON 字符串解码为数据
   *
   * @param raw - JSON 字符串
   * @returns 解码后的数据，解码失败返回 null
   */
  decode<T>(raw: string): T {
    return Navigator.Try(JSON.parse, null, raw).unwrapOr(null);
  },
};

export { JsonCodec };
