# Spotlight Search

一个类似 macOS Spotlight 的跨平台搜索应用，支持 macOS 和 Windows。

## 功能特性

- 🎯 快捷键唤起：
  - macOS: `Cmd + Space`
  - Windows: `Ctrl + Space`
- 🎨 美观的界面设计，支持毛玻璃效果
- 🔍 实时搜索功能
- ⌨️ 键盘导航（上/下箭头选择，Enter 确认，Esc 关闭）
- 点击外部区域自动关闭窗口

## 项目结构

```
/workspace/
├── package.json      # 项目配置
├── main.js           # Electron 主进程
├── index.html        # 搜索界面
├── styles.css        # 样式文件
└── renderer.js       # 渲染进程逻辑
```

## 安装和运行

1. 安装依赖：
```bash
npm install
```

2. 运行应用：
```bash
npm start
```

3. 构建应用（可选）：
```bash
npm run build
```

## 使用说明

1. 启动应用后，它会在后台运行
2. 按快捷键（macOS: Cmd+Space，Windows: Ctrl+Space）唤起搜索框
3. 输入关键词搜索（支持模糊搜索）
4. 使用上下箭头选择搜索结果
5. 按 Enter 选中，或者按 Esc 关闭

## 自定义搜索内容

你可以在 [renderer.js](file:///workspace/renderer.js#L5) 中的 `allItems` 数组添加自己的搜索项。

## 技术栈

- Electron: 跨平台桌面应用框架
- HTML/CSS/JavaScript: 前端技术
