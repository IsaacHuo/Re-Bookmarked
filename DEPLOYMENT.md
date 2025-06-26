# 部署指南

## 部署到 Vercel

### 1. 准备工作

确保你已经安装了 Node.js 和 npm：

```bash
node --version
npm --version
```

### 2. 安装依赖

```bash
npm install
```

### 3. 本地测试

```bash
# 启动开发服务器
npm run dev

# 构建项目
npm run build

# 预览构建结果
npm run preview
```

### 4. 部署到 Vercel

#### 方法一：使用 Vercel CLI

1. 安装 Vercel CLI：
```bash
npm i -g vercel
```

2. 登录 Vercel：
```bash
vercel login
```

3. 部署项目：
```bash
vercel
```

#### 方法二：通过 Git 集成

1. 将代码推送到 GitHub 仓库
2. 在 [Vercel Dashboard](https://vercel.com/dashboard) 中导入项目
3. 选择你的 GitHub 仓库
4. Vercel 会自动检测项目类型并进行部署

### 5. 环境配置

项目已经配置好了必要的文件：

- `vercel.json` - Vercel 部署配置
- `package.json` - 包含 `vercel-build` 脚本
- `api/parse.js` - Serverless 函数用于解析书签

### 6. 功能说明

- **前端**: Vue 3 + Vite + TailwindCSS
- **后端**: Vercel Serverless Functions
- **解析器**: 支持客户端和服务端双重解析
- **导出功能**: 支持 JSON 和 CSV 格式导出

### 7. 支持的浏览器书签格式

- Chrome
- Firefox  
- Safari
- Edge
- 其他基于 Chromium 的浏览器

### 8. 故障排除

如遇部署问题：

1. 检查 `package.json` 中的依赖版本
2. 确保 `vercel.json` 配置正确
3. 查看 Vercel 部署日志
4. 确认 Node.js 版本兼容性

### 9. 自定义域名（可选）

在 Vercel Dashboard 中可以为你的项目配置自定义域名。
