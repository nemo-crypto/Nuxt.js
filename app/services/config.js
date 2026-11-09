// API 和 WebSocket 由运行环境指定，SSR 与浏览器使用同一网络。
export const useServerURL = () => useRuntimeConfig().public.apiBase.replace(/\/$/, "")

export const useSocketURL = () => useRuntimeConfig().public.wsUrl
