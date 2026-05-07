# Spotlight Search

一个类似 macOS Spotlight 的跨平台搜索应用，支持 macOS 和 Windows。

## 功能特性

- 快捷键唤起：
  - macOS: Cmd + Space
  - Windows: Ctrl + Space
- 美观的界面设计，支持毛玻璃效果
- 实时搜索功能
- 键盘导航（上/下箭头选择，Enter 确认，Esc 关闭）
- 点击外部区域自动关闭窗口
- 剪贴板历史管理（自动监听系统剪贴板）
- 快捷输入/snippets（使用 ; 触发）

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

### 基础搜索
1. 启动应用后，它会在后台运行
2. 按快捷键（macOS: Cmd+Space，Windows: Ctrl+Space）唤起搜索框
3. 输入关键词搜索（支持模糊搜索）
4. 使用上下箭头选择搜索结果
5. 按 Enter 选中，或者按 Esc 关闭

### 剪贴板历史
- 输入冒号 `:` 可以只搜索剪贴板历史
- 直接搜索会同时显示剪贴板历史和快捷输入
- 点击即可快速复制

### 快捷输入/snippets
- 输入分号 `;` 可以只搜索快捷输入
- 预设的快捷指令：
  - `;email` - 输入邮箱地址
  - `;addr` - 输入家庭地址
  - `;tel` - 输入手机号码
  - `;sig` - 输入邮件签名
  - `;cmd` - 输入常用命令

## 自定义搜索内容

你可以在 renderer.js 中的 `allItems` 数组添加自己的应用/文件搜索项，在 `snippets` 数组添加自己的快捷输入。

## 技术栈

- Electron: 跨平台桌面应用框架
- HTML/CSS/JavaScript: 前端技术
