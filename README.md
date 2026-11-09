# Nubit Explorer · Nuxt 4 区块链浏览器前端

基于 Nuxt 4.6.4、Vue 3.5.45、Pinia 4.1.0 与 Sass 的区块链浏览器界面，覆盖区块、交易、地址、验证人、命名空间、Gas和书签等页面，并包含 Keplr 钱包与交易相关交互。

该目录提供前端、Nuxt服务目录与协议工具；链数据、索引API和WebSocket由外部服务提供，不包含完整链节点或索引后端。

<!-- BEGIN project-discovery -->
## 项目定位与实践入口

Nuxt 4 + Vue 3 blockchain explorer frontend with Pinia, block/transaction/address pages and Keplr wallet integration. 区块链浏览器界面，需外部链数据 API。

适合从以下入口阅读实现与接入条件：

- [区块链浏览器页面](pages/)
- [钱包适配](services/keplr.js)
- [数据源配置](services/config.js)
<!-- END project-discovery -->

## 页面与模块

| 模块 | 入口 | 功能 |
|---|---|---|
| 列表与概览 | `pages/index.vue`、`pages/blocks.vue`、`pages/txs.vue` | 浏览概况、区块与交易 |
| 资源详情 | `pages/block/`、`pages/tx/`、`pages/address/` | 高度、哈希与地址详情 |
| 验证人与命名空间 | `pages/validator/`、`pages/namespace/`、`pages/namespaces/` | 验证人、命名空间和可视化 |
| Gas与书签 | `pages/gas.vue`、`pages/bookmarks.vue` | 费用分析与个人收藏 |
| 网络与钱包 | [services/config.js](services/config.js)、`services/keplr.js` | API/WS选择与钱包交互 |
| 协议与组件 | `services/proto/`、`components/`、`store/` | 消息结构、界面模块与状态 |

## 安装与运行

使用 Node.js 24 LTS（至少 24.15.0，`.nvmrc` 指定 24）与 `pnpm@12.18.0`。`package.json` 声明完整 Node 兼容范围，依赖锁定在 `pnpm-lock.yaml`。

```bash
nvm install
nvm use
npm install -g pnpm@12.18.0
pnpm install --frozen-lockfile
pnpm dev
```

开发端口在脚本中设为9090，默认访问 `http://localhost:9090`。

```bash
pnpm build
pnpm preview
```

`pnpm generate` 用于静态生成；是否适合目标部署需结合动态路由和服务端依赖核实。当前没有单独的 lint、单测或端到端脚本。

## 运行配置与外部依赖

API与WebSocket根据访问域名在 `services/config.js` 中选择。当前实际启用的是 `dev` 配置，其他命名网络的地址保留为注释，但域名分支仍会读取对应字段；部署到新域名时必须先核对映射，避免得到未定义地址。

[nuxt.config.ts](nuxt.config.ts) 包含站点地址、sitemap、OG图片、字体及浏览器polyfill配置。`runtimeConfig.public.AMP` 读取环境变量AMP，属于公开运行配置，不应放入服务端秘密。`config/env.js` 仅导出包版本，不是完整的环境地址配置中心。

钱包操作需要目标链、RPC和账户环境一致。浏览器页面能渲染与API可达、WS更新正常、交易能被链接受是不同的验收层次。

## 开发与部署检查

新增资源页面遵循pages文件路由，通用交互放components，网络与编码逻辑放services。发布前核对站点URL、API/WS网络、动态详情路由、依赖加载和构建结果。

Amplify 配置见 [amplify.yml](amplify.yml)，使用 Node 24、pnpm 12.18.0 和冻结锁文件安装。生产 SSR 可通过 `node .output/server/index.mjs` 启动；托管平台还需配置对应的 Nuxt/Nitro 部署适配器，不能仅上传 `.output/` 就视为已完成 SSR 部署。链 API、WebSocket、Keplr 钱包签名和广播仍需在目标网络验收。

## 依赖升级与迁移说明

本次依赖版本于 2026-11-09 根据 npm registry 的稳定版本核查，核心版本为 Nuxt 4.6.4、Vue 3.5.45、Pinia 4.1.0、VueUse 15.0.0、Nuxt OG Image 7.0.7 和 Sitemap 9.1.0。

- 保留根目录 `pages/`、`components/`、`layouts/` 等结构，使用 `srcDir: "."`，不迁移到 `app/`。保留 `useAsyncData`/`useFetch` 的深层响应行为。
- 将已弃用的 `nuxt-simple-sitemap` 替换为 `@nuxtjs/sitemap`，移除 Pinia 旧 `autoImports` 配置。
- OG 模板改为 `components/OgImage/*.satori.vue`，详情页使用 `defineOgImage(组件名, props)`。字体使用标准字体名，交由新版模块解析；Satori 使用 OG 模块声明兼容的 `^0.47.1`，配合 `@resvg/resvg-js` 渲染。
- 生产环境需设置至少 32 字符且稳定的服务端环境变量 `NUXT_APP_SECRET`，用于新版 OG 图片 URL 签名；多个实例应使用相同值，不要放入 `runtimeConfig.public` 或提交到仓库。
- 浏览器 Node polyfill 仅应用于客户端，避免 SSR 的 `stream/web` 被错误替换。`pnpm-workspace.yaml` 显式允许必要依赖构建脚本，供 CI 非交互安装。
- 移除 Vite 构建不需要的 `sass-loader` 和未直接使用的 `unenv`。CryptoJS 当前最新版仍为 4.2.0 且已停止维护；迁移加密实现需单独验证钱包兼容性。

升级后执行 `pnpm install --frozen-lockfile` 和 `pnpm build`。项目暂无自动化单测或端到端测试；发布前还需检查详情页 OG 图片、sitemap、链数据更新及钱包交互。

### 本次验证

在 Node 24.22.2 / pnpm 12.18.0 下通过冻结锁文件安装、Nuxt 生产构建及 `git diff --check`。本地生产服务的 `/bookmarks`、`/sitemap.xml` 和静态图片返回 200；使用临时签名密钥和虚构区块数据，OG 端点成功返回有效 PNG。协议回归覆盖 Coin 固定编码、大整数金额、TxBody、64 位 gasLimit 和 TxRaw 签名字节往返。

仍有上游 Nuxt DevTools 的 `@vitejs/devtools` peer 范围提示，以及构建时的大 chunk、`vm-browserify` 的 eval 和打包性能提示；当前不阻塞构建。未验证浏览器完整交互、真实链 API/WS、钱包签名广播或远端 Amplify 部署。
