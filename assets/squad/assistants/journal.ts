/**
 * 记录官
 *
 * 负责记录冒险团的一切日志，提供分类与分级功能。
 */

/* eslint-disable no-console -- Journal 是日志工具，需要使用 console 方法 */

/**
 * 日志分类
 *
 * 按功能模块划分的日志类别。
 */
export enum LogCategory {
  /** 系统日志 */
  SYSTEM = 'SYSTEM',
  /** 战斗日志 */
  BATTLE = 'BATTLE',
  /** UI 日志 */
  UI = 'UI',
  /** 网络日志 */
  NETWORK = 'NETWORK',
  /** 资源日志 */
  ASSET = 'ASSET',
}

/**
 * 日志分级
 *
 * 按重要程度划分的日志级别。
 */
export enum LogLevel {
  /** 调试信息：开发时使用，生产环境关闭 */
  DEBUG = 'DEBUG',
  /** 一般信息：常规操作记录 */
  INFO = 'INFO',
  /** 警告：潜在问题，不影响运行 */
  WARN = 'WARN',
  /** 错误：错误发生，功能受影响 */
  ERROR = 'ERROR',
  /** 致命错误：严重错误，可能崩溃 */
  FATAL = 'FATAL',
}

/**
 * 日志实例
 *
 * 每个 LogCategory 对应一个日志实例，有独立的级别控制。
 */
class Logger {
  /**
   * 日志级别
   * @description 此日志实例的输出级别，低于此级别的日志不会输出
   */
  private _level: LogLevel;

  /**
   * 日志分类
   * @description 此日志实例所属的分类
   */
  private readonly _category: LogCategory;

  /**
   * 构造函数
   * @param category 日志分类
   */
  constructor(category: LogCategory) {
    this._category = category;
    this._level = LogLevel.DEBUG;
  }

  /**
   * 设置日志级别
   * @param level 日志级别
   */
  public setLevel(level: LogLevel): void {
    this._level = level;
  }

  /**
   * 获取日志级别
   * @returns 当前日志级别
   */
  public getLevel(): LogLevel {
    return this._level;
  }

  /**
   * 输出日志
   * @param level 日志级别
   * @param title 日志标题
   * @param data 附加数据（可变参数）
   */
  public log(level: LogLevel, title: string, ...data: unknown[]): void {
    // 检查实例级别
    if (!this._shouldOutputAtInstanceLevel(level)) {
      return;
    }

    // 检查主级别（由 Journal 控制）
    if (!Journal.ShouldOutputAtMainLevel(level)) {
      return;
    }

    // 输出到控制台
    this._outputToConsole(level, title, ...data);
  }

  /**
   * 判断是否应该在实例级别输出
   * @param level 日志级别
   * @returns 是否应该输出
   */
  private _shouldOutputAtInstanceLevel(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.FATAL];
    const levelIndex = levels.indexOf(level);
    const minIndex = levels.indexOf(this._level);
    return levelIndex >= minIndex;
  }

  /**
   * 输出到控制台
   * @param level 日志级别
   * @param title 日志标题
   * @param data 附加数据（可变参数）
   */
  private _outputToConsole(level: LogLevel, title: string, ...data: unknown[]): void {
    const timestamp = new Date().toLocaleTimeString();
    const header = `[${this._category} | ${level} | ${timestamp}]`;

    // 检查是否应该使用彩色输出
    const useColor = Journal.ColorOutputEnabled;

    switch (level) {
      case LogLevel.DEBUG:
        if (useColor) {
          console.debug(
            `%c${header} %c${title}`,
            `color: ${Journal.LevelColors[level]}; font-weight: bold`,
            '',
            ...data
          );
        } else {
          console.debug(header, title, ...data);
        }
        break;
      case LogLevel.INFO:
        if (useColor) {
          console.info(
            `%c${header} %c${title}`,
            `color: ${Journal.LevelColors[level]}; font-weight: bold`,
            '',
            ...data
          );
        } else {
          console.info(header, title, ...data);
        }
        break;
      case LogLevel.WARN:
        if (useColor) {
          console.warn(
            `%c${header} %c${title}`,
            `color: ${Journal.LevelColors[level]}; font-weight: bold`,
            '',
            ...data
          );
        } else {
          console.warn(header, title, ...data);
        }
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        if (useColor) {
          console.error(
            `%c${header} %c${title}`,
            `color: ${Journal.LevelColors[level]}; font-weight: bold`,
            '',
            ...data
          );
        } else {
          console.error(header, title, ...data);
        }
        break;
    }
  }

  // ========== 便捷方法 ==========

  /**
   * 调试日志
   */
  public debug(title: string, ...data: unknown[]): void {
    this.log(LogLevel.DEBUG, title, ...data);
  }

  /**
   * 信息日志
   */
  public info(title: string, ...data: unknown[]): void {
    this.log(LogLevel.INFO, title, ...data);
  }

  /**
   * 警告日志
   */
  public warn(title: string, ...data: unknown[]): void {
    this.log(LogLevel.WARN, title, ...data);
  }

  /**
   * 错误日志
   */
  public error(title: string, ...data: unknown[]): void {
    this.log(LogLevel.ERROR, title, ...data);
  }

  /**
   * 致命错误日志
   */
  public fatal(title: string, ...data: unknown[]): void {
    this.log(LogLevel.FATAL, title, ...data);
  }
}

/**
 * 记录官
 *
 * 管理所有日志实例，提供全局控制。
 */
class Journal {
  /**
   * 主日志级别
   * @description 全局最低输出级别，所有日志实例都受此限制
   */
  private static MainLevel: LogLevel = LogLevel.DEBUG;

  /**
   * 日志实例容器
   * @description 存储所有日志实例，key 为分类，value 为日志实例
   */
  private static Loggers: Map<LogCategory, Logger> = new Map();

  /**
   * 彩色输出启用
   * @description 用户设置的彩色输出开关
   */
  public static ColorOutputEnabled: boolean = true;

  /**
   * 日志级别颜色映射
   * @description 不同级别对应的控制台颜色
   */
  public static readonly LevelColors: Record<LogLevel, string> = {
    [LogLevel.DEBUG]: '#888888', // 灰色
    [LogLevel.INFO]: '#4CAF50', // 绿色
    [LogLevel.WARN]: '#FF9800', // 橙色
    [LogLevel.ERROR]: '#F44336', // 红色
    [LogLevel.FATAL]: '#D32F2F', // 深红色
  };

  /**
   * 设置主日志级别
   * @param level 主日志级别
   */
  public static SetMainLevel(level: LogLevel): void {
    this.MainLevel = level;
  }

  /**
   * 获取主日志级别
   * @returns 主日志级别
   */
  public static GetMainLevel(): LogLevel {
    return this.MainLevel;
  }

  /**
   * 判断是否应该在主级别输出
   * @param level 日志级别
   * @returns 是否应该输出
   */
  public static ShouldOutputAtMainLevel(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.FATAL];
    const levelIndex = levels.indexOf(level);
    const minIndex = levels.indexOf(this.MainLevel);
    return levelIndex >= minIndex;
  }

  /**
   * 获取日志实例
   *
   * 根据分类获取对应的日志实例，如果不存在则自动创建。
   * @param category 日志分类
   * @returns 日志实例
   */
  public static Acquire(category: LogCategory): Logger {
    if (!this.Loggers.has(category)) {
      this.Loggers.set(category, new Logger(category));
    }
    return this.Loggers.get(category)!;
  }

  /**
   * 设置某个分类的日志级别
   * @param category 日志分类
   * @param level 日志级别
   */
  public static SetCategoryLevel(category: LogCategory, level: LogLevel): void {
    const logger = this.Acquire(category);
    logger.setLevel(level);
  }

  // ========== 通用快捷方法（使用 SYSTEM 分类） ==========

  /**
   * 调试日志
   */
  public static Debug(title: string, ...data: unknown[]): void {
    this.Acquire(LogCategory.SYSTEM).debug(title, ...data);
  }

  /**
   * 信息日志
   */
  public static Info(title: string, ...data: unknown[]): void {
    this.Acquire(LogCategory.SYSTEM).info(title, ...data);
  }

  /**
   * 警告日志
   */
  public static Warn(title: string, ...data: unknown[]): void {
    this.Acquire(LogCategory.SYSTEM).warn(title, ...data);
  }

  /**
   * 错误日志
   */
  public static Error(title: string, ...data: unknown[]): void {
    this.Acquire(LogCategory.SYSTEM).error(title, ...data);
  }

  /**
   * 致命错误日志
   */
  public static Fatal(title: string, ...data: unknown[]): void {
    this.Acquire(LogCategory.SYSTEM).fatal(title, ...data);
  }
}

/**
 * 导出记录官和日志实例
 */
export { Journal, Logger };
