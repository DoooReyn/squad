/**
 * 风纪官契约
 *
 * 定义风纪官伙伴的异常监听接口。
 */

/**
 * 统一的错误信息
 */
export interface DisciplinaryError {
  /** 错误类型 */
  type: 'error' | 'unhandledRejection' | 'native-error';
  /** 错误消息 */
  message: string;
  /** 错误堆栈 */
  stack?: string;
  /** 文件名 */
  filename?: string;
  /** 行号 */
  lineno?: number;
  /** 列号 */
  colno?: number;
  /** 原始错误对象 */
  original: Error | null;
}

/**
 * 错误处理函数
 */
export type ErrorHandler = (error: DisciplinaryError) => void;

/**
 * 风纪官接口
 *
 * 负责全局异常的捕获与统一格式化。
 * 风纪官只负责发现异常和格式化，不负责记录或上报。
 *
 * @description 技术实现：全局错误监听器
 */
export interface IDiscipline {
  /**
   * 设置错误处理器
   *
   * 设置一个回调函数，当捕获到错误时会被调用。
   * 可以用于接入信标等上报伙伴。
   *
   * @param handler - 错误处理函数
   *
   * @example
   * ```typescript
   * discipline.setErrorHandler((error) => {
   *   beacon.report({ type: 'error', data: error });
   * });
   * ```
   */
  setErrorHandler(handler: ErrorHandler | null): void;
}
