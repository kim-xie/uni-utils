/**
 * A library for is utils.
 * 
 * @packageDocumentation
 */
/**
 * 判断是否是数组对象类型
 * @param param - input string
 * @returns 返参
 *
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
export const isColor = (value: string): boolean =>
  /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(value);
