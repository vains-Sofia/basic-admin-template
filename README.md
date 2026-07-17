# demo06 中后台框架

基于 Vite 8、Vue 3、Vue Router、Pinia 和 Element Plus 的中后台基础项目。

## 开发

```sh
pnpm install
pnpm dev
```

开发环境默认启用模拟接口，可使用以下账号：

- 管理员：`admin / admin123`
- 编辑：`editor / editor123`

管理员拥有仪表盘和用户管理权限，编辑账号仅拥有仪表盘权限。

## 路由与权限

静态权限路由放在 `src/router/static`，框架会自动扫描该目录下的 TypeScript 配置。菜单由过滤后的路由生成，无需维护独立菜单配置。

后端动态菜单接入点位于 `src/router/dynamic.ts`。应用启动前通过 `setDynamicRouteLoader` 注入加载器，并将后端数据转换成 `RouteRecordRaw[]` 即可复用现有权限过滤和菜单生成流程。

## 环境变量

环境变量示例见 `.env.example`。生产环境必须关闭 `VITE_USE_MOCK`，并按实际部署方式配置 API 地址或开发代理。

## 验证

```sh
pnpm type-check
pnpm test:run
pnpm lint
pnpm build
```
