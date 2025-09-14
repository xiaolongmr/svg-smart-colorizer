# SVG Smart Colorizer

🎨 一个智能的SVG随机颜色处理JavaScript库，能够智能识别SVG元素的颜色状态并进行合适的颜色处理。

## ✨ 特性

- 🧠 **智能颜色检测** - 自动识别元素自身颜色、父级继承颜色和无颜色状态
- 🎯 **设计风格保护** - 保持线性图标、面性图标的原始设计风格
- 🔄 **父级继承处理** - 正确处理从父级`<g>`元素继承的颜色
- 🎨 **多种颜色模式** - 支持纯色、渐变色的随机生成
- ⚡ **高性能处理** - 优化的DOM操作，支持大量元素的批量处理
- 🛡️ **容错机制** - 完善的错误处理和边界情况处理
- 📱 **跨平台兼容** - 支持现代浏览器和移动端

## 📦 安装

### 直接下载
从GitHub仓库下载源码：
```bash
git clone https://github.com/xiaolongmr/svg-smart-colorizer.git
cd svg-smart-colorizer
```

### CDN引入（开发中）
```html
<!-- 从GitHub直接引用 -->
<script src="https://cdn.jsdelivr.net/gh/xiaolongmr/svg-smart-colorizer@main/src/index.js"></script>
```

### 本地构建
```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 在HTML中引入构建后的文件
<script src="dist/svg-smart-colorizer.min.js"></script>
```

### 在线预览
🌐 **在线演示**：[https://xiaolongmr.github.io/svg-smart-colorizer/](https://xiaolongmr.github.io/svg-smart-colorizer/)

> 注意：NPM包正在准备中，敬请期待！

## 🚀 快速开始

### 基础用法

```javascript
// 引入库
import SVGSmartColorizer from 'svg-smart-colorizer';
// 或者在浏览器中直接使用全局变量 SVGSmartColorizer

// 创建实例
const colorizer = new SVGSmartColorizer();

// 为SVG元素应用随机颜色
const svgElement = document.querySelector('#my-svg');
colorizer.applyRandomColors(svgElement);
```

### 高级用法

```javascript
// 创建带配置的实例
const colorizer = new SVGSmartColorizer({
  // 自定义颜色调色板
  colorPalette: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'],
  
  // 保护线性图标的设计风格
  preserveLinearStyle: true,
  
  // 为填充和描边生成不同颜色
  independentColors: true,
  
  // 渐变色生成概率（0-1）
  gradientProbability: 0.3,
  
  // 调试模式
  debug: false
});

// 应用随机颜色到整个SVG
colorizer.applyRandomColors(svgElement);

// 只处理特定路径
colorizer.applyRandomPathColors(svgElement, {
  pathIndices: [0, 2, 4] // 只处理第1、3、5个路径
});

// 重置SVG颜色
colorizer.resetColors(svgElement);

// 获取SVG的颜色状态
const colorState = colorizer.getColorState(svgElement);
console.log(colorState);
```

## 📚 API 文档

### 构造函数

```javascript
new SVGSmartColorizer(options)
```

#### 参数
- `options` (Object, 可选) - 配置选项
  - `colorPalette` (Array) - 自定义颜色调色板，默认包含20种精选颜色
  - `preserveLinearStyle` (Boolean) - 是否保护线性图标风格，默认 `true`
  - `independentColors` (Boolean) - 填充和描边是否使用独立颜色，默认 `true`
  - `gradientProbability` (Number) - 渐变色生成概率 (0-1)，默认 `0.3`
  - `debug` (Boolean) - 是否开启调试模式，默认 `false`

### 主要方法

#### `applyRandomColors(svgElement, options)`
为SVG元素应用随机颜色

**参数：**
- `svgElement` (Element) - SVG DOM元素
- `options` (Object, 可选) - 处理选项
  - `skipModified` (Boolean) - 是否跳过已修改的元素，默认 `false`
  - `forceUpdate` (Boolean) - 是否强制更新所有元素，默认 `false`

**返回值：** `Boolean` - 处理是否成功

#### `applyRandomPathColors(svgElement, options)`
为SVG的特定路径应用随机颜色

**参数：**
- `svgElement` (Element) - SVG DOM元素
- `options` (Object, 可选) - 处理选项
  - `pathIndices` (Array) - 要处理的路径索引数组
  - `independentColors` (Boolean) - 是否为每个路径生成独立颜色

#### `resetColors(svgElement)`
重置SVG元素的颜色到原始状态

**参数：**
- `svgElement` (Element) - SVG DOM元素

#### `getColorState(svgElement)`
获取SVG元素的当前颜色状态

**参数：**
- `svgElement` (Element) - SVG DOM元素

**返回值：** `Object` - 颜色状态信息

#### `generateRandomColor()`
生成一个随机颜色

**返回值：** `String` - 十六进制颜色值

#### `generateRandomGradient(id)`
生成一个随机渐变

**参数：**
- `id` (String) - 渐变的唯一ID

**返回值：** `String` - 渐变URL引用

## 🎯 使用场景

### 1. 图标库随机颜色
```javascript
// 为图标库中的所有图标应用随机颜色
document.querySelectorAll('.icon-svg').forEach(svg => {
  colorizer.applyRandomColors(svg);
});
```

### 2. 主题色彩生成
```javascript
// 基于品牌色生成主题色彩
const brandColorizer = new SVGSmartColorizer({
  colorPalette: ['#1976d2', '#388e3c', '#f57c00', '#d32f2f']
});

brandColorizer.applyRandomColors(logoSvg);
```

### 3. 动态图标变色
```javascript
// 鼠标悬停时随机变色
svgElement.addEventListener('mouseenter', () => {
  colorizer.applyRandomColors(svgElement);
});

// 点击时重置颜色
svgElement.addEventListener('click', () => {
  colorizer.resetColors(svgElement);
});
```

### 4. 批量图标处理
```javascript
// 批量处理大量图标
const icons = document.querySelectorAll('.icon');
const batchColorizer = new SVGSmartColorizer({
  debug: true // 开启调试查看处理进度
});

icons.forEach((icon, index) => {
  setTimeout(() => {
    batchColorizer.applyRandomColors(icon);
  }, index * 100); // 错开处理时间避免阻塞
});
```

## 🔧 高级配置

### 自定义颜色检测逻辑
```javascript
const colorizer = new SVGSmartColorizer();

// 自定义元素过滤器
colorizer.setElementFilter((element) => {
  // 跳过特定类名的元素
  return !element.classList.contains('no-colorize');
});

// 自定义颜色验证器
colorizer.setColorValidator((color) => {
  // 只允许特定格式的颜色
  return /^#[0-9A-F]{6}$/i.test(color);
});
```

### 事件监听
```javascript
colorizer.on('colorApplied', (event) => {
  console.log('颜色已应用:', event.element, event.color);
});

colorizer.on('error', (event) => {
  console.error('处理出错:', event.error, event.element);
});

colorizer.on('complete', (event) => {
  console.log('处理完成:', event.processedCount, '个元素');
});
```

## 🎨 颜色处理策略

本库采用智能的颜色处理策略，能够自动识别不同类型的SVG图标并采用合适的处理方式：

### 线性图标（只有描边）
- ✅ 只修改描边颜色
- ❌ 不添加填充颜色（保持线性风格）

### 面性图标（只有填充）
- ✅ 修改填充颜色
- ✅ 可选择性添加描边增加层次

### 混合图标（既有填充又有描边）
- ✅ 为填充和描边生成独立颜色
- ✅ 增加视觉层次感

### 无颜色图标
- ✅ 智能添加填充颜色使其可见
- ✅ 根据上下文决定是否添加描边

### 父级继承颜色
- ✅ 修改父级`<g>`元素的颜色属性
- ✅ 影响所有继承该颜色的子元素
- ✅ 保持设计一致性

## 🛠️ 开发

### 本地开发
```bash
# 克隆仓库
git clone https://github.com/xiaolongmr/svg-smart-colorizer.git
cd svg-smart-colorizer

# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 测试
npm test
```

### 项目结构
```
svg-smart-colorizer/
├── src/
│   ├── index.js          # 主入口文件
│   ├── core/
│   │   ├── colorizer.js  # 核心颜色处理逻辑
│   │   ├── detector.js   # 颜色状态检测
│   │   └── utils.js      # 工具函数
│   └── types/
│       └── index.d.ts    # TypeScript类型定义
├── dist/                 # 构建输出
├── examples/             # 示例代码
├── test/                 # 测试文件
└── docs/                 # 文档
```

## 🧪 测试

本库包含全面的测试覆盖：

```bash
# 运行所有测试
npm test

# 运行特定测试
npm test -- --grep "颜色检测"

# 生成覆盖率报告
npm run test:coverage
```

## 🌍 浏览器兼容性

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ iOS Safari 12+
- ✅ Android Chrome 60+

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎贡献代码！请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详细信息。

### 贡献指南
1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📞 支持

- 📧 邮箱: [xiaolongmr@example.com]
- 🐛 问题反馈: [GitHub Issues](https://github.com/xiaolongmr/svg-smart-colorizer/issues)
- 💬 讨论: [GitHub Discussions](https://github.com/xiaolongmr/svg-smart-colorizer/discussions)

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！

## 📈 更新日志

### v1.0.0 (2024-01-XX)
- 🎉 首次发布
- ✨ 智能颜色检测功能
- 🎨 多种颜色处理策略
- 📚 完整的API文档
- 🧪 全面的测试覆盖

---

**如果这个库对你有帮助，请给个 ⭐ Star 支持一下！**