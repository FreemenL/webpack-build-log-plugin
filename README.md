<div align="center">
  <a href="https://github.com/webpack/webpack">
    <img width="200" height="200"
      src="https://webpack.js.org/assets/icon-square-big.svg">
  </a>
  <h1>webpack-build-log-plugin</h1>
  <p>This will help you quickly locate and solve problems</p>
  <p>Display compilation details in production environment friendly</p>
  <p>You can use it in any project that has been built by <strong>webpack</strong>, such as: <strong>vue-cli</strong>, <strong>create-react-app</strong>, or your custom project</p>
</div>
<h2 align="center">Note</h2>
Compile logs will only be output in the production environment.
And you need to set <strong>process.env.NODE_ENV</strong> in different environments.
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
const WebpackBuildLogPlugin = require("webpack-build-log-plugin");

module.exports = {
    plugins: [
        new WebpackBuildLogPlugin(options)
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
    new webpackBuildLogPlugin({
      path: path.join(process.cwd(),'log'),
      filename: 'compile-log.md',
      // Note: Compile logs will only be output in the production environment.
      //And you need to set process.env.NODE_ENV in different environments.
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

<h2 align="center">欢迎加wx群学习交流</h2>

<img src="https://raw.githubusercontent.com/FreemenL/first-github-pages/master/public/WechatIMG138.jpeg"/>
