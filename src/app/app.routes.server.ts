import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * 管理端以 CSR 为主，避免带参路由预渲染缺少 getPrerenderParams。
 */
export const serverRoutes: ServerRoute[] = [
  { path: '**', renderMode: RenderMode.Client },
];
