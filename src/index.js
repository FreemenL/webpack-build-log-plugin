const fs = require('fs');
const path = require('path');
const boxen = require('boxen');
const fse = require('fs-extra');
const chalk = require('chalk');
const json = require('format-json');
const filesize = require('filesize');
const stripAnsi = require('strip-ansi');
const { SyncHook } = require('tapable');
const recursive = require('recursive-readdir');
const gzipSize = require('gzip-size').sync;
const { getIp } = require('./utils');
// These sizes are pretty large. We'll warn for bundles exceeding them.
let WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024;
let WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024;

class WebpackBuildLogPlugin {
  constructor (options) {
    this.options = options;
    this.pluginName = 'WebpackBuildLogPlugin';
  }

  apply (compiler) {
    this.changeVueCliConfig(compiler);
    this.mountHook(compiler);
    // 开发环境不删除打包产出的文件
    if (!this.options.deleteFile) {
      return false;
    }
    this.createLog(compiler);
  }

  // 挂载自定义hook
  mountHook (compiler) {
    // 实例化自定义hook
    compiler.hooks.printFileSizesAfterBuildHook = new SyncHook(['data']);
    compiler.hooks.environment.tap(this.pluginName, () => {
      const appBuild = compiler.options.output.path;
      // 广播自定义hook
      compiler.hooks.printFileSizesAfterBuildHook.call(this.measureFileSizesBeforeBuild(appBuild));
    });
  }

  // 创建日志
  createLog (compiler) {
    const appBuild = compiler.options.output.path;
    compiler.hooks.printFileSizesAfterBuildHook.tap('Listen4Myplugin', (FileSizesAfterBuild) => {
      FileSizesAfterBuild.then((previousFileSizes) => {
        fse.emptyDirSync(appBuild);
        console.log(chalk.blue('Production environment directory has been deleted !'));
        compiler.hooks.done.tapAsync('getStats', (stats, callback) => {
          let content = ``;
          content += json.plain(stats.toJson());
          var buffer = Buffer.from(content);

          const logFile = `${this.options.path || stats.compilation.options.context || 'log'}/${this.options.filename || 'compilation-detail.md'}`;
          fse.ensureFileSync(logFile);
          let ws = fs.createWriteStream(logFile, { start: 0 });
          console.log(chalk.blueBright('Start outputting the compilation log...'));
          ws.write(buffer, 'utf8', (err) => {
            if (err) {
              throw err;
            }
            console.log(`\n`);
            console.log(chalk.blueBright(`Packing logs in this -> ${this.options.path || stats.compilation.options.context}/${this.options.filename || 'compilation-detail.md'}`));
            console.log(`\n`);
            WARN_AFTER_BUNDLE_GZIP_SIZE = this.options.warnAfterBundleGzipSize || WARN_AFTER_BUNDLE_GZIP_SIZE;
            WARN_AFTER_CHUNK_GZIP_SIZE = this.options.warnAfterChunkGzipSize || WARN_AFTER_BUNDLE_GZIP_SIZE;
            this.printFileSizesAfterBuild(
              stats,
              previousFileSizes,
              appBuild,
              WARN_AFTER_BUNDLE_GZIP_SIZE,
              WARN_AFTER_CHUNK_GZIP_SIZE,
              callback
            );
          });
        });
      });
    });
  }
  // 改写插件  ->  针对 vue-cli
  changeVueCliConfig (compiler) {
    Object.keys(compiler.hooks).forEach((item, index) => {
      compiler.hooks[item].intercept({
        register: (tapInfo) => {
          const pluginName = tapInfo.name.split(' ')[0];
          if (pluginName === 'vue-cli-service') {
            return { ...tapInfo,
              fn: (stats) => {
                const vueCliConfig = require(`${process.cwd()}/vue.config.js`);
                const vueCliConfigPort = vueCliConfig.devServer && vueCliConfig.devServer.port;
                console.log(`${chalk.white('─────────')} You application is running here ${chalk.white('─────────')}`);
                console.log(boxen(`On Your Network: ${chalk.green('http://' + getIp() + ':' + vueCliConfigPort)}`, { borderColor: 'blue', padding: 1, borderStyle: 'double' }));
                console.log(`${chalk.white('───────────────────────────────────────────────────')}`);
                console.log(`${chalk.white('───────────────────────────────────────────────────')}`);
                console.log(`${chalk.white('───────────────────────────────────────────────────')}`);
                console.log(`${chalk.gray('Or if you have any ideas, please let me know.')}`);
              } };
          }
          return tapInfo;
        }
      });
    });
  }
  // 测量文件大小
  measureFileSizesBeforeBuild (buildFolder) {
    return new Promise(resolve => {
      recursive(buildFolder, (err, fileNames) => {
        var sizes;
        if (!err && fileNames) {
          sizes = fileNames.filter(this.canReadAsset).reduce((memo, fileName) => {
            var contents = fs.readFileSync(fileName);
            var key = this.removeFileNameHash(buildFolder, fileName);
            memo[key] = gzipSize(contents);
            return memo;
          }, {});
        }
        resolve({
          root: buildFolder,
          sizes: sizes || {}
        });
      });
    });
  }

  canReadAsset (asset) {
    return (
      /\.(js|css)$/.test(asset) && !/service-worker\.js/.test(asset) && !/precache-manifest\.[0-9a-f]+\.js/.test(asset)
    );
  }

  removeFileNameHash (buildFolder, fileName) {
    return fileName
      .replace(buildFolder, '')
      .replace(/\\/g, '/')
      .replace(
        /\/?(.*)(\.[0-9a-f]+)?(\.js|\.css)/,
        (match, p1, p2, p3, p4) => p1 + p4
      );
  }

  getDifferenceLabel (currentSize, previousSize) {
    var FIFTY_KILOBYTES = 1024 * 50;
    var difference = currentSize - previousSize;
    var fileSize = !Number.isNaN(difference) ? filesize(difference) : 0;
    if (difference >= FIFTY_KILOBYTES) {
      return chalk.red('+' + fileSize);
    } else if (difference < FIFTY_KILOBYTES && difference > 0) {
      return chalk.yellow('+' + fileSize);
    } else if (difference < 0) {
      return chalk.green(fileSize);
    } else {
      return '';
    }
  }
  makeRow (a, b) {
    return `  ${a}                             ${b}`;
  }
  getAssets (assetsParams, root, sizes, buildFolder) {
    let assets = assetsParams
      .map(stats =>
        stats
          .toJson({ all: false, assets: true })
          .assets.filter(asset => this.canReadAsset(asset.name))
          .map(asset => {
            var fileContents = fs.readFileSync(path.join(root, asset.name));
            var size = gzipSize(fileContents);
            var previousSize = sizes[this.removeFileNameHash(root, asset.name)];
            var difference = this.getDifferenceLabel(size, previousSize);
            return {
              folder: path.join(
                path.basename(buildFolder),
                path.dirname(asset.name)
              ),
              name: path.basename(asset.name),
              size: size,
              sizeLabel: filesize(size) + (difference ? ' (' + difference + ')' : '')
            };
          })
      )
      .reduce((single, all) => all.concat(single), []);
    assets.sort((a, b) => b.size - a.size);
    var longestSizeLabelLength = Math.max.apply(
      null,
      assets.map(a => stripAnsi(a.sizeLabel).length)
    );
    var suggestBundleSplitting = false;
    const isJS = val => /\.js$/.test(val);
    const isCSS = val => /\.css$/.test(val);
    const isMinJS = val => /\.min\.js$/.test(val);
    assets.sort((a, b) => {
      if (isJS(a.name) && isCSS(b.name)) return -1;
      if (isCSS(a.name) && isJS(b.name)) return 1;
      if (isMinJS(a.name) && !isMinJS(b.name)) return -1;
      if (!isMinJS(a.name) && isMinJS(b.name)) return 1;
      return b.size - a.size;
    });
    const cssIndex = assets.findIndex((item, index) => item.name.endsWith('css')) + 1;
    assets.splice(0, 0, '\n ── js ── \n\n');
    assets.splice(cssIndex, 0, '\n ── css ── \n\n');
    return {
      assets,
      longestSizeLabelLength,
      suggestBundleSplitting
    };
  }
  printFileSizesAfterBuild (
    webpackStats,
    previousSizeMap,
    buildFolder,
    maxBundleGzipSize,
    maxChunkGzipSize,
    callback
  ) {
    const assetsParams = (webpackStats.stats || [webpackStats]);
    let logLine = '';
    let root = previousSizeMap.root;
    let sizes = previousSizeMap.sizes;
    let {
      assets,
      longestSizeLabelLength,
      suggestBundleSplitting
    } = this.getAssets(assetsParams, root, sizes, buildFolder);
    assets.forEach(asset => {
      if (!asset.sizeLabel) {
        logLine += ' ' + chalk.blueBright(asset);
      } else {
        var sizeLabel = asset.sizeLabel || [];
        var sizeLength = stripAnsi(sizeLabel).length;
        if (sizeLength < longestSizeLabelLength) {
          var rightPadding = ' '.repeat(longestSizeLabelLength - sizeLength);
          sizeLabel += rightPadding;
        }
        var isMainBundle = asset.name.indexOf('main.') === 0;
        var maxRecommendedSize = isMainBundle
          ? maxBundleGzipSize
          : maxChunkGzipSize;
        var isLarge = maxRecommendedSize && asset.size > maxRecommendedSize;
        if (isLarge && path.extname(asset.name) === '.js') {
          suggestBundleSplitting = true;
        }
        const buf = 25 - asset.name.length;
        if (buf > 0) {
          asset.name = asset.name.padEnd(buf, '       ');
        }
        logLine += ' ' + chalk.dim(asset.folder + path.sep) + chalk.cyan(asset.name) + '  ' + (isLarge ? chalk.yellow(sizeLabel) : sizeLabel) + '\n';
      }
    });
    console.log(`${chalk.white('───────────')} Here is your packaged output ${chalk.white('───────────')}`);
    console.log(
      boxen(this.makeRow(
        chalk.green.bold(`File`),
        chalk.green.bold(`Size`)
      ) + `\n\n` + logLine)
    );
    if (suggestBundleSplitting) {
      console.log();
      console.log(
        chalk.yellow('The bundle size is significantly larger than recommended.')
      );
    }
    callback(process.exit(0));
  }
}

module.exports = WebpackBuildLogPlugin;
