/**
 * 图片处理相关工具
 *
 * @packageDocumentation
 */
import Fs from 'fs';
import Path from 'path';
import Https from 'https';
import Url from 'url';
import Chalk from 'chalk';

/**
 * 支持压缩的图片格式
 */
const IMG_REGEXP = /\.(jpe?g|png)$/;

/**
 * 在线压缩网站
 */
const TINYIMG_URL = ['tinyjpg.com', 'tinypng.com'];

/**
 * @remarks 字节转换
 * @param byte 字节
 * @returns
 */
const ByteSize = (byte = 0) => {
  if (byte === 0) return '0 B';
  const unit = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(byte) / Math.log(unit));
  return (byte / Math.pow(unit, i)).toPrecision(3) + ' ' + sizes[i];
};

/**
 * 生成一定范围随机数
 * @param min
 * @param max
 * @returns
 */
const RandomNum = (min = 0, max = 10) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

/**
 * 四舍五入
 * @param num
 * @param dec
 * @param per
 * @returns
 */
const RoundNum = (num = 0, dec = 2, per = false) => {
  return per
    ? Math.round(num * 10 ** dec * 100) / 10 ** dec + '%'
    : Math.round(num * 10 ** dec) / 10 ** dec;
};

/**
 * 判断目录或文件夹是否存在？不存在测创建
 * @param pathStr
 * @returns
 */
const mkdirPath = async (pathStr: string) => {
  const currentPath = Path.join(__dirname, pathStr);
  console.log('currentPath', currentPath);
  try {
    const isExisted = await isFileExisted(currentPath);
    console.log('isExisted', isExisted);
    if (isExisted) {
      const tempstats = Fs.statSync(currentPath);
      if (!tempstats.isDirectory()) {
        Fs.unlinkSync(currentPath);
        Fs.mkdirSync(currentPath);
      }
    } else {
      console.log('tempstats2');
      Fs.mkdirSync(currentPath);
    }
  } catch (err) {
    console.log(Chalk.red('文件生成出错啦！'));
  }
  return currentPath;
};

/**
 * 判断路径是否存在
 * @param inputpath
 * @returns
 */
const isFileExisted = (inputpath: string) => {
  console.log('ddd', inputpath);
  return new Promise((resolve) => {
    Fs.access(inputpath, (err) => {
      if (err) {
        resolve(false); //"不存在"
      } else {
        resolve(true); //"存在"
      }
    });
  });
};

/**
 * 图片压缩网站请求头
 * @returns
 */
const RandomHeader = () => {
  const ip = new Array(4)
    .fill(0)
    .map(() => parseInt((Math.random() * 255).toString()))
    .join('.');
  const index = RandomNum(0, 1);
  return {
    headers: {
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Postman-Token': Date.now(),
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
      'X-Forwarded-For': ip,
    },
    hostname: TINYIMG_URL[index],
    method: 'POST',
    path: '/web/shrink',
    rejectUnauthorized: false,
  };
};

/**
 * 图片压缩工具
 * @remarks 图片在线压缩工具
 * @param file 需要压缩的图片文件
 * @param filename 需要压缩的图片名称
 * @param outputPath 压缩后的输出目录
 * @returns Promise
 */
const compressImg = async (file: any, filename: string, outputPath: string) => {
  try {
    const uploadResponse: any = await uploadImg(file);
    const downloadData = await downloadImg(uploadResponse.output.url);
    const oldSize = Chalk.redBright(ByteSize(uploadResponse.input.size));
    const newSize = Chalk.greenBright(ByteSize(uploadResponse.output.size));
    const ratio = Chalk.blueBright(
      RoundNum(1 - uploadResponse.output.ratio, 2, true),
    );
    const msg = `Compress [${Chalk.yellowBright(
      filename,
    )}] completed: Old Size ${oldSize}, New Size ${newSize}, Optimization Ratio ${ratio}`;
    const currentPath = await mkdirPath(outputPath);
    Fs.writeFileSync(
      Path.join(currentPath as string, filename),
      downloadData as NodeJS.ArrayBufferView,
      'binary',
    );
    return Promise.resolve(msg);
  } catch (err) {
    const msg = `Compress [${Chalk.yellowBright(
      filename,
    )}] failed: ${Chalk.redBright(err)}`;
    return Promise.resolve(msg);
  }
};

/**
 * 图片上传压缩
 * @param url
 * @returns
 */
const downloadImg = (url: string) => {
  const opts = new Url.URL(url);
  return new Promise((resolve, reject) => {
    const req = Https.request(opts, (res) => {
      let file = '';
      res.setEncoding('binary');
      res.on('data', (chunk) => (file += chunk));
      res.on('end', () => resolve(file));
    });
    req.on('error', (e) => reject(e));
    req.end();
  });
};

/**
 * 图片压缩后下载
 * @param file
 * @returns
 */
const uploadImg = (file: any) => {
  const opts = RandomHeader();
  return new Promise((resolve, reject) => {
    const req = Https.request(opts, (res) =>
      res.on('data', (data) => {
        const obj = JSON.parse(data.toString());
        obj.error ? reject(obj.message) : resolve(obj);
      }),
    );
    req.write(file, 'binary');
    req.on('error', (e) => reject(e));
    req.end();
  });
};

/**
 * 根据文件夹进行图片压缩
 * @param dirPath 需要压缩的图片文件夹路径
 * @param outputPath 压缩后输出的目录
 * @param isRecursion 是否需要递归压缩 @defaultValue true
 * @param showLog 压缩过程是否需要打开日志 @defaultValue true
 *
 * @returns void
 */
const compressImgByDir = ({
  inputPath,
  outputPath,
  isRecursion,
  showLog,
}: {
  inputPath: string;
  outputPath: string;
  isRecursion?: boolean;
  showLog?: boolean;
}) => {
  isRecursion = isRecursion || true;
  showLog = showLog || true;
  readDirFile(inputPath, isRecursion, (filePath, fileName) => {
    if (IMG_REGEXP.test(Path.extname(fileName))) {
      const file = Fs.readFileSync(filePath);
      compressImg(file, fileName, outputPath).then((msg) => {
        showLog && console.log(msg);
      });
    }
  });
};

// 异步递归读取文件夹下的文件
function readDirFile(currentDirPath, isRecursion, callback) {
  Fs.readdir(currentDirPath, (err, files) => {
    if (err) {
      console.warn(err);
    }
    files.forEach((name) => {
      const filePath = Path.join(currentDirPath, name);
      Fs.stat(filePath, (eror, stats) => {
        if (eror) {
          console.warn(Chalk.red('获取文件stats失败'));
        } else {
          const isFile = stats.isFile(); //是文件
          const isDir = stats.isDirectory(); //是文件夹
          if (isFile) {
            console.log(Chalk.green('read files: ', filePath));
            callback && callback(filePath, name, stats);
          }
          if (isDir && isRecursion) {
            readDirFile(filePath, isRecursion, callback);
          }
        }
      });
    });
  });
}

/**
 * webp转换工具
 * @param action generateWebp\deleteWebp\deleteNotWebp -- （3选1）watch为fasle下生效
 * @param watch 是否开启文件夹监听模式：开启会一直监听文件夹下的文件变动
 * @param inputPath 需要监听或读取的图片文件夹路径
 * @param outputPath 生成webp需要存放的路径，默认会生成在同一文件夹下
 * @param isRecursion 是否需要递归文件夹
 */
// const webpconvert = ({ action, watch, inputPath, outputPath, isRecursion }) => {
//   const childProcess = require('child_process');
//   const chokidar = require('chokidar');
//   // const cwebp = require('cwebp-bin');

//   const ignoreFiles = /(^\..+)|(.+[/\\]\..+)|(.+?\.webp$)/; // 忽略文件.开头和.webp结尾的文件
//   const quality = 75; // webp图片质量，默认75
//   let currentRunEnv = 'local';
//   let count = 0;

//   const startTime = new Date().getTime(); // 程序开始执行时间
//   log(Chalk.green(`${action} is begining at ${startTime} ms ...`));

//   log('inputPath: ', inputPath);
//   log('outputPath: ', outputPath);
//   log('Watch: ', watch, count);

//   /**
//    * 获取当前环境：
//    *     1、本地安装cwebp转换工具（谷歌官方下载地址：https://storage.googleapis.com/downloads.webmproject.org/releases/webp/index.html）（需配置环境变量）
//    *     2、安装cwebp-bin转换工具（linux环境安装可能会失败 - 需注意）
//    */
//   currentRunEnv = getCurrentEnv();
//   if (watch) {
//     /**
//      * 使用监听文件夹的方式
//      *
//      * */ const watcher = chokidar.watch(inputPath, {
//       ignored: (path) => {
//         return ignoreFiles.test(path);
//       }, // 忽略监听的文件及目录
//       persistent: true, // 保护进程不退出持久监听
//       cwd: '.', // 监听的inputPath所相对的路径
//       depth: 1, // 限定了会递归监听多少个子目录
//     });
//     // 监听增加，修改，删除文件的事件
//     watcher.on('all', (event, path) => {
//       switch (event) {
//         case 'add':
//           console.log('path', path);
//           // 添加新图片，自动转webp
//           generateWebpImgByEnv(path);
//           break;
//         case 'change':
//           console.log('change', path);
//           // 图片有变更，先删除掉原来的webp，再重新生成
//           deleteWebpImg(getWebpImgName(path), (status) => {
//             log(`delete webp img:  ${getWebpImgName(path)} ${status}`);
//           });
//           generateWebpImgByEnv(path);
//           break;
//         case 'unlink':
//           // 图片删除 删除掉原来的webp
//           deleteWebpImg(getWebpImgName(path), (status) => {
//             log(`delete webp img:  ${getWebpImgName(path)} ${status}`);
//           });
//           break;
//         default:
//           break;
//       }
//     });
//   } else {
//     /**
//      * 读取文件夹的方式进行文件读取
//      * isRecursion: 是否需要递归文件夹
//      * */
//     readDirFile(inputPath, isRecursion, (filePath, fileName) => {
//       // 执行删除指令
//       if (action === 'deleteWebp') {
//         /**
//          * 如果文件夹下有.webp图片，则会删掉
//          */
//         if (filePath.indexOf('.webp') > -1) {
//           deleteWebpImg(filePath, (status) => {
//             count += 1;
//             log(`delete webp img:  ${filePath} ${status}`);
//           });
//         }
//       } else if (action === 'deleteNotWebp') {
//         /**
//          * 如果文件夹下有图片，则会删掉
//          */
//         if (filePath.indexOf('.webp') < 0) {
//           deleteWebpImg(filePath, (status) => {
//             count += 1;
//             log(`delete img:  ${filePath} ${status}`);
//           });
//         }
//       } else {
//         /**
//          * 生成webp图片
//          * */
//         if (filePath.indexOf('.webp') < 0) {
//           generateWebpImgByEnv(fileName);
//         }
//       }
//     });
//   }

//   // /** * 程序退出 */
//   // global.process.on("beforeExit", () => {
//   //     const overTime = new Date().getTime();
//   //     log("webp convert is over");
//   //     log("files count: ", count);
//   //     log("spend times: ", `${(overTime - startTime) / 1000} s`);
//   // });

//   /**
//    * 环境探针 - 同步方式执行
//    * @returns
//    */
//   function getCurrentEnv() {
//     let env = 'local';
//     const { error } = childProcess.spawnSync('cwebp', ['-h']);
//     if (error) {
//       log(Chalk.yellow(`running in cwebp-bin env`));
//       env = 'node';
//     } else {
//       log(Chalk.yellow(`running in local cwebp env`));
//     }
//     return env;
//   }

//   /**
//    * 根据环境执行不同的转换命令
//    * @param filePath
//    */
//   function generateWebpImgByEnv(filePath) {
//     if (currentRunEnv === 'node') {
//       generateWebpImgByNode(filePath, (status) => {
//         count += 1;
//         log(
//           Chalk.green(
//             `generate webp img:  ${getWebpImgName(filePath)} ${status}`,
//           ),
//         );
//       });
//     } else {
//       generateWebpImgByLocal(filePath, (status) => {
//         count += 1;
//         log(
//           Chalk.green(
//             `generate webp img:  ${getWebpImgName(filePath)} ${status}`,
//           ),
//         );
//       });
//     }
//   }

//   // 获取对应的webp格式的文件名，默认为文件名后加上.webp
//   function getWebpImgName(path) {
//     return `${path}.webp`;
//   }

//   // 本地安装cwebp 执行的shell命令
//   function getShellCmd(filePath) {
//     const outPath = getWebpImgName(filePath);
//     // const inpath = path.join(__dirname, filePath).replace(/\\/g, '\\\\');
//     // outPath = path.join(__dirname, outPath).replace(/\\/g, '\\\\');
//     // if (outputPath) {
//     //   const currentPath = await mkdirPath(outputPath);
//     //   outPath = path.join(currentPath as string, getWebpImgName(filePath));
//     // }
//     return `cwebp -q ${quality} ${filePath} -o ${outPath}`;
//   }

//   // 本地安装cwebp生成webp图片
//   function generateWebpImgByLocal(filePath, cb) {
//     console.log('filePath', filePath);
//     childProcess.exec(
//       getShellCmd(filePath),
//       { env: path.join(__dirname, '../img'), encoding: 'utf-8' },
//       (err) => {
//         console.log('err', err);
//         if (err !== null) {
//           cb('fail');
//           log(Chalk.red('请先运行cwebp -h命令检查cwebp是否安装ok'));
//           log(err);
//         } else {
//           cb('success');
//         }
//       },
//     );
//   }

//   // 安装cwebp-bin包生成webp图片
//   async function generateWebpImgByNode(filePath, cb) {
//     console.log(filePath, cb);
//     // let outPath = getWebpImgName(filePath);
//     // if (outputPath) {
//     //   const currentPath = await mkdirPath(outputPath);
//     //   outPath = path.join(currentPath as string, getWebpImgName(filePath));
//     // }
//     // childProcess.execFile(cwebp, ['-q', quality, path, '-o', outPath], (err) => {
//     //   if (err !== null) {
//     //     cb('fail');
//     //     log(Chalk.red('检查cwebp-bin是否安装ok'));
//     //     log(err);
//     //   } else {
//     //     cb('success');
//     //   }
//     // });
//   }

//   // 删除webp图片
//   function deleteWebpImg(path, cb) {
//     Fs.unlink(path, (err) => {
//       if (err) {
//         cb('fail');
//         log(Chalk.red(err));
//       } else {
//         cb('success');
//       }
//     });
//   }
// };

// webpconvert({
//   action: 'generateWebp',
//   watch: true,
//   inputPath: '../img',
//   outputPath: '../img/webpImg',
//   isRecursion: false,
// });

// compressImgByDir({
//     dirPath: "../img",
//     outputPath: "../img/newImg",
//     isRecursion: true,
//     showLog: true
// })

export {
  RandomHeader,
  RoundNum,
  ByteSize,
  uploadImg,
  downloadImg,
  compressImg,
  compressImgByDir,
  IMG_REGEXP,
};
