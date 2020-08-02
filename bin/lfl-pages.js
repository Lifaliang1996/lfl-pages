#!/usr/bin/env node
// bin 类型的文件头，必须

// 指定当前工作目录
process.argv.push('--cwd')
process.argv.push(process.cwd())

// 指定 gulpfile 的路径
process.argv.push('--gulpfile')
process.argv.push(require.resolve('..'))

require('gulp/bin/gulp')