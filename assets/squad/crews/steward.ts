/**
 * 管家
 *
 * 冒险团的存储管理专家，负责游戏数据的持久化存储。
 * 他默默守护着所有重要的数据，确保数据安全可靠。
 *
 * **技能：数据存储**
 * - 数据模板：类型安全的存储定义
 * - 自动保存：使用 Proxy 实现变化自动保存
 * - 编解码：支持自定义编解码器
 * - 版本迁移：健壮的渐进式迁移机制
 *
 * **性格：**
 * - 细心周到，一丝不苟
 * - 默默守护，值得信赖
 * - 井井有条，从不遗忘
 */

import { sys } from 'cc';

import { Journal } from '../assistants/journal';
import { Navigator } from '../assistants/navigator';
import { SquadViolationError } from '../exceptions/squad-violation-error';
import { ICrew } from './contracts/crew';
import { DataCodec, DataSchema, ISteward } from './contracts/steward';

/**
 * 默认 JSON 编解码器
 *
 * 直接调用 JSON.stringify/parse，错误由上层 save/_loadFromStorage 处理。
 */
class JsonCodec<T> implements DataCodec<T> {
  public encode(data: T): string {
    return JSON.stringify(data);
  }

  public decode(raw: string): T {
    return JSON.parse(raw) as T;
  }
}

/**
 * 管家
 *
 * 冒险团的存储管理专家，负责游戏数据的持久化存储。
 * 通过数据模板注册提供类型安全，使用 Proxy 实现自动保存。
 */
class Steward implements ICrew, ISteward {
  private _active: boolean;

  /**
   * 数据模板映射表
   */
  private _schemas: Map<string, DataSchema<any>>;

  /**
   * 数据内存缓存
   */
  private _data: Map<string, any>;

  /**
   * 代理对象缓存
   */
  private _proxies: Map<string, any>;

  /**
   * 编解码器映射表
   */
  private _codecs: Map<string, DataCodec<any>>;

  /**
   * 默认编解码器
   */
  private _defaultCodec: DataCodec<any>;

  /**
   * 正在保存的数据集合（防止重复保存）
   */
  private _savingKeys: Set<string>;

  /**
   * 统一自动保存定时器
   */
  private _saveTimer: number | null;

  /**
   * 待保存的键名集合
   */
  private _pendingSaveKeys: Set<string>;

  declare public readonly roster: string;

  /**
   * 构造函数
   *
   * 管家诞生，准备管理数据。
   */
  public constructor() {
    this._active = false;
    this._schemas = new Map();
    this._data = new Map();
    this._proxies = new Map();
    this._codecs = new Map();
    this._defaultCodec = new JsonCodec();
    this._savingKeys = new Set();
    this._pendingSaveKeys = new Set();
    this._saveTimer = null;
  }

  public get isActive(): boolean {
    return this._active;
  }

  /**
   * 建立羁绊时调用
   *
   * 管家悄然出现，准备管理数据。
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
   * 管家开始工作，准备存储数据。
   */
  public async onLink(): Promise<void> {
    // 管家无需特殊初始化
    Journal.Debug('[管家] 已就位，随时为您服务');
  }

  /**
   * 与伙伴分别时调用
   *
   * 管家悄然离开，确保所有数据已保存。
   */
  public onUnlink(): void {
    // 保存所有数据
    this.saveAll();

    // 清理定时器
    if (this._saveTimer !== null) {
      clearTimeout(this._saveTimer);
      this._saveTimer = null;
    }
    this._pendingSaveKeys.clear();

    this._active = false;
  }

  /**
   * 注册数据模板
   *
   * @param schema - 数据模板定义
   */
  public register<T>(schema: DataSchema<T>): void {
    if (this._schemas.has(schema.key)) {
      Journal.Warn(`[管家] 数据模板已存在: ${schema.key}`);
      return;
    }

    this._schemas.set(schema.key, schema);

    // 尝试从存储加载
    const loaded = this._loadFromStorage(schema);
    this._data.set(schema.key, loaded);

    Journal.Debug(`[管家] 注册数据模板: ${schema.key} (v${schema.version})`);
  }

  /**
   * 获取数据（返回代理对象，变化自动保存）
   *
   * @param key - 存储键名
   * @returns 代理后的数据对象
   */
  public get<T>(key: string): T {
    let proxy = this._proxies.get(key);

    if (!proxy) {
      const data = this._data.get(key);
      if (!data) {
        throw new SquadViolationError(`数据模板未注册: ${key}`, 'STEWARD_SCHEMA_NOT_REGISTERED', { key });
      }

      // 创建 Proxy
      proxy = this._createProxy(key, data);
      this._proxies.set(key, proxy);
    }

    return proxy;
  }

  /**
   * 手动保存指定数据
   *
   * @param key - 存储键名
   */
  public async save(key: string): Promise<void> {
    // 防止重复保存
    if (this._savingKeys.has(key)) {
      return;
    }

    this._savingKeys.add(key);

    const result = Navigator.Try(() => {
      const schema = this._schemas.get(key);
      const data = this._data.get(key);

      if (!schema || !data) {
        return;
      }

      // 添加版本号
      const toSave = { ...data, _version: schema.version };

      // 编码
      const codec = this._codecs.get(key) || this._defaultCodec;
      const encoded = codec.encode(toSave);

      // 保存到 localStorage
      sys.localStorage.setItem(key, encoded);

      Journal.Debug(`[管家] 数据已保存: ${key}`);
    });

    result.match({
      ok: () => {},
      err: (error) => Journal.Error(`[管家] 保存失败: ${key}`, error),
    });

    this._savingKeys.delete(key);
  }

  /**
   * 保存所有已注册的数据
   */
  public async saveAll(): Promise<void> {
    const keys = Array.from(this._schemas.keys());
    await Promise.all(keys.map((key) => this.save(key)));
  }

  /**
   * 设置指定数据的编解码器
   *
   * @param key - 存储键名
   * @param codec - 编解码器
   */
  public setCodec<T>(key: string, codec: DataCodec<T>): void {
    this._codecs.set(key, codec);
    Journal.Debug(`[管家] 设置编解码器: ${key}`);
  }

  /**
   * 设置全局默认编解码器
   *
   * @param codec - 编解码器
   */
  public setDefaultCodec(codec: DataCodec<any>): void {
    this._defaultCodec = codec;
    Journal.Debug('[管家] 设置默认编解码器');
  }

  /**
   * 检查数据是否存在
   *
   * @param key - 存储键名
   * @returns 是否存在
   */
  public has(key: string): boolean {
    return this._schemas.has(key);
  }

  /**
   * 删除指定数据
   *
   * @param key - 存储键名
   */
  public delete(key: string): void {
    // 从存储中删除
    sys.localStorage.removeItem(key);

    // 从内存中删除
    this._schemas.delete(key);
    this._data.delete(key);
    this._proxies.delete(key);
    this._codecs.delete(key);

    Journal.Debug(`[管家] 数据已删除: ${key}`);
  }

  /**
   * 清空所有数据
   */
  public clear(): void {
    // 删除所有存储数据
    for (const key of this._schemas.keys()) {
      sys.localStorage.removeItem(key);
    }

    // 清空内存
    this._schemas.clear();
    this._data.clear();
    this._proxies.clear();
    this._codecs.clear();

    Journal.Debug('[管家] 所有数据已清空');
  }

  /**
   * 从存储加载数据（带迁移）
   *
   * @param schema - 数据模板
   * @returns 加载的数据
   */
  private _loadFromStorage<T>(schema: DataSchema<T>): T {
    const raw = sys.localStorage.getItem(schema.key);

    if (!raw) {
      // 首次使用，返回默认值
      return schema.defaults();
    }

    return Navigator.Try(() => {
      const stored = JSON.parse(raw);
      const storedVersion = (stored as any)._version || 1;

      if (storedVersion < schema.version) {
        // 需要迁移
        return this._migrate(stored, schema);
      }

      return stored;
    }).unwrapOr(schema.defaults());
  }

  /**
   * 迁移数据
   *
   * @param stored - 存储的旧数据
   * @param schema - 数据模板
   * @returns 迁移后的数据
   */
  private _migrate<T>(stored: any, schema: DataSchema<T>): T {
    const currentVersion = stored._version || 1;

    let data: any = stored;
    for (let v = currentVersion; v < schema.version; v++) {
      const migrate = schema.migrations?.[v];
      if (migrate) {
        const result = Navigator.Try(migrate, undefined, data);
        result.match({
          ok: (migrated) => {
            data = migrated;
            Journal.Debug(`[管家] 迁移数据: ${schema.key} v${v} -> v${v + 1}`);
          },
          err: (error) => {
            Journal.Error(`[管家] 迁移失败: ${schema.key} v${v} -> v${v + 1}`, error);
          },
        });
      }
    }

    // 标记新版本
    data._version = schema.version;
    return data as T;
  }

  /**
   * 创建代理对象
   *
   * @param key - 存储键名
   * @param target - 目标对象
   * @returns 代理对象
   */
  private _createProxy<T>(key: string, target: T): T {
    const self = this;

    return new Proxy(target as object, {
      set(obj, prop, value) {
        // 设置值
        (obj as any)[prop] = value;

        // 触发自动保存
        self._scheduleAutoSave(key);

        return true;
      },

      deleteProperty(obj, prop) {
        delete (obj as any)[prop];

        // 触发自动保存
        self._scheduleAutoSave(key);

        return true;
      },
    }) as T;
  }

  /**
   * 调度自动保存（防抖）
   *
   * 使用单一全局定时器，批量保存所有待保存的数据。
   *
   * @param key - 存储键名
   */
  private _scheduleAutoSave(key: string): void {
    // 添加到待保存集合
    this._pendingSaveKeys.add(key);

    // 如果定时器不存在，创建新的
    if (this._saveTimer === null) {
      this._saveTimer = window.setTimeout(() => {
        this._flushPendingSaves();
      }, 100);
    }
  }

  /**
   * 刷新待保存的数据
   *
   * 批量保存所有待保存的数据。
   */
  private _flushPendingSaves(): void {
    const keys = Array.from(this._pendingSaveKeys);
    this._pendingSaveKeys.clear();
    this._saveTimer = null;

    // 批量保存
    for (const key of keys) {
      this.save(key);
    }
  }
}

/**
 * 导出管家伙伴
 */
export { Steward };
