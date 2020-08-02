const { src, dest, parallel, series, watch } = require('gulp')

// 清除文件的插件
const del = require('del')

// 创建热更新服务插件
const browserSync = require('browser-sync')
const bs = browserSync.create()

// 自动加载插件
const loadPlugins = require('gulp-load-plugins')
const plugins = loadPlugins()

// 项目的当前工作目录
const cwd = process.cwd()

let config = {
  data: {},
  build: {
    src: 'src',
    dist: 'dist',
    temp: 'temp',
    public: 'public',
    paths: {
      styles: 'assets/styles/*.scss',
      scripts: 'assets/scripts/*.js',
      pages: '*.html',
      images: 'assets/images/**',
      fonts: 'assets/fonts/**'
    }
  }
}

// 读取用户配置信息
try {
  let userConfig = require(`${cwd}/pages.config.js`)
  // 若传入配置，则替换相关配置
  config = {
    data: userConfig.data || config.data,
    build: {
      ...config.build,
      ...userConfig.build,
      paths: {
        ...config.build.paths,
        ...userConfig.build.paths
      }
    }
  }
} catch { }


// 清除之前的文件
const clean = () => {
  try {
    return del([config.build.dist, config.build.temp])
  } catch { }
}

// 压缩样式文件到 temp
const style = () => {
  return src(config.build.paths.styles, { base: config.build.src, cwd: config.build.src })
    .pipe(plugins.sass())
    .pipe(dest(config.build.temp))
}

// 压缩脚本文件到 temp
const script = () => {
  return src(config.build.paths.scripts, { base: config.build.src, cwd: config.build.src })
    .pipe(plugins.babel({ presets: [require('@babel/preset-env')] }))
    .pipe(dest(config.build.temp))
}

// 压缩页面文件到 temp
const page = () => {
  return src(config.build.paths.pages, { base: config.build.src, cwd: config.build.src })
    .pipe(plugins.swig({ data: config.data, defaults: { cache: false } })) // cache: false 防止缓存不及时更新
    .pipe(dest(config.build.temp))
}

// 压缩打包图片
const image = () => {
  return src(config.build.paths.images, { base: config.build.src, cwd: config.build.src })
    .pipe(plugins.imagemin())
    .pipe(dest(config.build.dist))
}

// 打包字体
const font = () => {
  return src(config.build.paths.fonts, { base: config.build.src, cwd: config.build.src })
    .pipe(plugins.imagemin())
    .pipe(dest(config.build.dist))
}

// 拷贝其它文件
const extra = () => {
  // public 不需要执行压缩，只是拷贝过去
  return src("**", { base: config.build.public, cwd: config.build.public })
    .pipe(dest(config.build.dist))
}

// 热更新服务
const serve = () => {
  // 监听文件变化并自动构建
  watch(config.build.paths.styles, { cwd: config.build.src }, style)
  watch(config.build.paths.scripts, { cwd: config.build.src }, script)
  watch(config.build.paths.pages, { cwd: config.build.src }, page)

  // 图片、字体、其它文件在开发过程中不需要重新构建
  // 只需要在变化时重新加载，可提高构建时的性能
  // 监听图片、字体变化
  watch([config.build.paths.images, config.build.paths.fonts], { cwd: config.build.src }, bs.reload)
  // 监听静态文件变化
  watch('**', { cwd: config.build.public }, bs.reload)

  bs.init({
    files: config.build.temp,
    server: {
      baseDir: [config.build.temp, config.build.src, config.build.public],
      routes: {
        '/node_modules': 'node_modules'
      }
    }
  })
}

const useref = () => {
  return src(config.build.paths.pages, { base: config.build.temp, cwd: config.build.temp })
    .pipe(plugins.useref({ searchPath: [config.build.temp, '.'] }))
    .pipe(plugins.if(/\.js$/, plugins.uglify()))
    .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
    .pipe(plugins.if(/\.html$/, plugins.htmlmin({ collapseWhitespace: true, minifyCSS: true, minifyJS: true })))
    .pipe(dest(config.build.dist))
}

// 编译
const compile = parallel(style, script, page)

// 上线打包
const build = series(clean, parallel(compile, image, font, extra), useref)

// 开发服务
const dev = series(compile, serve)

module.exports = {
  clean,
  build,
  dev
}