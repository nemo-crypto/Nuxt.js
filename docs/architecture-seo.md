# Nuxt 4 架构与 SEO

## 分层

`app/` 负责页面、交互和请求状态；`server/` 提供 HTTP 索引策略和 sitemap 聚合；`shared/` 保存可独立测试的 URL 与错误分类规则。继续使用原有组件、Pinia 和协议代码，不替换钱包架构。原始数据编辑器通过动态 import 在打开弹窗时加载；关闭时销毁实例，加载失败回退为纯 JSON，降低普通页面的首屏依赖。

`useExplorerSeo` 是页面 metadata 的唯一入口。新增页面应传入 title、description 和可选图片；动态 OG 页面设置 `dynamicImage: true` 并调用 `defineOgImage`，避免默认图覆盖动态图。页面 metadata 使用响应式 getter，查询参数变化后同步更新。

`useExplorerResource` 处理五类详情：区块、交易、地址、验证人和命名空间。请求超时 10 秒且不自动重试；空结果或上游 404 转为页面 404，其他请求错误转为 503，附带 `Retry-After: 60`。错误页统一 noindex；Nitro 响应钩子为所有错误响应补齐索引头，包括未知路由。普通 `useFetch` 同样配置超时，深层响应暂时保留以兼容现有状态更新。

## URL 与索引规则

| URL 类型 | canonical | 索引 |
|---|---|---|
| 首页、公开列表、有效详情 | 正式域名 + 路径 | index |
| `page=1` | 不带 page | index |
| `page=N`，N > 1 | 保留 page | index，标题包含页码 |
| UTM/gclid/fbclid 等 | 移除跟踪参数 | 沿用原页面策略 |
| status、sort、搜索及其他查询参数 | 保留并排序，表示当前变体 | noindex, follow |
| 书签、namespace treemap | 当前路径 | noindex, follow |
| 资源不存在、未知路由、非法页码 | 错误响应 | 404 + noindex |
| 详情上游服务故障 | 错误响应 | 503 + noindex + Retry-After |
| 预发布环境 | 仍使用指定站点 URL | noindex，robots Disallow 全站 |

noindex 页面允许生产爬虫抓取，以便读取 meta 和 `X-Robots-Tag`，不同时用 robots 屏蔽这些页面。robots 不承担访问控制；预发布如需保密仍应使用平台鉴权。

不同网络必须分别部署并配置 API/WS、站点 URL 与钱包链；不会根据任意请求 Host 改写正式 canonical。

## 内容与结构化数据

首页有可见标题与介绍；列表首屏等待 API 数据；分页按钮包含真实链接。详情保留其链上标识、可见信息和动态分享图。WebSite/WebPage 与 BreadcrumbList 仅描述实际页面，不添加无对应功能的 SearchAction、评分或其他富结果声明。JSON-LD 转义 `<` 和特殊行分隔符，防止链上文本终止 script 标签。

渲染成功不代表 Google 一定收录，结构化数据也不保证富结果。真实数据质量、可用性、站内链接和线上性能仍影响效果。

## Sitemap

`@nuxtjs/sitemap` 自动发现公开静态页面，排除书签和客户端 treemap。`server/api/__sitemap__/recent.get.ts` 并发请求最近各 100 条区块与交易，验证高度/哈希格式，缓存 300 秒。失败来源贡献空列表，另一来源和静态路由仍保留。

不会用构建时间或请求时间伪造 lastmod。链上时间也不必然等于索引页面更新时间，因此当前省略动态详情 lastmod。

这不是全链索引：历史数据应由索引后端提供稳定的分页 URL 清单和真实更新时间，再扩展为 sitemap index + 分片。不要在 SSR 构建中遍历无限链历史，也不要把任意地址生成成可索引页面。

## 缓存与部署

保留页面 SSR，不对全部 HTML 使用长时 SWR。链状态、筛选和钱包展示不适合未经测量就统一缓存。仅近期 sitemap 来源使用短缓存；OG 图片由模块管理独立缓存。高流量生产应评估共享存储、多实例签名密钥一致性和 CDN 策略。

生产设置 `NUXT_SITE_URL`、`NUXT_SITE_INDEXABLE=true` 和稳定的 `NUXT_APP_SECRET`。签名密钥至少 32 字符，密钥轮换会使旧动态图片 URL 失效。预发布设置 `NUXT_SITE_INDEXABLE=false`。构建产物按目标平台 Nitro preset 部署；Node SSR 产物不能作为普通静态目录直接发布。

## 验证

```bash
pnpm test
pnpm build
pnpm test:seo
```

单测覆盖 canonical、分页/筛选索引策略、JSON-LD 转义、空资源和上游错误分类。HTTP 测试使用模拟链 API 与生产构建，覆盖 SSR 可见数据、meta、schema、抓取链接、静态/动态 sitemap、robots、五类详情的 404/503 和预发布 noindex。

发布后还需验证浏览器 hydration、交互与钱包流程、真实 OG 图片、Search Console URL Inspection、正式 robots/sitemap 和移动端 Core Web Vitals。本地模拟 API 不证明外部链服务稳定，测试通过不代表搜索排名保证。
