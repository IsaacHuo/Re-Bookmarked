# Re-Bookmarked

[English](#english) | [中文](#中文)

## English

AI-powered bookmark organizer with parsing and smart categorization.

### Features

- Parse HTML bookmark files
- AI-powered organization (Qwen)
- Visual tree structure
- Export organized HTML
- Statistics and insights

### Quick Start

1. **Setup**
   ```bash
   npm install
   cp .env.example .env  # Add your Qwen API key
   ```

2. **Run**
   ```bash
   npm run dev    # Frontend (port 5173)
   node server.js # Backend (port 3000)
   ```

3. **Use**
   - Upload bookmark HTML file
   - Click "Parse" to analyze
   - Choose organize strategy
   - Click "Start AI Organize"
   - Download organized HTML

### Environment

Create `.env` file:
```env
DASHSCOPE_API_KEY=your_api_key_here
APP_PORT=3000
```

### Tech Stack

- Frontend: Vue 3 + Vite + TailwindCSS
- Backend: Node.js + Express
- AI: Alibaba Qwen API

### Browser Support

Chrome, Firefox, Safari bookmark exports supported.

---

## 中文

AI驱动的书签整理器，支持解析和智能分类。

### 功能特性

- 解析HTML书签文件
- AI智能整理（Qwen）
- 可视化树状结构
- 导出整理后的HTML
- 统计和分析

### 快速开始

1. **安装**
   ```bash
   npm install
   cp .env.example .env  # 添加你的Qwen API密钥
   ```

2. **运行**
   ```bash
   npm run dev    # 前端 (端口 5173)
   node server.js # 后端 (端口 3000)
   ```

3. **使用**
   - 上传书签HTML文件
   - 点击"解析"进行分析
   - 选择整理策略
   - 点击"开始AI整理"
   - 下载整理后的HTML

### 环境配置

创建 `.env` 文件：
```env
DASHSCOPE_API_KEY=你的API密钥
APP_PORT=3000
```

### 技术栈

- 前端: Vue 3 + Vite + TailwindCSS
- 后端: Node.js + Express
- AI: 阿里云通义千问 API

### 浏览器支持

支持Chrome、Firefox、Safari书签导出。

---

## File Structure

```
Re-Bookmarked/
├── api/
│   ├── organize.js      # AI organization
│   ├── parse.js         # HTML parsing
│   └── generate-html.js # HTML generation
├── src/
│   ├── components/      # Vue components
│   ├── utils/           # Utilities
│   └── App.vue         # Main app
├── server.js           # Express server
└── .env               # Environment vars
```
