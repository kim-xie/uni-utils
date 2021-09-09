/**
 * 环境相关工具类
 *
 * @packageDocumentation
 */

declare const WXEnvironment: any;
declare const my: any;
declare const wx: any;
declare const tt: any;
declare const swan: any;
declare const ks: any;
declare const global: any;
declare const process: any;

/**
 * 判断是否是web环境
 * @public
 */
export const isWeb = typeof window !== 'undefined' && 'onload' in window;

/**
 * 判断是否是node环境
 * @public
 */
export const isNode = typeof process !== 'undefined' && !!(process.versions && process.versions.node);

/**
 * 判断是否是weex环境
 * @public
 */
export const isWeex = typeof WXEnvironment !== 'undefined' && WXEnvironment.platform !== 'Web';
/**
 * 判断是否是阿里小程序
 * @public
 */
export const isMiniApp = typeof my !== 'undefined' && my !== null && typeof my.alert !== 'undefined';

/**
 * 判断是否是字节小程序
 * @public
 */
export const isByteDanceMicroApp = typeof tt !== 'undefined' && tt !== null && typeof tt.showToast !== 'undefined';

/**
 * 判断是否是百度小程序
 * @public
 */
export const isBaiduSmartProgram =
  typeof swan !== 'undefined' && swan !== null && typeof swan.showToast !== 'undefined';

/**
 * 判断是否是快手小程序
 * @public
 */
export const isKuaiShouMiniProgram = typeof ks !== 'undefined' && ks !== null && typeof ks.showToast !== 'undefined';

/**
 * 判断是否是微信小程序
 * @remarks
 * ```
 * In wechat mini program, wx.login is a function
 * In wechat mini propgram webview, there is no wx.login, but exist wx.miniProgram
 * In bytedance maicro app, there is wx variable.
 * In kuaishou mini program, there is wx variable.
 * ```
 * @public
 */
export const isWeChatMiniProgram =
  !isByteDanceMicroApp &&
  typeof wx !== 'undefined' &&
  wx !== null &&
  (typeof wx.request !== 'undefined' || typeof wx.miniProgram !== 'undefined');

/**
 * 判断是否是快应用
 * @public
 */
export const isQuickApp =
  typeof global !== 'undefined' && global !== null && typeof global.callNative !== 'undefined' && !isWeex;
