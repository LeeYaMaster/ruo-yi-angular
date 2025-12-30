/**
 * Token Key
 */
export const TokenKey = 'Admin-Token';

/**
 * 获取Token（需要在有StorageService的地方使用）
 * 建议直接在组件或服务中注入StorageService使用
 */
export function getTokenFromStorage(storage: any): string | null {
  return storage.get(TokenKey);
}

/**
 * 设置Token（需要在有StorageService的地方使用）
 */
export function setTokenToStorage(storage: any, token: string): void {
  storage.set(TokenKey, token);
}

/**
 * 移除Token（需要在有StorageService的地方使用）
 */
export function removeTokenFromStorage(storage: any): void {
  storage.remove(TokenKey);
}

