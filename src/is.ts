export const isObject = (param: unknown):boolean => Object.prototype.toString.call(param) === "[object Object]"
export const isArray = (param: unknown):boolean => Object.prototype.toString.call(param) === "[object Array]"

/**
 * 判断字符串是否是十六进制的颜色值
 * @param value - input string
 * @returns boolean
 * 
 * @example
 * ```ts
 * isColor('#ffffff') => true
 * ```
 * @beta
 * @author kim
 */
export const isColor = (value: string): boolean => /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(value);
