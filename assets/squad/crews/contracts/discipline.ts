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
  original: Error;
}

/**
 * 风纪官接口
 *
 * 负责全局异常的捕获与统一格式化。
 * 风纪官只负责发现异常和格式化，不负责记录或上报。
 *
 * @description 技术实现：全局错误监听器
 */
export interface IDiscipline {
  // 接口为空，风纪官自动工作，无需外部调用
}
