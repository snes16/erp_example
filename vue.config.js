const path = require('path');
let publicPath = process.env.NODE_ENV === 'production' ? '/' : '/';

module.exports = {
  publicPath,
  productionSourceMap: false,
  configureWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
      const terserWebpackPlugin = config.optimization.minimizer[0];
      const terserOptions = terserWebpackPlugin.options.terserOptions;
      terserOptions.mangle = {
        reserved: ['$super']
      };
    }
    config.resolve.alias["jquery"] = path.join(__dirname, "./jqueryStub.js");
  },
  chainWebpack(config) {
    // Only convert .svg files that are imported by these files as Vue component
    const FILE_RE = /\.(vue|js|ts|svg)$/

    // Use vue-cli's default rule for svg in non .vue .js .ts files
    config.module.rule('svg').issuer(file => !FILE_RE.test(file))

    // Use our loader to handle svg imported by other files
    config.module
        .rule('svg-component')
        .test(/\.svg$/)
        .issuer(file => FILE_RE.test(file))
        .use('vue')
        .loader('vue-loader')
        .end()
        .use('svg-to-vue-component')
        .loader('svg-to-vue-component/loader')
  },
  pages: {
    index: {
      // точка входа для страницы
      entry: 'src/main.js',
      // исходный шаблон
      template: 'public/index.html',
      // в результате будет dist/index.html
      filename: 'index.html',
      // все фрагменты, добавляемые на этой странице, по умолчанию
      // это извлечённые общий фрагмент и вендорный фрагмент.
      chunks: ['chunk-vendors', 'chunk-common', 'index']
    },
    // когда используется строковый формат точки входа, то
    // шаблон будет определяться как `public/subpage.html`,
    // а если таковой не будет найден, то `public/index.html`.
    // Выходное имя файла будет определено как `subpage.html`.
    // subpage: 'src/subpage/main.js'
    dossier: {
      entry: 'src/dossier/dossier.js',
      template: 'public/dossier.html',
      filename: 'dossier.html',
    },
    schedule: {
      entry: 'src/schedule/schedule.js',
      template: 'public/dossier.html',
      filename: 'schedule.html',
    },
  }
};