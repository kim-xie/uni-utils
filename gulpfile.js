import gulp from 'gulp';
import path from 'path';
import fse from 'fs-extra';
import chalk from 'chalk';
import { Extractor, ExtractorConfig } from '@microsoft/api-extractor';
import conventionalChangelog from 'conventional-changelog';
const typedoc = require('gulp-typedoc');
const browserSync = require('browser-sync').create();

const log = {
  progress: text => {
    console.log(chalk.green(text));
  },
  error: text => {
    console.log(chalk.red(text));
  },
};

const paths = {
  root: path.join(__dirname, '.'),
  types: path.join(__dirname, '/dist'),
};

// api-extractor 整理 .d.ts 文件
const apiExtractorGenerate = async cb => {
  const apiExtractorJsonPath = path.join(__dirname, './api-extractor.json');
  // 加载并解析 api-extractor.json 文件
  const extractorConfig = await ExtractorConfig.loadFileAndPrepare(apiExtractorJsonPath);
  // 判断是否存在 index.d.ts 文件，这里必须异步先访问一遍，不然后面找不到会报错
  const isExist = await fse.pathExists(extractorConfig.mainEntryPointFilePath);

  if (!isExist) {
    log.error('API Extractor not find index.d.ts');
    return;
  }

  // 调用 API
  const extractorResult = await Extractor.invoke(extractorConfig, {
    localBuild: true,
    // 在输出中显示信息
    showVerboseMessages: true,
  });

  if (extractorResult.succeeded) {
    // 删除多余的 .d.ts 文件
    const typesFiles = await fse.readdir(paths.types);
    typesFiles.forEach(async file => {
      if (file.endsWith('.d.ts') && !file.includes('index')) {
        await fse.remove(path.join(paths.types, file));
      }
    });
    log.progress('API Extractor completed successfully');
    cb();
  } else {
    log.error(
      `API Extractor completed with ${extractorResult.errorCount} errors` +
        ` and ${extractorResult.warningCount} warnings`,
    );
  }
};

const complete = cb => {
  log.progress('---- end ----');
  cb();
};

// api-extractor 生成统一的声明文件, 删除多余的声明文件
export const buildApi = gulp.series(apiExtractorGenerate, complete);

// 自定义生成 changelog
export const changelog = async cb => {
  const changelogPath = path.join(paths.root, 'CHANGELOG.md');
  // 对命令 conventional-changelog -p angular -i CHANGELOG.md -w -r 0
  const changelogPipe = await conventionalChangelog({
    preset: 'angular',
    releaseCount: 0,
  });
  changelogPipe.setEncoding('utf8');

  const resultArray = ['# 工具库更新日志\n\n'];
  changelogPipe.on('data', chunk => {
    // 原来的 commits 路径是进入提交列表
    chunk = chunk.replace(/\/commits\//g, '/commit/');
    resultArray.push(chunk);
  });
  changelogPipe.on('end', async () => {
    await fse.createWriteStream(changelogPath).write(resultArray.join(''));
    cb();
  });
};

const runTypeDoc = () =>
  gulp.src(['src']).pipe(
    typedoc({
      out: './typedocs',
      tsconfig: 'tsconfig.json',
    }),
  );

const reload = done => {
  browserSync.reload();
  done();
};

const runBrowserSync = done => {
  browserSync.init({
    server: {
      baseDir: './typedocs',
    },
  });
  done();
};

const watch = () => gulp.watch(['README.md', 'src/*.ts'], gulp.series(runTypeDoc, reload));

export const buildTypeDoc = gulp.series(runTypeDoc, runBrowserSync, watch);
