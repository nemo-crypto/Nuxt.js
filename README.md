# Nubit Explorer · Nuxt 4 区块链浏览器

基于 Nuxt 4.6.4、Vue 3.5.45、Pinia 4.1.0 和 Sass，提供区块、交易、地址、验证人、命名空间、Gas 与本地书签页面，并集成 Keplr 钱包。链节点、索引 API 和 WebSocket 由外部服务提供。

<!-- BEGIN project-discovery -->
## 项目定位与实践入口

Nuxt 4 + Vue 3 blockchain explorer with SSR, shared SEO policies and Keplr wallet integration.

- [页面与路由](app/pages/)
- [钱包适配](app/services/keplr.js)
- [数据源配置](app/services/config.js)
- [架构与 SEO 设计](docs/architecture-seo.md)
<!-- END project-discovery -->

## 安装与运行

使用 Node 24 LTS（至少 24.15.0）和 pnpm 12.18.0；版本要求见 `package.json`，锁文件需随依赖一同提交。

```bash
nvm install
nvm use
npm install -g pnpm@12.18.0
pnpm install --frozen-lockfile
cp .env.example .env
pnpm dev
```

开发地址：`http://localhost:9090`。按 [.env.example](.env.example) 配置站点 URL、链 API、WebSocket 和 OG 签名密钥。示例默认禁止索引，生产确认配置后将 `NUXT_SITE_INDEXABLE` 改为 `true`。

```bash
pnpm test             # canonical、索引策略、JSON-LD 和错误状态单测
pnpm build            # SSR 生产构建
pnpm test:seo         # 启动生产产物及模拟链 API，验证 HTTP / HTML
pnpm preview
```

`test:seo` 使用临时端口和随机签名密钥，结束后关闭进程，不连接真实链或钱包。运行前须先构建。当前没有独立 lint 或浏览器 E2E 脚本。

## 目录与职责

| 目录 | 职责 |
|---|---|
| `app/pages/`、`app/layouts/` | Nuxt 4 文件路由与页面布局，原有 URL 保持不变 |
| `app/components/` | UI、数据表格、钱包弹窗与 `.satori.vue` OG 模板 |
| `app/composables/` | 统一页面 SEO、详情请求和错误语义 |
| `app/services/`、`app/store/` | 链 API、协议编码、钱包和 Pinia 状态 |
| `server/` | robots、索引响应头、近期动态 sitemap 来源 |
| `shared/utils/`、`tests/` | 前后端共用 SEO 规则、单测和 SSR 冒烟测试 |

项目使用 Nuxt 4 默认 `app/` 结构和分环境 TypeScript references。`modules/`、`server/`、`shared/`、`public/` 保留在项目根目录。`@/` 和 `~/` 指向 `app/`。

## SEO 与渲染

页面统一生成 title、description、canonical、OG/Twitter 与 WebSite/WebPage JSON-LD；面包屑生成 BreadcrumbList。移除重复关键词标签，主要页面提供语义化 H1 和 main 区域。

- 分页保留 `?page=N` 的独立 canonical；UTM 等跟踪参数不进入 canonical，筛选页设为 noindex。
- 书签和仅客户端可视化页不进入 sitemap；预发布支持站点级 noindex 和 robots 禁止抓取。
- 详情不存在返回 404；链 API 故障返回 503 与 `Retry-After`，避免跳首页形成 soft 404。
- sitemap 包含公开静态入口，以及最多各 100 条近期区块/交易 URL，缓存 5 分钟。不会伪造 lastmod，也不会扫描全链历史。
- 列表首屏数据参与 SSR；分页提供实际 href。实时页面不启用全站 HTML 缓存，浏览器继续通过 WebSocket 更新。

策略、限制与扩展方式见 [架构与 SEO 设计](docs/architecture-seo.md)。

## 生产部署

```bash
pnpm build
node .output/server/index.mjs
```

生产进程由部署平台注入环境变量；直接启动 Node 产物不会自动读取项目 `.env`。

| 环境变量 | 用途 |
|---|---|
| `NUXT_SITE_URL` | 唯一正式站点 URL，统一 canonical、OG、robots 与 sitemap |
| `NUXT_SITE_INDEXABLE` | 生产 `true`，预发布 `false` |
| `NUXT_PUBLIC_API_BASE` | 索引 API 基址，默认 Nubit alphatestnet `/v1` |
| `NUXT_PUBLIC_WS_URL` | 对应链的 WebSocket 地址 |
| `NUXT_APP_SECRET` | 至少 32 字符随机值，用于 OG 图片签名；多实例必须一致 |

`NUXT_PUBLIC_*` 对浏览器可见，不能存放密钥。修改 API 时需同时核对钱包链配置 `app/services/chains.js`。旧的按访问域名选择网络逻辑已移除，部署不同网络需分别配置环境变量。

[amplify.yml](amplify.yml) 固定 Node 24、pnpm 12.18.0 和冻结安装；Amplify SSR 仍需配置平台对应的 Nitro 适配和产物格式，不能仅上传 `.output/`。`pnpm generate` 不包含运行时 OG 渲染与动态 sitemap 服务，不是默认部署方案。

## 依赖与验证边界

依赖稳定版于 2026-11-09 核查。已迁移到 `@nuxtjs/sitemap` 9.1.0、Nuxt OG Image 7.0.7 和 VueUse 15.0.0；Satori 使用 OG 模块声明兼容的 `^0.47.1`。浏览器 Node polyfill 仅用于客户端，构建脚本白名单见 `pnpm-workspace.yaml`。

本轮已通过冻结安装、5 项单测、生产构建和 HTTP SEO 冒烟测试；另验证了 Chromium hydration、编辑器按需加载及反复开关清理。具体范围见 [验证记录](docs/architecture-seo.md#2026-11-09-本地验证记录)。

已有 CryptoJS 停止维护、DevTools 传递 peer 范围、bundle 体积及 `vm-browserify` eval 提示，需在后续专项中处理。自动检查不代表真实链 API、WebSocket、钱包签名广播或远端部署通过；发布前仍应验收这些流程，并在 Search Console 验证收录和线上 Core Web Vitals。
