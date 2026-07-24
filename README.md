# Basic Admin Template 中后台框架

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

### OAuth2 PKCE 登录

将 `VITE_OAUTH2_ENABLED` 设为 `true` 后，未登录访问会跳转到 OAuth2 授权端点。应用使用 Authorization Code + S256 PKCE，不需要也不应在前端配置 `client_secret`。授权服务器需要注册以下回调地址：

```text
{应用地址}{VITE_BASE_PATH}oauth2/callback
```

若配置了 `VITE_OAUTH2_REDIRECT_URI`，则必须在授权服务器中注册该地址，并确保两端完全一致。令牌端点和 UserInfo 端点必须允许应用来源进行跨域请求。UserInfo 至少应返回标准 `sub` 字段；项目还会读取 `preferred_username`、`name`、`roles` 和 `permissions`。角色及权限声明路径可通过对应环境变量调整。

授权服务器可以在检测到用户未登录时跳转到本项目 `/login`。本地登录成功后，页面会使用新的 PKCE 参数重新发起授权请求，并保留用户最初访问的业务地址。登录接口必须同时为授权服务器建立可识别的服务端登录会话；仅返回保存在浏览器本地的 Bearer Token 无法让授权端点识别登录状态。OAuth2 开启时，登录请求会启用浏览器凭据；跨域部署还必须由服务端配置凭据 CORS，并使用适合部署域名的 `SameSite`、`Secure` Cookie 属性。

OAuth2 登录所需配置如下：

- `VITE_OAUTH2_CLIENT_ID`：公共客户端 ID。
- `VITE_OAUTH2_AUTHORIZATION_URL`：授权端点。
- `VITE_OAUTH2_TOKEN_URL`：令牌端点。
- `VITE_OAUTH2_USERINFO_URL`：用户信息端点。
- `VITE_OAUTH2_SCOPE`：以空格分隔的授权范围。
- `VITE_OAUTH2_ROLES_CLAIM`：UserInfo 中角色字段路径，默认 `roles`。
- `VITE_OAUTH2_PERMISSIONS_CLAIM`：UserInfo 中权限字段路径，默认 `permissions`。

## 验证

```sh
pnpm type-check
pnpm test:run
pnpm lint
pnpm build
```
