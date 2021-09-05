/**
 * 图片处理相关工具
 *
 * @packageDocumentation
 */
import fs from 'fs'
import path from 'path'
import Https from 'https'
import Url from 'url'
import Chalk from 'chalk'

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
}

/**
 * 生成一定范围随机数
 * @param min
 * @param max
 * @returns
 */
const RandomNum = (min = 0, max = 10) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

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
}

/**
 * 判断目录或文件夹是否存在？不存在测创建
 * @param pathStr
 * @returns
 */
const mkdirPath = async (pathStr: string) => {
  try {
    const projectPath = path.join(__dirname, pathStr);
    if (await isFileExisted(projectPath)) {
      const tempstats = fs.statSync(projectPath);
      if (!tempstats.isDirectory()) {
        fs.unlinkSync(projectPath);
        fs.mkdirSync(projectPath);
      }
    } else {
      fs.mkdirSync(projectPath);
    }
    return projectPath;
  } catch (err) {
    console.log('文件生成出错啦！');
  }
}

/**
 * 判断路径是否存在
 * @param path
 * @returns
 */
const isFileExisted = (path) => {
  return new Promise((resolve) => {
    fs.access(path, (err) => {
      if (err) {
        resolve(false); //"不存在"
      } else {
        resolve(true); //"存在"
      }
    });
  });
}

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
}

/**
 * 图片压缩工具
 * @remarks 图片在线压缩工具
 * @param file 需要压缩的图片文件
 * @param filename 需要压缩的图片名称
 * @param outputPath 压缩后的输出目录
 * @returns Promise
 */
const  compressImg = async (file: any, filename: string, outputPath: string) => {
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
    const projectPath = await mkdirPath(outputPath);
    fs.writeFileSync(path.join(projectPath as string, filename), downloadData as NodeJS.ArrayBufferView, 'binary');
    return Promise.resolve(msg);
  } catch (err) {
    const msg = `Compress [${Chalk.yellowBright(
      filename,
    )}] failed: ${Chalk.redBright(err)}`;
    return Promise.resolve(msg);
  }
}

/**
 * 图片上传压缩
 * @param url
 * @returns
 */
const downloadImg = (url:string) => {
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
}

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
}

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
  dirPath,
  outputPath,
  isRecursion,
  showLog,
}: {
  dirPath: string;
  outputPath: string;
  isRecursion?: boolean;
  showLog?: boolean;
}) => {
  isRecursion = isRecursion || true;
  showLog = showLog || true;
  //根据文件路径读取文件，返回文件列表
  fs.readdir(dirPath,  (err, files) => {
    if (err) {
      console.warn(err);
    } else {
      //遍历读取到的文件列表
      files.forEach((filename) => {
        // 获取当前文件的绝对路径
        const filedir = path.join(dirPath, filename);
        // 根据文件路径获取文件信息，返回一个fs.Stats对象
        fs.stat(filedir,  (eror, stats) => {
          if (eror) {
            console.warn('获取文件stats失败');
          } else {
            const isFile = stats.isFile(); //是文件
            const isDir = stats.isDirectory(); //是文件夹
            if (isFile) {
              if (IMG_REGEXP.test(path.extname(filename))) {
                const file = fs.readFileSync(filedir);
                compressImg(file, filename, outputPath).then((msg) => {
                  showLog && console.log(msg);
                });
              }
            }
            if (isDir && isRecursion) {
              compressImgByDir({
                dirPath: filedir,
                outputPath,
                isRecursion,
                showLog,
              }); //递归，如果是文件夹，就继续遍历该文件夹下面的文件
            }
          }
        });
      });
    }
  });
}

export {
  RandomHeader,
  RoundNum,
  ByteSize,
  uploadImg,
  downloadImg,
  compressImg,
  compressImgByDir,
  IMG_REGEXP,
  TINYIMG_URL,
};
