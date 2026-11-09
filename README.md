# Nubit Explorer · Nuxt 3 区块链浏览器前端

基于 Nuxt 3.9.1、Vue、Pinia 与 Sass 的区块链浏览器界面，覆盖区块、交易、地址、验证人、命名空间、Gas和书签等页面，并包含 Keplr 钱包与交易相关交互。

该目录提供前端、Nuxt服务目录与协议工具；链数据、索引API和WebSocket由外部服务提供，不包含完整链节点或索引后端。

<!-- BEGIN project-discovery -->
## 项目定位与实践入口

Nuxt 3 + Vue 3 blockchain explorer frontend with Pinia, block/transaction/address pages and Keplr wallet integration. 区块链浏览器界面，需外部链数据 API。

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

包管理器声明为 `pnpm@8.7.4`，依赖锁定在 `pnpm-lock.yaml`。未声明 Node engines，需结合锁定的Nuxt版本准备兼容环境。

```bash
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

本轮依据源码和配置完善文档，未安装依赖、连接链服务或验证远端部署。现有Amplify配置见 `amplify.yml`，不能将文件存在等同于部署已通过。
