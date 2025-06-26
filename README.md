# Re-Bookmarked

智能书签解析器，支持上传HTML书签文件并解析为可视化结构。

🚀 **在线体验**: https://re-bookmarked-fcvq4c8xw-isaachuos-projects.vercel.app

## 功能

- 上传解析HTML书签文件
- 树形展示书签结构
- 数据统计和导出
- 支持JSON和CSV格式

## 技术栈

Vue 3 + Vite + TailwindCSS + Vercel

## 浏览器支持

Chrome / Firefox / Safari / Edge

## 快速开始

```bash
npm install
npm run dev
npm run build
```

## 部署

```bash
vercel
```

## 使用方法

1. 从浏览器导出书签HTML文件
2. 上传文件到应用
3. 查看解析结果
4. 导出为JSON或CSV

## 项目结构

```
Re-Bookmarked/
├── api/parse.js          # 解析API
├── src/
│   ├── components/       # Vue组件
│   ├── utils/           # 工具函数
│   ├── App.vue          # 主应用
│   └── main.js          # 入口文件
├── vercel.json          # 部署配置
└── package.json         # 项目配置
```
