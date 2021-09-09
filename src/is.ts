/**
 * is相关工具类
 *
 * @packageDocumentation
 */

/**
 * 判断是否是对象类型
 * @param param - 入参
 * @returns 返参 Boolean
 *
 * @example 判断某个元素是否是对象类型
 *
 * # Usage
 * ```ts
 * const result = isObject({"key": "value"});
 * ```
 *
 * # Result
 * ```ts
 * result === true
 * ```
 * @public
 */
export const isObject = (param: unknown): boolean =>
  Object.prototype.toString.call(param) === '[object Object]';

/**
 * 判断是否是数组数据类型
 * @param param - input string
 * @returns 返参
 *
 * @public
 */
export const isArray = (param: unknown): boolean =>
  Object.prototype.toString.call(param) === '[object Array]';

/**
 * 判断字符串是否是十六进制的颜色值
 * @param value - input string
 * @returns boolean
 *
 * @example
 * ```ts
 * isColor('#ffffff') => true
 * ```
 * @public
 */
export const isColor = (value: string): boolean => /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(value);

/**
 * 获取值的类型标签
 * @param value - 任意值
 * @returns [object Xxxx]
 *
 * @public
 */
export const getTag = (value: any): string => {
  if (value == null) {
    return value === undefined ? '[object Undefined]' : '[object Null]';
  }
  return toString.call(value);
};

/**
 * 判断是否是数值类型
 * @param value - 任意值
 * @returns true / false
 * @example
 * ```ts
 * isNumber(2) // => true
 * ```
 *
 * @public
 */
export const isNumber = (value: any): boolean => {
  return getTag(value) === '[object Number]';
};
