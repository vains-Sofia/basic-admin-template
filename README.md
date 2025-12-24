<p align="center">

# Basic Admin Template

### 一个基于 Vue 3、TypeScript 和 Element Plus 构建的现代化后台管理模板。

</p>

---

<p align="center">

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/vains-Sofia/basic-admin-template)
[![Vue](https://img.shields.io/badge/Vue-3.5.22-4FC08D?logo=vuedotjs)](https://vuejs.org/)
[![Vue Router](https://img.shields.io/badge/Vue%20Router-4.6.3-4FC08D?logo=vue.js)](https://router.vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1.20-646CFF?logo=vite)](https://vitejs.dev/)
[![Pinia](https://img.shields.io/badge/Pinia-3.0.3-F7DF1E?logo=pinia)](https://pinia.vuejs.org/)
[![Element Plus](https://img.shields.io/badge/Element_Plus-2.11.3-409EFF?logo=element)](https://element-plus.org/)
[![Vue Router](https://img.shields.io/badge/Vue_Router-4.6.3-4FC08D?logo=vuedotjs)](https://router.vuejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.16-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Axios](https://img.shields.io/badge/Axios-1.13.1-5A29E4?logo=axios)](https://axios-http.com/)
[![Node.js](https://img.shields.io/badge/Node.js-22.12.0-339933?logo=node.js)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-10.16.1-F69220?logo=pnpm)](https://pnpm.io/)
![vains_Sofia(云逸)](https://img.shields.io/badge/Author-vains_Sofia(云逸)-blue)

</p>

---

### [预览地址](https://vains-sofia.github.io/basic-admin-template/)
账密随便输入

### 如果这个项目对您有帮助，请点个Star支持一下！

您的支持是我们持续改进和维护项目的动力！如果您觉得项目不错，请：
- 🌟 给项目点个Star
- 🔄 分享给更多需要的朋友
- 🐛 提交Issue帮助我们改进
- 🔧 贡献代码让项目更完善

### DeepWiki
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/vains-Sofia/basic-admin-template)<br />
现在项目已使用 DeepWiki 自动生成wiki，您可访问 https://deepwiki.com/vains-Sofia/basic-admin-template 或点击上方icon来查看。<br />
DeepWiki 是一个 AI 驱动的知识库，旨在帮助开发者更高效地获取项目相关信息。您可以通过 DeepWiki 提问，获取关于 Basic Admin Template 的详细解答和使用指导。

## 功能特性

- 🖥️ 响应式布局，支持侧边栏折叠
- 🎨 基于 Element Plus 的精美 UI 组件
- 🔄 支持权限控制的动态路由
- 🔐 完整的认证系统，支持登录/登出
- 📱 多种登录方式（账号、邮箱、二维码）
- 🧠 基于 Pinia 的状态管理
- 🎯 内置组件（对话框、抽屉、表格、表单设计器等）
- ⚡ 基于 Vite 的快速开发体验
- 📦 组件和 API 的自动导入
- 🎨 支持 Tailwind CSS 和 SCSS

## 技术栈

- **核心框架**: Vue 3.5+、TypeScript 5.8+、Vite 7.1+
- **状态管理**: Pinia 3.0
- **路由**: Vue Router 4.6
- **UI 框架**: Element Plus 2.11
- **样式**: Tailwind CSS 4.16、SCSS
- **HTTP 客户端**: Axios
- **图标**: Iconify 配合 @iconify/vue
- **工具库**: VueUse、Animate.css、NProgress
- **构建工具**: ESLint、Prettier、TypeScript 编译器

## 快速开始

### 环境要求

- Node.js ^20.19.0 || >=22.12.0
- 推荐使用 pnpm，也可使用 npm 或 yarn

### 安装

```bash
# 克隆仓库
git clone https://github.com/vains-Sofia/basic-admin-template.git

# 进入项目目录
cd basic-admin-template

# 安装依赖
pnpm install
```

### 开发

```bash
# 启动开发服务器
pnpm dev
```

应用默认在 `http://localhost:5173` 访问。

### 构建

```bash
# 生产环境构建
pnpm build

# 仅打包，忽略类型检查
pnpm build-only

# 本地预览生产构建
pnpm preview
```

### TypeScript类型

```bash
# 代码检查并自动修复可修复的问题
pnpm lint

# 格式化src下的所有文件
pnpm format

# TypeScript类型检查
pnpm type-check
```

## 项目结构

```
src/
├── api/                        # API 服务
├── assets/                     # 静态资源
├── components/                 # 可复用组件
│   ├── Layout/                 # 布局组件（侧边栏、导航栏等）
│   └── BounceText              # 跳动文字
│   └── BounceText              # 跳动文字
│   └── CommonDialog            # 函数式对话框封装
│   └── CommonDrawer            # 函数式抽屉封装
│   └── FormDesigner            # 动态表单(设计器/预览器)
│   └── IconSelect              # 图标选择器
│   └── InputIconSelect         # 与Input关联的图标选择器
│   └── ImageCropper            # 图片剪裁
│   └── QrCode                  # 二维码封装
│   └── RemoteSelectV2          # 通过http加载的虚拟下拉框
│   └── SmartTable              # ElementPlus表格封装，自动占满所有可视区域，添加分页器
│   └── SmartVirtualizedTable   # ElementPlus的虚拟表格封装，自动占满所有可视区域，添加分页器
│   └── TextTooltip             # 当内容超出指定行数时自动省略，hover时悬浮提示
│   └── UniversalRouteWrapper   # 当有详情页面时可使用该组件包装，组件内决定是展示当前页面还是通过RouterView渲染子级
│   └── VerifyCodeInput         # 验证码输入框
├── directives/                 # 自定义指令
├── hooks/                      # 自定义钩子
├── router/                     # 路由配置
│   ├── modules/                # 路由模块
│   └── types/                  # 路由类型定义
├── stores/                     # Pinia 状态存储
├── utils/                      # 工具函数
├── views/                      # 页面组件
│   ├── components/             # 页面组件展示
│   ├── dashboard/              # 仪表板页面
│   ├── error/                  # 错误页面
│   ├── login/                  # 登录页面
│   └── tools/                  # 工具页面
├── App.vue                     # 根组件
├── main.ts                     # 入口文件
└── ...
```

## 路由

项目使用 Vue Router 并支持动态路由：

- **静态路由**:
  - 上段 `src/router/modules/static/*.ts`
  - 中段 动态加载的**动态路由**
  - 最后 `src/router/modules/last/*.ts`
- **动态路由**: 基于用户权限加载
- **路由模式**: 支持 hash 和 history 模式（通过 `.env` 配置）

默认路由包括：

- `/login` - 认证页面，支持多种登录方式
- `/dashboard` - 主仪表板
- `/404` - 错误页面
- `/tools/video` - 视频提取工具
- `/components` 内置组件展示页面

## 组件

项目包含多个内置组件：

- **布局组件**: 侧边栏、导航栏、标签页、主内容区
- **表单组件**: 智能表格、标准表单、验证码输入
- **UI 组件**: 弹跳文字、通用对话框、通用抽屉、图标选择器
- **工具组件**: 二维码、图片裁剪、文字提示

## 状态管理

使用 Pinia 管理应用状态：

- `Layout.ts` - 布局设置（侧边栏、主题等）
- `Plugins.ts` - 插件配置
- `User.ts` - 用户认证和权限
- `counter.ts` - 简单计数器示例

## 环境变量

通过环境文件管理配置：

- `.env.development` - 开发环境设置
- `.env.production` - 生产环境设置
- `.env.staging` - 预发布环境设置

关键变量：

- `VITE_BASE_PATH` - 应用基础路径
- `VITE_API_URL` - 后端 API 地址
- `VITE_ROUTER_MODE` - 路由模式（hash/history）
- `VITE_VUE_DEVTOOLS` - 启用/禁用 Vue 开发者工具

## 脚本命令

可用的 npm 脚本：

- `dev` - 启动开发服务器
- `build` - 生产环境构建
- `preview` - 预览生产构建
- `lint` - 运行 ESLint 并自动修复
- `format` - 使用 Prettier 格式化代码
- `type-check` - 运行 TypeScript 类型检查

## 开源协议

本项目采用 [Apache License 2.0](./LICENSE) 协议开源。

## 示例图片
待补充
