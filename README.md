### 安装

```powershell
yarn add lfl-pages --dev
# or
npm install lfl-pages --dev
```

### clean

```powershell
yarn lfl-pages clean
```

### dev

```powershell
yarn lfl-pages dev
```

### build

```powershell
yarn lfl-pages build
```

### pages.config.js 配置项
在项目根目录下创建 pages.config.js 文件。

```
config = {
  data: {},		// 模板文件中的数据
  build: {
    src: 'src',		// 源代码目录
    dist: 'dist',	// build输出的目录
    temp: 'temp',	// 中转目录
    public: 'public',	// 静态资源
    paths: {
      styles: 'assets/styles/*.scss',	// sass文件目录
      scripts: 'assets/scripts/*.js',	// js文件目录
      pages: '*.html',	// html文件目录
      images: 'assets/images/**',	// images文件目录
      fonts: 'assets/fonts/**'	// fonts文件目录
    }
  }
}
```