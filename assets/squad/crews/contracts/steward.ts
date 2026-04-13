/**
 * 管家契约
 *
 * 定义管家伙伴的数据存储接口。
 */

/**
 * 数据模板
 *
 * 定义存储数据的结构、版本和迁移逻辑。
 */
export interface DataSchema<T> {
  /** 存储键名 */
  key: string;
  /** 当前版本号 */
  version: number;
  /** 默认数据工厂函数 */
  defaults: () => T;
  /** 迁移映射表：版本号 -> 迁移函数 */
  migrations?: Record<number, (old: unknown) => T>;
}

/**
 * 编解码器
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
 * 管家接口
 *
 * 负责游戏数据的持久化存储。
 * 通过数据模板注册提供类型安全，使用 Proxy 实现自动保存。
 *
 * @description 技术实现：Proxy + localStorage + 版本迁移
 */
export interface ISteward {
  /**
   * 注册数据模板
   *
   * 注册后才能使用该数据的存储和读取。
   * 如果存储中已有旧版本数据，会自动执行迁移。
   *
   * @param schema - 数据模板定义
   *
   * @example
   * ```typescript
   * steward.register({
   *   key: 'player-progress',
   *   version: 2,
   *   defaults: () => ({ level: 1, exp: 0, coins: 0, achievements: [] }),
   *   migrations: {
   *     1: (old) => ({ ...old, achievements: [] }),
   *   },
   * });
   * ```
   */
  register<T>(schema: DataSchema<T>): void;

  /**
   * 获取数据（返回代理对象，变化自动保存）
   *
   * 对返回对象的任何修改都会触发自动保存（100ms 防抖）。
   *
   * @param key - 存储键名
   * @returns 代理后的数据对象
   *
   * @example
   * ```typescript
   * const progress = steward.get<PlayerProgress>('player-progress');
   * progress.level = 5;  // 自动保存！
   * progress.coins += 100;  // 自动保存！
   * ```
   */
  get<T>(key: string): T;

  /**
   * 手动保存指定数据
   *
   * 通常不需要手动调用，使用 get() 返回的代理对象会自动保存。
   *
   * @param key - 存储键名
   *
   * @example
   * ```typescript
   * await steward.save('player-progress');
   * ```
   */
  save(key: string): Promise<void>;

  /**
   * 保存所有已注册的数据
   *
   * 保存所有已注册的数据模板到存储。
   *
   * @example
   * ```typescript
   * await steward.saveAll();
   * ```
   */
  saveAll(): Promise<void>;

  /**
   * 设置指定数据的编解码器
   *
   * 为特定数据设置自定义编解码器。
   *
   * @param key - 存储键名
   * @param codec - 编解码器
   *
   * @example
   * ```typescript
   * steward.setCodec('player-progress', new Base64Codec());
   * ```
   */
  setCodec<T>(key: string, codec: DataCodec<T>): void;

  /**
   * 设置全局默认编解码器
   *
   * 为所有没有设置特定编解码器的数据使用此编解码器。
   * 默认使用 JSON 编解码器。
   *
   * @param codec - 编解码器
   *
   * @example
   * ```typescript
   * steward.setDefaultCodec(new JsonCodec());
   * ```
   */
  setDefaultCodec(codec: DataCodec<any>): void;

  /**
   * 检查数据是否存在
   *
   * @param key - 存储键名
   * @returns 是否存在
   *
   * @example
   * ```typescript
   * if (steward.has('player-progress')) {
   *   // ...
   * }
   * ```
   */
  has(key: string): boolean;

  /**
   * 删除指定数据
   *
   * 从存储中删除指定数据，并从内存中移除。
   *
   * @param key - 存储键名
   *
   * @example
   * ```typescript
   * steward.delete('player-progress');
   * ```
   */
  delete(key: string): void;

  /**
   * 清空所有数据
   *
   * 清空所有已注册数据的存储和内存。
   *
   * @example
   * ```typescript
   * steward.clear();
   * ```
   */
  clear(): void;
}
