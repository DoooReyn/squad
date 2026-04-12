/**
 * 冒险团违规错误
 *
 * 当违反冒险团规则时抛出此错误。
 */

/**
 * 冒险团违规错误
 *
 * 用于标识违反冒险团操作规范的行为。
 */
export class SquadViolationError extends Error {
  /**
   * 错误码
   * @description 错误的唯一标识符
   */
  public readonly code: string;

  /**
   * 上下文信息
   * @description 错误发生时的相关上下文数据
   */
  public readonly context: Record<string, unknown>;

  /**
   * 构造函数
   * @param message 错误消息
   * @param code 错误码
   * @param context 上下文信息
   */
  public constructor(message: string, code: string, context: Record<string, unknown> = {}) {
    super(message);
    this.name = 'SquadViolationError';
    this.code = code;
    this.context = context;

    // 维护正确的堆栈跟踪（仅在 V8 引擎中需要）
    (Error as unknown as any).captureStackTrace?.(this, SquadViolationError);
  }
}
