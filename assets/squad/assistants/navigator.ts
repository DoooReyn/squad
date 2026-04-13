/**
 * 领航员
 *
 * 冒险团的导航助手，帮助在代码的迷雾中安全航行。
 * 提供 Rust 风格的 Result 和 Option 类型，让错误处理更加优雅。
 *
 * **技能：安全导航**
 * - Result：处理可能失败的操作
 * - Option：处理可能为空的值
 * - Try：包装可能抛出异常的函数
 *
 * **性格：**
 * - 谨慎细心，绝不冒险
 * - 指引方向，避免迷失
 * - 类型安全，值得信赖
 */

import { SquadViolationError } from '../exceptions/squad-violation-error';

/**
 * 结果类型
 *
 * 表示操作可能成功或失败，成功时包含值，失败时包含错误。
 */
export class Result<T, E> {
  private readonly _value: T | null;
  private readonly _error: E | null;
  private readonly _isOk: boolean;

  /**
   * 私有构造函数
   */
  private constructor(value: T | null, error: E | null, isOk: boolean) {
    this._value = value;
    this._error = error;
    this._isOk = isOk;
  }

  /**
   * 创建成功结果
   */
  public static Ok<T, E>(value: T): Result<T, E> {
    return new Result(value, null, true);
  }

  /**
   * 创建失败结果
   */
  public static Err<T, E>(error: E): Result<T, E> {
    return new Result(null, error, false);
  }

  /**
   * 是否成功
   */
  public isOk(): this is Result<T, E> & { _value: T } {
    return this._isOk;
  }

  /**
   * 是否失败
   */
  public isErr(): this is Result<T, E> & { _error: E } {
    return !this._isOk;
  }

  /**
   * 解包值（成功时）
   *
   * @throws 如果是失败结果，抛出错误
   */
  public unwrap(): T {
    if (this._isOk) {
      return this._value as T;
    }
    throw new Error('Called unwrap on Err result');
  }

  /**
   * 解包值或返回默认值
   */
  public unwrapOr(defaultValue: T): T {
    return this._isOk ? (this._value as T) : defaultValue;
  }

  /**
   * 解包错误（失败时）
   *
   * @throws 如果是成功结果，抛出错误
   */
  public unwrapErr(): E {
    if (!this._isOk) {
      return this._error as E;
    }
    throw new Error('Called unwrapErr on Ok result');
  }

  /**
   * 映射值
   */
  public map<U>(fn: (value: T) => U): Result<U, E> {
    if (this._isOk) {
      return Result.Ok(fn(this._value as T));
    }
    return Result.Err(this._error as E) as unknown as Result<U, E>;
  }

  /**
   * 映射错误
   */
  public mapErr<F>(fn: (error: E) => F): Result<T, F> {
    if (!this._isOk) {
      return Result.Err(fn(this._error as E));
    }
    return Result.Ok(this._value as T) as unknown as Result<T, F>;
  }

  /**
   * 链接另一个可能失败的操作
   */
  public andThen<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    if (this._isOk) {
      return fn(this._value as T);
    }
    return Result.Err(this._error as E) as unknown as Result<U, E>;
  }

  /**
   * 失败时执行备用操作
   */
  public orElse<F>(fn: (error: E) => Result<T, F>): Result<T, F> {
    if (!this._isOk) {
      return fn(this._error as E);
    }
    return Result.Ok(this._value as T) as unknown as Result<T, F>;
  }

  /**
   * 模式匹配
   */
  public match(pattern: { ok: (value: T) => void; err: (error: E) => void }): void {
    if (this._isOk) {
      pattern.ok(this._value as T);
    } else {
      pattern.err(this._error as E);
    }
  }
}

/**
 * 可选类型
 *
 * 表示值可能存在或不存在。
 */
export class Option<T> {
  private readonly _value: T | null;
  private readonly _isSome: boolean;

  /**
   * 私有构造函数
   */
  private constructor(value: T | null, isSome: boolean) {
    this._value = value;
    this._isSome = isSome;
  }

  /**
   * 创建包含值的选项
   */
  public static Some<T>(value: T): Option<T> {
    return new Option(value, true);
  }

  /**
   * 创建空选项
   */
  public static None<T>(): Option<T> {
    return new Option(null, false);
  }

  /**
   * 从可能为 null 的值创建选项
   */
  public static FromNullable<T>(value: T | null | undefined): Option<T> {
    return value !== null && value !== undefined ? Option.Some(value) : Option.None<T>();
  }

  /**
   * 是否包含值
   */
  public isSome(): this is Option<T> & { _value: T } {
    return this._isSome;
  }

  /**
   * 是否为空
   */
  public isNone(): boolean {
    return !this._isSome;
  }

  /**
   * 解包值
   *
   * @throws 如果是空选项，抛出错误
   */
  public unwrap(): T {
    if (this._isSome) {
      return this._value as T;
    }
    throw new Error('Called unwrap on None option');
  }

  /**
   * 解包值或返回默认值
   */
  public unwrapOr(defaultValue: T): T {
    return this._isSome ? (this._value as T) : defaultValue;
  }

  /**
   * 解包值或执行函数
   */
  public unwrapOrElse(fn: () => T): T {
    return this._isSome ? (this._value as T) : fn();
  }

  /**
   * 映射值
   */
  public map<U>(fn: (value: T) => U): Option<U> {
    if (this._isSome) {
      return Option.Some(fn(this._value as T));
    }
    return Option.None<U>();
  }

  /**
   * 过滤值
   */
  public filter(predicate: (value: T) => boolean): Option<T> {
    if (this._isSome && predicate(this._value as T)) {
      return this;
    }
    return Option.None<T>();
  }

  /**
   * 链接另一个可选操作
   */
  public andThen<U>(fn: (value: T) => Option<U>): Option<U> {
    if (this._isSome) {
      return fn(this._value as T);
    }
    return Option.None<U>();
  }

  /**
   * 返回备选选项
   */
  public or(alternative: Option<T>): Option<T> {
    return this._isSome ? this : alternative;
  }

  /**
   * 执行函数返回备选选项
   */
  public orElse(fn: () => Option<T>): Option<T> {
    return this._isSome ? this : fn();
  }

  /**
   * 转换为结果类型
   */
  public toResult<E>(error: E): Result<T, E> {
    if (this._isSome) {
      return Result.Ok(this._value as T);
    }
    return Result.Err(error);
  }

  /**
   * 转换为可能为 null 的值
   */
  public someOrNull(): T | null {
    return this._isSome ? (this._value as T) : null;
  }

  /**
   * 模式匹配
   */
  public match(pattern: { some: (value: T) => void; none: () => void }): void {
    if (this._isSome) {
      pattern.some(this._value as T);
    } else {
      pattern.none();
    }
  }
}

/**
 * 领航员
 *
 * 提供静态工具方法，帮助安全地处理可能出错的操作。
 */
export class Navigator {
  /**
   * 包装可能抛出异常的同步函数
   *
   * @param fn - 要执行的函数
   * @param thisArg - 函数执行的 this 上下文（可选）
   * @param args - 传递给函数的参数
   * @returns Result 包装的结果
   *
   * @example
   * ```typescript
   * // 无参数
   * const result = Navigator.Try(JSON.parse, null, jsonString);
   * result.match({
   *   ok: (data) => console.log('解析成功', data),
   *   err: (error) => console.error('解析失败', error),
   * });
   *
   * // 带参数
   * const result2 = Navigator.Try(obj.method, obj, arg1, arg2);
   * ```
   */
  public static Try<F extends (...args: any[]) => any>(fn: F, thisArg?: ThisParameterType<F>, ...args: Parameters<F>): Result<ReturnType<F>, Error> {
    try {
      const value = thisArg === undefined ? fn(...args) : fn.apply(thisArg, args);
      return Result.Ok(value);
    } catch (error) {
      return Result.Err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * 包装可能抛出异常的异步函数
   *
   * @param fn - 要执行的异步函数
   * @param thisArg - 函数执行的 this 上下文（可选）
   * @param args - 传递给函数的参数
   * @returns Promise<Result 包装的结果
   *
   * @example
   * ```typescript
   * // 无参数
   * const result = await Navigator.TryAsync(fetch, null, url);
   * result.match({
   *   ok: (data) => console.log('获取成功', data),
   *   err: (error) => console.error('获取失败', error),
   * });
   *
   * // 带参数
   * const result2 = await Navigator.TryAsync(obj.asyncMethod, obj, arg1, arg2);
   * ```
   */
  public static async TryAsync<F extends (...args: any[]) => Promise<any>>(
    fn: F,
    thisArg?: ThisParameterType<F>,
    ...args: Parameters<F>
  ): Promise<Result<Awaited<ReturnType<F>>, Error>> {
    try {
      const value = thisArg === undefined ? await fn(...args) : await fn.apply(thisArg, args);
      return Result.Ok(value);
    } catch (error) {
      return Result.Err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * 创建包含值的选项
   */
  public static Some<T>(value: T): Option<T> {
    return Option.Some(value);
  }

  /**
   * 创建空选项
   */
  public static None<T>(): Option<T> {
    return Option.None();
  }

  /**
   * 从可能为 null 的值创建选项
   */
  public static FromNullable<T>(value: T | null | undefined): Option<T> {
    return Option.FromNullable(value);
  }

  /**
   * 包装 SquadViolationError
   *
   * @param fn - 可能抛出 SquadViolationError 的函数
   * @param thisArg - 函数执行的 this 上下文（可选）
   * @param args - 传递给函数的参数
   * @returns Result 包装的结果
   *
   * @example
   * ```typescript
   * const result = Navigator.SquadTry(validateData, null, data);
   * result.match({
   *   ok: (value) => console.log('验证成功', value),
   *   err: (error) => console.error('违反规则', error.code),
   * });
   * ```
   */
  public static SquadTry<F extends (...args: any[]) => any>(
    fn: F,
    thisArg?: ThisParameterType<F>,
    ...args: Parameters<F>
  ): Result<ReturnType<F>, SquadViolationError> {
    try {
      const value = thisArg === undefined ? fn(...args) : fn.apply(thisArg, args);
      return Result.Ok(value);
    } catch (error) {
      if (error instanceof SquadViolationError) {
        return Result.Err(error);
      }
      return Result.Err(
        new SquadViolationError(error instanceof Error ? error.message : String(error), 'UNKNOWN_ERROR', {
          original: error,
        })
      );
    }
  }

  /**
   * 包装可能抛出 SquadViolationError 的异步函数
   *
   * @param fn - 可能抛出 SquadViolationError 的异步函数
   * @param thisArg - 函数执行的 this 上下文（可选）
   * @param args - 传递给函数的参数
   * @returns Promise<Result 包装的结果
   *
   * @example
   * ```typescript
   * const result = await Navigator.SquadTryAsync(validateAsync, null, data);
   * result.match({
   *   ok: (value) => console.log('验证成功', value),
   *   err: (error) => console.error('违反规则', error.code),
   * });
   * ```
   */
  public static async SquadTryAsync<F extends (...args: any[]) => Promise<any>>(
    fn: F,
    thisArg?: ThisParameterType<F>,
    ...args: Parameters<F>
  ): Promise<Result<Awaited<ReturnType<F>>, SquadViolationError>> {
    try {
      const value = thisArg === undefined ? await fn(...args) : await fn.apply(thisArg, args);
      return Result.Ok(value);
    } catch (error) {
      if (error instanceof SquadViolationError) {
        return Result.Err(error);
      }
      return Result.Err(
        new SquadViolationError(error instanceof Error ? error.message : String(error), 'UNKNOWN_ERROR', {
          original: error,
        })
      );
    }
  }
}

/**
 * 导出类型别名，便于使用
 */
export type Ok<T> = Result<T, never>;
export type Err<E> = Result<never, E>;
export type Some<T> = Option<T>;
export type None = Option<never>;
