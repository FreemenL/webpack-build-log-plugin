<div align="center">
  <a href="https://github.com/webpack/webpack">
    <img width="200" height="200"
      src="https://webpack.js.org/assets/icon-square-big.svg">
  </a>
  <h1>webpack-build-log-plugin</h1>
  <p>friendly display compilation details</p>
</div>

<h2 align="center">Install</h2>

```bash
  cnpm install webpack-build-log-plugin -D
```

```bash
  npm i webpack-build-log-plugin -D
```

```bash
  yarn add --dev webpack-build-log-plugin
```

This is a [webpack](http://webpack.js.org/) plugin tailored for [emptyd-desgin](https://github.com/FreemenL/emptyd-admin-webpack) and can be used in your project. No difference

<h2 align="center">Zero Config</h2>

The `webpack-build-log-plugin` works without configuration.  

<h2 align="center">Usage</h2>

The plugin will friendly display compilation details

**webpack.config.prod.js**
```javascript
const emptyWebpackBuildDetailPlugin = require("webpack-build-log-plugin");

module.exports = {
    plugins: [
        new emptyWebpackBuildDetailPlugin(options)
    ]
}

```

<h2 align="center">Options</h2>

You can pass a hash of configuration options to `webpack-build-log-plugin`.
Allowed values are as follows

|Name|Type|Default|Description|
|:--:|:--:|:-----:|:----------|
|**`path`**|`{String}`|`compilation.options.context`|The path to use for the compile log|
|**`filename`**|`{String}`|`'compilation-detail.md'`|The file to write the compile log to. Defaults to `compilation-detail.md`|
|**`warnAfterBundleGzipSize`**|`{number}`|512*1024 (Bit)| Maximum limit for bundle files |
|**`warnAfterChunkGzipSize`**|`{number}`|1024*1024 (Bit)| Maximum limit for chunk files |
|**`deleteFile`**|`{boolean}`|`false`| Whether to delete compilation output |


Here's an example webpack config illustrating how to use these options

**webpack.config.js**
```js
{
  entry: 'index.js',
  output: {
    path: __dirname + '/dist',
    filename: 'index_bundle.js'
  },
  plugins: [
    new emptyWebpackBuildDetailPlugin({
      path: path.join(process.cwd(),'log'),
      filename: 'compile-log.md',
      deleteFile: process.env.NODE_ENV=="production"
    })
  ]
}
```

<h2 align="center">Maintainers</h2>

<table>
  <tbody>
    <tr>
      <td align="center">
        <img width="150" height="150"
        src="https://www.lgstatic.com/i/image/M00/70/45/CgpEMlm1eoaAT-7PAACXDPj8MC493.jpeg">
        </br>
        <a href="https://github.com/freemenL">freemenL</a>
      </td>
    </tr>
  <tbody>
</table>
