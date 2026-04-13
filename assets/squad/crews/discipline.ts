/**
 * 风纪官
 *
 * 冒险团的纪律维护者，默默站在所有团员的身后。
 * 敏锐捕捉所有异常状态，为冒险团的正常运转保驾护航。
 *
 * **技能：异常监听**
 * - 捕获：全局错误（同步/异步）
 * - 格式化：统一错误信息格式
 * - 上报：未来接入上报专员
 *
 * **性格：**
 * - 沉默寡言，目光如炬
 * - 严谨细致，绝不放过任何异常
 * - 默默守护，不可或缺
 */

import { sys } from 'cc';

import { Navigator } from '../assistants/navigator';
import { ICrew } from './contracts/crew';
import { DisciplinaryError, ErrorHandler, IDiscipline } from './contracts/discipline';

/**
 * 风纪官
 *
 * 冒险团的纪律维护者，负责全局异常的捕获与统一格式化。
 * 风纪官只负责发现异常和格式化，不负责记录或上报。
 *
 * @description 技术实现：window.onerror + window.onunhandledrejection
 */
class Discipline implements ICrew, IDiscipline {
  private _active: boolean;

  /**
   * 错误处理器（用于上报）
   */
  private _errorHandler: ErrorHandler | null;

  /**
   * 原始错误处理器（用于恢复）
   */
  private _originalOnError: typeof window.onerror;
  private _originalOnUnhandledRejection: typeof window.onunhandledrejection;
  private _originalNativeOnError: (name: string, line: number, msg: string, stack: string) => void;

  declare public readonly roster: string;

  /**
   * 构造函数
   *
   * 风纪官诞生，准备监听异常。
   */
  public constructor() {
    this._active = false;
    this._errorHandler = null;
    this._originalOnError = null;
    this._originalOnUnhandledRejection = null;
    this._originalNativeOnError = null;
  }

  public get isActive(): boolean {
    return this._active;
  }

  /**
   * 建立羁绊时调用
   *
   * 风纪官悄然出现，准备建立监听网络。
   */
  public onBind(): void {
    if (this._active) {
      return;
    }

    this._active = true;
  }

  /**
   * 编入队伍时调用
   *
   * 风纪官开始工作，注册全局错误监听。
   */
  public async onLink(): Promise<void> {
    // 保存原始处理器
    this._originalOnError = window.onerror;
    this._originalOnUnhandledRejection = window.onunhandledrejection;

    // 注册全局错误监听
    window.onerror = this._handleError.bind(this);
    window.onunhandledrejection = this._handleRejection.bind(this);

    if (sys.isNative) {
      // 待验证
      this._originalNativeOnError = (window as any).__errorHandler;
      (window as any).__errorHandler = this._handleNativeError.bind(this);
    }
  }

  /**
   * 与伙伴分别时调用
   *
   * 风纪官悄然离开，恢复原始错误处理器。
   */
  public onUnlink(): void {
    // 恢复原始处理器
    if (this._originalOnError !== null) {
      window.onerror = this._originalOnError;
      this._originalOnError = null;
    }
    if (this._originalOnUnhandledRejection !== null) {
      window.onunhandledrejection = this._originalOnUnhandledRejection;
      this._originalOnUnhandledRejection = null;
    }
    if (this._originalNativeOnError) {
      (window as any).__errorHandler = this._originalNativeOnError;
      this._originalOnUnhandledRejection = null;
    }

    this._active = false;
  }

  /**
   * 处理同步错误
   */
  private _handleError(message: string, filename: string, lineno: number, colno: number, error?: Error): boolean {
    const err = error || new Error(message);

    // 包装成统一格式
    const disciplinaryError: DisciplinaryError = {
      type: 'error',
      message: err.message,
      stack: err.stack,
      filename,
      lineno,
      colno,
      original: err,
    };

    this._notify(disciplinaryError);
    return true; // 阻止默认错误处理
  }

  /**
   * 处理 Promise rejection
   */
  private _handleRejection(event: PromiseRejectionEvent): void {
    const err = event.reason instanceof Error ? event.reason : new Error(String(event.reason));

    // 包装成统一格式
    const disciplinaryError: DisciplinaryError = {
      type: 'unhandledRejection',
      message: err.message,
      stack: err.stack,
      original: err,
    };

    this._notify(disciplinaryError);
    event.preventDefault(); // 阻止默认控制台输出
  }

  /**
   * 处理原生错误
   */
  private _handleNativeError(name: string, line: number, msg: string, stack: string) {
    const disciplinaryError: DisciplinaryError = {
      type: 'native-error',
      filename: name,
      lineno: line,
      message: msg,
      stack,
      original: null,
    };
    this._notify(disciplinaryError);
  }

  /**
   * 通知上报专员
   *
   * 将错误信息传递给错误处理器（如信标）。
   */
  private _notify(error: DisciplinaryError): void {
    if (this._errorHandler) {
      Navigator.Try(this._errorHandler, undefined, error);
    }
  }

  /**
   * 设置错误处理器
   *
   * @param handler - 错误处理函数（null 表示清除）
   */
  public setErrorHandler(handler: ErrorHandler | null): void {
    this._errorHandler = handler;
  }
}

/**
 * 导出风纪官伙伴
 */
export { Discipline };
