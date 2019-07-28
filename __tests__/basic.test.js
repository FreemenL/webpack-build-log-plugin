const path = require('path');
const webpack = require('webpack');
const webpackMajorVersion = Number(require('webpack/package.json').version.split('.')[0]);
const WebpackBuildLogPlugin = require('../src/index.js');
const rimraf = require("rimraf");
const utils = require("../src/utils");
const OUTPUT_DIR = path.resolve(__dirname, '../dist/basic-spec');
const filename = 'compile-log.md';

if (isNaN(webpackMajorVersion)) {
  throw new Error('Cannot parse webpack major version');
}
// 处理process.exit 导致jest进程退出
const setProperty = (object, property, value) => {
  const originalProperty = Object.getOwnPropertyDescriptor(object, property)
  Object.defineProperty(object, property, { value })
  return originalProperty
}

const mockExit = jest.fn()
setProperty(process, 'exit', mockExit)
function testwebpackBuildLogPlugin (webpackConfig, done) {
  
  webpack(webpackConfig, (err, stats) => {
    // jest 补捕获错误
    // 在 JavaScript中，有六个falsy值：false，0，''，null，undefined，和NaN。其他一切都是真实的
    expect(err).toBeFalsy();
    expect(mockExit).toHaveBeenCalledWith(0);
    done();
  })
}

describe('WebpackBuildLogPlugin', () => {

  beforeEach(done => {
    rimraf(OUTPUT_DIR, done);
  });

  test('utils', () => {
    expect(utils.getIp()).toMatch(/^(([a-zA-Z0-9_-])+(\.)?)*(:\d+)?(\/((\.)?(\?)?=?&?[a-zA-Z0-9_-](\?)?)*)*$/i);
  })

  it('Test log file exists', done => {
    testwebpackBuildLogPlugin({
      mode: 'production',
      entry: path.join(__dirname, 'fixtures/index.js'),
      output: {
        path: OUTPUT_DIR,
        filename: 'index_bundle.js'
      },
      plugins: [
        new WebpackBuildLogPlugin({
          path: path.join(process.cwd(), 'log'),
          filename,
          deleteFile: true
        })]
    }, done);
  });

  it('Test log in development', done => {
    testwebpackBuildLogPlugin({
      mode: 'development',
      entry: path.join(__dirname, 'fixtures/index.js'),
      output: {
        path: OUTPUT_DIR,
        filename: 'index_bundle.js'
      },
      plugins: [
        new WebpackBuildLogPlugin({
          path: path.join(process.cwd(), 'log'),
          filename,
          deleteFile: false
        })]
    }, done);
  });
});
